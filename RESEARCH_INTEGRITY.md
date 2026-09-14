# PRISM Research Integrity & Academic Compliance Statement

**Research Title:** *A Fair, Explainable, and Feedback-Adaptive AI Framework for Resume Screening and Candidate Matching*  
**Date:** September 3, 2026  
**Final Research Status:** 🟢 **IMPLEMENTATION READY — EMPIRICAL VALIDATION REQUIRED**  

---

## 1. Scientific Truthfulness & Transparency Mandate

In accordance with academic publication standards (Elsevier, IEEE, ACM), code implementation and software architecture must not be conflated with empirical validation.

| Feature Area | Software Implementation Status | Empirical Research Status | Scientific Classification |
| --- | --- | --- | --- |
| **Resume & Job Parsing** | Fully functional text & entity extraction | Evaluated on local text inputs | **DETERMINISTIC IMPLEMENTATION** |
| **Hybrid Matching Engine** | 6-feature weighted scoring in `lib/matching/` | Tested with candidate profiles | **DETERMINISTIC IMPLEMENTATION** |
| **Explainable AI (XAI)** | Candidate-grounded feature attributions | Dynamic match contributions | **DYNAMICALLY DERIVED** |
| **Machine Learning Rankers** | Trainable Logistic Regression & Random Forest | In-memory feature vectors | **TRAINABLE ML SCAFFOLD** |
| **LLM Provider Layer** | Server-side Gemini & OpenAI provider | Fallback active when keys omitted | **PROVIDER ABSTRACTION / FALLBACK** |
| **Fairness Auditing** | Demographic Parity Diff & Equal Opportunity | Computed on synthetic cohorts | **SYNTHETIC AUDIT** |
| **Bias Mitigation** | Threshold calibration adjustment | Evaluated on demo score thresholds | **SIMULATION** |
| **Recruiter Feedback** | Feedback event queue & session log | Stored for offline retraining | **RECORDED · PENDING ADAPTATION** |
| **Model Versioning** | Version registry & checkpoints (`v1.3.2`) | Checkpoint state tracking | **SIMULATED VERSIONING** |
| **Benchmark Metrics** | Precision@K, Recall@K, NDCG@10 evaluator | Synthetic benchmark evaluation | **SYNTHETIC BENCHMARK** |

---

## 2. Mandatory Terminology Standards

To prevent misleading claims in academic contexts:
1. **"Trained ML Model":** Used ONLY when actual model parameters have undergone optimization via loss minimization on labeled training data.
2. **"Gemini / LLM Inference":** Used ONLY when an active API call to Google Gemini or OpenAI succeeds and returns validated structured JSON.
3. **"Deterministic Fallback":** Explicitly indicated whenever offline heuristic extractors or keyword taxonomies are used.
4. **"Pending Adaptation":** Recruiter feedback is stored in a session queue; model checkpoint version changes are simulated for demonstration until offline batch training is executed.
5. **"Human-in-the-Loop":** The system strictly serves as a decision-support tool. Autonomous hiring without human review is prohibited.
