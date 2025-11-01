import { getDuckDb } from './duckdb';
import type {
  ActivityByWeekRecord,
  GradeDistributionRecord,
  ModuleOutcomeRecord,
  OutcomeByDemographicRecord,
  RegionChoroplethRecord,
  StudentActivityRecord,
} from './types';

const cache = new Map<string, Promise<unknown>>();

// const fetchBinary = async (path: string) => {
//   const response = await fetch(path);
//   if (!response.ok) {
//     throw new Error(`Gagal memuat ${path}: ${response.statusText}`);
//   }
//   return new Uint8Array(await response.arrayBuffer());
// };

const fetchText = async (path: string) => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Gagal memuat ${path}: ${response.statusText}`);
  }
  return response.text();
};

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
};

const parseCsv = (text: string) => {
  const lines = text.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  return lines
    .slice(1)
    .map((line) => {
      const values = parseCsvLine(line);
      return headers.reduce<Record<string, string>>((acc, key, idx) => {
        acc[key] = values[idx] ?? '';
        return acc;
      }, {});
    })
    .filter((row) => Object.values(row).some((value) => value !== ''));
};

const toNumber = (value: unknown) => {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const mapActivityRecords = (rows: Array<Record<string, unknown>>): ActivityByWeekRecord[] =>
  rows.map((row) => ({
    code_module: String(row.code_module),
    code_presentation: String(row.code_presentation),
    week: toNumber(row.week),
    sum_clicks: toNumber(row.sum_clicks ?? row.clicks),
    students_count: toNumber(row.students_count ?? row.students),
    avg_final_score: toNumber(row.avg_final_score ?? row.average_score ?? row.avg_score),
  }));

const mapGradeRecords = (rows: Array<Record<string, unknown>>): GradeDistributionRecord[] =>
  rows.map((row) => ({
    code_module: String(row.code_module),
    code_presentation: String(row.code_presentation),
    band: String(row.band),
    students: toNumber(row.students),
  }));

const mapOutcomeByDemographic = (
  rows: Array<Record<string, unknown>>,
): OutcomeByDemographicRecord[] =>
  rows.map((row) => ({
    demographic: String(row.demographic),
    category: String(row.category),
    pass: toNumber(row.pass),
    fail: toNumber(row.fail),
    withdrawn: toNumber(row.withdrawn),
    distinction: toNumber(row.distinction),
  }));

const mapModuleOutcome = (rows: Array<Record<string, unknown>>): ModuleOutcomeRecord[] =>
  rows.map((row) => ({
    code_module: String(row.code_module),
    code_presentation: String(row.code_presentation),
    pass: toNumber(row.pass),
    fail: toNumber(row.fail),
    withdrawn: toNumber(row.withdrawn),
    distinction: toNumber(row.distinction),
  }));

const mapRegionChoropleth = (rows: Array<Record<string, unknown>>): RegionChoroplethRecord[] =>
  rows.map((row) => ({
    region: String(row.region),
    students: toNumber(row.students),
    average_score: toNumber(row.average_score ?? row.avg_final_score),
  }));

const mapStudentActivity = (rows: Array<Record<string, string>>): StudentActivityRecord[] =>
  rows.map((row) => ({
    id_student: row.id_student,
    code_module: row.code_module,
    code_presentation: row.code_presentation,
    outcome: row.outcome,
    total_clicks: toNumber(row.total_clicks),
    final_score: toNumber(row.final_score),
    gender: row.gender,
    region: row.region,
    age_band: row.age_band,
    highest_education: row.highest_education,
    disability: row.disability,
    weeks: (() => {
      try {
        const parsed = JSON.parse(row.weeks ?? '[]') as Array<{ week: number; clicks: number }>;
        return parsed.map((item) => ({ week: toNumber(item.week), clicks: toNumber(item.clicks) }));
      } catch {
        return [];
      }
    })(),
  }));

const loadParquet = async <T>(parquetPath: string, csvFallback: string) => {
  try {
    const db = await getDuckDb();
    const conn = await db.connect();
    await conn.query('INSTALL httpfs; LOAD httpfs;');

    const abs = new URL(parquetPath, window.location.origin).toString();
    const res = await conn.query(`SELECT * FROM read_parquet('${abs}')`);
    conn.close();

    const rows = res.toArray().map((r: any) => (r.toJSON ? r.toJSON() : r));
    return rows as unknown as T[];
  } catch (error) {
    console.warn(`Parquet ${parquetPath} gagal dimuat, fallback CSV:`, error);
    const text = await fetchText(csvFallback);
    return parseCsv(text) as unknown as T[];
  }
};

const loadCsv = async <T>(path: string) => {
  const text = await fetchText(path);
  return parseCsv(text) as unknown as T[];
};

export const loadActivityByWeek = () => {
  if (!cache.has('activityByWeek')) {
    cache.set(
      'activityByWeek',
      loadParquet<ActivityByWeekRecord[]>(
        '/data/oulad/agg/activity_by_week.parquet',
        '/data/oulad/agg/activity_by_week.csv',
      ).then((rows) => mapActivityRecords(rows as unknown as Array<Record<string, unknown>>)),
    );
  }
  return cache.get('activityByWeek') as Promise<ActivityByWeekRecord[]>;
};

export const loadGradeDistribution = () => {
  if (!cache.has('gradeDistribution')) {
    cache.set(
      'gradeDistribution',
      loadParquet<GradeDistributionRecord[]>(
        '/data/oulad/agg/grade_distribution.parquet',
        '/data/oulad/agg/grade_distribution.csv',
      ).then((rows) => mapGradeRecords(rows as unknown as Array<Record<string, unknown>>)),
    );
  }
  return cache.get('gradeDistribution') as Promise<GradeDistributionRecord[]>;
};

export const loadOutcomeByDemographic = () => {
  if (!cache.has('outcomeByDemographic')) {
    cache.set(
      'outcomeByDemographic',
      loadCsv<OutcomeByDemographicRecord[]>('/data/oulad/agg/outcome_by_demographic.csv').then(
        (rows) => mapOutcomeByDemographic(rows as unknown as Array<Record<string, unknown>>),
      ),
    );
  }
  return cache.get('outcomeByDemographic') as Promise<OutcomeByDemographicRecord[]>;
};

export const loadModuleOutcome = () => {
  if (!cache.has('moduleOutcome')) {
    cache.set(
      'moduleOutcome',
      loadCsv<ModuleOutcomeRecord[]>('/data/oulad/agg/module_outcome.csv').then((rows) =>
        mapModuleOutcome(rows as unknown as Array<Record<string, unknown>>),
      ),
    );
  }
  return cache.get('moduleOutcome') as Promise<ModuleOutcomeRecord[]>;
};

export const loadRegionChoropleth = () => {
  if (!cache.has('regionChoropleth')) {
    cache.set(
      'regionChoropleth',
      loadCsv<RegionChoroplethRecord[]>('/data/oulad/agg/region_choropleth.csv').then((rows) =>
        mapRegionChoropleth(rows as unknown as Array<Record<string, unknown>>),
      ),
    );
  }
  return cache.get('regionChoropleth') as Promise<RegionChoroplethRecord[]>;
};

export const loadStudentActivity = () => {
  if (!cache.has('studentActivity')) {
    cache.set(
      'studentActivity',
      loadCsv<StudentActivityRecord[]>('/data/oulad/agg/student_activity.csv').then((rows) =>
        mapStudentActivity(rows as unknown as Array<Record<string, string>>),
      ),
    );
  }
  return cache.get('studentActivity') as Promise<StudentActivityRecord[]>;
};

export const loadAllData = async () => {
  const [
    activityByWeek,
    gradeDistribution,
    outcomeByDemographic,
    moduleOutcome,
    regionChoropleth,
    studentActivity,
  ] = await Promise.all([
    loadActivityByWeek(),
    loadGradeDistribution(),
    loadOutcomeByDemographic(),
    loadModuleOutcome(),
    loadRegionChoropleth(),
    loadStudentActivity(),
  ]);

  return {
    activityByWeek,
    gradeDistribution,
    outcomeByDemographic,
    moduleOutcome,
    regionChoropleth,
    studentActivity,
  };
};
