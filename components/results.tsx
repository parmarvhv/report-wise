"use client";

import type { AnalysisResult, LabRisk, LabTest, OverallRisk } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Lightbulb, RotateCcw, Siren, Stethoscope } from "lucide-react";
import { TestRangeChart } from "@/components/test-range-chart";

type ResultsProps = {
  data: AnalysisResult;
  onReset: () => void;
};

const overallRiskConfig: Record<
  OverallRisk,
  {
    cardClass: string;
    badgeClass: string;
    icon: typeof CheckCircle2;
    label: string;
  }
> = {
  normal: {
    cardClass: "border-emerald-200 bg-emerald-50",
    badgeClass: "bg-emerald-600 text-white",
    icon: CheckCircle2,
    label: "Stable",
  },
  attention: {
    cardClass: "border-amber-200 bg-amber-50",
    badgeClass: "bg-amber-500 text-slate-950",
    icon: AlertTriangle,
    label: "Needs attention",
  },
  urgent: {
    cardClass: "border-rose-200 bg-rose-50",
    badgeClass: "bg-rose-600 text-white",
    icon: Siren,
    label: "Urgent follow-up",
  },
};

const testRiskAccent: Record<LabRisk, string> = {
  normal: "border-emerald-500",
  borderline: "border-amber-400",
  high: "border-rose-500",
  low: "border-orange-500",
};

export function Results({ data, onReset }: ResultsProps) {
  const config = overallRiskConfig[data.overallRisk];
  const Icon = config.icon;

  return (
    <section 
      className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6"
      aria-label="Analysis results"
    >
      <div className={`rounded-2xl border p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[2rem] sm:p-8 ${config.cardClass}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-slate-700">
              <Icon className="size-4" aria-hidden="true" />
              <span>Overall summary</span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-slate-950 sm:mt-4 sm:text-3xl">
              {data.summary}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700 sm:mt-4 sm:text-base sm:leading-7">
              Educational explanation only. This tool helps with interpretation and
              should not replace a clinician&apos;s judgment.
            </p>
          </div>
          <div 
            className={`inline-flex h-fit items-center rounded-full px-4 py-2 text-sm font-semibold ${config.badgeClass}`}
            role="status"
            aria-label={`Risk level: ${config.label}`}
          >
            {config.label}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {data.tests.map((test) => (
          <TestCard key={`${test.name}-${test.value}`} test={test} />
        ))}
      </div>

      {data.nextSteps ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 sm:rounded-[1.75rem] sm:p-6">
          <h3 className="text-base font-semibold text-slate-950 sm:text-lg">What to do next</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700 sm:mt-3 sm:text-base sm:leading-7">
            {data.nextSteps}
          </p>
        </div>
      ) : null}

      <button
        className="inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
        onClick={onReset}
        type="button"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Analyze another report
      </button>
    </section>
  );
}

function TestCard({ test }: { test: LabTest }) {
  return (
    <article 
      className={`rounded-xl border border-slate-200 border-l-[6px] bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:border-l-[10px] sm:p-5 ${testRiskAccent[test.risk]}`}
      aria-label={`${test.name} test result`}
    >
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400 sm:text-sm">
            <span className="sr-only">Risk level: </span>{test.risk}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 sm:mt-2 sm:text-2xl">
            {test.name}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">{test.explanation}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-right sm:rounded-[1.25rem] sm:px-4 sm:py-3">
          <p className="text-xs text-slate-500 sm:text-sm">Value</p>
          <p className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {test.value}
          </p>
          {test.unit ? <p className="text-xs text-slate-500 sm:text-sm">{test.unit}</p> : null}
        </div>
      </div>
      {test.normalRange ? (
        <p className="mt-3 text-xs text-slate-500 sm:mt-4 sm:text-sm">Typical range: {test.normalRange}</p>
      ) : null}

      <TestRangeChart test={test} />

      {test.improvement ? (
        <div className="mt-3 flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50/70 p-3 sm:mt-4 sm:rounded-xl sm:p-4">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-emerald-700 sm:size-5" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 sm:text-sm">
              How to improve
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-700">{test.improvement}</p>
          </div>
        </div>
      ) : null}

      {test.seeDoctor ? (
        <div className="mt-3 flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 sm:mt-4 sm:rounded-xl sm:p-4">
          <Stethoscope className="mt-0.5 size-4 shrink-0 text-rose-700 sm:size-5" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-800 sm:text-sm">
              Consult a doctor
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-700">{test.seeDoctor}</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}
