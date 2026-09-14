import json
import sys
from pathlib import Path

def run_consistency_audit():
    print("================================================================================")
    print("PRISM MASTER RESEARCH DATA & ARTIFACT CONSISTENCY VERIFICATION")
    print("================================================================================")
    
    repro_dir = Path("experiments/results/reproduction")
    if not repro_dir.exists():
        print("ERROR: Reproduction artifacts directory does not exist.")
        sys.exit(1)
        
    summary_file = repro_dir / "audit_summary.json"
    if not summary_file.exists():
        print("ERROR: audit_summary.json not found.")
        sys.exit(1)
        
    with open(summary_file, "r", encoding="utf-8") as f:
        summary = json.load(f)
        
    models = ["keyword", "jaccard", "tfidf", "logistic_regression", "random_forest", "prism_hybrid"]
    
    # Check dataset split counts
    split = summary.get("split", {})
    assert split.get("train") == 14, f"Expected train=14, got {split.get('train')}"
    assert split.get("val") == 3, f"Expected val=3, got {split.get('val')}"
    assert split.get("test") == 3, f"Expected test=3, got {split.get('test')}"
    print(f"[CHECK 1: SPLIT COUNTS] Train={split['train']}, Val={split['val']}, Test={split['test']} -> PASS")
    
    # Check predictions files
    for m in models:
        p_file = repro_dir / f"predictions_{m}.json"
        assert p_file.exists(), f"Missing prediction file: {p_file}"
        with open(p_file, "r", encoding="utf-8") as f:
            preds = json.load(f)
        assert len(preds) == 3, f"Expected 3 holdout predictions for {m}, got {len(preds)}"
        
        # Check Candidate IDs and Ground Truth
        cands = [p["candidate_id"] for p in preds]
        gts = [p["ground_truth"] for p in preds]
        assert cands == ["C-1007", "C-1011", "C-1015"], f"Unexpected candidates in {m}: {cands}"
        assert gts == [1, 1, 0], f"Unexpected ground truth in {m}: {gts}"
        
        # Verify manual confusion matrix
        pred_labels = [p["prediction"] for p in preds]
        tp = sum(1 for pl, gt in zip(pred_labels, gts) if pl == 1 and gt == 1)
        tn = sum(1 for pl, gt in zip(pred_labels, gts) if pl == 0 and gt == 0)
        fp = sum(1 for pl, gt in zip(pred_labels, gts) if pl == 1 and gt == 0)
        fn = sum(1 for pl, gt in zip(pred_labels, gts) if pl == 0 and gt == 1)
        
        cls_metrics = summary["classification_metrics"][m]
        assert cls_metrics["TP"] == tp, f"TP mismatch in {m}"
        assert cls_metrics["TN"] == tn, f"TN mismatch in {m}"
        assert cls_metrics["FP"] == fp, f"FP mismatch in {m}"
        assert cls_metrics["FN"] == fn, f"FN mismatch in {m}"
        print(f"[CHECK 2: {m.upper()} PREDICTIONS & METRICS] TP={tp}, TN={tn}, FP={fp}, FN={fn} -> PASS")
        
    print("\nALL REPRODUCIBLE ARTIFACT CHECKS PASSED WITH ZERO DISCREPANCIES.")
    print("================================================================================")

if __name__ == "__main__":
    run_consistency_audit()
