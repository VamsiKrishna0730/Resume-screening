# PRISM Research Dataset Infrastructure

This directory contains the dataset infrastructure for empirical evaluation, validation, and benchmarking of the PRISM AI Recruitment Intelligence Platform.

## 1. Directory Structure

```text
datasets/
├── README.md               # Dataset specification, schema documentation, and licensing guidance
├── raw/                    # Raw external datasets (unmodified source files, gitignored)
├── processed/              # Standardized, validated datasets matching PRISM schema
├── splits/                 # Precomputed deterministic train/val/test splits (JSON/CSV)
├── metadata/               # Dataset provenance, source info, license metadata, quality reports
├── loaders/                # Dataset loaders for CSV, JSON, and JSONL
└── validators/             # Schema validation, missing value checking, duplicate detection
```

## 2. Standardized Dataset Schema

Every dataset in `processed/` and `splits/` strictly adheres to the following record schema:

```json
{
  "candidate_id": "C-1001",
  "job_id": "JOB-001",
  "resume_text": "Built NLP evaluation pipelines and production PyTorch ML models...",
  "job_description": "Design and deploy production NLP evaluation pipelines...",
  "skills": ["Python", "PyTorch", "NLP", "SQL", "Docker"],
  "experience": 4.2,
  "education": "MSc Artificial Intelligence",
  "projects": ["NLP Evaluation Benchmarks", "PyTorch Service Infra"],
  "ground_truth_match": 1,
  "recruiter_label": "Shortlist",
  "demographic_attribute": "Group A"
}
```

### Fields Specification:
- **`candidate_id`** (`string`, Required): Unique applicant identifier.
- **`job_id`** (`string`, Required): Target job requisition identifier.
- **`resume_text`** (`string`, Required): Full raw or parsed resume text.
- **`job_description`** (`string`, Required): Complete target job requisition specification.
- **`ground_truth_match`** (`int`, Required): Binary relevance label ($1 = \text{Qualified/Matched}, 0 = \text{Unqualified/Mismatched}$).
- **`skills`** (`list[string]`, Optional): Parsed candidate skill entities.
- **`experience`** (`float`, Optional): Total years of professional experience.
- **`education`** (`string`, Optional): Highest academic qualification achieved.
- **`projects`** (`list[string]`, Optional): Key documented project titles.
- **`recruiter_label`** (`string`, Optional): Categorical decision label (`Shortlist`, `Hold`, `Reject`).
- **`demographic_attribute`** (`string`, Optional): Protected demographic cohort label (used strictly for post-hoc fairness auditing, never as a model feature).

## 3. Privacy, Ethics & Licensing Guidelines

1. **Synthetic vs. Real Data:**
   - The browser UI and local smoke tests run on deterministic synthetic fixtures (`lib/demo-data.ts` and `datasets/sample_benchmark.jsonl`).
   - Synthetic demographic groups (`Group A`, `Group B`, `Group C`) must never be misrepresented as empirical human demographics.
2. **External Dataset Ingestion:**
   - External applicant tracking datasets (e.g., Kaggle Resume Dataset, public hiring benchmark corpora) must be placed under `datasets/raw/`.
   - Never commit personally identifiable information (PII) such as phone numbers, street addresses, or candidate photographs.
   - External datasets must be legally compliant under their respective open research licenses (e.g., CC-BY-4.0, MIT, or OpenRAIL).

## 4. Current External Benchmark Status

- **Status:** `NOT COMPLETED — EXTERNAL BENCHMARK DATASET REQUIRED`
- **Verification Cohort:** A sample cohort of $N=20$ candidate-job pairs is provided in `datasets/sample_benchmark.jsonl` to ensure reproducible execution of all pipeline modules. Full academic claims of competitive superiority over baseline Information Retrieval architectures require large-scale external datasets ($N \ge 1,000$).
