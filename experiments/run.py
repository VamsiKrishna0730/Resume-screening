import argparse
import json
import yaml
from pathlib import Path
from datetime import datetime
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from experiments.dataset import load_dataset, split_dataset, DatasetValidator
from experiments.models import (
    BaselineKeywordMatcher,
    BaselineJaccardMatcher,
    BaselineTfidfMatcher,
    SupervisedRanker,
    PRISMHybridPipeline
)
from experiments.evaluator import evaluate_model_pipeline, run_feedback_adaptation_experiment, run_robustness_perturbation
from experiments.statistical import paired_bootstrap_ci
from experiments.tables import generate_markdown_table, generate_latex_table

def run_experiment(config_path: str):
    with open(config_path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
        
    print(f"=== Running Experiment: {cfg.get('name', 'PRISM Run')} ===")
    
    # 1. Load & Validate Dataset
    dataset_path = cfg["dataset"]
    records = load_dataset(dataset_path)
    quality = DatasetValidator.generate_quality_report(records)
    print(f"Loaded {quality['total_samples']} records. Status: {quality['status']}")
    
    # 2. Split
    seed = cfg.get("random_seed", 42)
    train_data, val_data, test_data = split_dataset(records, random_seed=seed)
    print(f"Split: Train={len(train_data)}, Val={len(val_data)}, Test={len(test_data)}")
    
    # Output directory
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    exp_id = f"EXP-{timestamp}"
    out_dir = Path("experiments") / "results" / exp_id
    out_dir.mkdir(parents=True, exist_ok=True)
    
    results_summary = {}
    
    # Check experiment type
    if "models" in cfg:
        # Baseline comparison
        model_results = []
        table_rows = []
        prism_scores = None
        keyword_scores = None
        
        for m_name in cfg["models"]:
            if m_name == "keyword":
                m = BaselineKeywordMatcher()
            elif m_name == "jaccard":
                m = BaselineJaccardMatcher()
            elif m_name == "tfidf":
                m = BaselineTfidfMatcher()
            elif m_name == "logistic_regression":
                m = SupervisedRanker("logistic_regression")
            elif m_name == "random_forest":
                m = SupervisedRanker("random_forest")
            elif m_name == "prism_hybrid":
                m = PRISMHybridPipeline()
            else:
                continue
                
            res = evaluate_model_pipeline(m, train_data, test_data, k_list=cfg.get("k_list", [1, 5, 10]))
            model_results.append({
                "model": m_name,
                "metrics": res
            })
            
            if m_name == "prism_hybrid":
                prism_scores = res["y_scores"]
            elif m_name == "keyword":
                keyword_scores = res["y_scores"]
                
            table_rows.append([
                m_name,
                res["classification"]["accuracy"],
                res["classification"]["precision"],
                res["classification"]["recall"],
                res["classification"]["f1"],
                res["ranking"]["ndcg@10"],
                res["ranking"]["mrr"],
                res["fairness"]["demographic_parity_difference"],
                res["fairness"]["equal_opportunity_difference"],
                res["latency_ms"]["inference_total"]
            ])
            
        headers = ["Model", "Accuracy", "Precision", "Recall", "F1", "NDCG@10", "MRR", "DPD", "EOD", "Latency(ms)"]
        md_table = generate_markdown_table(headers, table_rows)
        latex_table = generate_latex_table(headers, table_rows, "Model Performance Comparison", "tab:model_comparison")
        
        # Statistical test if both exist
        stat_sig = None
        if prism_scores and keyword_scores:
            stat_sig = paired_bootstrap_ci(prism_scores, keyword_scores, seed=seed)
            print(f"Statistical validation (PRISM vs Keyword): {stat_sig}")
            
        results_summary = {
            "experiment_id": exp_id,
            "type": "baseline_comparison",
            "models": model_results,
            "statistical_test": stat_sig
        }
        
        with open(out_dir / "table.md", "w", encoding="utf-8") as f:
            f.write(md_table)
        with open(out_dir / "table.tex", "w", encoding="utf-8") as f:
            f.write(latex_table)
            
        print("\n" + md_table + "\n")
        
    elif "configurations" in cfg:
        # Ablation study
        ablation_rows = []
        for c in cfg["configurations"]:
            m = PRISMHybridPipeline(weights=c["weights"])
            res = evaluate_model_pipeline(m, train_data, test_data, k_list=cfg.get("k_list", [1, 5, 10]))
            ablation_rows.append([
                c["name"],
                res["classification"]["accuracy"],
                res["classification"]["f1"],
                res["ranking"]["ndcg@10"],
                res["ranking"]["mrr"],
                res["fairness"]["demographic_parity_difference"],
                res["fairness"]["equal_opportunity_difference"]
            ])
            
        headers = ["Configuration", "Accuracy", "F1", "NDCG@10", "MRR", "DPD", "EOD"]
        md_table = generate_markdown_table(headers, ablation_rows)
        with open(out_dir / "ablation_table.md", "w", encoding="utf-8") as f:
            f.write(md_table)
        print("\n" + md_table + "\n")
        results_summary = {"experiment_id": exp_id, "type": "ablation_study", "rows": ablation_rows}
        
    # Save config and summary JSON
    with open(out_dir / "config.json", "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)
    with open(out_dir / "results.json", "w", encoding="utf-8") as f:
        json.dump(results_summary, f, indent=2)
        
    print(f"Results cleanly persisted to: {out_dir}")

def main():
    parser = argparse.ArgumentParser(description="PRISM Research Experiment Runner")
    parser.add_argument("--config", type=str, required=True, help="Path to experiment YAML config")
    args = parser.parse_args()
    run_experiment(args.config)

if __name__ == "__main__":
    main()
