"use client";

// Client-side PDF text extraction using pdfjs-dist.
// Runs entirely in the browser, so no server bundling or billing concerns.

export async function extractPdfText(file: File): Promise<string> {
  // Dynamic import to keep pdfjs-dist out of the server bundle
  const pdfjs = await import("pdfjs-dist");

  // Point the worker at unpkg, which serves every published npm version immediately
  // (cdnjs lags behind and 404s for recent pdfjs-dist releases).
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const pdf = await pdfjs.getDocument({ data: uint8Array }).promise;

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((item) => {
        if (typeof item === "object" && item !== null && "str" in item) {
          return (item as { str: string }).str;
        }
        return "";
      })
      .join(" ");

    pageTexts.push(pageText);
  }

  return pageTexts.join("\n\n").trim();
}
