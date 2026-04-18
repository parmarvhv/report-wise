import Anthropic from "@anthropic-ai/sdk";
import { demoResult } from "@/lib/fixtures";
import { parseAnalysisResponse } from "@/lib/parse";
import { ANALYSIS_PROMPT } from "@/lib/prompt";
import type { AnalyzeResponse } from "@/lib/types";

const inputLimit = 12000;

function jsonResponse(body: AnalyzeResponse, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { reportText?: unknown };
    const reportText =
      typeof payload.reportText === "string" ? payload.reportText.trim() : "";

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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return jsonResponse(
        {
          ok: false,
          error:
            "ANTHROPIC_API_KEY is not configured. Set it or enable MOCK_ANALYSIS=true for demo mode.",
        },
        500,
      );
    }

    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
    const message = await client.messages.create({
      model,
      max_tokens: 1800,
      messages: [
        {
          role: "user",
          content: ANALYSIS_PROMPT.replace("{REPORT_TEXT}", reportText),
        },
      ],
    });

    const firstBlock = message.content.find((block) => block.type === "text");
    if (!firstBlock || firstBlock.type !== "text") {
      return jsonResponse(
        {
          ok: false,
          error: "The AI response did not include readable text.",
        },
        502,
      );
    }

    const result = parseAnalysisResponse(firstBlock.text);
    return jsonResponse({ ok: true, data: result });
  } catch (error) {
    console.error("analyze route failed", error);

    return jsonResponse(
      {
        ok: false,
        error:
          "Analysis failed. Try pasting report text again or switch to mock mode while configuring the AI key.",
      },
      500,
    );
  }
}
