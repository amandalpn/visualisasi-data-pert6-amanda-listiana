const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'public', 'data', 'oulad', 'agg');

const modules = [
  { code_module: 'Statistika Dasar', code_presentation: '2024Ganjil', baseClicks: 620 },
  { code_module: 'Analitik Pendidikan Digital', code_presentation: '2024Ganjil', baseClicks: 580 },
  { code_module: 'Visualisasi Data Interaktif', code_presentation: '2024Genap', baseClicks: 610 },
  { code_module: 'Pemrograman Python Terapan', code_presentation: '2024Genap', baseClicks: 640 },
];

const ageBands = ['18-20', '21-23', '24-30', '31-40'];
const educations = ['Diploma', 'Sarjana', 'Magister', 'Doktor'];
const genders = ['Laki-laki', 'Perempuan'];
const regions = [
  'Jawa Barat',
  'DKI Jakarta',
  'Jawa Timur',
  'DI Yogyakarta',
  'Bali',
  'Banten',
  'Jawa Tengah',
  'Sulawesi Selatan',
  'Sumatera Utara',
  'Papua',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Papua Barat',
  'Aceh',
  'Riau',
  'Kepulauan Riau',
  'NTB',
  'NTT',
  'Lampung',
  'Kalimantan Barat',
];

const seedRandom = (seed, scope = 1) => {
  const x = Math.sin(seed * 9301 + scope * 49297 + 233280) * 10000;
  return x - Math.floor(x);
};

const round = (value, decimals = 1) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const bandForScore = (score) => `${Math.floor(Math.max(score, 0) / 10) * 10}`;

const csvEscape = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const writeCsv = (fileName, headers, rows) => {
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ];
  fs.writeFileSync(path.join(outputDir, fileName), `${lines.join('\n')}\n`, 'utf8');
};

const generateWeeks = (moduleConfig, index, outcome) => {
  const templateWeeks = [-1, 0, 2, 4, 6, 8, 10];
  const activeWeeks = outcome === 'Withdrawn' ? templateWeeks.slice(0, 4) : templateWeeks;
  return activeWeeks.map((week, idx) => {
    const variance =
      moduleConfig.baseClicks *
      (0.45 + seedRandom(index + idx * 13, week + moduleConfig.baseClicks) * 0.6);
    const clicks = Math.max(12, Math.round(variance));
    return { week, clicks };
  });
};

const determineOutcome = (score, index) => {
  if (score >= 85) return 'Distinction';
  if (score >= 50) return 'Pass';
  if (index % 20 === 0) return 'Withdrawn';
  return 'Fail';
};

const generateStudents = (count) => {
  const students = [];
  for (let i = 0; i < count; i += 1) {
    const module = modules[i % modules.length];
    const gender = seedRandom(i, 19) < 0.62 ? 'Laki-laki' : 'Perempuan';
    const region = regions[i % regions.length];
    const age_band = ageBands[(i * 3) % ageBands.length];
    const highest_education = educations[(i * 5) % educations.length];
    const disability = i % 11 === 0 ? 'Ya' : 'Tidak';

    let scoreBase = 65 + seedRandom(i, 3) * 30;
    if (i % 13 === 0) scoreBase = 88 + seedRandom(i, 5) * 10;
    if (i % 7 === 0) scoreBase = 35 + seedRandom(i, 7) * 15;
    if (i % 20 === 0) scoreBase = 0;
    const final_score = Math.min(99, Math.max(0, round(scoreBase, 1)));
    const outcome = determineOutcome(final_score, i);

    const weeks = generateWeeks(module, i, outcome);
    const total_clicks = weeks.reduce((acc, week) => acc + week.clicks, 0);

    students.push({
      id_student: 2501000 + i,
      code_module: module.code_module,
      code_presentation: module.code_presentation,
      outcome,
      total_clicks,
      final_score: outcome === 'Withdrawn' ? 0 : final_score,
      gender,
      region,
      age_band,
      highest_education,
      disability,
      weeks,
    });
  }
  return students;
};

const aggregateModuleOutcome = (students) => {
  const map = new Map();
  students.forEach((student) => {
    const key = `${student.code_module}|${student.code_presentation}`;
    if (!map.has(key)) {
      map.set(key, {
        code_module: student.code_module,
        code_presentation: student.code_presentation,
        pass: 0,
        fail: 0,
        withdrawn: 0,
        distinction: 0,
      });
    }
    const entry = map.get(key);
    entry.pass += student.outcome === 'Pass' ? 1 : 0;
    entry.fail += student.outcome === 'Fail' ? 1 : 0;
    entry.withdrawn += student.outcome === 'Withdrawn' ? 1 : 0;
    entry.distinction += student.outcome === 'Distinction' ? 1 : 0;
  });
  return [...map.values()].sort((a, b) => a.code_module.localeCompare(b.code_module));
};

const aggregateGradeDistribution = (students) => {
  const map = new Map();
  students
    .filter((student) => student.outcome !== 'Withdrawn')
    .forEach((student) => {
      const key = `${student.code_module}|${student.code_presentation}|${bandForScore(student.final_score)}`;
      if (!map.has(key)) {
        map.set(key, {
          code_module: student.code_module,
          code_presentation: student.code_presentation,
          band: bandForScore(student.final_score),
          students: 0,
        });
      }
      map.get(key).students += 1;
    });
  return [...map.values()].sort((a, b) => {
    if (a.code_module !== b.code_module) {
      return a.code_module.localeCompare(b.code_module);
    }
    if (a.code_presentation !== b.code_presentation) {
      return a.code_presentation.localeCompare(b.code_presentation);
    }
    return Number(a.band) - Number(b.band);
  });
};

const aggregateOutcomeByDemographic = (students) => {
  const demographics = ['gender', 'age_band', 'highest_education', 'region', 'disability'];
  const map = new Map();
  students.forEach((student) => {
    demographics.forEach((demographic) => {
      const category = student[demographic] ?? 'Tidak diketahui';
      const key = `${demographic}|${category}`;
      if (!map.has(key)) {
        map.set(key, { demographic, category, pass: 0, fail: 0, withdrawn: 0, distinction: 0 });
      }
      const entry = map.get(key);
      entry.pass += student.outcome === 'Pass' ? 1 : 0;
      entry.fail += student.outcome === 'Fail' ? 1 : 0;
      entry.withdrawn += student.outcome === 'Withdrawn' ? 1 : 0;
      entry.distinction += student.outcome === 'Distinction' ? 1 : 0;
    });
  });
  return [...map.values()].sort((a, b) => {
    if (a.demographic !== b.demographic) {
      return a.demographic.localeCompare(b.demographic);
    }
    return a.category.localeCompare(b.category);
  });
};

const aggregateRegionChoropleth = (students) => {
  const map = new Map();
  students.forEach((student) => {
    const region = student.region ?? 'Tidak diketahui';
    if (!map.has(region)) {
      map.set(region, { region, students: 0, totalScore: 0, scored: 0 });
    }
    const entry = map.get(region);
    entry.students += 1;
    if (student.outcome !== 'Withdrawn') {
      entry.totalScore += student.final_score;
      entry.scored += 1;
    }
  });
  return [...map.values()]
    .map((entry) => ({
      region: entry.region,
      students: entry.students,
      average_score: entry.scored === 0 ? 0 : round(entry.totalScore / entry.scored, 1),
    }))
    .sort((a, b) => a.region.localeCompare(b.region));
};

const aggregateActivityByWeek = (students) => {
  const perModule = new Map();
  students.forEach((student) => {
    const key = `${student.code_module}|${student.code_presentation}`;
    if (!perModule.has(key)) {
      perModule.set(key, []);
    }
    perModule.get(key).push(student);
  });

  const rows = [];
  perModule.forEach((moduleStudents, key) => {
    const [code_module, code_presentation] = key.split('|');
    const weeks = new Map();
    moduleStudents.forEach((student) => {
      student.weeks.forEach((entry) => {
        const weekKey = entry.week;
        if (!weeks.has(weekKey)) {
          weeks.set(weekKey, { sum_clicks: 0, students: new Set() });
        }
        const weekEntry = weeks.get(weekKey);
        weekEntry.sum_clicks += entry.clicks;
        weekEntry.students.add(student.id_student);
      });
    });

    const avgFinalScore =
      moduleStudents.reduce((acc, student) => acc + student.final_score, 0) /
      Math.max(moduleStudents.length, 1);

    [...weeks.keys()]
      .sort((a, b) => a - b)
      .forEach((week) => {
        const entry = weeks.get(week);
        rows.push({
          code_module,
          code_presentation,
          week,
          sum_clicks: entry.sum_clicks,
          students_count: entry.students.size,
          avg_final_score: round(avgFinalScore, 1),
        });
      });
  });

  return rows.sort((a, b) => {
    if (a.code_module !== b.code_module) {
      return a.code_module.localeCompare(b.code_module);
    }
    if (a.code_presentation !== b.code_presentation) {
      return a.code_presentation.localeCompare(b.code_presentation);
    }
    return a.week - b.week;
  });
};

const main = () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const students = generateStudents(128);

  writeCsv(
    'student_activity.csv',
    [
      'id_student',
      'code_module',
      'code_presentation',
      'outcome',
      'total_clicks',
      'final_score',
      'gender',
      'region',
      'age_band',
      'highest_education',
      'disability',
      'weeks',
    ],
    students.map((student) => ({
      ...student,
      weeks: JSON.stringify(student.weeks),
    })),
  );

  writeCsv(
    'module_outcome.csv',
    ['code_module', 'code_presentation', 'pass', 'fail', 'withdrawn', 'distinction'],
    aggregateModuleOutcome(students),
  );

  writeCsv(
    'grade_distribution.csv',
    ['code_module', 'code_presentation', 'band', 'students'],
    aggregateGradeDistribution(students),
  );

  writeCsv(
    'outcome_by_demographic.csv',
    ['demographic', 'category', 'pass', 'fail', 'withdrawn', 'distinction'],
    aggregateOutcomeByDemographic(students),
  );

  writeCsv(
    'region_choropleth.csv',
    ['region', 'students', 'average_score'],
    aggregateRegionChoropleth(students),
  );

  writeCsv(
    'activity_by_week.csv',
    ['code_module', 'code_presentation', 'week', 'sum_clicks', 'students_count', 'avg_final_score'],
    aggregateActivityByWeek(students),
  );

  // eslint-disable-next-line no-console
  console.log('Dataset regenerated with', students.length, 'students.');
};

main();
