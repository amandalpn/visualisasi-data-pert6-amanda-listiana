export type ActivityByWeekRecord = {
  code_module: string;
  code_presentation: string;
  week: number;
  sum_clicks: number;
  students_count: number;
  avg_final_score: number;
};

export type GradeDistributionRecord = {
  code_module: string;
  code_presentation: string;
  band: string;
  students: number;
};

export type OutcomeByDemographicRecord = {
  demographic: string;
  category: string;
  pass: number;
  fail: number;
  withdrawn: number;
  distinction: number;
};

export type ModuleOutcomeRecord = {
  code_module: string;
  code_presentation: string;
  pass: number;
  fail: number;
  withdrawn: number;
  distinction: number;
};

export type RegionChoroplethRecord = {
  region: string;
  students: number;
  average_score: number;
};

export type StudentActivityRecord = {
  id_student: string;
  code_module: string;
  code_presentation: string;
  outcome: string;
  total_clicks: number;
  final_score: number;
  weeks: Array<{ week: number; clicks: number }>;
  gender: string;
  region: string;
  age_band: string;
  highest_education: string;
  disability: string;
};

export type InsightSummary = {
  title: string;
  bullets: string[];
};
