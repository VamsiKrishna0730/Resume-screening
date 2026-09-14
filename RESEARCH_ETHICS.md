# PRISM Research Ethics & Responsible AI Guidelines

**Research Project:** *A Fair, Explainable, and Feedback-Adaptive AI Framework for Resume Screening and Candidate Matching*  
**Date:** September 3, 2026  

---

## 1. Core Ethical Principles

### A. Mandatory Human Oversight (Human-in-the-Loop)
> **PRISM is a research decision-support prototype. It does NOT make autonomous hiring decisions.**  
> Final employment, shortlisting, and hiring decisions must always remain under qualified human recruiter oversight. Algorithmic scores and rankings serve exclusively as indicative recommendations.

### B. Prohibition of Protected Attributes in Scoring
> Protected demographic attributes (gender, ethnicity, age, religion, disability, socioeconomic status) are **strictly excluded** from feature vectors and match scoring algorithms. Group tags are utilized solely in audit logs to evaluate population-level parity metrics.

### C. Transparency & Explainability Safeguards
> Candidates and reviewers are provided with transparent feature attributions explaining score components (matched skills, experience thresholds, project relevance, and missing required skills) to prevent black-box decision bias.

### D. Privacy & Data Minimization
> Resume parsing pipelines process text locally. Personal Identifiable Information (PII) such as phone numbers, street addresses, and national identification IDs are excluded from feature vectors. Raw resume data should never be transmitted to unauthorized third-party services.

---

## 2. Research Limitations & Ethical Disclaimers
1. **Dataset Sensitivity:** Fairness metrics (Demographic Parity Difference, Equal Opportunity Difference) are inherently dataset-dependent and do not guarantee complete absence of real-world discrimination.
2. **Synthetic Data Boundaries:** Demonstrations using synthetic data fixtures illustrate framework capabilities but do not constitute empirical proof of real-world hiring fairness.
