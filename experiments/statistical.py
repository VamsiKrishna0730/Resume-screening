import numpy as np
from typing import List, Dict, Any, Tuple
from scipy import stats

def paired_bootstrap_ci(
    scores_a: List[float],
    scores_b: List[float],
    n_bootstraps: int = 1000,
    confidence_level: float = 0.95,
    seed: int = 42
) -> Dict[str, Any]:
    rng = np.random.RandomState(seed)
    diffs = np.array(scores_a) - np.array(scores_b)
    n = len(diffs)
    if n == 0:
        return {"mean_diff": 0.0, "ci_lower": 0.0, "ci_upper": 0.0, "significant": False}
        
    boot_means = []
    for _ in range(n_bootstraps):
        sample = rng.choice(diffs, size=n, replace=True)
        boot_means.append(np.mean(sample))
        
    alpha = (1.0 - confidence_level) / 2.0
    lower = float(np.percentile(boot_means, alpha * 100))
    upper = float(np.percentile(boot_means, (1.0 - alpha) * 100))
    mean_diff = float(np.mean(diffs))
    
    # Significant if 0 is not in the CI
    sig = (lower > 0 and upper > 0) or (lower < 0 and upper < 0)
    
    # Wilcoxon signed-rank test
    try:
        w_stat, p_val = stats.wilcoxon(scores_a, scores_b)
        p_val = float(p_val)
    except Exception:
        p_val = 1.0
        
    return {
        "mean_diff": round(mean_diff, 4),
        "ci_lower": round(lower, 4),
        "ci_upper": round(upper, 4),
        "p_value": round(p_val, 4),
        "statistically_significant": sig and p_val < 0.05
    }
