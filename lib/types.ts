import { z } from "zod";

export const labRiskSchema = z.enum(["normal", "borderline", "high", "low"]);
export const overallRiskSchema = z.enum(["normal", "attention", "urgent"]);

// Models sometimes return numbers as strings ("12.5") or the literal null/empty string.
// This preprocess step normalizes those cases so the chart fields stay optional-number.
const optionalNumber = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}, z.number().optional());

// Numbers are sometimes returned unquoted (e.g. `"value": 226`). Coerce to string defensively.
const requiredString = z.preprocess((value) => {
  if (typeof value === "number") return String(value);
  return value;
}, z.string().min(1));

// Optional string fields sometimes arrive as null from the model.
const optionalString = z.preprocess((value) => {
  if (value === null || value === "") return undefined;
  if (typeof value === "number") return String(value);
  return value;
}, z.string().optional());

export const labTestSchema = z.object({
  name: requiredString,
  value: requiredString,
  unit: optionalString,
  normalRange: optionalString,
  risk: labRiskSchema,
  explanation: requiredString,
  improvement: optionalString,
  seeDoctor: optionalString,
  // Numeric fields used by the per-test range chart. Optional so qualitative
  // tests (e.g., "positive / negative") still render without a chart.
  numericValue: optionalNumber,
  min: optionalNumber,
  max: optionalNumber,
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
