# PRISM Data Leakage Audit

**Framework Version:** 1.3.2  
**Audit Date:** 03 September 2026  
**Auditor:** Automated Empirical Research Validation Pipeline  

---

## 1. Audit Scope & Methodology

Data leakage can artificially inflate model performance metrics in recruitment AI evaluation. The audit verifies the following potential failure modes across the experimental pipeline:

1. **Candidate-Level Contamination (Train/Test Leakage):** Checks whether records associated with the same applicant identity (`candidate_id`) appear in both training and evaluation splits.
2. **Resume Text Duplicate Overlap:** Checks for identical or near-duplicate raw resume corpora spanning training and holdout partitions.
3. **Target / Label Leakage:** Verifies that ground truth relevance indicators (`ground_truth_match`, `recruiter_label`) or downstream review notes are not encoded as input features during training or inference.
4. **Demographic Attribute Leakage:** Confirms that sensitive protected attributes (`demographic_attribute`) are strictly excluded from predictive model feature extractors and solely utilized in post-prediction fairness evaluation.
5. **Feedback Adaptation Leakage:** Ensures that recruiter feedback collected during online evaluation batches is timestamp-isolated and never back-propagated into historical baseline evaluations.

---

## 2. Leakage Test Verification Matrix

| Leakage Category | Verification Test | Mechanism | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Candidate Partitioning** | Candidate ID Disjoint Test | `experiments/dataset.py:split_dataset` | **PASS** | Train, validation, and test candidate ID sets have zero intersection ($\text{Train} \cap \text{Test} = \emptyset$). |
| **Resume Text Overlap** | Exact Text Duplicate Scan | Exact string matching on `resume_text` | **PASS** | No candidate resume in test partition is duplicated in train partition. |
| **Feature Contamination** | Predictive Feature Vectorizer Audit | `experiments/models.py:SupervisedRanker` | **PASS** | Input features include only lexical/semantic text TF-IDF, numerical experience, and skills list; `ground_truth_match` is excluded from $X$. |
| **Demographic Sequestration** | Protected Feature Isolation Test | `experiments/models.py:PRISMHybridPipeline` | **PASS** | `demographic_attribute` is excluded from feature engineering; used strictly in `compute_fairness_metrics`. |
| **Feedback Chronology** | Adaptation Batch Time-ordering | `experiments/evaluator.py:run_feedback_adaptation_experiment` | **PASS** | Feedback data is injected only during secondary adaptation runs. |

---

## 3. Findings & Certification

* **Total Leakage Incidents Detected:** 0
* **Data Leakage Risk Classification:** **NEGLIGIBLE / PREVENTED BY DESIGN**
* **Audit Conclusion:** The dataset partitioning and model evaluation pipelines in `experiments/` strictly maintain candidate isolation and prevent label/demographic contamination.
