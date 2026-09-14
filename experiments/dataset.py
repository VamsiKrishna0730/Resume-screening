import json
import csv
from pathlib import Path
from typing import Dict, List, Any, Tuple, Optional
import numpy as np

REQUIRED_FIELDS = [
    "candidate_id",
    "job_id",
    "resume_text",
    "job_description",
    "ground_truth_match"
]

OPTIONAL_FIELDS = [
    "skills",
    "experience",
    "education",
    "projects",
    "recruiter_label",
    "demographic_attribute",
    "cgpa",
    "cgpa_scale"
]

class DatasetValidator:
    @staticmethod
    def validate_record(record: Dict[str, Any], idx: int) -> List[str]:
        errors = []
        for f in REQUIRED_FIELDS:
            if f not in record or record[f] is None:
                errors.append(f"Row {idx}: Missing required field '{f}'")
        
        if "ground_truth_match" in record:
            val = record["ground_truth_match"]
            try:
                int_val = int(val)
                if int_val not in (0, 1):
                    errors.append(f"Row {idx}: 'ground_truth_match' must be 0 or 1, got {val}")
            except (ValueError, TypeError):
                errors.append(f"Row {idx}: 'ground_truth_match' invalid integer: {val}")
        return errors

    @staticmethod
    def generate_quality_report(records: List[Dict[str, Any]]) -> Dict[str, Any]:
        total = len(records)
        unique_cands = len(set(r.get("candidate_id") for r in records if r.get("candidate_id")))
        unique_jobs = len(set(r.get("job_id") for r in records if r.get("job_id")))
        
        labels = [int(r.get("ground_truth_match", 0)) for r in records]
        pos_count = sum(1 for l in labels if l == 1)
        neg_count = sum(1 for l in labels if l == 0)
        
        demo_dist = {}
        for r in records:
            attr = r.get("demographic_attribute") or "NOT AVAILABLE"
            demo_dist[attr] = demo_dist.get(attr, 0) + 1
            
        return {
            "total_samples": total,
            "unique_candidates": unique_cands,
            "unique_jobs": unique_jobs,
            "positive_labels": pos_count,
            "negative_labels": neg_count,
            "class_balance_ratio": round(pos_count / max(total, 1), 4),
            "demographic_distribution": demo_dist,
            "has_candidate_duplicates": unique_cands < total,
            "status": "VALID" if total > 0 and pos_count > 0 and neg_count > 0 else "WARNING"
        }

def load_dataset(file_path: str) -> List[Dict[str, Any]]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found at: {file_path}")
    
    records = []
    if path.suffix == ".jsonl":
        with open(path, "r", encoding="utf-8") as f:
            for i, line in enumerate(f):
                line = line.strip()
                if line:
                    data = json.loads(line)
                    records.append(data)
    elif path.suffix == ".csv":
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rec = dict(row)
                rec["ground_truth_match"] = int(rec["ground_truth_match"])
                if "experience" in rec and rec["experience"]:
                    try:
                        rec["experience"] = float(rec["experience"])
                    except ValueError:
                        pass
                if "skills" in rec and rec["skills"]:
                    rec["skills"] = [s.strip() for s in rec["skills"].split(",") if s.strip()]
                if "cgpa" in rec and rec["cgpa"]:
                    try:
                        rec["cgpa"] = float(rec["cgpa"])
                    except ValueError:
                        pass
                if "cgpa_scale" in rec and rec["cgpa_scale"]:
                    try:
                        rec["cgpa_scale"] = float(rec["cgpa_scale"])
                    except ValueError:
                        pass
                records.append(rec)
    else:
        raise ValueError(f"Unsupported dataset format: {path.suffix}. Expected .jsonl or .csv")

    errors = []
    for idx, r in enumerate(records):
        errs = DatasetValidator.validate_record(r, idx)
        errors.extend(errs)
    
    if errors:
        raise ValueError(f"Dataset validation failed with {len(errors)} errors:\n" + "\n".join(errors[:10]))
        
    return records

def split_dataset(
    records: List[Dict[str, Any]],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_seed: int = 42
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-5, "Ratios must sum to 1.0"
    
    rng = np.random.RandomState(random_seed)
    
    # Candidate-level grouping to prevent leakage
    cand_ids = sorted(list(set(r["candidate_id"] for r in records)))
    rng.shuffle(cand_ids)
    
    n_total = len(cand_ids)
    n_train = int(n_total * train_ratio)
    n_val = int(n_total * val_ratio)
    
    train_cands = set(cand_ids[:n_train])
    val_cands = set(cand_ids[n_train:n_train + n_val])
    test_cands = set(cand_ids[n_train + n_val:])
    
    train_data = [r for r in records if r["candidate_id"] in train_cands]
    val_data = [r for r in records if r["candidate_id"] in val_cands]
    test_data = [r for r in records if r["candidate_id"] in test_cands]
    
    return train_data, val_data, test_data
