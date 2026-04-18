"use client";

import type { AnalysisResult, LabRisk, LabTest, OverallRisk } from "@/lib/types";
import { AlertTriangle, CheckCircle2, RotateCcw, Siren } from "lucide-react";

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
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div className={`rounded-[2rem] border p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8 ${config.cardClass}`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-slate-700">
              <Icon className="size-4" />
              <span>Overall summary</span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {data.summary}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
              Educational explanation only. This tool helps with interpretation and
              should not replace a clinician&apos;s judgment.
            </p>
          </div>
          <div className={`inline-flex h-fit items-center rounded-full px-4 py-2 text-sm font-semibold ${config.badgeClass}`}>
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
        <div className="rounded-[1.75rem] border border-sky-200 bg-sky-50 p-6">
          <h3 className="text-lg font-semibold text-slate-950">What to do next</h3>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
            {data.nextSteps}
          </p>
        </div>
      ) : null}

      <button
        className="inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
        onClick={onReset}
        type="button"
      >
        <RotateCcw className="size-4" />
        Analyze another report
      </button>
    </section>
  );
}

function TestCard({ test }: { test: LabTest }) {
  return (
    <article className={`rounded-[1.75rem] border border-slate-200 border-l-[10px] bg-white p-5 shadow-sm ${testRiskAccent[test.risk]}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
            {test.risk}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {test.name}
          </h3>
          <p className="mt-3 text-base leading-7 text-slate-600">{test.explanation}</p>
        </div>
        <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3 text-right">
          <p className="text-sm text-slate-500">Value</p>
          <p className="text-3xl font-semibold tracking-tight text-slate-950">
            {test.value}
          </p>
          {test.unit ? <p className="text-sm text-slate-500">{test.unit}</p> : null}
        </div>
      </div>
      {test.normalRange ? (
        <p className="mt-4 text-sm text-slate-500">Typical range: {test.normalRange}</p>
      ) : null}
    </article>
  );
}
