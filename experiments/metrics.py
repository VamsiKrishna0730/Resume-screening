import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    accuracy_score,
    roc_auc_score,
    average_precision_score
)

def compute_classification_metrics(y_true: List[int], y_scores: List[float], threshold: float = 0.5) -> Dict[str, float]:
    y_true_arr = np.array(y_true)
    y_scores_arr = np.array(y_scores)
    y_pred = (y_scores_arr >= threshold).astype(int)
    
    acc = float(accuracy_score(y_true_arr, y_pred))
    prec = float(precision_score(y_true_arr, y_pred, zero_division=0))
    rec = float(recall_score(y_true_arr, y_pred, zero_division=0))
    f1 = float(f1_score(y_true_arr, y_pred, zero_division=0))
    
    try:
        if len(set(y_true_arr)) > 1:
            roc_auc = float(roc_auc_score(y_true_arr, y_scores_arr))
            pr_auc = float(average_precision_score(y_true_arr, y_scores_arr))
        else:
            roc_auc = 0.5
            pr_auc = 0.5
    except Exception:
        roc_auc = 0.5
        pr_auc = 0.5
        
    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4)
    }

def compute_dcg_at_k(r: List[int], k: int) -> float:
    r = np.asarray(r, dtype=float)[:k]
    if r.size:
        return float(np.sum(r / np.log2(np.arange(2, r.size + 2))))
    return 0.0

def compute_ndcg_at_k(r: List[int], k: int) -> float:
    dcg_val = compute_dcg_at_k(r, k)
    ideal_r = sorted(r, reverse=True)
    idcg_val = compute_dcg_at_k(ideal_r, k)
    if not idcg_val:
        return 0.0
    return float(dcg_val / idcg_val)

def compute_ranking_metrics_per_job(
    records: List[Dict[str, Any]],
    y_scores: List[float],
    k_list: List[int] = [1, 5, 10, 20]
) -> Dict[str, float]:
    # Group by job_id
    jobs: Dict[str, List[Tuple[int, float]]] = {}
    for r, score in zip(records, y_scores):
        j_id = r["job_id"]
        true_label = int(r["ground_truth_match"])
        if j_id not in jobs:
            jobs[j_id] = []
        jobs[j_id].append((true_label, score))
        
    mrr_list = []
    ndcg_dict = {k: [] for k in k_list}
    prec_dict = {k: [] for k in k_list}
    hit_dict = {k: [] for k in k_list}
    
    for j_id, pairs in jobs.items():
        # Sort by predicted score desc
        pairs_sorted = sorted(pairs, key=lambda x: x[1], reverse=True)
        ranked_labels = [p[0] for p in pairs_sorted]
        
        # MRR
        rr = 0.0
        for rank_idx, lab in enumerate(ranked_labels, 1):
            if lab == 1:
                rr = 1.0 / rank_idx
                break
        mrr_list.append(rr)
        
        for k in k_list:
            top_k_labels = ranked_labels[:k]
            ndcg_dict[k].append(compute_ndcg_at_k(ranked_labels, k))
            prec_dict[k].append(sum(top_k_labels) / max(len(top_k_labels), 1))
            hit_dict[k].append(1.0 if sum(top_k_labels) > 0 else 0.0)
            
    out = {
        "mrr": round(float(np.mean(mrr_list)), 4) if mrr_list else 0.0
    }
    for k in k_list:
        out[f"ndcg@{k}"] = round(float(np.mean(ndcg_dict[k])), 4) if ndcg_dict[k] else 0.0
        out[f"precision@{k}"] = round(float(np.mean(prec_dict[k])), 4) if prec_dict[k] else 0.0
        out[f"hit_rate@{k}"] = round(float(np.mean(hit_dict[k])), 4) if hit_dict[k] else 0.0
        
    return out

def compute_fairness_metrics(
    records: List[Dict[str, Any]],
    y_scores: List[float],
    threshold: float = 0.5,
    group_attr: str = "demographic_attribute"
) -> Dict[str, Any]:
    groups: Dict[str, List[Tuple[int, int]]] = {}
    for r, score in zip(records, y_scores):
        g = r.get(group_attr) or "Unknown"
        y_true = int(r["ground_truth_match"])
        y_pred = 1 if score >= threshold else 0
        if g not in groups:
            groups[g] = []
        groups[g].append((y_true, y_pred))
        
    group_selection_rates = {}
    group_tpr = {}
    
    for g, pairs in groups.items():
        n = len(pairs)
        selected = sum(p[1] for p in pairs)
        group_selection_rates[g] = selected / max(n, 1)
        
        positives = [p for p in pairs if p[0] == 1]
        if positives:
            tpr = sum(p[1] for p in positives) / len(positives)
        else:
            tpr = 0.0
        group_tpr[g] = tpr
        
    rates = list(group_selection_rates.values())
    dpd = float(max(rates) - min(rates)) if rates else 0.0
    dir_ratio = float(min(rates) / max(max(rates), 1e-6)) if rates else 1.0
    
    tprs = list(group_tpr.values())
    eod = float(max(tprs) - min(tprs)) if tprs else 0.0
    
    return {
        "demographic_parity_difference": round(dpd, 4),
        "equal_opportunity_difference": round(eod, 4),
        "disparate_impact_ratio": round(dir_ratio, 4),
        "group_selection_rates": {g: round(v, 4) for g, v in group_selection_rates.items()},
        "group_true_positive_rates": {g: round(v, 4) for g, v in group_tpr.items()}
    }
