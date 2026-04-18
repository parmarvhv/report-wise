import { z } from "zod";

export const labRiskSchema = z.enum(["normal", "borderline", "high", "low"]);
export const overallRiskSchema = z.enum(["normal", "attention", "urgent"]);

export const labTestSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
  risk: labRiskSchema,
  explanation: z.string().min(1),
  improvement: z.string().optional(),
  seeDoctor: z.string().optional(),
  // Numeric fields used by the per-test range chart. Optional so qualitative
  // tests (e.g., "positive / negative") still render without a chart.
  numericValue: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const genderSchema = z.enum(["female", "male", "other"]);
export type Gender = z.infer<typeof genderSchema>;

export type PatientContext = {
  age?: number;
  gender?: Gender;
};

export const analysisResultSchema = z.object({
  summary: z.string().min(1),
  overallRisk: overallRiskSchema,
  tests: z.array(labTestSchema).min(1),
  nextSteps: z.string().optional(),
});

export type LabRisk = z.infer<typeof labRiskSchema>;
export type OverallRisk = z.infer<typeof overallRiskSchema>;
export type LabTest = z.infer<typeof labTestSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export type AnalyzeSuccess = {
  ok: true;
  data: AnalysisResult;
};

export type AnalyzeFailure = {
  ok: false;
  error: string;
};

export type AnalyzeResponse = AnalyzeSuccess | AnalyzeFailure;
