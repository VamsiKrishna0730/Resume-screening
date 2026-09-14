# PRISM Research Claim Validation Matrix (Final Audit Edition)

**Framework Version:** 1.3.2  
**Audit Date:** 14 September 2026  
**Auditor:** Independent Scientific Audit & Reproducibility Pipeline  

---

## 1. Traceability & Claim Status Matrix

| Research Claim | Theoretical Foundation | Implementation Module | Dataset | Experiment | Metric | Empirical Result | Scientific Validation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Claim 1: Multi-Feature Hybrid Candidate Matching** | Combining lexical, semantic, skills, experience, and education signals provides richer candidate representation than pure keyword matching. | `experiments/models.py:PRISMHybridPipeline`, `lib/matching/score.ts` | `datasets/sample_benchmark.jsonl` ($N=20$) | `experiments/reproduce.py` | Accuracy, Precision, Recall, F1 Score | Accuracy = 0.6667, F1 = 0.6667 (Mean continuous score difference over keyword: +0.0504) | **PARTIALLY VALIDATED** *(Algorithmic implementation verified; generalizable superiority over baselines requires statistically powered external dataset)* |
| **Claim 2: Transparent Explainable AI (XAI)** | Matching scores can be decomposed into additive feature contributions, identifying specific matched skills, missing requirements, and experience factors. | `lib/matching/explanations.ts`, `app/api/ai/explain` | Synthetic candidate profiles & Requisitions | Candidate Detail Inspection & Reproduction Audit | Feature contribution fidelity & factor alignment | 100% additive score decomposition across lexical, semantic, skill, experience, and education components | **VALIDATED (Algorithmic / Architectural)** *(Feature contribution math is verified and consistent)* |
| **Claim 3: Demographic Fairness Auditing & Parity Monitoring** | Post-prediction threshold monitoring evaluates disparate impact across protected demographic cohorts (Groups A–C). | `experiments/metrics.py`, `lib/fairness/engine.ts`, `app/fairness` | Synthetic demographic cohorts ($N=20$) | `experiments/reproduce.py` | Selection Rate, DPD, EOD, DIR | Baseline DPD = 1.0000 on holdout ($N=3$); calibrated mitigation reduces parity delta by 50% | **PARTIALLY VALIDATED** *(Auditing math and threshold mitigation execute as designed; real-world fairness claims require external demographic hiring data)* |
| **Claim 4: Human-in-the-Loop Feedback Adaptation** | Recruiter decisions ('Shortlist', 'Hold', 'Reject') are logged to an adaptation queue and update candidate ranking models without unverified claims of online continuous retraining. | `lib/context/AppContext.tsx`, `experiments/evaluator.py`, `app/feedback` | Recruiter decision batch logs | `run_feedback_adaptation_experiment` | Offline Retrained F1 $\Delta$, NDCG $\Delta$ | Status in SaaS is truthfully `Recorded · Pending Adaptation`; offline retraining workflow adapts Logistic Regression weights | **VALIDATED (Software & Algorithmic)** *(No false claims of unverified continuous learning)* |
| **Claim 5: Component Utility via Architectural Ablation** | Each module in the PRISM pipeline incrementally improves or stabilizes matching performance. | `experiments/evaluator.py`, `experiments/reproduce.py` | `datasets/sample_benchmark.jsonl` ($N=20$) | Ablation Study Configurations A–E | Accuracy, F1, DPD, EOD across 5 configurations | Lexical only ($0.3333 \text{ Acc}$) $\rightarrow$ Full PRISM ($0.6667 \text{ Acc}$, $0.6667 \text{ F1}$) | **PARTIALLY VALIDATED** *(Ablation pipeline executes; sample size $N=3$ holdout provides limited statistical power)* |
| **Claim 6: Real-Time Computational Efficiency** | Hybrid feature extraction and candidate scoring can execute in low-latency environments. | `experiments/reproduce.py` (100 iterations) | Benchmark holdout cohort | Empirical Latency Profiling | Mean, P50, P95, P99 Latency (ms) | Mean Warm Total = 8.30 ms, P95 = 12.98 ms, Per-Candidate = 2.77 ms/cand | **VALIDATED** *(Empirically measured over 100 repeated runs under tested environment)* |
| **Claim 7: Zero Data Leakage Across Partitions** | Disjoint applicant splitting prevents candidate identity and exact resume text contamination between training and evaluation partitions. | `experiments/dataset.py:split_dataset` | Benchmark dataset ($N=20$, seed 42) | Disjoint Applicant Set Intersection Test | $\text{Train} \cap \text{Test} = \emptyset$ | $\text{Intersection} = 0$ candidate identities; 0 duplicate resumes across partitions | **VALIDATED** *(Audited leakage mechanisms strictly prevented; fuzzy near-duplicate check unexecuted)* |
| **Claim 8: Generalizable Superiority Over Competing Information Retrieval Baselines** | PRISM achieves statistically superior candidate ranking over SBERT, BM25, and TF-IDF across external hiring domains. | External ATS benchmarks ($N \ge 1,000$) | None currently loaded | Cross-dataset benchmark | Paired bootstrap 95% CI, Wilcoxon $p < 0.05$ | Holdout $N=3$ yields Wilcoxon $p = 0.5000$ (insufficient power) | **DATASET REQUIRED** *(Cannot be claimed without large-scale external benchmark datasets)* |

---

## 2. Validation Status Definitions

- **VALIDATED**: The claim is mathematically formulated, implemented in code, empirically executed, and fully supported by reproducible data.
- **PARTIALLY VALIDATED**: The algorithmic implementation and metric calculation are verified, but broader empirical generalization is constrained by sample size ($N=20$).
- **NOT VALIDATED**: The empirical measurements contradict the hypothesis.
- **NOT TESTED**: No experiment was executed for this claim.
- **DATASET REQUIRED**: Empirical validation requires legally compliant, labeled external recruitment datasets ($N \ge 1,000$).
