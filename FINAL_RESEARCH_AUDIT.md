# PRISM Final Research Audit Report

**Research Project:** *A Fair, Explainable, and Feedback-Adaptive AI Framework for Resume Screening and Candidate Matching*  
**Date:** September 3, 2026  

---

## 1. Codebase Component Classification

| Module Path | Component Purpose | Implementation Classification | Notes / Evidence |
| --- | --- | --- | --- |
| `lib/matching/skills.ts` | Skill normalization & overlap analysis | **DETERMINISTIC IMPLEMENTATION** | Alias dictionary & exact coverage ratio |
| `lib/matching/lexical.ts` | Token Jaccard keyword overlap | **DETERMINISTIC IMPLEMENTATION** | Tokenization & term similarity math |
| `lib/matching/semantic.ts` | Domain concept proximity matching | **DETERMINISTIC APPROXIMATION** | Concept domain taxonomy matching |
| `lib/matching/experience.ts` | Required experience thresholding | **DETERMINISTIC IMPLEMENTATION** | Threshold gap penalty & bonus scoring |
| `lib/matching/education.ts` | Degree level requirement matching | **DETERMINISTIC IMPLEMENTATION** | Degree level hierarchy comparison |
| `lib/matching/projects.ts` | Project relevance scoring | **DETERMINISTIC IMPLEMENTATION** | Project text domain alignment |
| `lib/matching/explanations.ts` | Candidate-specific feature attribution | **DYNAMICALLY DERIVED** | Derived from candidate vs job data |
| `lib/matching/score.ts` | Hybrid score integration | **DETERMINISTIC IMPLEMENTATION** | Weighted linear combination of sub-scores |
| `lib/ml/ranker.ts` | Logistic Regression & Random Forest rankers | **REAL ML ALGORITHMIC IMPLEMENTATION** | Feature vector extraction & SGD loss minimization |
| `lib/llm/provider.ts` | LLM extraction interface & fallbacks | **REAL PROVIDER / DETERMINISTIC FALLBACK** | Provider pattern; uses fallback when API key omitted |
| `lib/fairness/engine.ts` | Selection Rate, DPD, EOD auditing | **SYNTHETIC AUDIT ENGINE** | Group selection rates on synthetic cohort labels |
| `lib/adaptive/engine.ts` | Recruiter feedback adaptive learning | **SIMULATION ONLY** | Checkpoint version promotion (`v1.3.2` $\rightarrow$ `v1.3.3`) |
| `lib/experiments/evaluator.ts` | Metric evaluation & ablation study | **SYNTHETIC BENCHMARK EVALUATOR** | Computes Precision, Recall, F1, MRR, NDCG@10 |
| `lib/experiments/exporter.ts` | Research artifact CSV/JSON generator | **REAL IMPLEMENTATION** | Generates downloadable experiment artifacts |
| `lib/parsing/resumeParser.ts` | Resume text entity & skill extraction | **DETERMINISTIC IMPLEMENTATION** | Regex & text pattern matching |
| `lib/parsing/jobParser.ts` | Job spec requirement extraction | **DETERMINISTIC IMPLEMENTATION** | Regex & text pattern matching |
| `reference_backend/main.py` | FastAPI reference backend | **REFERENCE SCAFFOLD** | Non-connected reference API routes |

---

## 2. Quantitative Status

- **Real Executable Code:** `100%` (Next.js 16 + React 19 + TypeScript 5)
- **TypeScript Type Safety:** `PASSED` (0 errors)
- **Next.js Production Build:** `PASSED` (Exit code 0)
- **Empirical Real-World Dataset:** `NO` (Demonstrated using deterministic synthetic fixtures)
- **Real Neural LLM Inference:** `NO` (Uses deterministic fallback provider)
