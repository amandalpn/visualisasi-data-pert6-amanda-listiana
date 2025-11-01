
#!/usr/bin/env node
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { z } from 'zod';

const root = path.resolve(process.cwd());
const rawDir = path.join(root, 'public', 'data', 'oulad', 'raw');
const aggDir = path.join(root, 'public', 'data', 'oulad', 'agg');

const requiredRaw = [
  'studentInfo.csv',
  'courses.csv',
  'studentVle.csv',
  'assessments.csv',
  'studentAssessment.csv',
  'vle.csv',
];

const parseCsvLine = (line) => {
  const values = [];
  let buffer = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      buffer += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      values.push(buffer);
      buffer = '';
      continue;
    }
    buffer += char;
  }

  values.push(buffer);
  return values.map((value) => value.trim());
};

const iterateCsv = async (filePath, onRow) => {
  const stream = createReadStream(filePath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headers = null;
  for await (const line of rl) {
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }
    if (!line.trim()) continue;
    const values = parseCsvLine(line);
    const row = headers.reduce((acc, key, idx) => {
      acc[key] = values[idx] ?? '';
      return acc;
    }, {});
    await onRow(row);
  }
};

const studentSchema = z.object({
  id_student: z.string(),
  code_module: z.string(),
  code_presentation: z.string(),
  region: z.string(),
  age_band: z.string(),
  imd_band: z.string().optional(),
  highest_education: z.string(),
  gender: z.string(),
  disability: z.string(),
  final_result: z.string(),
});

const assessmentSchema = z.object({
  id_assessment: z.string(),
  code_module: z.string(),
  code_presentation: z.string(),
  weight: z.string(),
});

const studentAssessmentSchema = z.object({
  id_assessment: z.string(),
  id_student: z.string(),
  score: z.string(),
});

const vleSchema = z.object({
  id_student: z.string(),
  code_module: z.string(),
  code_presentation: z.string(),
  date: z.string(),
  sum_click: z.string(),
});

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeResult = (value) => {
  const upper = value.trim().toLowerCase();
  if (upper.includes('withdraw')) return 'Withdrawn';
  if (upper.includes('fail')) return 'Fail';
  if (upper.includes('dist')) return 'Distinction';
  if (upper.includes('pass')) return 'Pass';
  return 'Unknown';
};

const ensureRawFiles = async () => {
  await fs.mkdir(rawDir, { recursive: true });
  const missing = [];
  for (const file of requiredRaw) {
    const exists = await fs
      .access(path.join(rawDir, file))
      .then(() => true)
      .catch(() => false);
    if (!exists) missing.push(file);
  }
  if (missing.length) {
    throw new Error(
      `File mentah belum lengkap. Jalankan npm run fetch:data atau letakkan manual: ${missing.join(
        ', ',
      )}`,
    );
  }
};

const writeCsv = async (filePath, rows, headers) => {
  const line = [headers.join(',')];
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
    line.push(values.join(','));
  }
  await fs.writeFile(filePath, `${line.join('\n')}\n`, 'utf-8');
};

const main = async () => {
  console.log('[prepare:data] Validasi file mentah...');
  await ensureRawFiles();
  await fs.mkdir(aggDir, { recursive: true });

  const students = new Map();
  const assessments = new Map();
  const studentScores = new Map();
  const studentWeeks = new Map();

  console.log('[prepare:data] Memuat studentInfo.csv');
  await iterateCsv(path.join(rawDir, 'studentInfo.csv'), async (row) => {
    const parsed = studentSchema.safeParse(row);
    if (!parsed.success) return;
    const data = parsed.data;
    const key = `${data.id_student}-${data.code_module}-${data.code_presentation}`;
    students.set(key, {
      id_student: data.id_student,
      code_module: data.code_module,
      code_presentation: data.code_presentation,
      region: data.region,
      age_band: data.age_band,
      highest_education: data.highest_education,
      gender: data.gender,
      disability: data.disability,
      final_result: normalizeResult(data.final_result),
      final_score: 0,
      total_clicks: 0,
      weeks: new Map(),
    });
  });

  console.log('[prepare:data] Memuat assessments.csv');
  await iterateCsv(path.join(rawDir, 'assessments.csv'), async (row) => {
    const parsed = assessmentSchema.safeParse(row);
    if (!parsed.success) return;
    assessments.set(parsed.data.id_assessment, {
      code_module: parsed.data.code_module,
      code_presentation: parsed.data.code_presentation,
      weight: toNumber(parsed.data.weight, 0),
    });
  });

  console.log('[prepare:data] Menghitung skor akhir mahasiswa...');
  await iterateCsv(path.join(rawDir, 'studentAssessment.csv'), async (row) => {
    const parsed = studentAssessmentSchema.safeParse(row);
    if (!parsed.success) return;
    const assessment = assessments.get(parsed.data.id_assessment);
    if (!assessment) return;
    const key = `${parsed.data.id_student}-${assessment.code_module}-${assessment.code_presentation}`;
    if (!students.has(key)) return;
    const entry =
      studentScores.get(key) ?? { weightedScore: 0, totalWeight: 0 };
    const weight = assessment.weight;
    const score = toNumber(parsed.data.score, 0);
    entry.weightedScore += (score * weight) / 100;
    entry.totalWeight += weight;
    studentScores.set(key, entry);
  });

  console.log('[prepare:data] Mengakumulasi aktivitas VLE...');
  await iterateCsv(path.join(rawDir, 'studentVle.csv'), async (row) => {
    const parsed = vleSchema.safeParse(row);
    if (!parsed.success) return;
    const key = `${parsed.data.id_student}-${parsed.data.code_module}-${parsed.data.code_presentation}`;
    const student = students.get(key);
    if (!student) return;
    const week = Math.floor(toNumber(parsed.data.date, 0) / 7);
    const clicks = toNumber(parsed.data.sum_click, 0);
    student.total_clicks += clicks;
    const weeks = studentWeeks.get(key) ?? new Map();
    weeks.set(week, (weeks.get(week) ?? 0) + clicks);
    studentWeeks.set(key, weeks);
  });

  for (const [key, student] of students.entries()) {
    const scores = studentScores.get(key);
    if (scores && scores.totalWeight > 0) {
      student.final_score = Math.round(
        (scores.weightedScore / scores.totalWeight) * 100,
      );
    } else {
      student.final_score = 0;
    }
    const weeks = studentWeeks.get(key) ?? new Map();
    student.weeks = weeks;
  }

  console.log('[prepare:data] Membentuk agregasi keluaran...');
  const activityByWeek = new Map();
  const gradeDistribution = new Map();
  const outcomeByDemo = {
    gender: new Map(),
    region: new Map(),
    age_band: new Map(),
    highest_education: new Map(),
  };
  const moduleOutcome = new Map();
  const regionChoropleth = new Map();
  const studentActivity = [];

  for (const student of students.values()) {
    const weeks = Array.from(student.weeks.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([week, clicks]) => ({ week, clicks }));
    studentActivity.push({
      id_student: student.id_student,
      code_module: student.code_module,
      code_presentation: student.code_presentation,
      outcome: student.final_result,
      total_clicks: student.total_clicks,
      final_score: student.final_score,
      gender: student.gender,
      region: student.region,
      age_band: student.age_band,
      highest_education: student.highest_education,
      disability: student.disability,
      weeks,
    });

    weeks.forEach(({ week, clicks }) => {
      const key = `${student.code_module}|${student.code_presentation}|${week}`;
      const entry =
        activityByWeek.get(key) ?? {
          code_module: student.code_module,
          code_presentation: student.code_presentation,
          week,
          sum_clicks: 0,
          students: new Set(),
          finalScoreSum: 0,
        };
      entry.sum_clicks += clicks;
      if (!entry.students.has(student.id_student)) {
        entry.students.add(student.id_student);
        entry.finalScoreSum += student.final_score;
      }
      activityByWeek.set(key, entry);
    });

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

    const demoKeys = [
      ['gender', student.gender],
      ['region', student.region],
      ['age_band', student.age_band],
      ['highest_education', student.highest_education],
    ];
    for (const [field, value] of demoKeys) {
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
      if (student.final_result === 'Pass') entry.pass += 1;
      else if (student.final_result === 'Fail') entry.fail += 1;
      else if (student.final_result === 'Withdrawn') entry.withdrawn += 1;
      else if (student.final_result === 'Distinction') entry.distinction += 1;
      target.set(value, entry);
    }

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
    if (student.final_result === 'Pass') modEntry.pass += 1;
    else if (student.final_result === 'Fail') modEntry.fail += 1;
    else if (student.final_result === 'Withdrawn') modEntry.withdrawn += 1;
    else if (student.final_result === 'Distinction') modEntry.distinction += 1;
    moduleOutcome.set(modKey, modEntry);

    const regionEntry =
      regionChoropleth.get(student.region) ?? {
        region: student.region,
        students: 0,
        scoreSum: 0,
      };
    regionEntry.students += 1;
    regionEntry.scoreSum += student.final_score;
    regionChoropleth.set(student.region, regionEntry);
  }

  const activityRows = Array.from(activityByWeek.values()).map((entry) => ({
    code_module: entry.code_module,
    code_presentation: entry.code_presentation,
    week: entry.week,
    sum_clicks: entry.sum_clicks,
    students_count: entry.students.size,
    avg_final_score:
      entry.students.size > 0 ? (entry.finalScoreSum / entry.students.size).toFixed(2) : '0',
  }));

  await writeCsv(path.join(aggDir, 'activity_by_week.csv'), activityRows, [
    'code_module',
    'code_presentation',
    'week',
    'sum_clicks',
    'students_count',
    'avg_final_score',
  ]);

  await writeCsv(path.join(aggDir, 'grade_distribution.csv'), Array.from(gradeDistribution.values()), [
    'code_module',
    'code_presentation',
    'band',
    'students',
  ]);

  const demographicsRows = Object.values(outcomeByDemo)
    .flatMap((map) => Array.from(map.values()))
    .sort((a, b) => a.demographic.localeCompare(b.demographic));
  await writeCsv(path.join(aggDir, 'outcome_by_demographic.csv'), demographicsRows, [
    'demographic',
    'category',
    'pass',
    'fail',
    'withdrawn',
    'distinction',
  ]);

  await writeCsv(path.join(aggDir, 'module_outcome.csv'), Array.from(moduleOutcome.values()), [
    'code_module',
    'code_presentation',
    'pass',
    'fail',
    'withdrawn',
    'distinction',
  ]);

  const regionRows = Array.from(regionChoropleth.values()).map((entry) => ({
    region: entry.region,
    students: entry.students,
    average_score:
      entry.students > 0 ? (entry.scoreSum / entry.students).toFixed(2) : '0',
  }));
  await writeCsv(path.join(aggDir, 'region_choropleth.csv'), regionRows, [
    'region',
    'students',
    'average_score',
  ]);

  await writeCsv(path.join(aggDir, 'student_activity.csv'), studentActivity, [
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
  ]);

  console.log('[prepare:data] Agregasi selesai. File siap digunakan frontend.');
};

main().catch((error) => {
  console.error('[prepare:data] Proses gagal:', error);
  process.exitCode = 1;
});
