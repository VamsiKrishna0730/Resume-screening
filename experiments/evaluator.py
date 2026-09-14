import time
import copy
from typing import Dict, Any, List
import numpy as np
from experiments.metrics import (
    compute_classification_metrics,
    compute_ranking_metrics_per_job,
    compute_fairness_metrics
)
from experiments.models import (
    BaselineKeywordMatcher,
    BaselineJaccardMatcher,
    BaselineTfidfMatcher,
    SupervisedRanker,
    PRISMHybridPipeline
)

def evaluate_model_pipeline(
    model,
    train_data: List[Dict[str, Any]],
    test_data: List[Dict[str, Any]],
    k_list: List[int] = [1, 5, 10],
    threshold: float = 0.5
) -> Dict[str, Any]:
    # Measure latency
    t0 = time.perf_counter()
    model.fit(train_data)
    train_latency = (time.perf_counter() - t0) * 1000.0
    
    t1 = time.perf_counter()
    y_scores = model.predict_proba(test_data)
    infer_latency = (time.perf_counter() - t1) * 1000.0
    
    y_true = [int(r["ground_truth_match"]) for r in test_data]
    
    cls_metrics = compute_classification_metrics(y_true, y_scores, threshold=threshold)
    rank_metrics = compute_ranking_metrics_per_job(test_data, y_scores, k_list=k_list)
    fair_metrics = compute_fairness_metrics(test_data, y_scores, threshold=threshold)
    
    return {
        "classification": cls_metrics,
        "ranking": rank_metrics,
        "fairness": fair_metrics,
        "latency_ms": {
            "train_latency": round(train_latency, 2),
            "inference_total": round(infer_latency, 2),
            "per_candidate_ms": round(infer_latency / max(len(test_data), 1), 3)
        },
        "y_scores": y_scores
    }

def run_feedback_adaptation_experiment(
    train_data: List[Dict[str, Any]],
    test_data: List[Dict[str, Any]],
    feedback_batch: List[Dict[str, Any]]
) -> Dict[str, Any]:
    # Baseline model
    base_model = SupervisedRanker(model_type="logistic_regression")
    base_model.fit(train_data)
    eval_before = evaluate_model_pipeline(base_model, train_data, test_data)
    
    # Adapted model with feedback data merged
    adapted_model = SupervisedRanker(model_type="logistic_regression")
    adapted_train = train_data + feedback_batch
    adapted_model.fit(adapted_train)
    eval_after = evaluate_model_pipeline(adapted_model, adapted_train, test_data)
    
    return {
        "before_adaptation": eval_before,
        "after_adaptation": eval_after,
        "feedback_samples_added": len(feedback_batch),
        "f1_delta": round(eval_after["classification"]["f1"] - eval_before["classification"]["f1"], 4),
        "ndcg_delta": round(eval_after["ranking"]["ndcg@10"] - eval_before["ranking"]["ndcg@10"], 4)
    }

def run_robustness_perturbation(
    model,
    test_data: List[Dict[str, Any]]
) -> Dict[str, Any]:
    # Baseline
    clean_scores = model.predict_proba(test_data)
    clean_y = [int(r["ground_truth_match"]) for r in test_data]
    clean_f1 = compute_classification_metrics(clean_y, clean_scores)["f1"]
    
    # Perturbation 1: Skill drop (remove 50% skills)
    noisy_data = copy.deepcopy(test_data)
    for r in noisy_data:
        if "skills" in r and r["skills"]:
            r["skills"] = r["skills"][:max(1, len(r["skills"]) // 2)]
            
    noisy_scores = model.predict_proba(noisy_data)
    noisy_f1 = compute_classification_metrics(clean_y, noisy_scores)["f1"]
    
    return {
        "clean_f1": clean_f1,
        "perturbed_skill_drop_f1": noisy_f1,
        "performance_drop": round(clean_f1 - noisy_f1, 4)
    }
