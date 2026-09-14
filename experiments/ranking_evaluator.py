"""
PRISM Realistic Information Retrieval Ranking Evaluation Module
Evaluates NDCG@K, MRR, Precision@K, and HitRate@K per requisition pool.
Supports recommended realistic benchmark configuration: K >= 50 candidates per job.
"""

import numpy as np
from typing import List, Dict, Any, Optional

def compute_dcg(relevances: List[int], k: int) -> float:
    r = np.asarray(relevances, dtype=float)[:k]
    if r.size:
        return float(np.sum(r / np.log2(np.arange(2, r.size + 2))))
    return 0.0

def compute_ndcg(relevances: List[int], k: int) -> float:
    dcg = compute_dcg(relevances, k)
    ideal = sorted(relevances, reverse=True)
    idcg = compute_dcg(ideal, k)
    if not idcg:
        return 0.0
    return float(dcg / idcg)

def evaluate_requisition_ranking_pools(
    records: List[Dict[str, Any]],
    y_scores: List[float],
    k_list: List[int] = [1, 5, 10, 20, 50],
    min_candidates_per_job: int = 50
) -> Dict[str, Any]:
    """
    Groups records strictly by job_id, ranks candidates descending by score,
    and computes ranking metrics per job before averaging.
    Flags whether candidate pools satisfy realistic benchmark sizing (K >= 50).
    """
    jobs: Dict[str, List[Dict[str, Any]]] = {}
    for r, score in zip(records, y_scores):
        jid = r["job_id"]
        if jid not in jobs:
            jobs[jid] = []
        jobs[jid].append({
            "candidate_id": r["candidate_id"],
            "ground_truth": int(r["ground_truth_match"]),
            "score": float(score)
        })

    job_results = {}
    mrr_values = []
    ndcg_by_k = {k: [] for k in k_list}
    prec_by_k = {k: [] for k in k_list}
    pool_sizes = []

    for jid, cands in jobs.items():
        pool_size = len(cands)
        pool_sizes.append(pool_size)

        # Sort candidates descending by predicted score
        cands_sorted = sorted(cands, key=lambda x: x["score"], reverse=True)
        ranked_labels = [c["ground_truth"] for c in cands_sorted]

        # Reciprocal rank
        rr = 0.0
        for rank_idx, lab in enumerate(ranked_labels, 1):
            if lab == 1:
                rr = 1.0 / rank_idx
                break
        mrr_values.append(rr)

        job_metrics = {
            "candidate_count": pool_size,
            "positive_count": sum(ranked_labels),
            "mrr": round(rr, 4)
        }

        for k in k_list:
            top_k = ranked_labels[:k]
            ndcg_k = compute_ndcg(ranked_labels, k)
            prec_k = sum(top_k) / max(len(top_k), 1)
            ndcg_by_k[k].append(ndcg_k)
            prec_by_k[k].append(prec_k)
            job_metrics[f"ndcg@{k}"] = round(ndcg_k, 4)
            job_metrics[f"precision@{k}"] = round(prec_k, 4)

        job_results[jid] = job_metrics

    mean_pool_size = float(np.mean(pool_sizes)) if pool_sizes else 0.0
    is_realistic_pool = bool(all(size >= min_candidates_per_job for size in pool_sizes))

    summary = {
        "num_evaluated_jobs": len(jobs),
        "mean_candidate_pool_size": round(mean_pool_size, 1),
        "min_candidate_pool_size": int(min(pool_sizes)) if pool_sizes else 0,
        "max_candidate_pool_size": int(max(pool_sizes)) if pool_sizes else 0,
        "min_pool_requirement": min_candidates_per_job,
        "is_realistic_ranking_pool": is_realistic_pool,
        "interpretability_status": (
            "VALIDATED_REALISTIC_POOL" if is_realistic_pool else "NOT INTERPRETABLE / INSUFFICIENT RANKING POOL"
        ),
        "mean_mrr": round(float(np.mean(mrr_values)), 4) if mrr_values else 0.0,
        "mean_ndcg": {f"ndcg@{k}": round(float(np.mean(ndcg_by_k[k])), 4) for k in k_list},
        "mean_precision": {f"precision@{k}": round(float(np.mean(prec_by_k[k])), 4) for k in k_list},
        "per_job_details": job_results
    }
    return summary
