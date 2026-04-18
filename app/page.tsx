"use client";

import { useState } from "react";
import { Results } from "@/components/results";
import { AnalysisStatus } from "@/components/status";
import { UploadZone } from "@/components/upload";
import type { AnalysisResult, AnalyzeResponse, PatientContext } from "@/lib/types";

type ViewState = "upload" | "analyzing" | "results" | "error";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAnalyze(reportText: string, context?: PatientContext) {
    setViewState("analyzing");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportText,
          age: context?.age,
          gender: context?.gender,
        }),
      });

      const payload = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.ok ? "Request failed." : payload.error);
        setViewState("error");
        return;
      }

      setResult(payload.data);
      setViewState("results");
    } catch {
      setErrorMessage(
        "Network or server error. Check your API configuration or use mock mode for local demos.",
      );
      setViewState("error");
    }
  }

  function reset() {
    setViewState("upload");
    setResult(null);
    setErrorMessage(null);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.18),_transparent_34%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_38%,_#f4efe8_100%)] px-4 py-6 text-slate-950 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="px-1 py-6 sm:py-10 lg:py-12">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
            ReportWise MVP
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-balance text-slate-950 sm:mt-5 sm:text-5xl lg:text-6xl">
            Understand lab reports without getting buried in numbers and jargon.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-pretty text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
            Paste your report text and get a structured explanation with clear risk
            cues, plain-language summaries, and next-step guidance.
          </p>
        </header>

        {viewState === "upload" ? (
          <UploadZone onSubmitText={handleAnalyze} />
        ) : null}

        {viewState === "analyzing" ? <AnalysisStatus state="analyzing" /> : null}

        {viewState === "error" ? (
          <AnalysisStatus message={errorMessage ?? undefined} onRetry={reset} state="error" />
        ) : null}

        {viewState === "results" && result ? (
          <Results data={result} onReset={reset} />
        ) : null}
      </div>
    </main>
  );
}
