"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, FileUp, ImageIcon, Type } from "lucide-react";

type UploadZoneProps = {
  onSubmitText: (text: string) => Promise<void>;
  disabled?: boolean;
};

const minimumCharacters = 80;

export function UploadZone({ onSubmitText, disabled = false }: UploadZoneProps) {
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [text, setText] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

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
    await onSubmitText(trimmed);
  }, [onSubmitText, text]);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }

    setLocalError(
      `${file.name} was added, but OCR is not built yet. Paste the report text for the current MVP.`,
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    disabled,
    maxFiles: 1,
    onDrop,
  });

  return (
    <section className="mx-auto w-full max-w-4xl rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.5rem] bg-slate-950 p-6 text-slate-50 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-300">
            Input
          </p>
          <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight">
            Paste a report and get a patient-friendly summary in seconds.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
            Start with pasted text for the fastest and most reliable MVP path. File
            upload is visible here, but text extraction is intentionally deferred.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                mode === "paste"
                  ? "border-cyan-300 bg-cyan-300/10 text-white"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
              onClick={() => setMode("paste")}
              type="button"
            >
              <div className="flex items-center gap-3">
                <Type className="size-5" />
                <span className="font-medium">Paste text</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Best for the first shipping version.
              </p>
            </button>
            <button
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                mode === "upload"
                  ? "border-cyan-300 bg-cyan-300/10 text-white"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
              onClick={() => setMode("upload")}
              type="button"
            >
              <div className="flex items-center gap-3">
                <FileUp className="size-5" />
                <span className="font-medium">Upload file</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                PDF and image shell, OCR later.
              </p>
            </button>
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-slate-50 p-5 sm:p-6">
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
                className="mt-3 min-h-72 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                disabled={disabled}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste CBC, lipid panel, thyroid, or other report text here."
                value={text}
              />
              <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                <p className="text-slate-500">{helperText}</p>
                <p className="font-medium text-slate-400">{text.trim().length} chars</p>
              </div>
              <button
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-base font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
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
              className={`flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed px-6 text-center transition ${
                isDragActive
                  ? "border-cyan-500 bg-cyan-50"
                  : "border-slate-300 bg-white hover:border-slate-400"
              } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <input {...getInputProps()} />
              <div className="rounded-full bg-slate-100 p-4 text-slate-700">
                <FileText className="size-7" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                Drop a PDF or report image
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                The UI is ready for upload, but the current MVP still expects pasted
                text. This keeps the main loop reliable while OCR is pending.
              </p>
              <div className="mt-5 flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
                <ImageIcon className="size-4" />
                <span>PNG, JPG, WEBP, PDF</span>
              </div>
            </div>
          )}

          {localError ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              {localError}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
