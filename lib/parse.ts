import { analysisResultSchema, type AnalysisResult } from "@/lib/types";

function extractJsonBlock(raw: string) {
  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const objectMatch = raw.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    return objectMatch[0];
  }

  return raw.trim();
}

export function parseAnalysisResponse(raw: string): AnalysisResult {
  const jsonText = extractJsonBlock(raw);
  const parsed = JSON.parse(jsonText);
  return analysisResultSchema.parse(parsed);
}
