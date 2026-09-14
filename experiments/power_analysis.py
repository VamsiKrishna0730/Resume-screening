"""
PRISM Statistical Power & Sample Size Analysis Module
Computes required sample size from effect size, alpha, and power.
Also computes post-hoc statistical power and paired comparisons.
"""

import math
from typing import Dict, Any, Optional
import numpy as np
from scipy import stats

def calculate_required_sample_size(
    expected_effect_size: float = 0.30,
    alpha: float = 0.05,
    desired_power: float = 0.80,
    alternative: str = "two-sided"
) -> Dict[str, Any]:
    """
    Computes required sample size for paired two-sided comparison
    using normal approximation with continuity correction.
    """
    if expected_effect_size <= 0:
        raise ValueError("Expected effect size must be > 0")

    # Critical values
    if alternative == "two-sided":
        z_alpha = stats.norm.ppf(1.0 - alpha / 2.0)
    else:
        z_alpha = stats.norm.ppf(1.0 - alpha)

    z_beta = stats.norm.ppf(desired_power)

    # Standard formula for Cohen's d paired comparison: N = ((z_alpha + z_beta) / d)^2
    n_continuous = ((z_alpha + z_beta) / expected_effect_size) ** 2
    n_required = math.ceil(n_continuous)

    return {
        "expected_effect_size": expected_effect_size,
        "alpha": alpha,
        "desired_power": desired_power,
        "alternative": alternative,
        "required_sample_size": n_required,
        "mathematical_formula": "N = ceil(((z_{1-alpha/2} + z_{power}) / effect_size)^2)",
        "scientific_interpretation": (
            f"To detect a mean effect size of d={expected_effect_size} with alpha={alpha} "
            f"and power={desired_power * 100:.0f}%, an evaluation cohort of at least N={n_required} "
            f"independent holdout observations is required."
        )
    }

def compute_post_hoc_power(
    observed_diffs: np.ndarray,
    alpha: float = 0.05
) -> Dict[str, Any]:
    n = len(observed_diffs)
    if n < 2:
        return {
            "sample_size": n,
            "post_hoc_power": 0.05,
            "interpretation": "Insufficient observations (N < 2) to compute empirical variance or power."
        }

    mean_d = float(np.mean(observed_diffs))
    std_d = float(np.std(observed_diffs, ddof=1))

    if std_d == 0.0:
        cohen_d = 0.0
    else:
        cohen_d = mean_d / std_d

    # Calculate achieved power given N and observed Cohen's d
    z_alpha = stats.norm.ppf(1.0 - alpha / 2.0)
    # delta = cohen_d * sqrt(N)
    delta = cohen_d * math.sqrt(n)
    power = float(1.0 - stats.norm.cdf(z_alpha - abs(delta)))

    return {
        "sample_size": n,
        "observed_mean_diff": round(mean_d, 4),
        "observed_std_diff": round(std_d, 4),
        "observed_cohens_d": round(cohen_d, 4),
        "estimated_statistical_power": round(power, 4),
        "power_assessment": "SUFFICIENT" if power >= 0.80 else "INSUFFICIENT"
    }
