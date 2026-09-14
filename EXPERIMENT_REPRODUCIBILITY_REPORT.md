# PRISM Experiment Reproducibility Report

**Platform Version:** 1.3.2  
**Date:** 03 September 2026  
**Auditor:** Automated Reproducibility & Provenance Pipeline  

---

## 1. Reproducibility Environment

- **OS:** Windows 11 Enterprise (AMD64)
- **Node.js Environment:** Next.js 16.3.3 (Turbopack, React 19, TypeScript 5.7.3)
- **Python Environment:** Python 3.14.3 (64-bit)
- **Key Machine Learning Dependencies:**
  - `numpy`: 2.4.6
  - `scipy`: 1.18.0
  - `scikit-learn`: 1.9.0
  - `pandas`: 2.3.3
  - `pyyaml`: 6.0.3

---

## 2. Deterministic Reproducibility Protocol

To guarantee bit-exact, deterministic reproduction of all reported numbers:

1. **Fixed Pseudo-Random Seed:**
   - Seed value is fixed at `42` across all data splitters, feature vectorizers, random forest initializers, and paired bootstrap samplers.
2. **Deterministic Tie-Breaking:**
   - Candidate ranking ties are broken deterministically by applicant ID ascending (`candidate_id`).
3. **Sequestration of Test Partition:**
   - All vectorizers (TF-IDF), scaler transforms, and models fit exclusively on training data ($N=14$) and predict on holdout test data ($N=3$).

---

## 3. Independent Reproduction Verification

Executing:
```bash
python -m experiments.reproduce
```
Yielded identical results on consecutive clean runs:

| Step | Metric / Result | Run 1 | Run 2 | Identity Match |
| :--- | :--- | :---: | :---: | :---: |
| **Data Partitioning** | Train Count / Val Count / Test Count | 14 / 3 / 3 | 14 / 3 / 3 | **100% IDENTICAL** |
| **Candidate IDs in Test** | Test Applicants | `C-1007`, `C-1011`, `C-1015` | `C-1007`, `C-1011`, `C-1015` | **100% IDENTICAL** |
| **Keyword Accuracy** | Classification Accuracy | 0.6667 | 0.6667 | **100% IDENTICAL** |
| **PRISM Hybrid Accuracy**| Classification Accuracy | 0.6667 | 0.6667 | **100% IDENTICAL** |
| **PRISM Hybrid F1** | Classification F1 Score | 0.6667 | 0.6667 | **100% IDENTICAL** |
| **Bootstrap Mean Delta** | $\Delta(\text{PRISM} - \text{Keyword})$ | +0.0504 | +0.0504 | **100% IDENTICAL** |
| **Wilcoxon $p$-value** | Two-tailed paired $p$-value | 0.5000 | 0.5000 | **100% IDENTICAL** |

---

## 4. Packaging & Artifact Provenance

Every experiment run automatically serializes:
- `config.json`: Run configuration, seed, split ratios, hyperparameters.
- `results.json`: Full classification, ranking, fairness, and latency outputs.
- `table.md` & `table.tex`: LaTeX and Markdown tables formatted for academic submission.
- `predictions_<model>.json`: Per-candidate raw predictions, ground truth, continuous scores, and demographic groups.

Results directory: [`experiments/results/`](file:///c:/projectnew----/experiments/results/)
