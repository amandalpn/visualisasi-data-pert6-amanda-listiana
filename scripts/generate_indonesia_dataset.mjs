import fs from 'fs';
import path from 'path';

const students = [
  {
    id_student: '2401001',
    code_module: 'Statistika Dasar',
    code_presentation: '2024Ganjil',
    outcome: 'Pass',
    total_clicks: 720,
    final_score: 82,
    gender: 'Perempuan',
    region: 'Jawa Barat',
    age_band: '18-20',
    highest_education: 'SMA/SMK',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 40 },
      { week: 0, clicks: 120 },
      { week: 2, clicks: 140 },
      { week: 4, clicks: 160 },
      { week: 6, clicks: 150 },
      { week: 8, clicks: 110 },
    ],
  },
  {
    id_student: '2401002',
    code_module: 'Statistika Dasar',
    code_presentation: '2024Ganjil',
    outcome: 'Pass',
    total_clicks: 680,
    final_score: 78,
    gender: 'Laki-laki',
    region: 'DKI Jakarta',
    age_band: '21-23',
    highest_education: 'Diploma',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 35 },
      { week: 0, clicks: 110 },
      { week: 2, clicks: 135 },
      { week: 4, clicks: 140 },
      { week: 6, clicks: 130 },
      { week: 8, clicks: 130 },
    ],
  },
  {
    id_student: '2401003',
    code_module: 'Statistika Dasar',
    code_presentation: '2024Ganjil',
    outcome: 'Fail',
    total_clicks: 420,
    final_score: 38,
    gender: 'Laki-laki',
    region: 'Jawa Timur',
    age_band: '21-23',
    highest_education: 'SMA/SMK',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 20 },
      { week: 0, clicks: 80 },
      { week: 2, clicks: 90 },
      { week: 4, clicks: 110 },
      { week: 6, clicks: 70 },
      { week: 8, clicks: 50 },
    ],
  },
  {
    id_student: '2401004',
    code_module: 'Statistika Dasar',
    code_presentation: '2024Ganjil',
    outcome: 'Pass',
    total_clicks: 650,
    final_score: 74,
    gender: 'Perempuan',
    region: 'DI Yogyakarta',
    age_band: '18-20',
    highest_education: 'SMA/SMK',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 38 },
      { week: 0, clicks: 115 },
      { week: 2, clicks: 128 },
      { week: 4, clicks: 140 },
      { week: 6, clicks: 135 },
      { week: 8, clicks: 94 },
    ],
  },
  {
    id_student: '2401005',
    code_module: 'Statistika Dasar',
    code_presentation: '2024Ganjil',
    outcome: 'Withdrawn',
    total_clicks: 180,
    final_score: 0,
    gender: 'Perempuan',
    region: 'Banten',
    age_band: '24-30',
    highest_education: 'SMA/SMK',
    disability: 'Ya',
    weeks: [
      { week: -1, clicks: 18 },
      { week: 0, clicks: 60 },
      { week: 2, clicks: 55 },
      { week: 4, clicks: 47 },
    ],
  },
  {
    id_student: '2401006',
    code_module: 'Statistika Dasar',
    code_presentation: '2024Ganjil',
    outcome: 'Pass',
    total_clicks: 750,
    final_score: 89,
    gender: 'Laki-laki',
    region: 'Jawa Barat',
    age_band: '18-20',
    highest_education: 'SMA/SMK',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 42 },
      { week: 0, clicks: 130 },
      { week: 2, clicks: 150 },
      { week: 4, clicks: 160 },
      { week: 6, clicks: 150 },
      { week: 8, clicks: 118 },
    ],
  },
  {
    id_student: '2402001',
    code_module: 'Analitik Pendidikan Digital',
    code_presentation: '2024Ganjil',
    outcome: 'Pass',
    total_clicks: 710,
    final_score: 85,
    gender: 'Perempuan',
    region: 'Jawa Tengah',
    age_band: '21-23',
    highest_education: 'Sarjana',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 38 },
      { week: 0, clicks: 120 },
      { week: 2, clicks: 130 },
      { week: 4, clicks: 150 },
      { week: 6, clicks: 140 },
      { week: 8, clicks: 132 },
    ],
  },
  {
    id_student: '2402002',
    code_module: 'Analitik Pendidikan Digital',
    code_presentation: '2024Ganjil',
    outcome: 'Pass',
    total_clicks: 640,
    final_score: 72,
    gender: 'Laki-laki',
    region: 'Jawa Barat',
    age_band: '24-30',
    highest_education: 'Sarjana',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 32 },
      { week: 0, clicks: 100 },
      { week: 2, clicks: 118 },
      { week: 4, clicks: 130 },
      { week: 6, clicks: 120 },
      { week: 8, clicks: 140 },
    ],
  },
  {
    id_student: '2402003',
    code_module: 'Analitik Pendidikan Digital',
    code_presentation: '2024Ganjil',
    outcome: 'Fail',
    total_clicks: 390,
    final_score: 34,
    gender: 'Perempuan',
    region: 'Sumatera Utara',
    age_band: '24-30',
    highest_education: 'Diploma',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 16 },
      { week: 0, clicks: 70 },
      { week: 2, clicks: 80 },
      { week: 4, clicks: 82 },
      { week: 6, clicks: 72 },
      { week: 8, clicks: 70 },
    ],
  },
  {
    id_student: '2402004',
    code_module: 'Analitik Pendidikan Digital',
    code_presentation: '2024Ganjil',
    outcome: 'Pass',
    total_clicks: 680,
    final_score: 80,
    gender: 'Laki-laki',
    region: 'Kalimantan Selatan',
    age_band: '24-30',
    highest_education: 'Sarjana',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 34 },
      { week: 0, clicks: 110 },
      { week: 2, clicks: 125 },
      { week: 4, clicks: 140 },
      { week: 6, clicks: 130 },
      { week: 8, clicks: 141 },
    ],
  },
  {
    id_student: '2402005',
    code_module: 'Analitik Pendidikan Digital',
    code_presentation: '2024Ganjil',
    outcome: 'Withdrawn',
    total_clicks: 220,
    final_score: 0,
    gender: 'Perempuan',
    region: 'Bali',
    age_band: '21-23',
    highest_education: 'SMA/SMK',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 20 },
      { week: 0, clicks: 75 },
      { week: 2, clicks: 65 },
      { week: 4, clicks: 60 },
    ],
  },
  {
    id_student: '2402006',
    code_module: 'Analitik Pendidikan Digital',
    code_presentation: '2024Ganjil',
    outcome: 'Pass',
    total_clicks: 520,
    final_score: 68,
    gender: 'Perempuan',
    region: 'Papua',
    age_band: '21-23',
    highest_education: 'Sarjana',
    disability: 'Ya',
    weeks: [
      { week: -1, clicks: 28 },
      { week: 0, clicks: 95 },
      { week: 2, clicks: 105 },
      { week: 4, clicks: 120 },
      { week: 6, clicks: 98 },
      { week: 8, clicks: 74 },
    ],
  },
  {
    id_student: '2403001',
    code_module: 'Visualisasi Data Interaktif',
    code_presentation: '2024Genap',
    outcome: 'Pass',
    total_clicks: 690,
    final_score: 83,
    gender: 'Perempuan',
    region: 'Jawa Tengah',
    age_band: '18-20',
    highest_education: 'SMA/SMK',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 36 },
      { week: 0, clicks: 110 },
      { week: 2, clicks: 128 },
      { week: 4, clicks: 140 },
      { week: 6, clicks: 136 },
      { week: 8, clicks: 140 },
    ],
  },
  {
    id_student: '2403002',
    code_module: 'Visualisasi Data Interaktif',
    code_presentation: '2024Genap',
    outcome: 'Pass',
    total_clicks: 610,
    final_score: 77,
    gender: 'Laki-laki',
    region: 'Jawa Timur',
    age_band: '21-23',
    highest_education: 'Sarjana',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 30 },
      { week: 0, clicks: 98 },
      { week: 2, clicks: 112 },
      { week: 4, clicks: 120 },
      { week: 6, clicks: 120 },
      { week: 8, clicks: 130 },
    ],
  },
  {
    id_student: '2403003',
    code_module: 'Visualisasi Data Interaktif',
    code_presentation: '2024Genap',
    outcome: 'Fail',
    total_clicks: 350,
    final_score: 32,
    gender: 'Perempuan',
    region: 'Sulawesi Selatan',
    age_band: '21-23',
    highest_education: 'Diploma',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 18 },
      { week: 0, clicks: 60 },
      { week: 2, clicks: 72 },
      { week: 4, clicks: 80 },
      { week: 6, clicks: 65 },
      { week: 8, clicks: 55 },
    ],
  },
  {
    id_student: '2403004',
    code_module: 'Visualisasi Data Interaktif',
    code_presentation: '2024Genap',
    outcome: 'Pass',
    total_clicks: 640,
    final_score: 79,
    gender: 'Laki-laki',
    region: 'DKI Jakarta',
    age_band: '18-20',
    highest_education: 'SMA/SMK',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 34 },
      { week: 0, clicks: 108 },
      { week: 2, clicks: 120 },
      { week: 4, clicks: 132 },
      { week: 6, clicks: 130 },
      { week: 8, clicks: 116 },
    ],
  },
  {
    id_student: '2403005',
    code_module: 'Visualisasi Data Interaktif',
    code_presentation: '2024Genap',
    outcome: 'Pass',
    total_clicks: 700,
    final_score: 86,
    gender: 'Perempuan',
    region: 'Jawa Barat',
    age_band: '18-20',
    highest_education: 'Sarjana',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 40 },
      { week: 0, clicks: 120 },
      { week: 2, clicks: 135 },
      { week: 4, clicks: 140 },
      { week: 6, clicks: 130 },
      { week: 8, clicks: 135 },
    ],
  },
  {
    id_student: '2403006',
    code_module: 'Visualisasi Data Interaktif',
    code_presentation: '2024Genap',
    outcome: 'Withdrawn',
    total_clicks: 210,
    final_score: 0,
    gender: 'Laki-laki',
    region: 'Bali',
    age_band: '24-30',
    highest_education: 'Diploma',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 15 },
      { week: 0, clicks: 68 },
      { week: 2, clicks: 60 },
      { week: 4, clicks: 47 },
      { week: 6, clicks: 20 },
    ],
  },
  {
    id_student: '2404001',
    code_module: 'Pemrograman Python Terapan',
    code_presentation: '2024Genap',
    outcome: 'Pass',
    total_clicks: 780,
    final_score: 88,
    gender: 'Laki-laki',
    region: 'Jawa Timur',
    age_band: '21-23',
    highest_education: 'SMA/SMK',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 42 },
      { week: 0, clicks: 130 },
      { week: 2, clicks: 140 },
      { week: 4, clicks: 150 },
      { week: 6, clicks: 160 },
      { week: 8, clicks: 158 },
    ],
  },
  {
    id_student: '2404002',
    code_module: 'Pemrograman Python Terapan',
    code_presentation: '2024Genap',
    outcome: 'Pass',
    total_clicks: 720,
    final_score: 82,
    gender: 'Perempuan',
    region: 'Jawa Barat',
    age_band: '18-20',
    highest_education: 'SMA/SMK',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 36 },
      { week: 0, clicks: 120 },
      { week: 2, clicks: 130 },
      { week: 4, clicks: 140 },
      { week: 6, clicks: 150 },
      { week: 8, clicks: 144 },
    ],
  },
  {
    id_student: '2404003',
    code_module: 'Pemrograman Python Terapan',
    code_presentation: '2024Genap',
    outcome: 'Pass',
    total_clicks: 650,
    final_score: 75,
    gender: 'Laki-laki',
    region: 'Kalimantan Timur',
    age_band: '24-30',
    highest_education: 'Sarjana',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 30 },
      { week: 0, clicks: 110 },
      { week: 2, clicks: 120 },
      { week: 4, clicks: 130 },
      { week: 6, clicks: 130 },
      { week: 8, clicks: 130 },
    ],
  },
  {
    id_student: '2404004',
    code_module: 'Pemrograman Python Terapan',
    code_presentation: '2024Genap',
    outcome: 'Fail',
    total_clicks: 410,
    final_score: 36,
    gender: 'Perempuan',
    region: 'Sulawesi Selatan',
    age_band: '24-30',
    highest_education: 'Diploma',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 22 },
      { week: 0, clicks: 90 },
      { week: 2, clicks: 85 },
      { week: 4, clicks: 80 },
      { week: 6, clicks: 70 },
      { week: 8, clicks: 63 },
    ],
  },
  {
    id_student: '2404005',
    code_module: 'Pemrograman Python Terapan',
    code_presentation: '2024Genap',
    outcome: 'Pass',
    total_clicks: 690,
    final_score: 81,
    gender: 'Perempuan',
    region: 'DKI Jakarta',
    age_band: '21-23',
    highest_education: 'Sarjana',
    disability: 'Tidak',
    weeks: [
      { week: -1, clicks: 34 },
      { week: 0, clicks: 115 },
      { week: 2, clicks: 125 },
      { week: 4, clicks: 138 },
      { week: 6, clicks: 140 },
      { week: 8, clicks: 138 },
    ],
  },
  {
    id_student: '2404006',
    code_module: 'Pemrograman Python Terapan',
    code_presentation: '2024Genap',
    outcome: 'Withdrawn',
    total_clicks: 260,
    final_score: 0,
    gender: 'Laki-laki',
    region: 'Sumatera Barat',
    age_band: '24-30',
    highest_education: 'SMA/SMK',
    disability: 'Ya',
    weeks: [
      { week: -1, clicks: 20 },
      { week: 0, clicks: 80 },
      { week: 2, clicks: 70 },
      { week: 4, clicks: 60 },
      { week: 6, clicks: 30 },
    ],
  },
];

const aggDir = path.join(process.cwd(), 'public', 'data', 'oulad', 'agg');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const formatCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[\",\\n]/.test(str)) {
    return `"${str.replace(/\"/g, '""')}"`;
  }
  return str;
};

const writeCsv = (filename, rows) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const content = [
    headers.join(','),
    ...rows.map((row) => headers.map((key) => formatCsvValue(row[key])).join(',')),
  ].join('\n');
  fs.writeFileSync(path.join(aggDir, filename), `${content}\n`, 'utf8');
};

const groupBy = (items, keyFn) => {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  }
  return map;
};

const toBand = (score) => {
  if (score <= 0) return 0;
  const band = Math.floor(score / 20) * 20;
  return Math.min(band, 100);
};

const round = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

ensureDir(aggDir);

// Student activity CSV
const studentActivityRows = students.map((student) => ({
  ...student,
  weeks: JSON.stringify(student.weeks),
}));

writeCsv('student_activity.csv', studentActivityRows);

const moduleGroups = groupBy(
  students,
  (student) => `${student.code_module}:::${student.code_presentation}`,
);

// Activity by week
const activityRows = [];

for (const [key, moduleStudents] of moduleGroups.entries()) {
  const [code_module, code_presentation] = key.split(':::');
  const weeksMap = new Map();
  const studentPresence = new Map();

  for (const student of moduleStudents) {
    for (const { week, clicks } of student.weeks) {
      const current = weeksMap.get(week) ?? 0;
      weeksMap.set(week, current + clicks);
      if (!studentPresence.has(week)) {
        studentPresence.set(week, new Set());
      }
      studentPresence.get(week).add(student.id_student);
    }
  }

  const avgScore =
    moduleStudents.reduce((acc, student) => acc + student.final_score, 0) /
    Math.max(moduleStudents.length, 1);

  const sortedWeeks = Array.from(weeksMap.keys()).sort((a, b) => a - b);
  for (const week of sortedWeeks) {
    activityRows.push({
      code_module,
      code_presentation,
      week,
      sum_clicks: weeksMap.get(week),
      students_count: studentPresence.get(week)?.size ?? 0,
      avg_final_score: round(avgScore, 1),
    });
  }
}

activityRows.sort((a, b) => {
  if (a.code_module === b.code_module) {
    if (a.code_presentation === b.code_presentation) {
      return a.week - b.week;
    }
    return a.code_presentation.localeCompare(b.code_presentation);
  }
  return a.code_module.localeCompare(b.code_module);
});

writeCsv('activity_by_week.csv', activityRows);

// Grade distribution
const gradeRows = [];

for (const [key, moduleStudents] of moduleGroups.entries()) {
  const [code_module, code_presentation] = key.split(':::');
  const bandCounts = new Map();
  for (const student of moduleStudents) {
    const band = toBand(student.final_score);
    bandCounts.set(band, (bandCounts.get(band) ?? 0) + 1);
  }
  const sortedBands = Array.from(bandCounts.keys()).sort((a, b) => a - b);
  for (const band of sortedBands) {
    gradeRows.push({
      code_module,
      code_presentation,
      band,
      students: bandCounts.get(band),
    });
  }
}

gradeRows.sort((a, b) => {
  if (a.code_module === b.code_module) {
    if (a.code_presentation === b.code_presentation) {
      return a.band - b.band;
    }
    return a.code_presentation.localeCompare(b.code_presentation);
  }
  return a.code_module.localeCompare(b.code_module);
});

writeCsv('grade_distribution.csv', gradeRows);

// Module outcome
const moduleOutcomeRows = [];

for (const [key, moduleStudents] of moduleGroups.entries()) {
  const [code_module, code_presentation] = key.split(':::');
  const totalPass = moduleStudents.filter((student) => student.outcome === 'Pass').length;
  const fail = moduleStudents.filter((student) => student.outcome === 'Fail').length;
  const withdrawn = moduleStudents.filter((student) => student.outcome === 'Withdrawn').length;
  const distinction = moduleStudents.filter(
    (student) => student.outcome === 'Pass' && student.final_score >= 85,
  ).length;
  moduleOutcomeRows.push({
    code_module,
    code_presentation,
    pass: totalPass - distinction,
    fail,
    withdrawn,
    distinction,
  });
}

moduleOutcomeRows.sort((a, b) => {
  if (a.code_module === b.code_module) {
    return a.code_presentation.localeCompare(b.code_presentation);
  }
  return a.code_module.localeCompare(b.code_module);
});

writeCsv('module_outcome.csv', moduleOutcomeRows);

// Outcome by demographic
const demographicRows = [];

const addDemographic = (demographic, category, predicate) => {
  const pass = students.filter(
    (student) =>
      predicate(student) && student.outcome === 'Pass' && student.final_score < 85,
  ).length;
  const fail = students.filter(
    (student) => predicate(student) && student.outcome === 'Fail',
  ).length;
  const withdrawn = students.filter(
    (student) => predicate(student) && student.outcome === 'Withdrawn',
  ).length;
  const distinction = students.filter(
    (student) =>
      predicate(student) && student.outcome === 'Pass' && student.final_score >= 85,
  ).length;

  demographicRows.push({
    demographic,
    category,
    pass,
    fail,
    withdrawn,
    distinction,
  });
};

const demographics = ['gender', 'region', 'age_band', 'highest_education'];

for (const field of demographics) {
  const categories = Array.from(new Set(students.map((student) => student[field])));
  for (const category of categories) {
    addDemographic(field, category, (student) => student[field] === category);
  }
}

demographicRows.sort((a, b) => {
  if (a.demographic === b.demographic) {
    return a.category.localeCompare(b.category);
  }
  return a.demographic.localeCompare(b.demographic);
});

writeCsv('outcome_by_demographic.csv', demographicRows);

// Region choropleth
const regionRows = [];
const regions = groupBy(students, (student) => student.region);

for (const [region, regionStudents] of regions.entries()) {
  const studentsCount = regionStudents.length;
  const avgScore =
    regionStudents.reduce((acc, student) => acc + student.final_score, 0) /
    Math.max(studentsCount, 1);
  regionRows.push({
    region,
    students: studentsCount,
    average_score: round(avgScore, 1),
  });
}

regionRows.sort((a, b) => a.region.localeCompare(b.region));

writeCsv('region_choropleth.csv', regionRows);

console.log('Dataset agregasi Indonesia berhasil dibuat di', aggDir);
