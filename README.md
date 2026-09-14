# PRISM Research Console

**Research Title:** *A Fair, Explainable, and Feedback-Adaptive AI Framework for Resume Screening and Candidate Matching*

---

## 1. Abstract
PRISM is an experimental research framework and human-in-the-loop decision-support console for candidate-job matching. It combines lexical keyword processing, domain concept semantic matching, candidate-specific Explainable AI (XAI) feature attributions, dynamic group parity fairness auditing, and recruiter feedback-adaptive model re-ranking.

## 2. Research Motivation & Gaps
Existing automated resume screening tools often suffer from three critical research gaps:
1. **Lack of Transparent Feature Explanations:** Candidates are ranked via black-box scores without candidate-grounded evidence attributions.
2. **Unmonitored Demographic Bias:** Off-the-shelf classifiers can inadvertently amplify historical hiring disparities across demographic cohorts.
3. **Static Models without Human Feedback:** Candidate matching engines fail to adaptively incorporate reviewer feedback and recruiter overrides.

## 3. Core Contributions
- **Central Hybrid Matching Engine:** Dynamic weighted score integration across Lexical (20%), Semantic (30%), Skills (25%), Experience (15%), Education (5%), and Projects (5%).
- **Candidate-Specific XAI Reasoning Layer:** Dynamic calculation of positive match contributions and missing skill gap penalties per candidate.
- **Group Parity & Bias Mitigation Audit:** Real-time computation of Selection Rate, Demographic Parity Difference (DPD), Equal Opportunity Difference (EOD), and threshold calibration.
- **Feedback-Adaptive Model Progression:** Interactive reviewer feedback loops triggering simulated model checkpoint version updates (`v1.3.2` $\rightarrow$ `v1.3.3`).

---

## 4. Architecture

```text
                    PRISM RESEARCH CONSOLE

                         INPUT LAYER
                    ┌──────────────────┐
                    │ Resume Documents │
                    │ Job Descriptions │
                    └────────┬─────────┘
                             ↓
                     PARSING & CLEANING
                             ↓
              ┌──────────────┴──────────────┐
              ↓                             ↓
        Resume Features                Job Features
              └──────────────┬──────────────┘
                             ↓
                   REPRESENTATION LAYER
                             ↓
          ┌──────────────────┼──────────────────┐
          ↓                  ↓                  ↓
      Lexical            Semantic             Skills
      Features           Features            Features
          └──────────────────┼──────────────────┘
                             ↓
                     MATCHING ENGINE
                             ↓
                HYBRID CANDIDATE SCORE
                             ↓
                    RANKING ENGINE
                             ↓
          ┌──────────────────┼──────────────────┐
          ↓                  ↓                  ↓
         XAI              FAIRNESS           FEEDBACK
          ↓                  ↓                  ↓
          └──────────────────┼──────────────────┘
                             ↓
                     HUMAN-IN-THE-LOOP
                             ↓
                    FINAL RECOMMENDATION
```

---

## 5. Quick Start & Execution

### Frontend (Next.js 16)
```bash
npm install
npm run build
npm run dev
```

### Reference Backend (FastAPI Scaffold)
```bash
cd reference_backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 6. Implementation Status Matrix

| Component | Status | Implementation Mechanism |
| --- | --- | --- |
| **Resume Parsing** | **IMPLEMENTED** | Client-side text entity & skill extraction |
| **Job Parsing** | **IMPLEMENTED** | Client-side job spec requirement extraction |
| **Lexical Matching** | **IMPLEMENTED** | Jaccard & keyword term overlap similarity |
| **Semantic Similarity** | **DETERMINISTIC APPROXIMATION** | Concept domain proximity matching |
| **Skill Matching** | **IMPLEMENTED** | Normalized skill overlap & coverage ratio |
| **Experience Matching** | **IMPLEMENTED** | Threshold gap penalty & bonus scoring |
| **Education Matching** | **IMPLEMENTED** | Degree level requirement comparison |
| **Project Matching** | **IMPLEMENTED** | Project relevance & domain alignment |
| **Hybrid Scoring** | **IMPLEMENTED** | Dynamic weighted linear combination |
| **Ranking** | **IMPLEMENTED** | Dynamic array sorting by hybrid score |
| **XAI (Explainable AI)** | **DYNAMICALLY DERIVED** | Candidate-specific feature attribution |
| **Fairness Audit** | **SYNTHETIC AUDIT** | Group selection rate & parity difference |
| **Bias Mitigation** | **SIMULATION** | Threshold calibration adjustment |
| **Recruiter Feedback** | **IMPLEMENTED** | In-memory feedback store & action logging |
| **Adaptive Learning** | **SIMULATION** | Checkpoint version promotion (`v1.3.2` $\rightarrow$ `v1.3.3`) |
| **Experiments** | **SYNTHETIC BENCHMARK** | Dynamic evaluation metrics |
| **Ablation** | **DYNAMIC EVALUATION** | Feature subset removal metric deltas |
| **Human-in-the-Loop** | **IMPLEMENTED** | Recruiter override gates & review required disclaimers |
| **Real Trained ML Model** | **NOT IMPLEMENTED** | System uses deterministic algorithms |
| **Real LLM** | **NOT IMPLEMENTED** | System uses deterministic approximations |

---

## 7. Authentication & Access Control

The PRISM console includes a centralized, role-based authentication layer supporting both deterministic development evaluation and production OAuth/JWT provider extension:

### Key Pages:
- **`/login`**: Modern PRISM-branded sign-in with show/hide password, session persistence toggle, and input validation.
- **`/signup`**: Recruiter and researcher account registration with institutional organization input and password confirmation.
- **`/forgot-password`**: Password recovery request flow. In development mode, requests are recorded non-leakingly without exposing account presence.

### Protected Routes:
Unauthenticated users attempting to access protected research routes (`/dashboard`, `/jobs`, `/candidates`, `/screening`, `/fairness`, `/feedback`, `/experiments`, `/models`, `/settings`) are automatically redirected to `/login?redirectTo=...`. After authentication, users are returned to their destination route.

### Development Authentication Mode:
Default institutional test accounts are pre-seeded in `lib/auth/auth-service.ts`:
- **Admin**: `alex.miller@prism-ai.org` / `Research@2026`
- **Recruiter**: `sarah.chen@talentai.io` / `Recruit@2026`
- **Researcher**: `david.kumar@univ-ai.edu` / `Science@2026`

### Security Standards & Research Data Isolation:
- Passwords are never stored or displayed in plaintext.
- User identity is strictly decoupled from benchmark datasets and experiment seeds; experimental reproduction is 100% deterministic regardless of which researcher is logged in.
- Architecture details: see [`AUTHENTICATION_ARCHITECTURE.md`](file:///c:/projectnew----/AUTHENTICATION_ARCHITECTURE.md).

---

## 8. Ethical Considerations & Research Disclaimer

> **Research Prototype · Synthetic Data · Human-in-the-Loop**  
> This system provides research-oriented recommendations and explanations. It does not make autonomous hiring decisions. Final employment decisions remain under qualified human oversight.
