import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Layers, Award, Zap, Filter as FilterIcon } from 'lucide-react';
import { useOuladData } from '@/lib/dataContext';
import { useAppStore } from '@/lib/store';
import {
  computeKpis,
  craftActivityInsight,
  craftModuleInsight,
  craftDemographicInsight,
  craftHistogramInsight,
  buildRegionInsight,
  filterActivities,
} from '@/lib/analytics';
import {
  aggregateModuleOutcomeFromStudents,
  aggregateActivityByWeekFromStudents,
  aggregateGradeDistributionFromStudents,
  aggregateRegionFromStudents,
  aggregateOutcomeByDemographicFromStudents,
} from '@/lib/analytics';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChartX } from '@/components/charts/BarChartX';
import { LineChartX } from '@/components/charts/LineChartX';
import { PieChartX } from '@/components/charts/PieChartX';
import { HistogramX } from '@/components/charts/HistogramX';
import { ChoroplethMap } from '@/components/map/ChoroplethMap';
import { formatNumber } from '@/lib/format';
import { FilterSidebar, FilterDrawer } from '@/features/filters/FilterSidebar';

const DashboardPage = () => {
  const { data, loading, error } = useOuladData();
  const navigate = useNavigate();
  const filters = useAppStore((state) => state.filters);
  const setSelection = useAppStore((state) => state.setSelection);
  const [openFilter, setOpenFilter] = useState(false);

  // ✅ Formatter label sumbu-X untuk memendekkan nama modul panjang
  // Contoh: "Pemrograman Python Terapan-2024Genap" -> "PPT-2024Genap"
  const shortModuleLabel = (raw: string) => {
    if (!raw) return '';
    const [name, term] = raw.split('-');
    const words = name.trim().split(/\s+/);
    const abbreviated =
      words.length >= 2 || name.length > 18
        ? words
            .map((w) => w[0])
            .join('')
            .toUpperCase()
        : name;
    return term ? `${abbreviated}-${term}` : abbreviated;
  };

  const memoized = useMemo(() => {
    if (!data) {
      return {
        kpis: null,
        moduleOutcomeData: [],
        filteredModuleOutcome: [],
        filteredActivity: [],
        filteredOutcomeByDemo: [],
        filteredRegion: [],
        filteredGradeDistribution: [],
        activityData: [],
        demographicData: [],
        histogramData: [],
        mapData: {},
      };
    }

    const activeStudents = filterActivities(data.studentActivity, filters, filters.weekRange);

    const filteredModuleOutcome = aggregateModuleOutcomeFromStudents(activeStudents);
    const filteredActivity = aggregateActivityByWeekFromStudents(activeStudents);
    const filteredGradeDistribution = aggregateGradeDistributionFromStudents(activeStudents);
    const filteredRegion = aggregateRegionFromStudents(activeStudents);
    const filteredOutcomeByDemo = aggregateOutcomeByDemographicFromStudents(activeStudents);

    const moduleOutcomeData = filteredModuleOutcome.map((row) => {
      const total = row.pass + row.fail + row.withdrawn + row.distinction;
      const code = `${row.code_module}-${row.code_presentation}`;
      return {
        key: code,
        value: Math.round((row.pass / Math.max(total, 1)) * 100),
        pass: row.pass,
        fail: row.fail,
        withdrawn: row.withdrawn,
      };
    });

    const activityData = filteredActivity.map((row) => ({
      key: `M${row.week}`,
      value: row.sum_clicks,
      average: row.avg_final_score,
    }));

    const demographicData = Object.entries(
      activeStudents.reduce<Record<string, number>>((acc, s) => {
        const key = s.gender || 'Tidak diketahui';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([key, value]) => ({ key, value }));

    const histogramData = filteredGradeDistribution.flatMap((row) =>
      Array.from({ length: row.students }).map(() => ({ value: Number(row.band) })),
    );

    const mapData = filteredRegion.reduce<Record<string, { value: number; average_score: number }>>(
      (acc, row) => {
        acc[row.region] = { value: row.students, average_score: row.average_score };
        return acc;
      },
      {},
    );

    const kpis = computeKpis({
      students: activeStudents,
      activity: filteredActivity,
      moduleOutcome: filteredModuleOutcome,
    });

    const totalStudents = new Set(data.studentActivity.map((s) => s.id_student)).size;
    const totalModules = new Set(
      data.moduleOutcome.map((m) => `${m.code_module}_${m.code_presentation}`),
    ).size;
    const baselineKpis = computeKpis({
      students: data.studentActivity,
      activity: data.activityByWeek,
      moduleOutcome: data.moduleOutcome,
    });

    return {
      kpis,
      moduleOutcomeData,
      filteredModuleOutcome,
      filteredActivity,
      filteredOutcomeByDemo,
      filteredRegion,
      filteredGradeDistribution,
      activityData,
      demographicData,
      histogramData,
      mapData,
      totals: { students: totalStudents, modules: totalModules },
      baseline: baselineKpis,
    };
  }, [data, filters]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 rounded-3xl bg-white/40 dark:bg-white/10" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 rounded-3xl bg-white/40 dark:bg-white/10" />
            ))}
          </div>
          <div className="h-[480px] rounded-3xl bg-white/40 dark:bg-white/10" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="rounded-3xl bg-red-500/10 p-8 text-lg font-semibold text-red-500">
          Gagal memuat data: {error}
        </p>
      </main>
    );
  }

  if (!data || !memoized.kpis) return null;

  const {
    kpis,
    moduleOutcomeData,
    filteredModuleOutcome,
    filteredActivity,
    filteredOutcomeByDemo,
    filteredRegion,
    filteredGradeDistribution,
    activityData,
    demographicData,
    histogramData,
    mapData,
    totals,
    baseline,
  } = memoized;

  const kpiItems = [
    {
      title: 'Mahasiswa Aktif',
      value: formatNumber(kpis.studentCount),
      description: 'Jumlah mahasiswa unik di dataset terpilih',
      icon: Users,
      progress:
        totals?.students && totals.students > 0
          ? Math.min(kpis.studentCount / totals.students, 1)
          : 0,
    },
    {
      title: 'Modul Dipantau',
      value: formatNumber(kpis.moduleCount),
      description: 'Total kombinasi modul dan presentasi',
      icon: Layers,
      progress:
        totals?.modules && totals.modules > 0 ? Math.min(kpis.moduleCount / totals.modules, 1) : 0,
    },
    {
      title: 'Skor Rata-Rata',
      value: `${formatNumber(kpis.averageScore)} / 100`,
      description: 'Nilai akhir rata-rata mahasiswa',
      icon: Award,
      progress: Math.min(kpis.averageScore / 100, 1),
    },
    {
      title: 'Klik per Pekan',
      value: formatNumber(kpis.weeklyEngagement),
      description: 'Rata-rata keterlibatan empat pekan pertama',
      icon: Zap,
      progress:
        baseline?.weeklyEngagement && baseline.weeklyEngagement > 0
          ? Math.min(kpis.weeklyEngagement / baseline.weeklyEngagement, 1)
          : 0,
    },
  ];
  const KpiCard = ({
    title,
    value,
    description,
    icon: Icon,
    progress = 0,
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    progress?: number;
  }) => {
    const pct = Math.min(Math.max(progress ?? 0, 0), 1) * 100;

    return (
      <Card className="relative h-full overflow-hidden bg-white/50 dark:bg-slate-900/80">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5" />
        <div className="relative grid h-full grid-rows-[auto,auto,1fr,auto] gap-2 p-5">
          {/* Header */}
          <div className="flex items-center gap-3 text-sky-500">
            <Icon className="h-6 w-6" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>

          {/* Angka utama */}
          <div className="text-3xl font-semibold leading-none text-slate-900 dark:text-white tabular-nums min-h-[2.25rem]">
            {value}
          </div>

          {/* Deskripsi (mengisi ruang tengah agar progress selalu di bawah) */}
          <CardDescription className="mt-1 text-left text-sm text-slate-600 dark:text-slate-300">
            {description}
          </CardDescription>

          {/* Progress */}
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-300">
              <span className="opacity-60">0%</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-700/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-purple-500 to-fuchsia-500 transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <header className="space-y-4 rounded-3xl bg-gradient-to-r from-sky-500/20 via-fuchsia-500/10 to-violet-500/20 p-6 text-slate-900 shadow-glass backdrop-blur-2xl dark:text-white">
          <h1 className="text-3xl font-bold">Visualisasi Analitik Pembelajaran OULAD</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-700 dark:text-slate-200">
            Dasbor ini memperlihatkan pola keterlibatan, performa, dan disparitas demografis
            mahasiswa Open University. Manfaatkan filter untuk melakukan analisis lintas modul dan
            region, serta gunakan insight otomatis di setiap visualisasi sebagai bahan kebijakan
            intervensi kampus.
          </p>
        </header>

        {/* Tombol filter untuk mobile */}
        <div className="flex items-center justify-end lg:hidden">
          <button
            type="button"
            onClick={() => setOpenFilter(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-sky-200 hover:text-sky-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
          >
            <FilterIcon className="h-4 w-4" />
            Filter
          </button>
        </div>

        {/* Layout 2 kolom: sidebar (desktop) + konten */}
        <div className="grid gap-6 lg:grid-cols-[var(--fsb-w,320px),1fr]">
          <FilterSidebar className="hidden lg:block" />

          <div className="space-y-8">
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {kpiItems.map((item) => (
                <KpiCard
                  key={item.title}
                  title={item.title}
                  value={item.value}
                  description={item.description}
                  icon={item.icon}
                  progress={item.progress}
                />
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <BarChartX
                title="Outcome Akademik per Modul"
                description="Bandingkan tingkat kelulusan antar modul dan klik untuk membuka detail modul."
                data={moduleOutcomeData}
                insight={craftModuleInsight(filteredModuleOutcome)}
                isClickable={false}
                formatCategoryLabel={shortModuleLabel}
                xTickFontSize={10}
                xTickAngle={-15}
                xTickDx={40} // ⬅️ geser label lebih ke kanan
                xTickDy={5}
                leftMargin={0} // ⬅️ tambah ruang kiri (di luar plot)
                leftPadding={0} // ⬅️ tambah padding kiri (di sumbu X)
                showGridVertical
                showGridHorizontal
                gridDash="3 6"
              />

              <LineChartX
                title="Tren Klik Mingguan"
                description="Pantau dinamika aktivitas belajar mahasiswa di lingkungan VLE."
                data={activityData}
                insight={craftActivityInsight(filteredActivity)}
                onBrushChange={(start, end) =>
                  setSelection({
                    studentIds: data.studentActivity
                      .filter((student) =>
                        student.weeks.some((w) => w.week >= start && w.week <= end),
                      )
                      .map((student) => student.id_student),
                  })
                }
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <PieChartX
                title="Komposisi Gender"
                description="Proporsi gender mahasiswa yang terdaftar pada filter aktif."
                data={demographicData}
                insight={craftDemographicInsight(filteredOutcomeByDemo)}
              />
              <HistogramX
                title="Distribusi Skor Akhir"
                description="Sebaran skor akhir mahasiswa yang memenuhi filter."
                data={histogramData}
                insight={craftHistogramInsight(filteredGradeDistribution)}
              />
            </section>

            <section className="grid gap-6">
              <ChoroplethMap
                title="Sebaran Region Mahasiswa"
                description="Klik wilayah untuk menerapkan filter region dan melihat detail pada visualisasi lain."
                metricByRegion={mapData}
                insight={buildRegionInsight(filteredRegion)}
                onRegionClick={(region) => {
                  const currentRegions = new Set(filters.regions);
                  if (currentRegions.has(region)) currentRegions.delete(region);
                  else currentRegions.add(region);
                  useAppStore.getState().setFilter('regions', Array.from(currentRegions));
                }}
              />
            </section>
          </div>
        </div>

        <FilterDrawer open={openFilter} onClose={() => setOpenFilter(false)} />
      </motion.div>
    </main>
  );
};

export default DashboardPage;
