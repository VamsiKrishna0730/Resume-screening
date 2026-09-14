"""
Pretrained Transformer Semantic Baseline Module
Encodes candidate resumes and job specifications using sentence-transformers (e.g. all-MiniLM-L6-v2).
"""

from typing import List, Dict, Any
import numpy as np

class PretrainedTransformerMatcher:
    name = "Sentence-BERT (all-MiniLM-L6-v2)"

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self._load_error = None
        self.is_available = False
        self._init_model()

    def _init_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name)
            self.is_available = True
        except Exception as e:
            self.is_available = False
            self._load_error = str(e)

    def fit(self, records: List[Dict[str, Any]]):
        # Pretrained encoder does not require parameter fine-tuning on unsupervised pairs
        pass

    def predict_proba(self, records: List[Dict[str, Any]]) -> List[float]:
        if not self.is_available or self.model is None:
            raise RuntimeError(f"SBERT model {self.model_name} is not available: {self._load_error}")

        resumes = [r["resume_text"] for r in records]
        jobs = [r["job_description"] for r in records]

        # Batch encode
        resume_embs = self.model.encode(resumes, convert_to_numpy=True, normalize_embeddings=True)
        job_embs = self.model.encode(jobs, convert_to_numpy=True, normalize_embeddings=True)

        # Dot product of normalized vectors = Cosine Similarity in [-1.0, 1.0]
        # Rescale [-1.0, 1.0] -> [0.0, 1.0] via (cos + 1.0) / 2.0 or clip positive
        sims = np.sum(resume_embs * job_embs, axis=1)
        # Cosine similarity for semantic textual similarity is typically in [0.0, 1.0] for non-orthogonal text
        scores = [float(round(np.clip(float(s), 0.0, 1.0), 4)) for s in sims]
        return scores
