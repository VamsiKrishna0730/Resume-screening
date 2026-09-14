# PRISM Master Research Evidence Matrix

**Framework Version:** 1.3.2  
**Audit Date:** 14 September 2026  
**Auditor:** Senior Research Software Engineer, Data Leakage Auditor & Q1 Reviewer  

---

## 1. Traceability Architecture

$$\text{Source Code} \longrightarrow \text{Dataset} \longrightarrow \text{Experiment} \longrightarrow \text{Raw Artifact} \longrightarrow \text{Independent Metric} \longrightarrow \text{Claim} \longrightarrow \text{Paper Readiness}$$

| ID | Research Claim | Code Evidence | Dataset | Experiment | Raw Artifact | Metric | Limitation | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **CLM-01** | Multi-Feature Hybrid Candidate Matching combines lexical, semantic, skills, experience, and education signals | `experiments/models.py:103-158`, `lib/matching/score.ts:1-75` | `sample_benchmark.jsonl` ($N=20$) | `experiments/reproduce.py:117-175` | `experiments/results/reproduction/predictions_prism_hybrid.json` | Accuracy=0.6667, Precision=1.0, Recall=0.5, F1=0.6667, Mean $\Delta=+0.0504$ | Evaluated on holdout $N=3$; identical binary decisions to Keyword baseline at $\tau=0.50$ | **PARTIALLY VALIDATED** |
| **CLM-02** | Additive Explainable AI (XAI) feature attribution decomposed into grounded sub-components | `lib/matching/explanations.ts:1-68`, `app/api/ai/explain/route.ts` | Synthetic profiles & Requisitions | Browser UI inspection & programmatic formula audit | `experiments/models.py:150-157` | Additive decomposition: $\sum w_i S_i = 1.0$, exact component fidelity | Explanations are verified linear decompositions; non-linear interactions unmodeled | **VALIDATED — ALGORITHMIC / ARCHITECTURAL** |
| **CLM-03** | Demographic Fairness Auditing & Parity Monitoring across protected cohorts | `experiments/metrics.py:104-148`, `lib/fairness/engine.ts:1-80` | `sample_benchmark.jsonl` (Groups A, B, C) | `experiments/reproduce.py:202-230` | `experiments/results/reproduction/fairness_metrics.json` | Holdout DPD=1.00, EOD=1.00, DIR=0.00; Mitigation reduces synthetic disparity by 50% | Synthetic audit cohorts only; cannot claim real-world demographic parity | **PARTIALLY VALIDATED** |
| **CLM-04** | Human-in-the-Loop Feedback Adaptation with transparent queuing and offline model update | `lib/context/AppContext.tsx:113-132`, `experiments/evaluator.py:52-74` | Recruiter decision batch logs | `run_feedback_adaptation_experiment` | `experiments/results/reproduction/audit_summary.json` | SaaS status is `Recorded · Pending Adaptation`; offline retraining adapts logistic weights | No continuous online retraining; adaptation is strictly batch-offline | **VALIDATED (Software & Algorithmic)** |
| **CLM-05** | Component Utility verified via Architectural Ablation Study | `experiments/reproduce.py:232-243`, `experiments/models.py:PRISMHybridPipeline` | `sample_benchmark.jsonl` ($N=20$) | Ablation Study Configurations A–E | `experiments/results/reproduction/audit_summary.json` | Lexical unscaled Acc=0.3333 $\rightarrow$ Full PRISM Acc=0.6667, F1=0.6667 | Keyword baseline had $1.5\times$ scalar; ablation represents architectural progression | **PARTIALLY VALIDATED** |
| **CLM-06** | Computational Efficiency & Low-Latency Scoring | `experiments/reproduce.py:270-315` | Benchmark holdout cohort ($N=3$) | 100 repeated warm inference runs | `experiments/results/reproduction/latency.json` | Mean warm total = 5.89 ms, P95 = 9.45 ms, Per-cand = 1.96 ms | Environment-specific (Windows 64-bit AMD64, Python 3.14.3); not universal | **VALIDATED** |
| **CLM-07** | Disjoint Applicant Partitioning prevents identity and exact text leakage | `experiments/dataset.py:109-136`, `experiments/near_duplicate_audit.py` | `sample_benchmark.jsonl` ($N=20$, seed 42) | Disjoint candidate set intersection & 3-gram MinHash/Jaccard audit | `experiments/results/reproduction/leakage_audit.json` | $\text{Train} \cap \text{Test} = \emptyset$, Exact Dups = 0, Near Dups (Jaccard $\ge 0.70$) = 0 | Exact and near-duplicate text leakage audited and verified 0 | **VALIDATED** |
| **CLM-08** | Generalizable Superiority over Information Retrieval Baselines (SBERT, BM25, TF-IDF) | `experiments/bm25.py`, `experiments/transformer_matcher.py` | External ATS corpora | `experiments/reproduce.py:35-82` | `predictions_bm25.json`, `predictions_sbert.json` | SBERT Acc=1.00, F1=1.00; BM25 Acc=0.33, F1=0.00; PRISM Acc=0.67, F1=0.67 | Insufficient sample size ($N=3$); SBERT exceeds PRISM on holdout; external benchmark dataset required | **DATASET REQUIRED** |

---

## 2. Status Category Definitions

* **VALIDATED:** Mathematically formulated, implemented in code, empirically executed, and completely verified by raw artifact logs.
* **PARTIALLY VALIDATED:** Algorithmic logic and internal computation are confirmed, but broader empirical conclusions are bounded by cohort size ($N=20$).
* **NOT VALIDATED:** Empirical observations refute the hypothesized outcome.
* **NOT TESTED:** Implementation or hypothesis was not evaluated in an empirical run.
* **DATASET REQUIRED:** Definitive empirical validation requires an independently sourced, legally compliant external hiring benchmark dataset with sample size determined by power analysis.
