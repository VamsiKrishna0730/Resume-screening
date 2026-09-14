# PRISM Dataset Specification

**Framework Version:** 1.3.2  
**Audit Date:** 14 September 2026  
**Reference File:** `datasets/sample_benchmark.jsonl`  

---

## 1. Schema Field Role Matrix

The following table explicitly distinguishes model inputs, evaluation targets, demographic audit labels, and metadata across the PRISM research data schema:

| Field Name | Data Type | Model Input Feature | Evaluation Target | Fairness Audit Only | Metadata / Review Only |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **`candidate_id`** | `string` | **NO** | **NO** | **NO** | **YES** (Split grouping key) |
| **`job_id`** | `string` | **NO** | **NO** | **NO** | **YES** (Requisition identifier) |
| **`resume_text`** | `string` | **YES** (Lexical/Semantic) | **NO** | **NO** | **NO** |
| **`job_description`** | `string` | **YES** (Target Requisition) | **NO** | **NO** | **NO** |
| **`ground_truth_match`** | `integer` ($\{0, 1\}$) | **NO** (Strictly excluded) | **YES** (Primary target) | **NO** | **NO** |
| **`skills`** | `list[string]` | **YES** (Skill overlap) | **NO** | **NO** | **NO** |
| **`experience`** | `float` (years) | **YES** (Experience scaling) | **NO** | **NO** | **NO** |
| **`education`** | `string` | **YES** (Education matching) | **NO** | **NO** | **NO** |
| **`projects`** | `list[string]` | **NO** | **NO** | **NO** | **YES** (Portfolio evidence) |
| **`recruiter_label`** | `string` | **NO** | **YES** (Secondary target) | **NO** | **NO** |
| **`demographic_attribute`** | `string` | **NO** (Strictly excluded) | **NO** | **YES** (Subgroup analysis) | **NO** |
| **`cgpa`** | `float` | **YES** (Academic evaluation) | **NO** | **NO** | **NO** |
| **`cgpa_scale`** | `float` (4, 5, 10, 100) | **YES** (Scale normalization) | **NO** | **NO** | **NO** |

---

## 2. Dataset Mode Separation

To prevent confusion between browser demonstrations and empirical benchmarks, three distinct data tiers are enforced:

1. **Browser Demo Fixtures (`lib/demo-data.ts`):** Deterministic mock candidates ($N=12$) and jobs ($N=5$) designed for frontend visualization and interactive recruitment workflow testing.
2. **Internal Benchmark Verification Cohort (`datasets/sample_benchmark.jsonl`):** Standalone research cohort ($N=20$) utilized for reproducible unit validation of the offline Python experimental suite.
3. **External Academic Benchmark Dataset (Required for Publication):** Independently sourced external applicant tracking corpora ($N \ge 1,000$ candidate-job pairs) required to establish generalizable empirical superiority under rigorous statistical power.

---

## 3. Confidentiality & Ethical Safeguards

* **Synthetic Demographics Disclaimer:** Groups A, B, and C in the verification cohort are synthetic audit labels generated for algorithmic testing; they do not represent real human applicant demographics.
* **PII Redaction:** No real phone numbers, emails, physical addresses, or biometric data are stored in benchmark datasets.
