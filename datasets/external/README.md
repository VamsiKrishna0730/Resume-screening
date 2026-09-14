# PRISM External Recruitment Dataset Ingestion Framework

**Status:** `DATASET REQUIRED`  
**Current Real-World External Dataset:** Not yet loaded (Awaiting legally compliant external benchmark acquisition).  

---

## 1. Scope & Objective

To establish external generalization and empirical superiority for Elsevier/Q1 publication, the PRISM evaluation framework requires an independently sourced, legally compliant external recruitment dataset.

This directory (`datasets/external/`) provides the standardized specification, loader, and provenance metadata tracker for ingesting external hiring datasets.

---

## 2. Ingestion Requirements

Any external benchmark loaded into this pipeline must satisfy:

1. **Schema Compliance:** Must strictly validate against [`schema.json`](file:///c:/projectnew----/datasets/external/schema.json).
2. **PII Redaction:** All real-world names, phone numbers, personal email addresses, home addresses, and photographs must be completely stripped or pseudonymized prior to ingestion.
3. **Licensing & Provenance:** The dataset must possess a documented open research license (e.g. CC-BY-4.0, MIT, or OpenRAIL) or explicit research consent. Document this in `provenance.json`.
4. **Target & Demographic Isolation:**
   - `ground_truth_match` must be binary $\{0, 1\}$.
   - Protected demographic indicators (`demographic_attribute`) must be strictly sequestered for post-hoc fairness metrics and never exposed to model feature extractors.

---

## 3. Dataset Loading API

Use [`datasets/external/loader.py`](file:///c:/projectnew----/datasets/external/loader.py):

```python
from datasets.external.loader import ExternalDatasetLoader

loader = ExternalDatasetLoader()
corpus = loader.load_external_corpus("datasets/external/kaggle_recruitment.jsonl")
print(f"Loaded {corpus['total_records']} candidate-job pairs across {corpus['unique_candidates']} candidates.")
```
