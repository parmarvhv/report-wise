import type { AnalysisResult } from "@/lib/types";

export const demoResult: AnalysisResult = {
  summary: "Your cholesterol needs attention, but the pattern looks manageable.",
  overallRisk: "attention",
  tests: [
    {
      name: "Total Cholesterol",
      value: "226",
      unit: "mg/dL",
      normalRange: "Below 200",
      risk: "high",
      explanation:
        "This is higher than the usual target. It can raise long-term heart risk if it stays elevated.",
    },
    {
      name: "HDL Cholesterol",
      value: "58",
      unit: "mg/dL",
      normalRange: "Above 40",
      risk: "normal",
      explanation:
        "This is a protective cholesterol level. It is one of the more reassuring numbers on this report.",
    },
    {
      name: "Triglycerides",
      value: "162",
      unit: "mg/dL",
      normalRange: "Below 150",
      risk: "borderline",
      explanation:
        "This is slightly above the usual range. Food patterns, alcohol, and sugar intake can affect it.",
    },
  ],
  nextSteps:
    "If this pattern is new, discuss it at your next routine visit and review diet and exercise habits.",
};
