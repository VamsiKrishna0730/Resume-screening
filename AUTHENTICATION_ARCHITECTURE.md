# PRISM Authentication Architecture

**Platform Version:** 1.3.2  
**Date:** 03 September 2026  
**Implementation:** Modular Multi-Provider Architecture (Development/Demo Mode + Production Extensible)  

---

## 1. Overview

The PRISM authentication subsystem provides secure, centralized, and role-aware identity management across all research console interfaces (`/dashboard`, `/jobs`, `/candidates`, `/screening`, `/fairness`, `/feedback`, `/experiments`, `/models`, `/settings`).

Importantly, **authentication state is strictly isolated from research datasets and experiment algorithms**. Logging in as different users or switching roles never perturbs deterministic model weights, benchmark seeds, or scientific metrics.

---

## 2. Authentication Provider Architecture

```text
                  AuthProvider (Interface)
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
DevelopmentAuthProvider         ProductionAuthProvider
(Active: Demo & Smoke Testing)  (Target: OAuth 2.0 / NextAuth / Supabase)
  • Browser Session Hydration     • Secure HttpOnly Cookies
  • Seed Institutional Users      • JWT Validation & RS256 Signing
  • Non-leaking Password Reset    • SSO / Institutional SAML
```

### Registered Roles:
- **`ADMIN`**: Full platform management, workspace resets, model registry deployments.
- **`RESEARCHER`**: Benchmark experimentation, metric evaluation, fairness auditing, and ablation runs.
- **`RECRUITER`**: Candidate profile review, resume ingestion, screening weight tuning, and feedback logging.
- **`USER`**: Standard talent pool inquiry and read-only candidate inspection.

---

## 3. Route Protection Flow

Unauthenticated requests to protected pages are intercepted by `AuthProvider` in `lib/auth/auth-context.tsx`:

```text
Unauthenticated Request (e.g., /screening)
            ↓
Detect No Active Session
            ↓
Redirect: /login?redirectTo=%2Fscreening
            ↓
Enter Credentials & Authenticate
            ↓
Session Token Generated & Hydrated
            ↓
Redirect to Original Route (/screening)
```

Public Routes (bypass auth requirement):
- `/login`
- `/signup`
- `/forgot-password`

---

## 4. Default Demonstration Accounts

For local evaluation, smoke testing, and peer review without external database dependencies, the development provider pre-registers three institutional personas:

| Account Name | Email | Password | Role | Institution |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. Alex Miller** | `alex.miller@prism-ai.org` | `Research@2026` | `ADMIN` | PRISM AI Research Consortium |
| **Sarah Chen** | `sarah.chen@talentai.io` | `Recruit@2026` | `RECRUITER` | Global Tech Recruiting |
| **Prof. David Kumar** | `david.kumar@univ-ai.edu` | `Science@2026` | `RESEARCHER` | Institute for Fair AI Systems |

---

## 5. Security & Isolation Standards

1. **Zero Plaintext Password Exposure:** Passwords are never returned in user objects, serialized to client logs, or committed to Git.
2. **Environment Variable Protection:** Production OAuth client secrets remain server-side in `.env.local`.
3. **Research Isolation:** Scientific reproducibility seeds, random splits, and model feature vectors remain invariant to user sessions.
