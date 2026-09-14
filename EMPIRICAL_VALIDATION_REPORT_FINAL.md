# PRISM Empirical Validation Report (Final Audit Edition)

**Research Paper:** *A Fair, Explainable, and Feedback-Adaptive AI Framework for Resume Screening and Candidate Matching*  
**Platform Version:** 1.3.2  
**Evaluation Date:** 14 September 2026  
**Auditor:** Automated Independent Reproduction & Scientific Audit Suite (`experiments/reproduce.py`)  

---

## 1. Dataset Verification & Composition

* **Source File:** `datasets/sample_benchmark.jsonl`
* **Benchmarking Designation:** `SMALL REPRODUCIBILITY BENCHMARK — NOT SUFFICIENT FOR GENERALIZATION`
* **Total Observations:** 20 candidate-job evaluation pairs
* **Unique Candidates:** 20 ($N_{\text{cand}} = 20$)
* **Unique Job Requisitions:** 3 (`JOB-001`: ML Engineer, `JOB-002`: Senior Data Scientist, `JOB-003`: Frontend UI Engineer)
* **Ground Truth Class Balance:** 11 Positive Matches (55.0%), 9 Negative Matches (45.0%)
* **Synthetic Demographic Breakdown:** Group A = 8 (40.0%), Group B = 7 (35.0%), Group C = 5 (25.0%)
* **Data Quality Verification:** 100% field completeness; zero missing attributes; labels strictly binary $y \in \{0, 1\}$.

---

## 2. Experimental Splitting Protocol & Leakage Verification

* **Partitioning Strategy:** Candidate-level disjoint splitting with 70% Train ($N=14$), 15% Validation ($N=3$), 15% Holdout Test ($N=3$).
* **Candidate Disjointness Audit:**
  * $\text{Train Candidates} = \{\text{C-1001}, \text{C-1002}, \text{C-1003}, \text{C-1004}, \text{C-1006}, \text{C-1009}, \text{C-1010}, \text{C-1012}, \text{C-1014}, \text{C-1016}, \text{C-1017}, \text{C-1018}, \text{C-1019}, \text{C-1020}\}$
  * $\text{Val Candidates} = \{\text{C-1005}, \text{C-1008}, \text{C-1013}\}$
  * $\text{Holdout Test Candidates} = \{\text{C-1007}, \text{C-1011}, \text{C-1015}\}$
  * Set intersections: $\text{Train} \cap \text{Val} = \emptyset$, $\text{Train} \cap \text{Test} = \emptyset$, $\text{Val} \cap \text{Test} = \emptyset$.
* **3-Gram MinHash Near-Duplicate Leakage Audit:**
  * Exact duplicates found: 0
  * Near duplicates found (3-gram word Jaccard $\ge 0.70$): 0
  * Audit status: **PASS (Leakage Risk: LOW)**
* **Holdout Test Ground Truth:** `C-1007` ($y=1$), `C-1011` ($y=1$), `C-1015` ($y=0$). Total: 2 Positives, 1 Negative.

---

## 3. Classification Performance Across All 8 Models

Models evaluated under identical holdout test partition ($N=3$, decision threshold $\tau = 0.50$):

| Model Architecture | Raw Holdout Scores | Discrete Predictions | TP | TN | FP | FN | Accuracy | Precision | Recall | F1 Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Keyword (Scaled Overlap)** | `[0.3462, 0.5769, 0.1875]` | `[0, 1, 0]` | 1 | 1 | 0 | 1 | 0.6667 | 1.0000 | 0.5000 | 0.6667 |
| **Jaccard Similarity** | `[0.3261, 0.5435, 0.1786]` | `[0, 1, 0]` | 1 | 1 | 0 | 1 | 0.6667 | 1.0000 | 0.5000 | 0.6667 |
| **TF-IDF Cosine Similarity** | `[0.1992, 0.2072, 0.0751]` | `[0, 0, 0]` | 0 | 1 | 0 | 2 | 0.3333 | 0.0000 | 0.0000 | 0.0000 |
| **BM25 (Okapi)** | `[0.2662, 0.4446, 0.1966]` | `[0, 0, 0]` | 0 | 1 | 0 | 2 | 0.3333 | 0.0000 | 0.0000 | 0.0000 |
| **SBERT (all-MiniLM-L6-v2)** | `[0.5948, 0.5883, 0.3355]` | `[1, 1, 0]` | 2 | 1 | 0 | 0 | **1.0000** | **1.0000** | **1.0000** | **1.0000** |
| **Logistic Regression Ranker** | `[0.4699, 0.4590, 0.5469]` | `[0, 0, 1]` | 0 | 0 | 1 | 2 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| **Random Forest Ranker** | `[0.3200, 0.4400, 0.7000]` | `[0, 0, 1]` | 0 | 0 | 1 | 2 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| **PRISM Hybrid Model** | `[0.4801, 0.5416, 0.2400]` | `[0, 1, 0]` | 1 | 1 | 0 | 1 | 0.6667 | 1.0000 | 0.5000 | 0.6667 |

*Critical Finding:* SBERT correctly classifies both positive candidates (`C-1007`, `C-1011`) above threshold $\tau=0.50$, reaching F1 = 1.0000 on this cohort. PRISM Hybrid scores candidate `C-1007` at $0.4801$, resulting in a false negative at $\tau=0.50$ (F1 = 0.6667). PRISM does **not** outperform SBERT on this evaluation cohort.

---

## 4. Requisition Ranking Pool Evaluation

* **Evaluator Module:** `experiments/ranking_evaluator.py`
* **Benchmark Standard:** Requires $K \ge 50$ candidates per requisition for realistic ranking assessment.
* **Observed Requisition Pools on Holdout:**
  * `JOB-001`: 2 candidates (`C-1007`, `C-1011`)
  * `JOB-002`: 1 candidate (`C-1015`)
* **Mean MRR:** 0.5000; **Mean NDCG@10:** 0.5000.
* **Interpretability Status:** **NOT INTERPRETABLE / INSUFFICIENT RANKING POOL (N=3).** Ranking metrics are preserved for pipeline integrity but do not constitute valid evidence of retrieval effectiveness.

---

## 5. Demographic Fairness Audit (Synthetic Audit Cohort)

* **Designation:** `SYNTHETIC FAIRNESS AUDIT COHORT`
* **Group B ($N=1$, Pos=1):** Selection Rate = 1.00 (PRISM, Keyword, SBERT), 0.00 (TF-IDF, BM25)
* **Group C ($N=2$, Pos=1):** Selection Rate = 0.00 (PRISM, Keyword), 0.50 (SBERT, Logistic Regression, Random Forest)
* **Parity Metrics for PRISM Hybrid:** $\text{DPD} = 1.0000$, $\text{EOD} = 1.0000$, $\text{DIR} = 0.0000$.
* **Caveat:** Evaluated on synthetic audit labels; cannot be interpreted as real-world human demographic parity.

---

## 6. Architectural Ablation Analysis

| Configuration | Features Included | Holdout Scores | Accuracy | F1 Score |
| :--- | :--- | :---: | :---: | :---: |
| **A. Pure Lexical** | $1.0 \times \text{raw\_overlap}$ (unscaled) | `[0.2308, 0.3846, 0.1250]` | 0.3333 | 0.0000 |
| **B. Lexical + Semantic** | $0.5 \cdot \text{lex} + 0.5 \cdot \text{sem}$ | `[0.2150, 0.2959, 0.1001]` | 0.3333 | 0.0000 |
| **C. + Skills** | $0.35 \cdot \text{lex} + 0.35 \cdot \text{sem} + 0.30 \cdot \text{skills}$ | `[0.3705, 0.4571, 0.0700]` | 0.3333 | 0.0000 |
| **D. + Experience & Education** | Add $0.10 \cdot \text{exp} + 0.05 \cdot \text{edu}$ | `[0.4426, 0.5041, 0.1988]` | 0.3333 | 0.0000 |
| **E. Full PRISM Hybrid** | Full weights ($0.20, 0.30, 0.25, 0.15, 0.10$) | `[0.4801, 0.5416, 0.2400]` | **0.6667** | **0.6667** |

*Root Cause Documentation:* `BaselineKeywordMatcher` used a $1.5\times$ scaling factor, while Ablation A used unscaled raw overlap. The ablation represents an architectural progression rather than an identical baseline comparison.

---

## 7. Statistical Power & Sample Size Analysis

* **Module:** `experiments/power_analysis.py`
* **Bootstrap Analysis (1,000 paired iterations):** Mean continuous delta = $+0.0504$, 95% CI = $[-0.0353, +0.1339]$.
* **Wilcoxon Signed-Rank Test:** $W = 1.0, p = 0.5000$.
* **Observed Cohen's d:** $d = 0.5950$; **Estimated Post-Hoc Power:** $0.1763$ (17.6%).
* **Required Sample Size Analysis:** To detect a mean effect size of $d=0.30$ with $\alpha=0.05$ and $\text{Power}=80\%$, an evaluation cohort of at least $N=88$ independent holdout observations is required.
* **Statistical Power Conclusion:** **INSUFFICIENT STATISTICAL POWER.**

---

## 8. Latency Profiling (100 Repetitions)

* **Profiling Environment:** Windows 64-bit AMD64, Python 3.14.3
* **Indexing / Training Latency:** $3.08 \text{ ms}$
* **Cold-Start Inference:** $6.75 \text{ ms}$
* **Warm Inference (Mean):** $5.89 \text{ ms}$ (Median: $5.65 \text{ ms}$, P95: $9.45 \text{ ms}$, P99: $12.18 \text{ ms}$)
* **Per-Candidate Inference Latency:** $1.96 \text{ ms/candidate}$ (P95: $3.15 \text{ ms/candidate}$)
