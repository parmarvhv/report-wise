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
      <section 
        className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[2rem] sm:p-8"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="rounded-full bg-rose-100 p-2 text-rose-700 sm:p-3">
            <TriangleAlert className="size-5 sm:size-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              Analysis could not be completed
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
              {message ??
                "Try again with pasted report text or switch on mock mode for a demo result."}
            </p>
            {onRetry ? (
              <button
                className="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:mt-6"
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
    <section 
      className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[2rem] sm:p-8"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 sm:size-16">
        <LoaderCircle className="size-7 animate-spin sm:size-8" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:mt-6 sm:text-3xl">
        Analyzing your report
      </h2>
      <div className="mt-3 space-y-1 text-sm text-slate-600 sm:mt-4 sm:space-y-2 sm:text-base">
        {loadingPhrases.map((phrase) => (
          <p key={phrase}>{phrase}</p>
        ))}
      </div>
      <p className="sr-only">Please wait while your report is being analyzed.</p>
    </section>
  );
}
