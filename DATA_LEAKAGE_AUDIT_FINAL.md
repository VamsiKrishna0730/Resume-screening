# PRISM Comprehensive Data Leakage Audit

**Framework Version:** 1.3.2  
**Audit Date:** 14 September 2026  
**Auditor:** Senior Research Software Engineer & Data Leakage Auditor  

---

## 1. Multi-Layer Contamination Checks

Data leakage in machine learning for candidate recruitment produces artificially inflated metrics and compromises scientific validity. This audit evaluates seven specific leakage vectors across the PRISM research repository:

1. **Candidate-Level Identity Contamination:** Verifying disjoint applicant grouping between training, validation, and holdout test partitions.
2. **Exact Text Overlap:** Verifying that no identical raw resume text spans multiple data partitions.
3. **Near-Duplicate Fuzzy Text Overlap:** 3-gram character/word shingling with MinHash signatures and Jaccard similarity audit across partitions.
4. **Target / Label Contamination:** Confirming ground truth labels are strictly sequestered from input feature vectors ($X$).
5. **Demographic Attribute Leakage:** Ensuring protected group attributes are excluded from model training features.
6. **Chronological Feedback Leakage:** Verifying recruiter adaptation batches are strictly timestamp-isolated from historical baselines.
7. **Preprocessing / Fitting Leakage:** Ensuring TF-IDF vectorizers, tokenizers, and scalers are fitted exclusively on training sets.

---

## 2. Quantitative Verification Findings

| Contamination Vector | Tested Implementation | Verification Evidence | Finding / Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Candidate Partitioning** | `experiments/dataset.py:109-136` | $\text{Train} \cap \text{Val} = \emptyset$, $\text{Train} \cap \text{Test} = \emptyset$, $\text{Val} \cap \text{Test} = \emptyset$ | Candidate IDs grouped prior to record split; 0 applicant overlap | **PASS** |
| **Exact Text Duplicate Overlap** | Exact string match on `resume_text` | $\text{ExactDuplicates}(\text{Train}, \text{Test}) = 0$ | Zero exact resume text overlap between partitions | **PASS** |
| **Near-Duplicate Text Overlap** | 3-gram MinHash / Jaccard (`experiments/near_duplicate_audit.py`) | Threshold $\tau = 0.70$ on 3-gram word shingles | 0 near-duplicate candidate resumes across partitions | **PASS** |
| **Target Label Contamination** | `experiments/models.py:SupervisedRanker` | Features: text TF-IDF + structured metadata | `ground_truth_match` strictly excluded from $X$ | **PASS** |
| **Demographic Attribute Leakage** | `experiments/models.py:PRISMHybridPipeline` | Features: lexical, semantic, skills, exp, edu | `demographic_attribute` excluded from scoring; used solely in fairness audit | **PASS** |
| **Feedback Chronology** | `experiments/evaluator.py:52-74` | Two-stage evaluation: before vs. after adaptation | Adaptation batch injected only during secondary evaluation | **PASS** |
| **Preprocessing Fitting** | `experiments/models.py:BaselineTfidfMatcher` | `vectorizer.fit(train_records)` | Vectorizers fitted exclusively on training partition data | **PASS** |
| **Hyperparameter Tuning** | Feature weight selection | Manual heuristic assignment ($0.20, 0.30, 0.25, 0.15, 0.10$) | Weights were not tuned against holdout performance metrics | **PASS** |

---

## 3. Scientific Boundary & Limitations

* **Audited vs. Universal Leakage:** The audit certifies that the audited leakage pathways (candidate identity, exact text, near-duplicate text at threshold 0.70, target label, demographic feature, and chronological feedback) were not detected in `datasets/sample_benchmark.jsonl`.
* **External Dataset Ingestion Rule:** When ingesting external applicant tracking corpora via `datasets/external/loader.py`, `audit_partition_near_duplicates()` must be executed automatically before experimental training to verify that shared resume templates do not compromise partitioning integrity.
