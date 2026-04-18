"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, FileUp, ImageIcon, Loader2, Type } from "lucide-react";
import { extractPdfText } from "@/lib/extract-pdf";
import type { Gender, PatientContext } from "@/lib/types";

type UploadZoneProps = {
  onSubmitText: (text: string, context?: PatientContext) => Promise<void>;
  disabled?: boolean;
};

const minimumCharacters = 80;

export function UploadZone({ onSubmitText, disabled = false }: UploadZoneProps) {
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [text, setText] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<Gender | "">("");

  const patientContext = useMemo<PatientContext | undefined>(() => {
    const parsedAge = Number.parseInt(age, 10);
    const hasAge = Number.isFinite(parsedAge) && parsedAge > 0 && parsedAge < 130;
    const hasGender = gender !== "";
    if (!hasAge && !hasGender) return undefined;
    return {
      age: hasAge ? parsedAge : undefined,
      gender: hasGender ? gender : undefined,
    };
  }, [age, gender]);

  const helperText = useMemo(() => {
    if (!text.trim()) {
      return "Paste the report text exactly as you received it.";
    }

    if (text.trim().length < minimumCharacters) {
      return `Add a bit more detail. The analyzer works best with at least ${minimumCharacters} characters.`;
    }

    return "Ready to analyze.";
  }, [text]);

  const submit = useCallback(async () => {
    const trimmed = text.trim();

    if (trimmed.length < minimumCharacters) {
      setLocalError(
        `Paste a longer report excerpt. Aim for at least ${minimumCharacters} characters.`,
      );
      return;
    }

    setLocalError(null);
    await onSubmitText(trimmed, patientContext);
  }, [onSubmitText, text, patientContext]);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }

    setLocalError(null);

    if (file.type !== "application/pdf") {
      setLocalError("Only PDF files are supported right now. Image OCR is coming soon.");
      return;
    }

    setIsExtracting(true);

    try {
      const extractedText = await extractPdfText(file);

      if (!extractedText || extractedText.length < minimumCharacters) {
        setLocalError(
          "Could not read enough text from this PDF. It may be a scanned image. Try pasting the text instead.",
        );
        setIsExtracting(false);
        return;
      }

      setIsExtracting(false);
      await onSubmitText(extractedText, patientContext);
    } catch (error) {
      console.error("[v0] PDF extraction failed:", error);
      setLocalError(
        "Failed to read the PDF. Please try a different file or paste the text instead.",
      );
      setIsExtracting(false);
    }
  }, [onSubmitText, patientContext]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    disabled: disabled || isExtracting,
    maxFiles: 1,
    onDrop,
  });

  return (
    <section 
      aria-label="Report input area"
      className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[2rem] sm:p-6"
    >
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl bg-slate-950 p-5 text-slate-50 sm:rounded-[1.5rem] sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-300">
            Input
          </p>
          <h2 className="mt-3 max-w-md text-2xl font-semibold tracking-tight text-balance sm:mt-4 sm:text-3xl">
            Paste a report and get a patient-friendly summary in seconds.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:mt-4 sm:text-base sm:leading-7">
            Paste your report text directly, or upload a PDF file. We&apos;ll extract
            the text and analyze it for you.
          </p>

          <div 
            className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2"
            role="tablist"
            aria-label="Input method selection"
          >
            <button
              className={`rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 sm:rounded-2xl ${
                mode === "paste"
                  ? "border-cyan-300 bg-cyan-300/10 text-white"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
              onClick={() => setMode("paste")}
              type="button"
              role="tab"
              aria-selected={mode === "paste"}
              aria-controls="input-panel"
            >
              <div className="flex items-center gap-3">
                <Type className="size-5" aria-hidden="true" />
                <span className="font-medium">Paste text</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Best for the first shipping version.
              </p>
            </button>
            <button
              className={`rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 sm:rounded-2xl ${
                mode === "upload"
                  ? "border-cyan-300 bg-cyan-300/10 text-white"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
              onClick={() => setMode("upload")}
              type="button"
              role="tab"
              aria-selected={mode === "upload"}
              aria-controls="input-panel"
            >
              <div className="flex items-center gap-3">
                <FileUp className="size-5" aria-hidden="true" />
                <span className="font-medium">Upload file</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                PDF supported, image OCR coming soon.
              </p>
            </button>
          </div>
        </div>

        <div 
          id="input-panel"
          role="tabpanel"
          className="rounded-xl bg-slate-50 p-4 sm:rounded-[1.5rem] sm:p-6"
        >
          <fieldset className="mb-4 grid grid-cols-1 gap-3 sm:mb-5 sm:grid-cols-[110px_1fr]">
            <legend className="sr-only">Patient context (optional)</legend>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="patient-age">
                Age
              </label>
              <input
                id="patient-age"
                type="number"
                inputMode="numeric"
                min={0}
                max={129}
                placeholder="e.g. 34"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                disabled={disabled || isExtracting}
                onChange={(event) => setAge(event.target.value)}
                value={age}
              />
            </div>
            <div>
              <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">Gender</span>
              <div role="radiogroup" aria-label="Gender" className="mt-1 flex flex-wrap gap-2">
                {([
                  { value: "female", label: "Female" },
                  { value: "male", label: "Male" },
                  { value: "other", label: "Other" },
                ] as const).map((option) => {
                  const isActive = gender === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                        isActive
                          ? "border-cyan-500 bg-cyan-500 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                      disabled={disabled || isExtracting}
                      onClick={() => setGender((current) => (current === option.value ? "" : option.value))}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="col-span-full text-xs text-slate-500">
              Optional. Adding these helps tailor reference ranges (for example, hemoglobin targets differ by sex).
            </p>
          </fieldset>

          {mode === "paste" ? (
            <>
              <label
                className="block text-sm font-medium text-slate-700"
                htmlFor="report-text"
              >
                Lab report text
              </label>
              <textarea
                id="report-text"
                className="mt-3 min-h-56 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 sm:min-h-72 sm:rounded-[1.25rem] sm:px-4 sm:py-4"
                disabled={disabled}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste CBC, lipid panel, thyroid, or other report text here."
                value={text}
                aria-describedby="report-helper report-char-count"
              />
              <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <p id="report-helper" className="text-slate-500">{helperText}</p>
                <p id="report-char-count" className="font-medium text-slate-400" aria-live="polite">
                  {text.trim().length} chars
                </p>
              </div>
              <button
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-base font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:mt-5"
                disabled={disabled}
                onClick={() => void submit()}
                type="button"
              >
                Analyze report
              </button>
            </>
          ) : (
            <div
              {...getRootProps()}
              className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 sm:min-h-72 sm:rounded-[1.5rem] sm:px-6 ${
                isDragActive
                  ? "border-cyan-500 bg-cyan-50"
                  : "border-slate-300 bg-white hover:border-slate-400"
              } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
              tabIndex={0}
              role="button"
              aria-label="Upload a PDF or image file. Drag and drop or click to select."
            >
              <input {...getInputProps()} aria-label="File upload input" />
              {isExtracting ? (
                <>
                  <div className="rounded-full bg-cyan-100 p-3 text-cyan-700 sm:p-4">
                    <Loader2 className="size-6 animate-spin sm:size-7" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 sm:mt-4 sm:text-xl">
                    Extracting text from PDF...
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 sm:mt-3">
                    Please wait while we read your report.
                  </p>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-slate-100 p-3 text-slate-700 sm:p-4">
                    <FileText className="size-6 sm:size-7" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 sm:mt-4 sm:text-xl">
                    Drop a PDF or report image
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 sm:mt-3">
                    Upload your lab report PDF and we&apos;ll extract the text automatically.
                    Image OCR is coming soon.
                  </p>
                  <div className="mt-4 flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 sm:mt-5">
                    <ImageIcon className="size-4" aria-hidden="true" />
                    <span>PNG, JPG, WEBP, PDF</span>
                  </div>
                </>
              )}
            </div>
          )}

          {localError ? (
            <p 
              className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800 sm:rounded-2xl"
              role="alert"
              aria-live="assertive"
            >
              {localError}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
