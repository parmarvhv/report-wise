import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReportWise - Understand Your Lab Reports",
  description: "Patient-friendly lab report interpretation. Paste your report text and get a structured explanation with clear risk cues, plain-language summaries, and next-step guidance.",
};

export const viewport = {
  themeColor: "#f8fbff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
