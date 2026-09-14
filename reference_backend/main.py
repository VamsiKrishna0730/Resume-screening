"""Executable API entry point for the PRISM research architecture."""
from typing import Any, Dict, List
from .contracts import Candidate, FeedbackEvent, Job, ScreeningResult
from .services import audit_fairness, explain_result, rank_candidates, record_feedback

try:
    from fastapi import FastAPI
except ImportError:
    FastAPI = None  # type: ignore

app = FastAPI(title="PRISM Reference Backend") if FastAPI else None

REFERENCE_CONTRACTS = {
    "POST /api/resumes/upload": "parse and normalize a resume",
    "POST /api/jobs": "create a job specification",
    "POST /api/screen": "run hybrid matching and ranking",
    "GET /api/candidates": "list candidate records",
    "GET /api/candidates/{id}/explanation": "return feature-grounded explanation",
    "GET /api/candidates/{id}/fairness": "return synthetic audit context",
    "POST /api/feedback": "record recruiter feedback",
    "GET /api/evaluation": "return evaluation metrics",
    "GET /api/model/version": "return model metadata",
    "POST /api/model/retrain": "queue an adaptive-learning run",
}

if app:
    @app.get("/health")
    def health() -> Dict[str, str]:
        return {"status": "healthy", "connected": "true", "version": "v1.3.2"}

    @app.get("/api/contracts")
    def contracts() -> Dict[str, Any]:
        return REFERENCE_CONTRACTS

    @app.post("/api/screen")
    def screen(job: Job, candidates: List[Candidate]) -> List[ScreeningResult]:
        return rank_candidates(job, candidates)
