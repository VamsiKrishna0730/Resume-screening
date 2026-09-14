"""
PRISM CGPA-Based Candidate Screening & Ranking Ablation Study
Evaluates:
  Config A: Baseline PRISM Hybrid (lexical, semantic, skills, experience, education)
  Config B: PRISM Hybrid + CGPA Soft Scoring (10% normalized weight, neutral handling for missing CGPA)
  Config C: PRISM Hybrid + CGPA Hard Filtering (threshold cutoff, ineligible flagged)

Metrics computed:
  - Accuracy, Precision, Recall, F1
  - Ranking Metrics: NDCG@5, NDCG@10, MRR
  - Eligibility / Selection Rate
  - Mean Candidate Score
"""

import sys
import json
from pathlib import Path
from typing import List, Dict, Any, Tuple
import numpy as np

# Add repository root to path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from experiments.dataset import load_dataset, split_dataset
from experiments.metrics import compute_classification_metrics
from experiments.ranking_evaluator import evaluate_requisition_ranking_pools
from experiments.models import clean_tokens, BaselineTfidfMatcher

def normalize_cgpa(val: float, scale: float) -> float:
    """Normalizes CGPA to [0.0, 1.0]."""
    if scale <= 0:
        return 0.75
    norm = val / scale
    return max(0.0, min(1.0, norm))

def evaluate_candidate_cgpa(
    cand_cgpa: Any,
    cand_scale: Any,
    req_min: float = 7.0,
    req_scale: float = 10.0,
    mode: str = "SOFT"
) -> Tuple[float, bool]:
    """
    Evaluates candidate CGPA against requirement.
    Returns (cgpa_score, is_eligible).
    """
    if cand_cgpa is None or cand_cgpa == "":
        # Neutral missing value policy
        return (0.75, True if mode == "SOFT" else False)
    
    try:
        val = float(cand_cgpa)
        scale = float(cand_scale) if cand_scale else 10.0
    except (ValueError, TypeError):
        return (0.75, True if mode == "SOFT" else False)
    
    norm_cand = normalize_cgpa(val, scale)
    norm_req = normalize_cgpa(req_min, req_scale)
    
    is_eligible = norm_cand >= norm_req
    
    if is_eligible:
        # Bounded between 0.85 and 1.0 for meeting/exceeding
        ratio = norm_cand / max(norm_req, 0.01)
        score = min(1.0, 0.85 + 0.15 * (norm_cand - norm_req) / max(1.0 - norm_req, 0.01))
    else:
        # Proportional bounded penalty in [0.3, 0.84]
        ratio = norm_cand / max(norm_req, 0.01)
        score = max(0.2, min(0.84, ratio * 0.85))
        
    return (score, is_eligible)

class PRISMCgpaAblationPipeline:
    def __init__(self, mode: str = "NONE", cgpa_weight: float = 0.10, min_cgpa: float = 7.0):
        """
        mode: "NONE" (Base PRISM), "SOFT" (PRISM + CGPA Soft), "HARD" (PRISM + CGPA Hard Cutoff)
        """
        self.mode = mode
        self.cgpa_weight = cgpa_weight if mode != "NONE" else 0.0
        self.min_cgpa = min_cgpa
        self.tfidf = BaselineTfidfMatcher()
        
        # Base weights
        if mode == "NONE":
            self.weights = {
                "lexical": 0.20,
                "semantic": 0.30,
                "skills": 0.25,
                "experience": 0.15,
                "education": 0.10,
                "cgpa": 0.00
            }
        else:
            self.weights = {
                "lexical": 0.18,
                "semantic": 0.27,
                "skills": 0.23,
                "experience": 0.14,
                "education": 0.08,
                "cgpa": 0.10
            }
            
    def fit(self, records: List[Dict[str, Any]]):
        self.tfidf.fit(records)
        
    def predict_records(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        tfidf_scores = self.tfidf.predict_proba(records)
        results = []
        
        for r, sem_score in zip(records, tfidf_scores):
            # 1. Lexical Jaccard
            res_toks = set(clean_tokens(r["resume_text"]))
            job_toks = set(clean_tokens(r["job_description"]))
            lexical = len(res_toks.intersection(job_toks)) / max(len(job_toks), 1)
            
            # 2. Semantic
            semantic = sem_score
            
            # 3. Skills overlap
            cand_skills = set(s.lower() for s in r.get("skills", []))
            skill_score = 0.5
            if cand_skills:
                matched = [s for s in cand_skills if s in r["job_description"].lower()]
                skill_score = len(matched) / max(len(cand_skills), 1)
                
            # 4. Experience score
            exp = float(r.get("experience", 2.0))
            exp_score = min(1.0, exp / 4.0)
            
            # 5. Education score
            edu = str(r.get("education", "")).lower()
            edu_score = 0.7
            if "phd" in edu or "msc" in edu or "meng" in edu:
                edu_score = 0.95
            elif "btech" in edu or "bsc" in edu:
                edu_score = 0.8
                
            # 6. CGPA Score
            cand_cgpa = r.get("cgpa")
            cand_scale = r.get("cgpa_scale", 10.0)
            cgpa_score, is_eligible = evaluate_candidate_cgpa(
                cand_cgpa, cand_scale, req_min=self.min_cgpa, req_scale=10.0, mode=self.mode
            )
            
            w_lex = self.weights["lexical"]
            w_sem = self.weights["semantic"]
            w_ski = self.weights["skills"]
            w_exp = self.weights["experience"]
            w_edu = self.weights["education"]
            w_cgp = self.weights["cgpa"]
            
            hybrid = (
                w_lex * lexical +
                w_sem * semantic +
                w_ski * skill_score +
                w_exp * exp_score +
                w_edu * edu_score +
                w_cgp * cgpa_score
            )
            
            final_score = float(np.clip(hybrid, 0.0, 1.0))
            
            # Hard mode policy: if hard requirement not met, candidate score is capped / flagged ineligible
            if self.mode == "HARD" and not is_eligible:
                final_score = float(min(final_score, 0.35))
                
            results.append({
                "score": final_score,
                "is_eligible": is_eligible if self.mode == "HARD" else True,
                "cgpa_score": cgpa_score,
                "record": r
            })
            
        return results

def run_cgpa_ablation(dataset_path: str):
    print("=" * 70)
    print("PRISM CGPA SCREENING & RANKING ABLATION EXPERIMENT")
    print("=" * 70)
    
    records = load_dataset(dataset_path)
    print(f"Loaded dataset: {dataset_path} ({len(records)} candidate-job pairs)")
    
    # Check CGPA presence
    has_cgpa = sum(1 for r in records if r.get("cgpa") is not None)
    print(f"Candidates with structured CGPA: {has_cgpa}/{len(records)} ({(has_cgpa/len(records)*100):.1f}%)")
    
    train_data, val_data, test_data = split_dataset(records, random_seed=42)
    print(f"Data Split: Train={len(train_data)}, Val={len(val_data)}, Test={len(test_data)}")
    
    configs = [
        ("Config A: Base PRISM (No CGPA)", "NONE"),
        ("Config B: PRISM + CGPA Soft Scoring (10% Weight)", "SOFT"),
        ("Config C: PRISM + CGPA Hard Filter (Threshold 7.0/10)", "HARD")
    ]
    
    y_test_true = [int(r["ground_truth_match"]) for r in test_data]
    results_table = []
    
    for cfg_title, mode in configs:
        model = PRISMCgpaAblationPipeline(mode=mode, cgpa_weight=0.10, min_cgpa=7.0)
        model.fit(train_data)
        preds = model.predict_records(test_data)
        
        y_scores = [p["score"] for p in preds]
        eligibles = sum(1 for p in preds if p["is_eligible"])
        
        # Classification metrics
        cls_metrics = compute_classification_metrics(y_test_true, y_scores, threshold=0.5)
        
        # IR Ranking metrics
        ranking_res = evaluate_requisition_ranking_pools(test_data, y_scores, k_list=[1, 5, 10])
        
        summary = {
            "Configuration": cfg_title,
            "Accuracy": cls_metrics["accuracy"],
            "Precision": cls_metrics["precision"],
            "Recall": cls_metrics["recall"],
            "F1": cls_metrics["f1"],
            "ROC_AUC": cls_metrics["roc_auc"],
            "NDCG@5": ranking_res.get("mean_ndcg@5", 0.0),
            "NDCG@10": ranking_res.get("mean_ndcg@10", 0.0),
            "MRR": ranking_res.get("mrr", 0.0),
            "Eligibility_Rate": round(eligibles / len(preds), 4),
            "Mean_Score": round(float(np.mean(y_scores)), 4)
        }
        results_table.append(summary)
        
    print("\n" + "-" * 105)
    header = f"{'Configuration':<45} | {'Acc':<6} | {'F1':<6} | {'AUC':<6} | {'NDCG@5':<7} | {'MRR':<6} | {'Elig%':<6}"
    print(header)
    print("-" * 105)
    for res in results_table:
        print(f"{res['Configuration']:<45} | {res['Accuracy']:<6.4f} | {res['F1']:<6.4f} | {res['ROC_AUC']:<6.4f} | {res['NDCG@5']:<7.4f} | {res['MRR']:<6.4f} | {res['Eligibility_Rate']*100:<5.1f}%")
    print("-" * 105)
    
    # Save output artifact
    out_dir = Path("experiments") / "results" / "cgpa_ablation"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "cgpa_ablation_results.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results_table, f, indent=2)
    print(f"\nSaved ablation artifact: {out_file}")

if __name__ == "__main__":
    default_dataset = "datasets/sample_benchmark.jsonl"
    path = sys.argv[1] if len(sys.argv) > 1 else default_dataset
    run_cgpa_ablation(path)
