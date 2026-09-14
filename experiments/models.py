import re
from typing import List, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

def clean_tokens(text: str) -> List[str]:
    return re.findall(r"\b[a-zA-Z0-9_+#\.]+\b", text.lower())

class BaselineKeywordMatcher:
    name = "Keyword Matching (Scaled Token Overlap)"
    
    def fit(self, records: List[Dict[str, Any]]):
        pass
        
    def predict_proba(self, records: List[Dict[str, Any]]) -> List[float]:
        scores = []
        for r in records:
            resume_toks = set(clean_tokens(r["resume_text"]))
            job_toks = set(clean_tokens(r["job_description"]))
            if not job_toks:
                scores.append(0.0)
                continue
            common = resume_toks.intersection(job_toks)
            score = len(common) / len(job_toks)
            scores.append(float(min(1.0, score * 1.5)))
        return scores

class BaselineJaccardMatcher:
    name = "Jaccard Similarity"
    
    def fit(self, records: List[Dict[str, Any]]):
        pass
        
    def predict_proba(self, records: List[Dict[str, Any]]) -> List[float]:
        scores = []
        for r in records:
            resume_toks = set(clean_tokens(r["resume_text"]))
            job_toks = set(clean_tokens(r["job_description"]))
            union = resume_toks.union(job_toks)
            if not union:
                scores.append(0.0)
                continue
            score = len(resume_toks.intersection(job_toks)) / len(union)
            scores.append(float(score * 2.5))
        return scores

class BaselineTfidfMatcher:
    name = "TF-IDF Cosine Similarity"
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
        
    def fit(self, records: List[Dict[str, Any]]):
        corpus = [r["resume_text"] + " " + r["job_description"] for r in records]
        if corpus:
            self.vectorizer.fit(corpus)
            
    def predict_proba(self, records: List[Dict[str, Any]]) -> List[float]:
        scores = []
        for r in records:
            res_vec = self.vectorizer.transform([r["resume_text"]])
            job_vec = self.vectorizer.transform([r["job_description"]])
            sim = (res_vec * job_vec.T).toarray()[0, 0]
            scores.append(float(np.clip(sim, 0.0, 1.0)))
        return scores

class SupervisedRanker:
    def __init__(self, model_type: str = "logistic_regression"):
        self.model_type = model_type
        if model_type == "logistic_regression":
            self.model = LogisticRegression(class_weight="balanced")
        else:
            self.model = RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42)
        self.vectorizer = TfidfVectorizer(max_features=50, stop_words='english')

    def _extract_features(self, records: List[Dict[str, Any]], fit: bool = False) -> np.ndarray:
        texts = [r["resume_text"] + " " + r["job_description"] for r in records]
        if fit:
            tfidf_feats = self.vectorizer.fit_transform(texts).toarray()
        else:
            tfidf_feats = self.vectorizer.transform(texts).toarray()
            
        extra = []
        for r in records:
            exp = float(r.get("experience", 2.0)) / 10.0
            num_skills = len(r.get("skills", [])) / 10.0
            extra.append([exp, num_skills])
            
        return np.hstack([tfidf_feats, np.array(extra)])

    def fit(self, records: List[Dict[str, Any]]):
        X = self._extract_features(records, fit=True)
        y = np.array([int(r["ground_truth_match"]) for r in records])
        self.model.fit(X, y)

    def predict_proba(self, records: List[Dict[str, Any]]) -> List[float]:
        X = self._extract_features(records, fit=False)
        probs = self.model.predict_proba(X)[:, 1]
        return [float(p) for p in probs]

class PRISMHybridPipeline:
    name = "PRISM Hybrid Adaptive Framework"
    
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or {
            "lexical": 0.20,
            "semantic": 0.30,
            "skills": 0.25,
            "experience": 0.15,
            "education": 0.10
        }
        self.tfidf = BaselineTfidfMatcher()
        
    def fit(self, records: List[Dict[str, Any]]):
        self.tfidf.fit(records)
        
    def predict_proba(self, records: List[Dict[str, Any]]) -> List[float]:
        tfidf_scores = self.tfidf.predict_proba(records)
        scores = []
        for r, sem_score in zip(records, tfidf_scores):
            # 1. Lexical Jaccard
            res_toks = set(clean_tokens(r["resume_text"]))
            job_toks = set(clean_tokens(r["job_description"]))
            lexical = len(res_toks.intersection(job_toks)) / max(len(job_toks), 1)
            
            # 2. Semantic (TF-IDF Cosine proxy)
            semantic = sem_score
            
            # 3. Skills overlap
            cand_skills = set(s.lower() for s in r.get("skills", []))
            skill_score = 0.5
            if cand_skills:
                matched = [s for s in cand_skills if s in r["job_description"].lower()]
                skill_score = len(matched) / max(len(cand_skills), 1)
                
            # 4. Experience score
            exp = float(r.get("experience", 2.0))
            exp_score = min(1.0, exp / 4.0)
            
            # 5. Education score
            edu = str(r.get("education", "")).lower()
            edu_score = 0.7
            if "phd" in edu or "msc" in edu or "meng" in edu:
                edu_score = 0.95
            elif "btech" in edu or "bsc" in edu:
                edu_score = 0.8
                
            hybrid = (
                self.weights["lexical"] * lexical +
                self.weights["semantic"] * semantic +
                self.weights["skills"] * skill_score +
                self.weights["experience"] * exp_score +
                self.weights["education"] * edu_score
            )
            scores.append(float(np.clip(hybrid, 0.0, 1.0)))
        return scores
