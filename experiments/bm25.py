"""
BM25 Information Retrieval Baseline Module
Standard Robertson-Spärck Jones / Lucene-compatible BM25Okapi implementation.
"""

import re
import math
from typing import List, Dict, Any

def clean_tokens(text: str) -> List[str]:
    return re.findall(r"\b[a-zA-Z0-9_+#\.]+\b", text.lower())

class BaselineBM25Matcher:
    name = "BM25 (Okapi)"

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus_size = 0
        self.avgdl = 0.0
        self.idf: Dict[str, float] = {}

    def fit(self, records: List[Dict[str, Any]]):
        corpus = [r["resume_text"] for r in records]
        self.corpus_size = len(corpus)
        if self.corpus_size == 0:
            return

        tokenized_corpus = [clean_tokens(doc) for doc in corpus]
        doc_lens = [len(doc) for doc in tokenized_corpus]
        self.avgdl = sum(doc_lens) / max(self.corpus_size, 1)

        df = {}
        for doc in tokenized_corpus:
            unique_terms = set(doc)
            for term in unique_terms:
                df[term] = df.get(term, 0) + 1

        for term, freq in df.items():
            self.idf[term] = math.log(1.0 + (self.corpus_size - freq + 0.5) / (freq + 0.5))

    def predict_proba(self, records: List[Dict[str, Any]]) -> List[float]:
        raw_scores = []
        for r in records:
            query_toks = clean_tokens(r["job_description"])
            doc_toks = clean_tokens(r["resume_text"])
            doc_len = len(doc_toks)

            tf = {}
            for t in doc_toks:
                tf[t] = tf.get(t, 0) + 1

            score = 0.0
            for term in query_toks:
                if term not in tf:
                    continue
                term_freq = tf[term]
                idf_val = self.idf.get(term, 0.5)
                numerator = term_freq * (self.k1 + 1.0)
                denominator = term_freq + self.k1 * (1.0 - self.b + self.b * (doc_len / max(self.avgdl, 1e-6)))
                score += idf_val * (numerator / denominator)
            raw_scores.append(score)

        norm_scores = []
        for s in raw_scores:
            if s <= 0.0:
                norm_scores.append(0.0)
            else:
                norm = s / (s + 10.0)
                norm_scores.append(float(round(norm, 4)))
        return norm_scores
