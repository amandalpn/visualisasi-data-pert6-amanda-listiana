
#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const aggDir = path.join(root, 'public', 'data', 'oulad', 'agg');

const modules = [
  { code_module: 'AAA', code_presentation: '2024J' },
  { code_module: 'BBB', code_presentation: '2024J' },
  { code_module: 'CCC', code_presentation: '2024J' },
  { code_module: 'DDD', code_presentation: '2025B' },
];

const regions = [
  'East Midlands',
  'London',
  'South East',
  'South West',
  'Scotland',
  'Wales',
];

const genders = ['M', 'F'];
const educations = ['HE Qualification', 'No Formal quals', 'A Level or Equivalent'];
const ageBands = ['0-35', '35-55', '55<='];

const randomChoice = (items) => items[Math.floor(Math.random() * items.length)];

const writeCsv = async (filePath, rows, headers) => {
  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map((header) => {
      const value = row[header] ?? '';
      if (typeof value === 'string') {
        return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
      }
      if (Array.isArray(value)) {
        const serialized = JSON.stringify(value);
        return `"${serialized.replace(/"/g, '""')}"`;
      }
      return String(value);
    });
    lines.push(values.join(','));
  }
  await fs.writeFile(filePath, `${lines.join('\n')}\n`, 'utf-8');
};

const generate = async () => {
  const studentCount = 50000;
  const maxWeek = 30;
  const studentActivity = [];

  console.log('[seed:synthetic] Membuat data mahasiswa sintetis...');
  for (let i = 0; i < studentCount; i += 1) {
    const module = randomChoice(modules);
    const gender = randomChoice(genders);
    const region = randomChoice(regions);
    const highest_education = randomChoice(educations);
    const age_band = randomChoice(ageBands);
    const weeks = [];
    let totalClicks = 0;
    for (let week = 0; week <= maxWeek; week += 1) {
      const clicks = Math.max(
        0,
        Math.round(
          Math.random() * 80 *
            (1 + (gender === 'F' ? 0.05 : 0)) *
            (1 + (highest_education.includes('HE') ? 0.1 : -0.05)),
        ),
      );
      if (clicks > 0) {
        weeks.push({ week, clicks });
        totalClicks += clicks;
      }
    }
    const baseScore = Math.min(100, Math.round(totalClicks / (maxWeek * 0.8)));
    const final_score = Math.min(100, Math.max(0, baseScore + (Math.random() * 10 - 5)));
    let outcome = 'Fail';
    if (final_score >= 85) outcome = 'Distinction';
    else if (final_score >= 40) outcome = 'Pass';
    else if (weeks.length < 3) outcome = 'Withdrawn';

    studentActivity.push({
      id_student: String(100000 + i),
      code_module: module.code_module,
      code_presentation: module.code_presentation,
      outcome,
      total_clicks: totalClicks,
      final_score: Math.round(final_score),
      gender,
      region,
      age_band,
      highest_education,
      disability: Math.random() < 0.08 ? 'Yes' : 'No',
      weeks,
    });
  }

  console.log('[seed:synthetic] Mengolah agregasi...');
  const activityByWeek = new Map();
  const gradeDistribution = new Map();
  const outcomeByDemo = {
    gender: new Map(),
    region: new Map(),
    age_band: new Map(),
    highest_education: new Map(),
  };
  const moduleOutcome = new Map();
  const regionAgg = new Map();

  for (const student of studentActivity) {
    for (const { week, clicks } of student.weeks) {
      const key = `${student.code_module}|${student.code_presentation}|${week}`;
      const entry =
        activityByWeek.get(key) ?? {
          code_module: student.code_module,
          code_presentation: student.code_presentation,
          week,
          sum_clicks: 0,
          studentIds: new Set(),
          scoreSum: 0,
        };
      entry.sum_clicks += clicks;
      if (!entry.studentIds.has(student.id_student)) {
        entry.studentIds.add(student.id_student);
        entry.scoreSum += student.final_score;
      }
      activityByWeek.set(key, entry);
    }

    const band = Math.min(80, Math.floor(student.final_score / 20) * 20);
    const gradeKey = `${student.code_module}|${student.code_presentation}|${band}`;
    const gradeEntry =
      gradeDistribution.get(gradeKey) ?? {
        code_module: student.code_module,
        code_presentation: student.code_presentation,
        band,
        students: 0,
      };
    gradeEntry.students += 1;
    gradeDistribution.set(gradeKey, gradeEntry);

    const modKey = `${student.code_module}|${student.code_presentation}`;
    const modEntry =
      moduleOutcome.get(modKey) ?? {
        code_module: student.code_module,
        code_presentation: student.code_presentation,
        pass: 0,
        fail: 0,
        withdrawn: 0,
        distinction: 0,
      };
    if (student.outcome === 'Pass') modEntry.pass += 1;
    else if (student.outcome === 'Fail') modEntry.fail += 1;
    else if (student.outcome === 'Withdrawn') modEntry.withdrawn += 1;
    else if (student.outcome === 'Distinction') modEntry.distinction += 1;
    moduleOutcome.set(modKey, modEntry);

    const demoEntries = [
      ['gender', student.gender],
      ['region', student.region],
      ['age_band', student.age_band],
      ['highest_education', student.highest_education],
    ];
    for (const [field, value] of demoEntries) {
      const target = outcomeByDemo[field];
      const entry =
        target.get(value) ?? {
          demographic: field,
          category: value,
          pass: 0,
          fail: 0,
          withdrawn: 0,
          distinction: 0,
        };
      if (student.outcome === 'Pass') entry.pass += 1;
      else if (student.outcome === 'Fail') entry.fail += 1;
      else if (student.outcome === 'Withdrawn') entry.withdrawn += 1;
      else if (student.outcome === 'Distinction') entry.distinction += 1;
      target.set(value, entry);
    }

    const regionEntry =
      regionAgg.get(student.region) ?? { region: student.region, students: 0, scoreSum: 0 };
    regionEntry.students += 1;
    regionEntry.scoreSum += student.final_score;
    regionAgg.set(student.region, regionEntry);
  }

  await fs.mkdir(aggDir, { recursive: true });

  await writeCsv(
    path.join(aggDir, 'activity_by_week.csv'),
    Array.from(activityByWeek.values()).map((entry) => ({
      code_module: entry.code_module,
      code_presentation: entry.code_presentation,
      week: entry.week,
      sum_clicks: entry.sum_clicks,
      students_count: entry.studentIds.size,
      avg_final_score:
        entry.studentIds.size ? (entry.scoreSum / entry.studentIds.size).toFixed(2) : '0',
    })),
    ['code_module', 'code_presentation', 'week', 'sum_clicks', 'students_count', 'avg_final_score'],
  );

  await writeCsv(
    path.join(aggDir, 'grade_distribution.csv'),
    Array.from(gradeDistribution.values()),
    ['code_module', 'code_presentation', 'band', 'students'],
  );

  const demographicRows = Object.values(outcomeByDemo)
    .flatMap((map) => Array.from(map.values()))
    .sort((a, b) => a.demographic.localeCompare(b.demographic));

  await writeCsv(
    path.join(aggDir, 'outcome_by_demographic.csv'),
    demographicRows,
    ['demographic', 'category', 'pass', 'fail', 'withdrawn', 'distinction'],
  );

  await writeCsv(
    path.join(aggDir, 'module_outcome.csv'),
    Array.from(moduleOutcome.values()),
    ['code_module', 'code_presentation', 'pass', 'fail', 'withdrawn', 'distinction'],
  );

  await writeCsv(
    path.join(aggDir, 'region_choropleth.csv'),
    Array.from(regionAgg.values()).map((entry) => ({
      region: entry.region,
      students: entry.students,
      average_score: entry.students ? (entry.scoreSum / entry.students).toFixed(2) : '0',
    })),
    ['region', 'students', 'average_score'],
  );

  await writeCsv(
    path.join(aggDir, 'student_activity.csv'),
    studentActivity,
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
  );

  console.log('[seed:synthetic] Dataset sintetis berhasil dibuat.');
};

generate().catch((error) => {
  console.error('[seed:synthetic] Proses gagal:', error);
  process.exitCode = 1;
});
