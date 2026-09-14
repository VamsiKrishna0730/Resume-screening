# PRISM SaaS User Workflow & Journey Guide

This document details the end-to-end user journey across the PRISM AI Recruitment Intelligence platform.

---

## 1. End-to-End User Journey

```text
1. Open Platform (/dashboard)
   └── View hiring KPIs, active job count, qualified candidates, and recent activity logs.

2. Job Management (/jobs)
   └── Create a new job requisition with required skills (e.g. Python, SQL, PyTorch).
   └── Navigate to Job Details (/jobs/[jobId]) or click "Screen pool".

3. Candidate Screening (/screening/[jobId])
   └── Select job requisition.
   └── Adjust matching weight sliders (Lexical, Semantic, Skills, Experience, Education).
   └── Upload a new candidate resume to parse and append to the active pool.
   └── View dynamic candidate rankings with real-time score updates.

4. Candidate AI Analysis (/candidates/[candidateId])
   └── Inspect candidate profile and feature score breakdown.
   └── Trigger "Run Gemini Analysis" to generate strengths and missing skill gaps.
   └── Log recruiter decisions: "Shortlist", "Hold", or "Reject".

5. Recruiter Feedback & Adaptation (/feedback)
   └── Review recruiter feedback history and decision timestamps.
   └── Observe model version progression (v1.3.2 → v1.3.3).

6. Demographic Fairness Audit (/fairness)
   └── Audit Selection Rates, Demographic Parity Differences, and Equal Opportunity Differences.
   └── Simulate threshold bias mitigation.

7. Research Experiment Lab (/experiments)
   └── Review model benchmark accuracy and dynamic ablation study matrix.
   └── Click "Export CSV" or "Export JSON Artifacts" for publication artifacts.
```
