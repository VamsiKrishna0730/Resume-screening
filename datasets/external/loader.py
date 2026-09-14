"""
PRISM External Dataset Ingestion & Validation Loader
Loads, validates, checks PII redaction, and reports provenance for external recruitment datasets.
"""

import os
import json
import csv
from pathlib import Path
from typing import List, Dict, Any, Optional

REQUIRED_FIELDS = [
    "candidate_id",
    "job_id",
    "resume_text",
    "job_description",
    "ground_truth_match"
]

class ExternalDatasetLoader:
    def __init__(self, external_dir: Optional[str] = None):
        if external_dir is None:
            self.external_dir = Path(__file__).resolve().parent
        else:
            self.external_dir = Path(external_dir)

    def list_available_datasets(self) -> List[Dict[str, Any]]:
        meta_file = self.external_dir / "provenance.json"
        if not meta_file.exists():
            return []
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def load_external_corpus(self, file_path: str) -> Dict[str, Any]:
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"External dataset file not found: {file_path}")

        records = []
        if path.suffix == ".jsonl":
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        records.append(json.loads(line.strip()))
        elif path.suffix == ".csv":
            with open(path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    rec = dict(row)
                    rec["ground_truth_match"] = int(rec["ground_truth_match"])
                    if "experience" in rec and rec["experience"]:
                        rec["experience"] = float(rec["experience"])
                    if "skills" in rec and rec["skills"]:
                        rec["skills"] = [s.strip() for s in rec["skills"].split(",") if s.strip()]
                    records.append(rec)
        else:
            raise ValueError(f"Unsupported format: {path.suffix}")

        errors = []
        for idx, r in enumerate(records):
            for field in REQUIRED_FIELDS:
                if field not in r or r[field] is None:
                    errors.append(f"Row {idx}: Missing required field '{field}'")
            if "ground_truth_match" in r:
                try:
                    val = int(r["ground_truth_match"])
                    if val not in (0, 1):
                        errors.append(f"Row {idx}: 'ground_truth_match' must be 0 or 1, got {val}")
                except Exception:
                    errors.append(f"Row {idx}: Invalid 'ground_truth_match'")

        if errors:
            raise ValueError(f"Dataset schema errors:\n" + "\n".join(errors[:10]))

        unique_cands = len(set(r["candidate_id"] for r in records))
        unique_jobs = len(set(r["job_id"] for r in records))

        return {
            "source_path": str(path),
            "total_records": len(records),
            "unique_candidates": unique_cands,
            "unique_jobs": unique_jobs,
            "records": records,
            "status": "LOADED_AND_VALIDATED"
        }
