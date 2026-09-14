# PRISM Prediction Artifact Audit Report

**Framework Version:** 1.3.2  
**Audit Date:** 14 September 2026  
**Artifact Directory:** `experiments/results/reproduction/`  
**Auditor:** Automated Reproducibility & Metric Verification Engine  

---

## 1. Raw Prediction Artifact Verification (All 8 Models)

All prediction artifacts located in `experiments/results/reproduction/` were independently inspected and verified against the ground truth labels of holdout test partition ($N=3$, candidates: `['C-1007', 'C-1011', 'C-1015']`, ground truth labels: `[1, 1, 0]`):

| Model | Evaluated File | Sample Size ($N$) | Candidate IDs Match | Labels Match | Raw Continuous Scores | Discrete Predictions ($\tau=0.50$) | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Keyword** | `predictions_keyword.json` | 3 | YES (`C-1007`, `C-1011`, `C-1015`) | YES (`[1, 1, 0]`) | `[0.3462, 0.5769, 0.1875]` | `[0, 1, 0]` | **PASS** |
| **Jaccard** | `predictions_jaccard.json` | 3 | YES (`C-1007`, `C-1011`, `C-1015`) | YES (`[1, 1, 0]`) | `[0.3261, 0.5435, 0.1786]` | `[0, 1, 0]` | **PASS** |
| **TF-IDF** | `predictions_tfidf.json` | 3 | YES (`C-1007`, `C-1011`, `C-1015`) | YES (`[1, 1, 0]`) | `[0.1992, 0.2072, 0.0751]` | `[0, 0, 0]` | **PASS** |
| **BM25 (Okapi)** | `predictions_bm25.json` | 3 | YES (`C-1007`, `C-1011`, `C-1015`) | YES (`[1, 1, 0]`) | `[0.2662, 0.4446, 0.1966]` | `[0, 0, 0]` | **PASS** |
| **SBERT (MiniLM)** | `predictions_sbert.json` | 3 | YES (`C-1007`, `C-1011`, `C-1015`) | YES (`[1, 1, 0]`) | `[0.5948, 0.5883, 0.3355]` | `[1, 1, 0]` | **PASS** |
| **Logistic Regression** | `predictions_logistic_regression.json` | 3 | YES (`C-1007`, `C-1011`, `C-1015`) | YES (`[1, 1, 0]`) | `[0.4699, 0.4590, 0.5469]` | `[0, 0, 1]` | **PASS** |
| **Random Forest** | `predictions_random_forest.json` | 3 | YES (`C-1007`, `C-1011`, `C-1015`) | YES (`[1, 1, 0]`) | `[0.3200, 0.4400, 0.7000]` | `[0, 0, 1]` | **PASS** |
| **PRISM Hybrid** | `predictions_prism_hybrid.json` | 3 | YES (`C-1007`, `C-1011`, `C-1015`) | YES (`[1, 1, 0]`) | `[0.4801, 0.5416, 0.2400]` | `[0, 1, 0]` | **PASS** |

---

## 2. Independent Metric Reconstruction

Independent mathematical recomputation of performance metrics from raw predictions:

$$\text{Accuracy} = \frac{\text{TP} + \text{TN}}{\text{TP} + \text{TN} + \text{FP} + \text{FN}}, \quad \text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}, \quad \text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}, \quad \text{F1} = \frac{2 \cdot \text{Prec} \cdot \text{Rec}}{\text{Prec} + \text{Rec}}$$

| Model | TP | TN | FP | FN | Recomputed Accuracy | Recomputed Precision | Recomputed Recall | Recomputed F1 | `metrics.json` Match |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Keyword** | 1 | 1 | 0 | 1 | 0.6667 | 1.0000 | 0.5000 | 0.6667 | **EXACT MATCH** |
| **Jaccard** | 1 | 1 | 0 | 1 | 0.6667 | 1.0000 | 0.5000 | 0.6667 | **EXACT MATCH** |
| **TF-IDF** | 0 | 1 | 0 | 2 | 0.3333 | 0.0000 | 0.0000 | 0.0000 | **EXACT MATCH** |
| **BM25** | 0 | 1 | 0 | 2 | 0.3333 | 0.0000 | 0.0000 | 0.0000 | **EXACT MATCH** |
| **SBERT** | 2 | 1 | 0 | 0 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | **EXACT MATCH** |
| **Logistic Regression** | 0 | 0 | 1 | 2 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | **EXACT MATCH** |
| **Random Forest** | 0 | 0 | 1 | 2 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | **EXACT MATCH** |
| **PRISM Hybrid** | 1 | 1 | 0 | 1 | 0.6667 | 1.0000 | 0.5000 | 0.6667 | **EXACT MATCH** |

---

## 3. Score Semantics & Decision Thresholds

* **Score Semantics by Model:**
  * **Keyword / Jaccard:** Heuristic scaled token overlap index.
  * **TF-IDF / SBERT:** Cosine similarity in $[0.0, 1.0]$.
  * **BM25:** Robertson-Spärck Jones Okapi score mapped monotonically via saturation function $s / (s + 10.0)$.
  * **Logistic Regression / Random Forest:** Supervised class posterior probability estimates.
  * **PRISM Hybrid:** Multi-feature additive weighted sum in $[0.0, 1.0]$.
* **Decision Boundary:** Uniform threshold $\tau = 0.50$.
* **Audit Finding:** On holdout $N=3$, SBERT correctly classifies all 3 samples ($\text{F1}=1.0000$), while PRISM Hybrid, Keyword, and Jaccard achieve $\text{F1}=0.6667$. PRISM does not outperform SBERT on this holdout set.
