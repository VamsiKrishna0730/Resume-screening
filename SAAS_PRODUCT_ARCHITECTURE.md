# PRISM SaaS Product Architecture

**Research Title:** *A Fair, Explainable, and Feedback-Adaptive AI Framework for Resume Screening and Candidate Matching*  
**Platform Version:** PRISM SaaS v1.3.2  
**Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS v4  

---

## 1. System Topology

```text
                                CLIENT BROWSER
                     ┌──────────────────────────────────┐
                     │     Next.js 16 App Router UI     │
                     │  (/dashboard, /jobs, /screening) │
                     └───────────────┬──────────────────┘
                                     │
                                     ↓
                     ┌──────────────────────────────────┐
                     │      React AppContext State      │
                     │   (Jobs, Candidates, Sliders)    │
                     └───────────────┬──────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ↓                         ↓                         ↓
   Client Engines             Server API Layer           Offline Scaffolds
   - lib/matching/            - /api/ai/analyze          - reference_backend/
   - lib/fairness/            - /api/jobs                (FastAPI /api/screen)
   - lib/adaptive/            - /api/candidates
   - lib/ml/ranker.ts
           │                         │
           ↓                         ↓
   Client Matching             Gemini AI LLM
   - Lexical (20%)             - Google Gemini REST
   - Semantic (30%)            - OpenAI API
   - Skills (25%)              - Fallback Provider
   - Experience (15%)
```

---

## 2. Real Routes Directory Structure

```text
app/
├── layout.tsx              → Root layout with AppProvider & Shell
├── page.tsx                → Redirects '/' to '/dashboard'
├── dashboard/page.tsx      → SaaS Executive Dashboard with KPIs & Recent Activity
├── jobs/
│   ├── page.tsx            → Job Library with Search, Filter & Create Modal
│   └── [jobId]/page.tsx    → Job Requisition Detail View & Candidate Pool
├── candidates/
│   ├── page.tsx            → Candidate Talent Pool with Bulk Actions & Sorting
│   └── [candidateId]/page.tsx → Dedicated Candidate Profile & Gemini AI Analysis
├── screening/
│   ├── page.tsx            → Screening Workspace with Sliders & Ranking Table
│   └── [jobId]/page.tsx    → Job-Specific Screening Workspace
├── fairness/page.tsx       → Demographic Parity & Bias Mitigation Analytics
├── feedback/page.tsx       → Recruiter Feedback Timeline & Adaptive Learning
├── experiments/
│   ├── page.tsx            → Experiment Lab, Ablation Study & Artifact Exporter
│   └── [experimentId]/page.tsx → Detailed Experiment Metric Report
├── models/page.tsx         → Model Registry & Checkpoint History
├── settings/page.tsx       → SaaS Settings, Weights & AI Provider Configuration
└── api/
    ├── ai/analyze/route.ts → Server-side Gemini AI Resume Analysis Endpoint
    ├── jobs/route.ts       → Server-side Job CRUD Endpoint
    └── candidates/route.ts → Server-side Candidate Queries Endpoint
```

---

## 3. Security & API Protection

1. **Server-Side API Key Storage:** `GEMINI_API_KEY` and `OPENAI_API_KEY` are accessed exclusively inside server-side route handlers (`app/api/ai/analyze/route.ts`).
2. **Client-Side Bundle Sanitization:** No secrets or private tokens are prefixed with `NEXT_PUBLIC_` or bundled into client JavaScript.
3. **Graceful Fallback:** When external AI credentials are not configured, the system executes deterministic extraction transparently labeled as `Deterministic Fallback`.
