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
      improvement:
        "Aim for more fiber-rich foods like oats, beans, lentils, apples, and leafy greens. Cut back on fried foods, red meat, and full-fat dairy, and walk or exercise at least 30 minutes most days.",
      numericValue: 226,
      min: 0,
      max: 200,
    },
    {
      name: "HDL Cholesterol",
      value: "58",
      unit: "mg/dL",
      normalRange: "Above 40",
      risk: "normal",
      explanation:
        "This is a protective cholesterol level. It is one of the more reassuring numbers on this report.",
      numericValue: 58,
      min: 40,
      max: 100,
    },
    {
      name: "Triglycerides",
      value: "162",
      unit: "mg/dL",
      normalRange: "Below 150",
      risk: "borderline",
      explanation:
        "This is slightly above the usual range. Food patterns, alcohol, and sugar intake can affect it.",
      improvement:
        "Reduce sugary drinks, refined carbs like white bread, and alcohol. Add more fatty fish, nuts, and olive oil, and keep up regular physical activity.",
      numericValue: 162,
      min: 0,
      max: 150,
    },
  ],
  nextSteps:
    "If this pattern is new, discuss it at your next routine visit and review diet and exercise habits.",
};
