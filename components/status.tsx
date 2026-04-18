"use client";

import { LoaderCircle, TriangleAlert } from "lucide-react";

type AnalysisStatusProps = {
  state: "analyzing" | "error";
  message?: string;
  onRetry?: () => void;
};

const loadingPhrases = [
  "Reading the report carefully.",
  "Organizing the key values.",
  "Turning medical shorthand into plain English.",
];

export function AnalysisStatus({
  state,
  message,
  onRetry,
}: AnalysisStatusProps) {
  if (state === "error") {
    return (
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-rose-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-rose-100 p-3 text-rose-700">
            <TriangleAlert className="size-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Analysis could not be completed
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {message ??
                "Try again with pasted report text or switch on mock mode for a demo result."}
            </p>
            {onRetry ? (
              <button
                className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                onClick={onRetry}
                type="button"
              >
                Try again
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
        <LoaderCircle className="size-8 animate-spin" />
      </div>
      <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
        Analyzing your report
      </h2>
      <div className="mt-4 space-y-2 text-base text-slate-600">
        {loadingPhrases.map((phrase) => (
          <p key={phrase}>{phrase}</p>
        ))}
      </div>
    </section>
  );
}
