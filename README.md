# ReportWise

ReportWise is a Next.js MVP for turning pasted lab report text into a clearer, patient-friendly summary.

## Stack

- Next.js App Router
- Tailwind CSS
- Anthropic SDK
- Zod for response validation

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.local.example .env.local
```

3. For the fastest local start, keep `MOCK_ANALYSIS=true`.

4. Run the app:

```bash
npm run dev
```

5. Production build:

```bash
npm run build
```

The build script uses Webpack explicitly to avoid Turbopack sandbox issues during local builds.

## Environment variables

- `ANTHROPIC_API_KEY`: required for live AI analysis
- `ANTHROPIC_MODEL`: optional Anthropic model override
- `MOCK_ANALYSIS`: set to `true` for demo mode without live API calls

## MVP scope

- Paste report text
- Analyze through API route
- Render summary and per-test cards
- Keep upload visible as a shell for later OCR work
