🎯 ReportWise – Complete Technical Implementation Plan
📋 Executive Summary
Timeline: 4 hours MVP
Stack: Next.js 15 + Tailwind + Claude/OpenAI API
Deploy: Vercel (5 min deployment)
Demo URL: reportwise.vercel.app

🏗️ Technical Architecture
System Flow
User Upload → Text Extraction → AI Analysis → Structured Response → Visual UI
     ↓              ↓                ↓              ↓                ↓
  [PDF/Image]   [OCR/Paste]    [Claude API]    [JSON Parse]    [Color Cards]
Decision Matrix
ComponentOption A (Fast)Option B (Better)ChoiceFrameworkVite ReactNext.js 15Next.js (API routes built-in)OCRGoogle VisionTesseract.jsPaste fallback first (ship fast)AIOpenAI GPT-4Claude SonnetClaude (better medical reasoning)StylingTailwindShadcn/uiTailwind + Headless UIDeployNetlifyVercelVercel (Next.js optimized)

🚀 Hour-by-Hour Build Plan
Hour 1: Foundation (Setup + Upload)
Tasks

Project Init (10 min)

bashnpx create-next-app@latest reportwise --app --tailwind --typescript
cd reportwise
npm install @anthropic-ai/sdk react-dropzone lucide-react

File Structure (5 min)

app/
├── page.tsx              # Main upload screen
├── api/
│   └── analyze/route.ts  # AI endpoint
├── components/
│   ├── upload.tsx        # Drag-drop component
│   └── results.tsx       # Results display
└── lib/
    ├── prompt.ts         # AI prompt template
    └── types.ts          # TypeScript interfaces

Upload Component (30 min)

typescript// components/upload.tsx
'use client';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';

export function UploadZone({ onText }: { onText: (text: string) => void }) {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg'] },
    onDrop: async (files) => {
      // Quick text extraction hack
      const text = await extractText(files[0]);
      onText(text);
    }
  });

  if (mode === 'paste') {
    return <PasteBox onSubmit={onText} />;
  }

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-12">
      <input {...getInputProps()} />
      <p>Drop lab report here</p>
      <button onClick={() => setMode('paste')}>Or paste text</button>
    </div>
  );
}

Basic Layout (15 min)


Clean landing page
Centered upload zone
Logo + tagline: "Understand Your Lab Reports. Instantly."


Hour 2: AI Integration (The Brain)
Tasks

Type Definitions (10 min)

typescript// lib/types.ts
export interface LabTest {
  name: string;
  value: string;
  unit?: string;
  normalRange?: string;
  risk: 'normal' | 'borderline' | 'high' | 'low';
  explanation: string;
}

export interface AnalysisResult {
  summary: string;
  overallRisk: 'normal' | 'attention' | 'urgent';
  tests: LabTest[];
  nextSteps?: string;
}

Prompt Engineering (20 min)

typescript// lib/prompt.ts
export const ANALYSIS_PROMPT = `You are a medical communication expert who translates lab reports for patients.

TASK: Analyze this lab report and respond ONLY with valid JSON (no markdown).

INPUT:
{REPORT_TEXT}

OUTPUT FORMAT (strict JSON):
{
  "summary": "One-line plain English summary (max 15 words)",
  "overallRisk": "normal|attention|urgent",
  "tests": [
    {
      "name": "Test name",
      "value": "actual value",
      "unit": "mg/dL",
      "normalRange": "70-100",
      "risk": "normal|borderline|high|low",
      "explanation": "What this means in 2 simple sentences. No medical jargon."
    }
  ],
  "nextSteps": "When to see doctor (only if needed)"
}

RULES:
1. Use conversational tone ("Your blood sugar is...")
2. Never say "consult doctor" unless truly urgent
3. Explain WHY a value matters
4. If no risk, say what's working well
5. Keep explanations under 100 characters

Think step by step, then output ONLY the JSON.`;

API Route (25 min)

typescript// app/api/analyze/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { ANALYSIS_PROMPT } from '@/lib/prompt';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { reportText } = await req.json();
    
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: ANALYSIS_PROMPT.replace('{REPORT_TEXT}', reportText)
      }]
    });

    const responseText = message.content[0].text;
    
    // Extract JSON (handle potential markdown wrapping)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch[0]);
    
    return Response.json(result);
    
  } catch (error) {
    return Response.json(
      { error: 'Analysis failed. Try pasting report text directly.' },
      { status: 500 }
    );
  }
}

Environment Setup (5 min)

bash# .env.local
ANTHROPIC_API_KEY=sk-ant-xxx

Hour 3: Results UI (The Magic)
Tasks

Results Component (35 min)

typescript// components/results.tsx
'use client';
import { AnalysisResult } from '@/lib/types';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const riskConfig = {
  normal: { color: 'bg-green-50 border-green-200', icon: CheckCircle, text: 'text-green-700' },
  attention: { color: 'bg-yellow-50 border-yellow-200', icon: AlertTriangle, text: 'text-yellow-700' },
  urgent: { color: 'bg-red-50 border-red-200', icon: AlertCircle, text: 'text-red-700' }
};

export function Results({ data }: { data: AnalysisResult }) {
  const config = riskConfig[data.overallRisk];
  const Icon = config.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      {/* Overall Summary Card */}
      <div className={`${config.color} border-2 rounded-xl p-6`}>
        <div className="flex items-start gap-4">
          <Icon className={`${config.text} w-8 h-8`} />
          <div>
            <h2 className="text-2xl font-bold mb-2">Overall Summary</h2>
            <p className="text-lg">{data.summary}</p>
          </div>
        </div>
      </div>

      {/* Individual Tests */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Detailed Results</h3>
        {data.tests.map((test, idx) => (
          <TestCard key={idx} test={test} />
        ))}
      </div>

      {/* Next Steps */}
      {data.nextSteps && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold mb-2">What to do next</h3>
          <p>{data.nextSteps}</p>
        </div>
      )}

      <button 
        onClick={() => window.location.reload()} 
        className="w-full py-3 bg-gray-900 text-white rounded-lg"
      >
        Analyze Another Report
      </button>
    </div>
  );
}

function TestCard({ test }: { test: LabTest }) {
  const riskColors = {
    normal: 'border-l-green-500',
    borderline: 'border-l-yellow-500',
    high: 'border-l-red-500',
    low: 'border-l-orange-500'
  };

  return (
    <div className={`border-l-4 ${riskColors[test.risk]} bg-white rounded-lg p-4 shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-lg">{test.name}</h4>
        <span className="text-2xl font-bold">{test.value}</span>
      </div>
      
      {test.normalRange && (
        <p className="text-sm text-gray-600 mb-2">
          Normal: {test.normalRange} {test.unit}
        </p>
      )}
      
      <p className="text-gray-700">{test.explanation}</p>
    </div>
  );
}

Main Page Logic (15 min)

typescript// app/page.tsx
'use client';
import { useState } from 'react';
import { UploadZone } from '@/components/upload';
import { Results } from '@/components/results';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [state, setState] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [result, setResult] = useState(null);

  async function handleText(text: string) {
    setState('analyzing');
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportText: text })
    });
    
    const data = await response.json();
    setResult(data);
    setState('results');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-12">
        <h1 className="text-5xl font-bold text-center mb-4">
          ReportWise
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Understand your lab reports. Instantly.
        </p>

        {state === 'upload' && <UploadZone onText={handleText} />}
        
        {state === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            <p className="mt-4 text-lg">Analyzing your report...</p>
          </div>
        )}
        
        {state === 'results' && result && <Results data={result} />}
      </div>
    </main>
  );
}

Hour 4: Polish + Deploy
Tasks

Error Handling (15 min)


Add try-catch wrappers
Friendly error messages
"Try again" button


Loading States (10 min)

typescript// Add loading messages
const loadingPhrases = [
  "Reading your report...",
  "Identifying key values...",
  "Translating medical jargon...",
  "Almost there..."
];

Mobile Responsive (10 min)


Test on iPhone SE viewport
Adjust padding/font sizes
Ensure cards stack nicely


Deploy to Vercel (10 min)

bash# Push to GitHub
git init
git add .
git commit -m "Initial commit"
gh repo create reportwise --public --source=. --push

# Connect to Vercel (auto-detects Next.js)
# Add ANTHROPIC_API_KEY in dashboard
# Deploy completes in 2 min

Testing (15 min)


Test with 2-3 sample reports
Test paste flow
Test error cases (gibberish text)


🎨 Design Decisions (Why They Matter)
Color Psychology

Green: "You're healthy" → Reinforcement
Yellow: "Pay attention" → Not scary
Red: "Take action" → But still calm tone

Typography

Large numbers → Easy to spot abnormal values
Conversational explanations → Build trust
Clear hierarchy → Scan in 10 seconds


🔥 Demo Script (60 Second Pitch)
Setup: Have 2 tabs open

Real lab report PDF
Your deployed app

Script:

"When you get lab results, you see this [show PDF]. Numbers, ranges, medical terms. Confusing, right?
[Open ReportWise]
Drop the report → wait 5 seconds → boom.
[Show results]
Green means good. Yellow means watch it. Red means talk to your doctor.
No login. No app install. No waiting days for a doctor's call.
Built with Claude AI for medical accuracy. Try it yourself: reportwise.vercel.app"


⚠️ Risk Mitigation
RiskLikelihoodImpactMitigationOCR failsHighMediumPaste text fallback (already built)AI gives bad JSONMediumHighHardcoded fallback responseAPI rate limitsLowHighCache sample resultsPrompt breaksMediumMediumVersion control promptsTime runs outMediumHighStatic demo mode (JSON file)
Fallback Plan (If 30 Min Left)
typescript// Emergency: Use static JSON
const DEMO_RESULT = {
  summary: "Your cholesterol is slightly high, but manageable with diet changes",
  overallRisk: "attention",
  tests: [...]
};

🚀 Bonus Features (If Time Permits)
Priority 1: Hindi Toggle (15 min)
typescript// Add to API route
const prompt = language === 'hi' 
  ? HINDI_PROMPT 
  : ANALYSIS_PROMPT;
Priority 2: Ask Follow-up (20 min)
typescript// Add chat input below results
<input placeholder="Ask about any result..." />
Priority 3: Share Results (10 min)
typescript// Generate shareable link
const shareUrl = `/results/${btoa(JSON.stringify(data))}`;

📊 Success Metrics (What to Track)
For Demo:

⏱️ Time from upload → results: < 10 seconds
👀 Visual clarity: Understand in 5 seconds
🎯 Accuracy: Test with real reports

For Judges:

💡 "I would actually use this"
🚀 "This solves a real problem"
🎨 "The UX is smooth"


🛠️ Development Checklist
Pre-Build

 Get Claude API key
 Install Node.js 18+
 Have 2-3 sample lab reports ready

Hour 1

 Next.js project created
 Upload UI working (drag + paste)
 Basic styling done

Hour 2

 API route handles text input
 Claude integration working
 JSON response parsing

Hour 3

 Results UI complete
 Color coding working
 Mobile responsive

Hour 4

 Error handling added
 Deployed to Vercel
 Tested with real reports
 Demo script practiced


🎯 What Makes This Stand Out

Zero Friction: No login, no install
Instant Value: Results in 10 seconds
Beautiful UX: Not another boring health app
Smart AI: Claude understands medical context
Backup Plan: Paste text if upload fails


💬 Final Pro Tips
Do:
✅ Use Tailwind (save 2 hours vs custom CSS)
✅ Test error cases (judges will try to break it)
✅ Keep UI clean (less is more)
✅ Practice demo (confidence = points)
Don't:
❌ Build authentication (waste of time)
❌ Over-engineer parsing (AI handles it)
❌ Add too many features (focus on core)
❌ Forget mobile testing (judges use phones)

🚀 Deploy Command Cheatsheet
bash# Development
npm run dev

# Build
npm run build

# Deploy
git push origin main  # Vercel auto-deploys

# Environment
# Vercel Dashboard → Settings → Environment Variables
# Add: ANTHROPIC_API_KEY=sk-ant-xxx

📱 Post-Demo (If You Win & Want to Build Real Product)
Phase 2 Features:

User accounts + history
Multi-report comparison
Trend analysis ("Your HbA1c over 6 months")
Doctor sharing
Hindi + regional languages
WhatsApp integration

Monetization:

Free: 3 reports/month
Pro ($5/mo): Unlimited + trends
Enterprise: Hospital partnerships


This plan is battle-tested for hackathons. Stick to the timeline, don't over-build, and you'll have a working demo that judges remember.
Now go build it. You have 4 hours. 🚀