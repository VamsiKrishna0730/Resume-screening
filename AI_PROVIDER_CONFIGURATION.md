# PRISM AI Provider Configuration Guide

PRISM supports a multi-tier AI extraction and evaluation architecture designed to balance cutting-edge LLM reasoning with offline reproducibility.

---

## 1. Provider Hierarchy

When an AI action (such as Candidate Analysis, Skill Extraction, or Summary Generation) is invoked, PRISM executes through the following fallback cascade:

```text
               AI Request (/api/ai/analyze)
                            ↓
               Is GEMINI_API_KEY set?
                     ├── YES ──→ [Google Gemini Provider]
                     └── NO  ──┐
                               ↓
                   Is OPENAI_API_KEY set?
                         ├── YES ──→ [OpenAI Provider]
                         └── NO  ──┐
                                   ↓
                   [Deterministic Fallback Provider]
```

---

## 2. Setting Up Google Gemini (Primary Provider)

1. Obtain an API key from Google AI Studio: [https://aistudio.google.com/](https://aistudio.google.com/)
2. Create or edit `.env.local` in the root repository directory:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key-here"
   GEMINI_MODEL="gemini-1.5-pro"
   ```
3. Restart your Next.js development server.
4. When you click **"Run Gemini Analysis"** on any Candidate Profile (`/candidates/[candidateId]`), the server-side API route will query Google Gemini and report `Google Gemini (Server-side)` as the active provider.

---

## 3. Offline Deterministic Fallback Mode

If no API keys are provided:
- The system operates 100% offline with zero external network dependencies.
- Candidate features, strengths, and missing skills are computed via `DeterministicFallbackProvider`.
- Results are transparently labeled as `Deterministic Fallback` in the UI to prevent fabricated research claims.
