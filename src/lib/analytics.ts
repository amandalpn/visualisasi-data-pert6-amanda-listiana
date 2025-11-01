import { mean, quantile } from 'd3-array';
import type {
  ActivityByWeekRecord,
  GradeDistributionRecord,
  ModuleOutcomeRecord,
  OutcomeByDemographicRecord,
  RegionChoroplethRecord,
  StudentActivityRecord,
} from './types';
import type { FilterState } from './store';
import { formatNumber, formatPercent } from './format';

const includesOrAll = (values: string[], target?: string) =>
  values.length === 0 || (target ? values.includes(target) : true);

const matchesFilter = (record: Partial<StudentActivityRecord>, filters: FilterState) => {
  return (
    includesOrAll(filters.modules, record.code_module) &&
    includesOrAll(filters.presentations, record.code_presentation) &&
    includesOrAll(filters.regions, record.region) &&
    includesOrAll(filters.ageBands, record.age_band) &&
    includesOrAll(filters.educationLevels, record.highest_education) &&
    includesOrAll(filters.genders, record.gender) &&
    includesOrAll(filters.disabilities, record.disability ?? '')
  );
};

export const filterActivities = (
  data: StudentActivityRecord[],
  filters: FilterState,
  weekRange?: [number, number],
) => {
  return data.filter((record) => {
    const matches = matchesFilter(record, filters);
    if (!matches) return false;
    if (weekRange) {
      const [start, end] = weekRange;
      return record.weeks.some((w) => w.week >= start && w.week <= end);
    }
    return true;
  });
};

export const filterModuleOutcomes = (data: ModuleOutcomeRecord[], filters: FilterState) =>
  data.filter((row) => includesOrAll(filters.modules, row.code_module));

export const filterActivityByWeek = (
  data: ActivityByWeekRecord[],
  filters: FilterState,
  weekRange: [number, number],
) =>
  data.filter(
    (row) =>
      includesOrAll(filters.modules, row.code_module) &&
      includesOrAll(filters.presentations, row.code_presentation) &&
      row.week >= weekRange[0] &&
      row.week <= weekRange[1],
  );

export const filterGradeDistribution = (
  data: GradeDistributionRecord[],
  filters: FilterState,
) =>
  data.filter(
    (row) =>
      includesOrAll(filters.modules, row.code_module) &&
      includesOrAll(filters.presentations, row.code_presentation),
  );

export const filterOutcomeByDemographic = (
  data: OutcomeByDemographicRecord[],
  filters: FilterState,
) =>
  data.filter(
    (row) =>
      filters.regions.length === 0 ||
      (row.demographic === 'region' && filters.regions.includes(row.category)) ||
      row.demographic !== 'region',
  );

export const filterRegionChoropleth = (
  data: RegionChoroplethRecord[],
  filters: FilterState,
) =>
  data.filter((row) => includesOrAll(filters.regions, row.region));

export const computeKpis = (opts: {
  students: StudentActivityRecord[];
  activity: ActivityByWeekRecord[];
  moduleOutcome: ModuleOutcomeRecord[];
}) => {
  const { students, activity, moduleOutcome } = opts;
  const studentCount = new Set(students.map((s) => s.id_student)).size;
  const moduleCount = new Set(
    moduleOutcome.map((m) => `${m.code_module}_${m.code_presentation}`),
  ).size;
  const averageScore = mean(students.map((s) => s.final_score)) ?? 0;
  const recentWeeks = activity.filter((row) => row.week >= 0 && row.week <= 4);
  const weeklyEngagement =
    recentWeeks.reduce((acc, row) => acc + row.sum_clicks, 0) / Math.max(recentWeeks.length, 1);
  return {
    studentCount,
    moduleCount,
    averageScore,
    weeklyEngagement,
  };
};

export const buildKpiNarrative = (kpis: {
  studentCount: number;
  moduleCount: number;
  averageScore: number;
  weeklyEngagement: number;
}) => {
  return [
    `Dashboard saat ini mencakup ${formatNumber(
      kpis.studentCount,
    )} mahasiswa aktif lintas modul.`,
    `Rata-rata skor akhir berada di kisaran ${formatNumber(
      kpis.averageScore,
    )}, menandakan peluang intervensi akademik dini.`,
    `Mahasiswa mencatat ${formatNumber(
      kpis.weeklyEngagement,
    )} klik per minggu selama empat pekan awal, cocok untuk memonitor keterlibatan dini.`,
  ];
};

export const craftModuleInsight = (rows: ModuleOutcomeRecord[]) => {
  if (rows.length === 0)
    return 'Belum ada data modul yang memenuhi filter. Gunakan filter berbeda untuk menampilkan perbandingan kelulusan.';
  const topPass =
    [...rows].sort(
      (a, b) =>
        b.pass / (b.pass + b.fail + b.withdrawn) - a.pass / (a.pass + a.fail + a.withdrawn),
    )[0] ?? rows[0];
  const rate = topPass.pass / Math.max(topPass.pass + topPass.fail + topPass.withdrawn, 1);
  return `Grafik batang ini menampilkan distribusi hasil akhir per modul sehingga Anda dapat langsung membandingkan proporsi lulus, gagal, dan withdraw. Modul ${topPass.code_module} ${topPass.code_presentation} mencatat tingkat kelulusan tertinggi ${formatPercent(
    rate,
  )} di antara pilihan yang sedang difilter. Temuan ini mengindikasikan praktik pengajaran yang efektif yang bisa direplikasi ke modul lain dengan performa menurun. Klik salah satu batang untuk meninjau detail modul terkait dan gunakan informasi tersebut untuk merancang intervensi akademik.`;
};

export const craftActivityInsight = (rows: ActivityByWeekRecord[]) => {
  if (rows.length === 0) {
    return 'Aktivitas klik belum tersedia untuk filter saat ini. Perluas rentang minggu atau modul untuk melihat tren keterlibatan.';
  }
  const totalClicks = rows.reduce((acc, row) => acc + row.sum_clicks, 0);
  const busiestWeek =
    rows.reduce(
      (prev, current) => (current.sum_clicks > prev.sum_clicks ? current : prev),
      rows[0],
    ) ?? rows[0];
  return `Garis pada grafik menunjukkan volume klik mingguan sehingga perubahan aktivitas mahasiswa dari waktu ke waktu terlihat jelas. Total ${formatNumber(
    totalClicks,
  )} klik tercatat pada rentang minggu terpilih dan garis putus-putus merepresentasikan rata-rata historis. Aktivitas tertinggi terjadi pada minggu ${busiestWeek.week}, sehingga fase ini penting untuk kampanye pengayaan materi. Amati penurunan tajam sebagai sinyal untuk melakukan pengingat tugas atau dukungan belajar tambahan.`;
};

export const craftHistogramInsight = (rows: GradeDistributionRecord[]) => {
  if (rows.length === 0)
    return 'Distribusi nilai belum bisa dihitung. Pastikan ada data nilai pada filter yang dipilih.';
  const sorted = [...rows].sort((a, b) => (parseInt(b.band, 10) || 0) - (parseInt(a.band, 10) || 0));
  const dominant = sorted[0];
  return `Histogram ini mengelompokkan skor akhir ke dalam rentang nilai sehingga penyebaran performa belajar mudah dibaca. Mayoritas mahasiswa berada pada rentang nilai ${dominant.band} dengan ${formatNumber(
    dominant.students,
  )} peserta, menandakan titik konsentrasi performa. Gunakan informasi ini untuk merancang remedial bagi kelompok di bawah rata-rata serta tantangan lanjutan bagi kelompok dengan skor tinggi. Perubahan bentuk distribusi dari waktu ke waktu dapat menjadi indikator efektivitas intervensi.`;
};

export const craftScatterInsight = (rows: StudentActivityRecord[]) => {
  if (rows.length === 0) return 'Belum ada mahasiswa yang sesuai filter.';
  const avgClicks = mean(rows.map((r) => r.total_clicks)) ?? 0;
  const avgScore = mean(rows.map((r) => r.final_score)) ?? 0;
  const atRisk = rows.filter((r) => r.final_score < 40 && r.total_clicks < avgClicks);
  return `Setiap titik pada scatter plot mewakili mahasiswa dengan sumbu-X sebagai total klik dan sumbu-Y sebagai skor akhir, sehingga hubungan keterlibatan dan performa dapat diamati. Rerata klik adalah ${formatNumber(avgClicks)} dengan skor akhir ${formatNumber(
    avgScore,
  )}, dan garis kisi membantu mengecek deviasi dari rerata. Terdapat ${formatNumber(
    atRisk.length,
  )} mahasiswa berisiko (aktivitas rendah & skor < 40) yang layak mendapat intervensi awal. Gunakan fitur seleksi untuk menjemput detail individu dan jadwalkan coaching atau dukungan belajar yang terarah.`;
};

export const craftDemographicInsight = (rows: OutcomeByDemographicRecord[]) => {
  if (rows.length === 0)
    return 'Tidak ada data demografis untuk filter ini. Aktifkan kembali beberapa dimensi untuk melihat pola demografi.';
  const flattened = rows.flatMap((row) => [
    { demographic: row.demographic, category: row.category, metric: row.pass },
    { demographic: row.demographic, category: row.category, metric: -row.fail },
  ]);
  const strongest = flattened.reduce((prev, current) =>
    current.metric > prev.metric ? current : prev, flattened[0]);
  const weakest = flattened.reduce((prev, current) =>
    current.metric < prev.metric ? current : prev, flattened[0]);
  return `Bagan donat demografis membantu membandingkan kontribusi tiap segmen terhadap hasil akhir dengan cepat. Demografi dengan performa terbaik adalah ${strongest.category} (${strongest.demographic}) yang memberikan porsi kelulusan tertinggi sehingga praktiknya patut dicontoh. Perhatikan pula ${weakest.category} yang menunjukkan tantangan terbesar dan butuh program dukungan khusus. Pantau perubahan proporsi setelah program dilakukan untuk mengukur dampaknya.`;
};

export const buildRegionInsight = (rows: RegionChoroplethRecord[]) => {
  if (rows.length === 0)
    return 'Belum ada wilayah yang memenuhi filter. Cobalah pilih modul atau presentasi lain untuk melihat persebaran geografis.';
  const topRegion = rows.reduce((prev, current) =>
    current.average_score > prev.average_score ? current : prev, rows[0]);
  return `Peta choropleth menvisualisasikan sebaran mahasiswa berdasarkan region sehingga ketimpangan geografis langsung terlihat. Wilayah ${topRegion.region} memiliki skor rata-rata ${formatNumber(
    topRegion.average_score,
  )} dan menjadi kandidat referensi praktik baik. Pertimbangkan berbagi strategi dukungan dari wilayah ini ke region lain yang warnanya lebih gelap. Klik suatu wilayah untuk menerapkan filter region dan kaji lebih detail performanya di visualisasi lain.`;
};

export const computePercentiles = (rows: StudentActivityRecord[]) => {
  const clicks = rows.map((row) => row.total_clicks);
  const scores = rows.map((row) => row.final_score);
  return {
    clicksP90: quantile(clicks, 0.9) ?? 0,
    scoresP90: quantile(scores, 0.9) ?? 0,
  };
};
