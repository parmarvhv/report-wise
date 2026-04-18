import type { LabTest } from "@/lib/types";

type TestRangeChartProps = {
  test: LabTest;
};

/**
 * Horizontal range gauge that visually compares a test value to its normal
 * range. Renders a scale bar with a shaded "normal" band and a marker where
 * the patient's value falls. If the value is outside the scale, the marker is
 * clamped to the edge and labeled accordingly.
 *
 * Implemented with CSS flexbox + absolutely positioned markers instead of a
 * chart library because we only need a single horizontal axis per test.
 */
export function TestRangeChart({ test }: TestRangeChartProps) {
  if (
    typeof test.numericValue !== "number" ||
    typeof test.min !== "number" ||
    typeof test.max !== "number" ||
    test.max <= test.min
  ) {
    return null;
  }

  const { numericValue, min, max } = test;

  // Pad the scale by 20% of the range on either side so the value has room
  // to render even when it's at the edge of the normal band, but expand if
  // the value falls outside.
  const rangeSpan = max - min;
  const pad = Math.max(rangeSpan * 0.2, 1);
  const scaleMin = Math.min(min - pad, numericValue - pad * 0.5);
  const scaleMax = Math.max(max + pad, numericValue + pad * 0.5);
  const scaleSpan = scaleMax - scaleMin;

  const toPercent = (n: number) => {
    const raw = ((n - scaleMin) / scaleSpan) * 100;
    return Math.max(0, Math.min(100, raw));
  };

  const normalStart = toPercent(min);
  const normalEnd = toPercent(max);
  const valuePercent = toPercent(numericValue);

  const isHigh = numericValue > max;
  const isLow = numericValue < min;
  const isNormal = !isHigh && !isLow;

  const markerTone = isNormal
    ? "bg-emerald-600 ring-emerald-200"
    : isHigh
      ? "bg-rose-600 ring-rose-200"
      : "bg-orange-500 ring-orange-200";

  const valueLabel = `${numericValue}${test.unit ? ` ${test.unit}` : ""}`;
  const positionLabel = isNormal ? "Within normal range" : isHigh ? "Above normal range" : "Below normal range";

  return (
    <div
      className="mt-4 rounded-lg border border-slate-200 bg-white p-3 sm:mt-5 sm:rounded-xl sm:p-4"
      role="img"
      aria-label={`${test.name} is ${valueLabel}. Normal range ${min} to ${max}. ${positionLabel}.`}
    >
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>Value vs. normal range</span>
        <span className={isNormal ? "text-emerald-700" : isHigh ? "text-rose-700" : "text-orange-700"}>
          {positionLabel}
        </span>
      </div>

      {/* Scale track */}
      <div className="relative mt-4 h-2 rounded-full bg-slate-100">
        {/* Normal range band */}
        <div
          className="absolute inset-y-0 rounded-full bg-emerald-400/70"
          style={{
            left: `${normalStart}%`,
            width: `${Math.max(normalEnd - normalStart, 1)}%`,
          }}
          aria-hidden="true"
        />

        {/* Value marker */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${valuePercent}%` }}
          aria-hidden="true"
        >
          <div className={`size-4 rounded-full ring-4 ${markerTone}`} />
        </div>
      </div>

      {/* Axis labels */}
      <div className="relative mt-3 h-4 text-[11px] text-slate-500">
        <span className="absolute left-0">{formatAxis(scaleMin)}</span>
        <span
          className="absolute -translate-x-1/2 text-emerald-700"
          style={{ left: `${normalStart}%` }}
        >
          {formatAxis(min)}
        </span>
        <span
          className="absolute -translate-x-1/2 text-emerald-700"
          style={{ left: `${normalEnd}%` }}
        >
          {formatAxis(max)}
        </span>
        <span className="absolute right-0">{formatAxis(scaleMax)}</span>
      </div>

      {/* Value readout under the chart */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Normal: {formatAxis(min)} – {formatAxis(max)}
          {test.unit ? ` ${test.unit}` : ""}
        </span>
        <span className="font-semibold text-slate-900">Your value: {valueLabel}</span>
      </div>
    </div>
  );
}

function formatAxis(n: number): string {
  if (!Number.isFinite(n)) return "";
  // Show up to 1 decimal for small numbers, none for large, avoid trailing zeros.
  const rounded = Math.abs(n) >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
}
