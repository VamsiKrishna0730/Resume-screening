# PRISM Research Claims Audit & Validation Log

**Research Title:** *A Fair, Explainable, and Feedback-Adaptive AI Framework for Resume Screening and Candidate Matching*  
**Date:** September 3, 2026  

---

## Research Claims Audit Matrix

| Claim ID | Research Claim Statement | Implementation Classification | Evidence / Validation Method |
| --- | --- | --- | --- |
| **C01** | Candidate-job matching can be transparently decomposed into lexical, semantic, skill, experience, education, and project features. | **SUPPORTED BY IMPLEMENTATION** | Central dynamic matching engine in `lib/matching/score.ts` calculates 6 distinct feature sub-scores. |
| **C02** | Explainable AI (XAI) feature attribution can produce candidate-specific explanations grounded in candidate data vs job requirements. | **SUPPORTED BY IMPLEMENTATION** | `lib/matching/explanations.ts` dynamically generates candidate-specific positive and negative contribution items. |
| **C03** | Changing matching weights in research settings dynamically re-scores and re-ranks candidates in real-time. | **SUPPORTED BY IMPLEMENTATION** | Reactive state binding in `AppContext.tsx` and `SettingsView.tsx`. |
| **C04** | Group parity and equal opportunity differences can be audited dynamically across demographic cohorts. | **SIMULATED / SYNTHETIC AUDIT** | `lib/fairness/engine.ts` audits synthetic group labels (Group A–C) and computes demographic parity differences. |
| **C05** | Recruiter feedback can be aggregated to trigger model checkpoint version updates and re-rank candidate pools. | **SIMULATED** | `lib/adaptive/engine.ts` tracks reviewer actions and creates model checkpoint version updates (`v1.3.2` $\rightarrow$ `v1.3.3`). |
| **C06** | Text-based candidate resumes can be parsed client-side to extract entity features and enter the dynamic matching pool. | **SUPPORTED BY IMPLEMENTATION** | `lib/parsing/resumeParser.ts` parses raw resume text and appends structured `Candidate` objects to context state. |
| **C07** | PRISM achieves superior ranking performance over single-feature baselines on production industry datasets. | **NOT YET VALIDATED** | Synthetic evaluation benchmark implemented; real-world industrial dataset validation remains future work. |
| **C08** | Automated AI systems can make autonomous, bias-free hiring decisions without human oversight. | **EXPLICITLY REJECTED / DISAPPROVED** | PRISM explicitly enforces a **Human-in-the-Loop** decision-support constraint with recruiter final oversight. |
| **C09** | Academic performance (CGPA/GPA) can be normalized across heterogeneous grading scales (4.0, 5.0, 10.0, 100%) and integrated into hybrid candidate matching via soft scoring or hard threshold constraints. | **SUPPORTED BY IMPLEMENTATION** | Evaluated via `lib/matching/cgpa.ts`, parsed via `lib/parsing/cgpaParser.ts`, integrated in scoring engine `lib/matching/score.ts`, tested in `tests/cgpa-suite.mjs`, and empirically evaluated in `experiments/cgpa_ablation.py`. |
