import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { demoResult } from "@/lib/fixtures";
import { parseAnalysisResponse } from "@/lib/parse";
import { buildAnalysisPrompt } from "@/lib/prompt";
import { genderSchema, type AnalyzeResponse, type Gender } from "@/lib/types";

const inputLimit = 12000;

function jsonResponse(body: AnalyzeResponse, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      reportText?: unknown;
      age?: unknown;
      gender?: unknown;
    };
    const reportText =
      typeof payload.reportText === "string" ? payload.reportText.trim() : "";

    let age: number | undefined;
    if (typeof payload.age === "number" && Number.isFinite(payload.age) && payload.age > 0 && payload.age < 130) {
      age = Math.round(payload.age);
    }

    let gender: Gender | undefined;
    const genderParse = genderSchema.safeParse(payload.gender);
    if (genderParse.success) {
      gender = genderParse.data;
    }

    if (!reportText) {
      return jsonResponse(
        { ok: false, error: "Paste your lab report text before analyzing." },
        400,
      );
    }

    if (reportText.length < 80) {
      return jsonResponse(
        {
          ok: false,
          error: "The report text is too short to analyze reliably. Paste a larger excerpt.",
        },
        400,
      );
    }

    if (reportText.length > inputLimit) {
      return jsonResponse(
        {
          ok: false,
          error: "The pasted report is too large for a single request. Trim it and try again.",
        },
        400,
      );
    }

    if (process.env.MOCK_ANALYSIS === "true") {
      return jsonResponse({ ok: true, data: demoResult });
    }

    if (!process.env.GROQ_API_KEY) {
      return jsonResponse(
        {
          ok: false,
          error:
            "GROQ_API_KEY is not configured. Add it in project settings or enable MOCK_ANALYSIS=true for demo mode.",
        },
        500,
      );
    }

    // Use Groq with a free API key (generous free tier, no credit card required)
    let aiText: string;
    try {
      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: buildAnalysisPrompt(reportText, { age, gender }),
        maxOutputTokens: 1800,
      });
      aiText = text;
    } catch (error) {
      console.error("[v0] Groq request failed:", error);
      const detail = error instanceof Error ? error.message : String(error);
      return jsonResponse(
        {
          ok: false,
          error: `Upstream AI request failed: ${detail}`,
        },
        502,
      );
    }

    if (!aiText) {
      return jsonResponse(
        {
          ok: false,
          error: "The AI response did not include readable text.",
        },
        502,
      );
    }

    try {
      const result = parseAnalysisResponse(aiText);
      return jsonResponse({ ok: true, data: result });
    } catch (error) {
      console.error("[v0] Failed to parse AI response:", error);
      console.error("[v0] Raw AI output was:", aiText);
      const detail = error instanceof Error ? error.message : String(error);
      return jsonResponse(
        {
          ok: false,
          error: `Could not parse the AI response. ${detail}`,
        },
        502,
      );
    }
  } catch (error) {
    console.error("[v0] analyze route failed:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return jsonResponse(
      {
        ok: false,
        error: `Analysis failed: ${detail}`,
      },
      500,
    );
  }
}
