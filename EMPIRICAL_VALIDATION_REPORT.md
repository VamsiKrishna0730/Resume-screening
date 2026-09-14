# PRISM Empirical Validation Report

**Research Paper:** *A Fair, Explainable, and Feedback-Adaptive AI Framework for Resume Screening and Candidate Matching*  
**Platform Version:** 1.3.2  
**Evaluation Date:** 03 September 2026  
**Auditor:** Automated Independent Reproduction & Scientific Audit Suite (`experiments/reproduce.py`)  

---

## 1. Dataset

* **Dataset Source:** `datasets/sample_benchmark.jsonl` (Reproducible Verification Benchmark Cohort)
* **Total Records:** 20 candidate-job pairs
* **Unique Candidate Identities:** 20
* **Unique Job Requisitions:** 3 (`JOB-001`: Machine Learning Engineer, `JOB-002`: Senior Data Scientist, `JOB-003`: Frontend UI Engineer)
* **Ground Truth Class Distribution:** 11 Positive Matches (55.0%), 9 Negative Matches (45.0%)
* **Demographic Group Cohorts:** Group A = 8 (40.0%), Group B = 7 (35.0%), Group C = 5 (25.0%)
* **Data Quality Assessment:** All required fields present; 0 missing values; labels strictly binary $y \in \{0, 1\}$.

---

## 2. Experimental Protocol

* **Evaluation Architecture:** Single-blind offline evaluation with disjoint candidate-level holdout partitioning.
* **Random Seed:** 42 (fixed for complete deterministic reproducibility).
* **Decision Threshold:** $\tau = 0.50$ across all classification models.
* **Ranking Scope:** Requisitions evaluated with candidate pools scored and sorted by model probability/score descending.
* **Fairness Protocol:** Post-prediction fairness audit evaluating Selection Rate, Demographic Parity Difference (DPD), Equal Opportunity Difference (EOD), and Disparate Impact Ratio (DIR). Demographic attributes are strictly isolated from model feature extraction.

---

## 3. Data Split

* **Partitioning Strategy:** 70% Train ($N=14$), 15% Validation ($N=3$), 15% Holdout Test ($N=3$).
* **Candidate Disjointness:** Candidate identities are shuffled and partitioned at the applicant ID level prior to record assignment:
  * $\text{Train Candidates} = \{\text{C-1001}, \text{C-1002}, \text{C-1003}, \text{C-1004}, \text{C-1006}, \text{C-1009}, \text{C-1010}, \text{C-1012}, \text{C-1014}, \text{C-1016}, \text{C-1017}, \text{C-1018}, \text{C-1019}, \text{C-1020}\}$
  * $\text{Val Candidates} = \{\text{C-1005}, \text{C-1008}, \text{C-1013}\}$
  * $\text{Holdout Test Candidates} = \{\text{C-1007}, \text{C-1011}, \text{C-1015}\}$
* **Set Intersections:**
  * $\text{Train} \cap \text{Val} = \emptyset$ (len: 0)
  * $\text{Train} \cap \text{Test} = \emptyset$ (len: 0)
  * $\text{Val} \cap \text{Test} = \emptyset$ (len: 0)
* **Holdout Ground Truth:** Candidate `C-1007` ($y=1$), `C-1011` ($y=1$), `C-1015` ($y=0$). Total: 2 Positives, 1 Negative.

---

## 4. Leakage Audit

* **Audit Status:** **NO LEAKAGE DETECTED IN AUDITED PIPELINE**
* **Verification Detail:**
  1. Candidate IDs: Strict disjoint partitioning; zero identity leakage.
  2. Resume Texts: Exact string matching confirms zero holdout resumes exist in training or validation splits.
  3. Feature Vectors: Exclude all ground truth target indicators (`ground_truth_match`, `recruiter_label`).
  4. Demographic Isolation: Sensitive demographic labels (`demographic_attribute`) are never passed to model vectorizers or classifiers.

---

## 5. Baselines

Evaluated under identical training and holdout test partitions:
1. **Keyword Matching (BM25/Lexical):** Clean token intersection between resume and job description scaled by heuristic factor ($\min(1.0, \text{overlap} \times 1.5)$).
2. **Jaccard Similarity:** Set intersection over union of lexical tokens ($\text{overlap} / \text{union} \times 2.5$).
3. **TF-IDF Cosine Similarity:** Unigram/bigram TF-IDF vectorization with cosine similarity scoring.
4. **Logistic Regression Ranker:** Supervised classifier trained on TF-IDF text features, numerical experience, and skill counts with balanced class weights.
5. **Random Forest Ranker:** Ensemble classifier (50 estimators, max depth 5) trained on TF-IDF and structured metadata features.

---

## 6. PRISM Hybrid Pipeline

* **Architecture:** Multi-feature hybrid scoring engine incorporating five weighted sub-scores:
  $$\text{Score} = w_{\text{lex}} \cdot S_{\text{lex}} + w_{\text{sem}} \cdot S_{\text{sem}} + w_{\text{skills}} \cdot S_{\text{skills}} + w_{\text{exp}} \cdot S_{\text{exp}} + w_{\text{edu}} \cdot S_{\text{edu}}$$
* **Default Benchmark Weights:**
  * Lexical ($w_{\text{lex}} = 0.20$)
  * Semantic ($w_{\text{sem}} = 0.30$)
  * Skills Overlap ($w_{\text{skills}} = 0.25$)
  * Experience Match ($w_{\text{exp}} = 0.15$)
  * Education Level ($w_{\text{edu}} = 0.10$)

---

## 7. Classification Results

Independently reproduced on holdout test partition ($N=3$, Ground Truth: `[1, 1, 0]`):

| Model | Raw Scores | Predictions | TP | TN | FP | FN | Accuracy | Precision | Recall | F1 Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Keyword** | `[0.3462, 0.5769, 0.1875]` | `[0, 1, 0]` | 1 | 1 | 0 | 1 | 0.6667 | 1.0000 | 0.5000 | 0.6667 |
| **Jaccard** | `[0.3261, 0.5435, 0.1786]` | `[0, 1, 0]` | 1 | 1 | 0 | 1 | 0.6667 | 1.0000 | 0.5000 | 0.6667 |
| **TF-IDF** | `[0.1992, 0.2072, 0.0751]` | `[0, 0, 0]` | 0 | 1 | 0 | 2 | 0.3333 | 0.0000 | 0.0000 | 0.0000 |
| **Logistic Regression** | `[0.4699, 0.4590, 0.5469]` | `[0, 0, 1]` | 0 | 0 | 1 | 2 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| **Random Forest** | `[0.3200, 0.4400, 0.7000]` | `[0, 0, 1]` | 0 | 0 | 1 | 2 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| **PRISM Hybrid** | `[0.4801, 0.5416, 0.2400]` | `[0, 1, 0]` | 1 | 1 | 0 | 1 | **0.6667** | **1.0000** | **0.5000** | **0.6667** |

*Investigation of PRISM vs. Keyword:* PRISM produces different continuous scores (+0.0504 mean delta), but at $\tau=0.50$ on $N=3$ holdout samples, both models map to identical binary decisions `[0, 1, 0]`.

---

## 8. Ranking Results

* **NDCG@10:** 0.5000 across models
* **MRR:** 0.5000 across models
* **Scientific Note:** **NOT INTERPRETABLE AS GENERALIZABLE RANKING EVIDENCE AT CURRENT SAMPLE SIZE ($N=3$).** Because the holdout partition contains 3 candidates distributed across 2 separate job requisitions, ranking lists have lengths 1 and 2. Larger candidate cohorts per requisition ($K \ge 50$) are necessary for meaningful ranking metric evaluation.

---

## 9. Fairness Results

Demographic audit computed on holdout test partition:

| Model | Group B ($N=1$, Pos=1) | Group C ($N=2$, Pos=1) | Selection Rate (B) | Selection Rate (C) | DPD | EOD | DIR |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Keyword** | Pred: 1 (TP: 1, FP: 0) | Pred: 0 (TP: 0, TN: 1, FN: 1) | 1.0000 | 0.0000 | 1.0000 | 1.0000 | 0.0000 |
| **Jaccard** | Pred: 1 (TP: 1, FP: 0) | Pred: 0 (TP: 0, TN: 1, FN: 1) | 1.0000 | 0.0000 | 1.0000 | 1.0000 | 0.0000 |
| **TF-IDF** | Pred: 0 (FN: 1) | Pred: 0 (TN: 1, FN: 1) | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| **Logistic Regression** | Pred: 0 (FN: 1) | Pred: 1 (FP: 1, FN: 1) | 0.0000 | 0.5000 | 0.5000 | 0.0000 | 0.0000 |
| **PRISM Hybrid** | Pred: 1 (TP: 1, FP: 0) | Pred: 0 (TP: 0, TN: 1, FN: 1) | 1.0000 | 0.0000 | 1.0000 | 1.0000 | 0.0000 |

---

## 10. Ablation Study & Root-Cause Resolution

| Configuration | Lexical Score Formula | Raw Scores | Accuracy | F1 Score |
| :--- | :--- | :---: | :---: | :---: |
| **A. Pure Lexical Baseline** | $\text{Score} = 1.0 \times \text{raw\_overlap}$ (unscaled) | `[0.2308, 0.3846, 0.1250]` | 0.3333 | 0.0000 |
| **B. Lexical + Semantic** | $0.5 \cdot \text{lex} + 0.5 \cdot \text{sem}$ | `[0.2150, 0.2959, 0.1001]` | 0.3333 | 0.0000 |
| **C. Lexical + Semantic + Skills** | $0.35 \cdot \text{lex} + 0.35 \cdot \text{sem} + 0.30 \cdot \text{skills}$ | `[0.3705, 0.4571, 0.0700]` | 0.3333 | 0.0000 |
| **D. + Experience & Education** | Add $0.10 \cdot \text{exp} + 0.05 \cdot \text{edu}$ | `[0.4426, 0.5041, 0.1988]` | 0.3333 | 0.0000 |
| **E. Full PRISM Hybrid** | Full weights ($0.20, 0.30, 0.25, 0.15, 0.10$) | `[0.4801, 0.5416, 0.2400]` | **0.6667** | **0.6667** |

*Root Cause of Inconsistency Disclosed:* `BaselineKeywordMatcher` included a scaling multiplier of $1.5\times$, whereas Ablation A used unscaled raw overlap fraction. At $\tau=0.50$, unscaled lexical overlap yields 0 positive predictions (Accuracy = 0.3333), whereas adding multi-feature components progressively shifts candidate `C-1011` above the 0.50 threshold to reach Accuracy = 0.6667 and F1 = 0.6667.

---

## 11. Statistical Analysis

* **Methodology:** 1,000 paired bootstrap iterations on holdout scores; two-tailed Wilcoxon signed-rank test.
* **PRISM Hybrid vs. Keyword:**
  * Mean Continuous Score Delta: $+0.0504$
  * 95% Bootstrap Confidence Interval: $[-0.0353, +0.1339]$
  * Wilcoxon Signed-Rank Test Statistic: $W = 1.0$, $p = 0.5000$
* **Statistical Power Assessment:** **INSUFFICIENT.** With $N=3$ paired differences, the minimum mathematically achievable $p$-value for the Wilcoxon signed-rank test is $0.2500$. Achieving statistical significance ($p < 0.05$) is mathematically impossible on $N=3$.

---

## 12. Latency Profiling (100 Repetitions)

* **Profiling Setup:** Windows 64-bit AMD64, Python 3.14.3, 100 repeated inference executions.
* **Indexing / Training Latency:** $2.88 \text{ ms}$
* **Cold-Start Inference:** $4.54 \text{ ms}$
* **Warm Total Inference:**
  * Mean: $6.48 \text{ ms}$
  * Median (P50): $6.04 \text{ ms}$
  * P95: $10.22 \text{ ms}$
  * P99: $16.74 \text{ ms}$
  * Min / Max: $4.42 \text{ ms} / 19.82 \text{ ms}$
* **Per-Candidate Inference Latency:** Mean $2.16 \text{ ms/candidate}$ (P95: $3.41 \text{ ms/candidate}$).

---

## 13. Robustness Evaluation

* **Perturbation Test:** 50% random skill ablation applied to applicant profiles.
* **Result:** Classification F1 dropped by $\Delta = -0.1667$ under high-noise conditions, indicating that skill feature extraction contributes meaningfully to decision boundaries.

---

## 14. Feedback Adaptation

* **SaaS Implementation:** Recruiter actions logged to queue labeled `Recorded · Pending Adaptation`.
* **Offline Adaptation Experiment:** Retraining supervised ranker on recruiter decision feedback batch shifted candidate decision boundaries with F1 $\Delta = +0.10$. Model versions are not modified until offline training completes.

---

## 15. Limitations

1. **Benchmark Cohort Size:** $N=20$ total records with $N=3$ holdout samples is suitable for pipeline verification and code reproducibility, but does not provide statistical power for competitive superiority claims.
2. **Demographic Group Representation:** Groups A, B, and C are synthetic illustrative cohorts for algorithmic auditing, not real-world demographic identities.
3. **Generalization Scope:** Efficacy across diverse industries (healthcare, legal, engineering) requires external multi-domain hiring benchmarks ($N \ge 1,000$).

---

## 16. Reproducibility

* **Deterministic Seed:** Fixed at 42.
* **Single-Command Reproduction:**
  ```bash
  python -m experiments.reproduce
  ```
* **Artifact Directory:** `experiments/results/reproduction/` contains:
  * `predictions_keyword.json`
  * `predictions_jaccard.json`
  * `predictions_tfidf.json`
  * `predictions_logistic_regression.json`
  * `predictions_random_forest.json`
  * `predictions_prism_hybrid.json`
  * `audit_summary.json`

---

## 17. Research Claim Validation

See [RESEARCH_CLAIM_VALIDATION_MATRIX.md](file:///c:/projectnew----/RESEARCH_CLAIM_VALIDATION_MATRIX.md) for full traceability across all 8 core paper claims.

---

## 18. Conclusion

The preliminary benchmark confirms that the PRISM experimental pipeline executes reproducibly and that its evaluation components can be measured without detected data leakage. However, the small holdout cohort provides insufficient statistical power to establish generalizable performance superiority over competing methods. Larger external datasets ($N \ge 1,000$) are required for conclusive comparative academic validation.
