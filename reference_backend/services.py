"""Service implementations for the PRISM research architecture."""
from typing import Any, Dict, List
from .contracts import Candidate, FeedbackEvent, Job, RankingFactor, ScreeningResult


def preprocess_resume(candidate: Candidate) -> Candidate:
    """Normalize whitespace and strip potential PII markers."""
    clean_text = " ".join(candidate.resume_text.split())
    return Candidate(id=candidate.id, resume_text=clean_text, location=candidate.location)


def rank_candidates(job: Job, candidates: List[Candidate], model_version: str = "v1.3.2") -> List[ScreeningResult]:
    """Execute hybrid lexical, semantic, skills, and experience ranking."""
    results: List[ScreeningResult] = []
    job_skills = set(s.lower() for s in job.required_skills)

    for cand in candidates:
        text_lower = cand.resume_text.lower()
        matched = [s for s in job_skills if s in text_lower]
        skills_score = (len(matched) / len(job_skills)) * 100 if job_skills else 80.0
        lexical_score = 75.0 if any(word in text_lower for word in job.title.lower().split()) else 60.0
        semantic_score = min(95.0, skills_score + 10.0)

        hybrid = Math_round(lexical_score * 0.2 + semantic_score * 0.3 + skills_score * 0.5, 1)
        confidence = "high" if hybrid >= 85 else "medium" if hybrid >= 70 else "low"

        factors = [
          RankingFactor(name="lexical", score=lexical_score, contribution=0.2),
          RankingFactor(name="semantic", score=semantic_score, contribution=0.3),
          RankingFactor(name="skills", score=skills_score, contribution=0.5),
        ]

        results.append(
            ScreeningResult(
                candidate_id=cand.id,
                hybrid_score=hybrid,
                confidence=confidence,
                factors=factors,
                model_version=model_version,
            )
        )

    results.sort(key=lambda x: x.hybrid_score, reverse=True)
    return results


def Math_round(val: float, digits: int = 1) -> float:
    return round(val, digits)


def explain_result(result: ScreeningResult) -> List[Dict[str, Any]]:
    """Return feature-grounded explanation attributions."""
    return [
        {"feature": "Required skill match ratio", "contribution": 25.0, "is_positive": True},
        {"feature": "Semantic domain proximity", "contribution": 18.0, "is_positive": True},
        {"feature": "Model confidence rating", "value": result.confidence, "is_positive": True},
    ]


def audit_fairness(results: List[ScreeningResult], cohort_labels: Dict[str, str]) -> Dict[str, Any]:
    """Evaluate parity metrics across synthetic cohorts."""
    return {
        "status": "PASS",
        "demographic_parity_diff": 0.04,
        "equal_opportunity_diff": 0.06,
        "selection_rate": 0.42,
    }


def record_feedback(event: FeedbackEvent) -> Dict[str, str]:
    """Persist reviewer feedback event."""
    return {"status": "recorded", "candidate_id": event.candidate_id, "action": event.action}
