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
});

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
