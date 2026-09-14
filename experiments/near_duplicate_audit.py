"""
PRISM Near-Duplicate Text Leakage Detection Module
Implements 3-gram character/word shingling, MinHash signatures, and Jaccard similarity audit.
"""

import re
import hashlib
from typing import List, Dict, Any, Set, Tuple

def get_3gram_word_shingles(text: str) -> Set[str]:
    clean = re.sub(r"\s+", " ", text.lower().strip())
    words = [w for w in re.findall(r"\b[a-zA-Z0-9_+#\.]+\b", clean) if w]
    if len(words) < 3:
        return {" ".join(words)} if words else set()
    return {" ".join(words[i:i+3]) for i in range(len(words) - 2)}

def compute_minhash_signature(shingles: Set[str], num_perm: int = 64) -> List[int]:
    if not shingles:
        return [0] * num_perm
    sig = []
    for i in range(num_perm):
        min_val = float("inf")
        for shingle in shingles:
            h = int(hashlib.md5(f"{i}_{shingle}".encode("utf-8")).hexdigest(), 16)
            if h < min_val:
                min_val = h
        sig.append(min_val)
    return sig

def compute_jaccard_similarity(set_a: Set[str], set_b: Set[str]) -> float:
    if not set_a or not set_b:
        return 0.0
    return len(set_a.intersection(set_b)) / len(set_a.union(set_b))

def audit_partition_near_duplicates(
    train_records: List[Dict[str, Any]],
    val_records: List[Dict[str, Any]],
    test_records: List[Dict[str, Any]],
    similarity_threshold: float = 0.70
) -> Dict[str, Any]:
    """
    Checks exact duplicates and 3-gram MinHash/Jaccard near-duplicates across partitions.
    """
    partitions = {
        "train": train_records,
        "val": val_records,
        "test": test_records
    }

    # Precompute shingles
    shingles_by_part: Dict[str, List[Tuple[str, str, Set[str]]]] = {}
    for part_name, recs in partitions.items():
        shingles_by_part[part_name] = []
        for r in recs:
            cid = r["candidate_id"]
            text = r["resume_text"]
            sh = get_3gram_word_shingles(text)
            shingles_by_part[part_name].append((cid, text, sh))

    exact_duplicates = []
    near_duplicates = []

    pairs_to_check = [("train", "val"), ("train", "test"), ("val", "test")]

    for part_a, part_b in pairs_to_check:
        list_a = shingles_by_part[part_a]
        list_b = shingles_by_part[part_b]

        for cid_a, text_a, sh_a in list_a:
            for cid_b, text_b, sh_b in list_b:
                # 1. Exact check
                if text_a.strip().lower() == text_b.strip().lower():
                    exact_duplicates.append({
                        "partition_a": part_a,
                        "candidate_a": cid_a,
                        "partition_b": part_b,
                        "candidate_b": cid_b,
                        "similarity": 1.0,
                        "type": "EXACT"
                    })
                    continue

                # 2. Near duplicate check via Jaccard on 3-gram shingles
                jacc = compute_jaccard_similarity(sh_a, sh_b)
                if jacc >= similarity_threshold:
                    near_duplicates.append({
                        "partition_a": part_a,
                        "candidate_a": cid_a,
                        "partition_b": part_b,
                        "candidate_b": cid_b,
                        "similarity": round(jacc, 4),
                        "type": "NEAR_DUPLICATE"
                    })

    risk_level = "LOW"
    if exact_duplicates:
        risk_level = "CRITICAL"
    elif near_duplicates:
        risk_level = "HIGH"

    return {
        "exact_duplicates_count": len(exact_duplicates),
        "near_duplicates_count": len(near_duplicates),
        "similarity_threshold": similarity_threshold,
        "exact_duplicates": exact_duplicates,
        "near_duplicates": near_duplicates,
        "risk_level": risk_level,
        "status": "PASS" if len(exact_duplicates) == 0 and len(near_duplicates) == 0 else "FLAGGED"
    }
