# PRISM reference backend

This directory is a deliberately non-running FastAPI reference scaffold for the research pipeline represented by the browser demo. The Next.js preview uses deterministic synthetic fixtures; it does not import or execute this Python code.

## Suggested modules
- `app/main.py` — FastAPI routes and health checks
- `app/contracts.py` — typed request/response contracts
- `app/services/preprocessing.py` — text normalization and PII-safe parsing boundary
- `app/services/ranking.py` — TF-IDF + Sentence-BERT hybrid ranker boundary
- `app/services/explanations.py` — SHAP-style contribution boundary
- `app/services/fairness.py` — group parity and calibration metrics
- `app/services/feedback.py` — recruiter overrides and adaptive-learning events
- `app/services/evaluation.py` — reproducible offline evaluation
- `app/services/models.py` — version registry and promotion metadata

Dataset ingestion should preserve provenance, use explicit consent/retention policies, and never use protected attributes as ranking features. Production deployment requires security review, authenticated access, audit logging, bias testing, and human approval gates.

## Example flow
`POST /jobs` → `POST /candidates` → `POST /screenings` → `GET /screenings/{id}/explanations` → `POST /feedback` → `POST /evaluations`.

Install/run commands are intentionally omitted from the runnable v0 app because the ML stack is a research reference, not a configured service.
