"""Reference-only API contracts. The browser demo does not import this module."""
from dataclasses import dataclass
from typing import Literal

@dataclass
class Job:
    id: str
    title: str
    description: str
    required_skills: list[str]

@dataclass
class Candidate:
    id: str
    resume_text: str
    location: str | None = None

@dataclass
class RankingFactor:
    name: Literal['lexical', 'semantic', 'skills', 'experience']
    score: float
    contribution: float

@dataclass
class ScreeningResult:
    candidate_id: str
    hybrid_score: float
    confidence: Literal['low', 'medium', 'high']
    factors: list[RankingFactor]
    model_version: str

@dataclass
class FeedbackEvent:
    candidate_id: str
    action: Literal['advance', 'hold', 'reject', 'note']
    reviewer_id: str
    rationale: str
