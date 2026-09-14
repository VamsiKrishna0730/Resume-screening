import json
import sys
from pathlib import Path

def verify_all():
    print("=" * 80)
    print("PRISM SCIENTIFIC CONSISTENCY AUDITOR (ALL 8 MODELS + NEAR DUP + RANKING POOLS)")
    print("=" * 80)

    repro_dir = Path("experiments/results/reproduction")
    if not repro_dir.exists():
        print("[FAIL] Missing reproduction artifacts directory:", repro_dir)
        sys.exit(1)

    summary_file = repro_dir / "audit_summary.json"
    if not summary_file.exists():
        print("[FAIL] Missing audit_summary.json")
        sys.exit(1)

    with open(summary_file, "r", encoding="utf-8") as f:
        summary = json.load(f)

    # 1. Verify dataset split
    split = summary.get("split", {})
    assert split.get("train") == 14, f"Train split count mismatch: {split.get('train')}"
    assert split.get("val") == 3, f"Val split count mismatch: {split.get('val')}"
    assert split.get("test") == 3, f"Test split count mismatch: {split.get('test')}"
    print(f"[VERIFIED 1: DATASET SPLIT] Train={split['train']}, Val={split['val']}, Test={split['test']} -> PASS")

    # 2. Verify Near-Duplicate Audit Artifact
    leakage = summary.get("near_duplicate_leakage_audit", {})
    assert leakage.get("exact_duplicates_count") == 0, "Exact duplicates detected!"
    assert leakage.get("near_duplicates_count") == 0, "Near duplicates detected!"
    assert leakage.get("status") == "PASS", f"Near duplicate status: {leakage.get('status')}"
    print(f"[VERIFIED 2: 3-GRAM MINHASH LEAKAGE] Exact={leakage.get('exact_duplicates_count')}, Near={leakage.get('near_duplicates_count')}, Risk={leakage.get('risk_level')} -> PASS")

    # 3. Verify all 8 prediction artifacts
    models = ["keyword", "jaccard", "tfidf", "bm25", "sbert", "logistic_regression", "random_forest", "prism_hybrid"]
    expected_cands = ["C-1007", "C-1011", "C-1015"]
    expected_gt = [1, 1, 0]

    for m in models:
        p_path = repro_dir / f"predictions_{m}.json"
        if not p_path.exists():
            print(f"[FAIL] Missing prediction artifact: {p_path}")
            sys.exit(1)
        with open(p_path, "r", encoding="utf-8") as f:
            preds = json.load(f)

        assert len(preds) == 3, f"{m} count is {len(preds)}, expected 3"
        cands = [p["candidate_id"] for p in preds]
        gts = [p["ground_truth"] for p in preds]
        scores = [p["score"] for p in preds]
        pred_labels = [p["prediction"] for p in preds]

        assert cands == expected_cands, f"{m} candidates mismatch: {cands}"
        assert gts == expected_gt, f"{m} ground truth mismatch: {gts}"

        # Recompute confusion matrix from raw discrete predictions
        tp = sum(1 for pl, gt in zip(pred_labels, gts) if pl == 1 and gt == 1)
        tn = sum(1 for pl, gt in zip(pred_labels, gts) if pl == 0 and gt == 0)
        fp = sum(1 for pl, gt in zip(pred_labels, gts) if pl == 1 and gt == 0)
        fn = sum(1 for pl, gt in zip(pred_labels, gts) if pl == 0 and gt == 1)

        reported_cm = summary["classification_metrics"][m]
        assert reported_cm["TP"] == tp, f"{m} TP mismatch"
        assert reported_cm["TN"] == tn, f"{m} TN mismatch"
        assert reported_cm["FP"] == fp, f"{m} FP mismatch"
        assert reported_cm["FN"] == fn, f"{m} FN mismatch"

        # Recompute Accuracy & F1
        acc = (tp + tn) / (tp + tn + fp + fn)
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0

        assert abs(reported_cm["Accuracy"] - acc) < 1e-4, f"{m} Accuracy mismatch"
        assert abs(reported_cm["F1"] - f1) < 1e-4, f"{m} F1 mismatch"

        print(f"[VERIFIED 3: {m.upper()} ARTIFACT] Pred={pred_labels}, Scores={[round(s, 4) for s in scores]} -> Acc={acc:.4f}, F1={f1:.4f} -> PASS")

    # 4. Verify ranking interpretability caveat
    ranking_status = summary.get("ranking_interpretability")
    assert "NOT INTERPRETABLE" in ranking_status, f"Unexpected ranking status: {ranking_status}"
    print(f"[VERIFIED 4: RANKING INTERPRETABILITY] Status: {ranking_status} -> PASS")

    # 5. Verify statistical power statement
    stat = summary.get("statistical_test", {})
    assert stat.get("statistically_significant") is False, "Statistical significance must be False for N=3"
    assert stat.get("post_hoc_power", {}).get("power_assessment") == "INSUFFICIENT"
    print(f"[VERIFIED 5: STATISTICAL TEST & POWER] Wilcoxon p={stat.get('p_value')}, Post-Hoc Power={stat.get('post_hoc_power', {}).get('estimated_statistical_power')} -> PASS (INSUFFICIENT)")

    print("\n[SUCCESS] ALL REPRODUCIBILITY, ARTIFACT, AND CONSISTENCY CHECKS PASSED CLEANLY.")
    print("=" * 80)

if __name__ == "__main__":
    verify_all()
