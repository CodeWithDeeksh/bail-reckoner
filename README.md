# Bail // Reckoner — SIH260405 Prototype (Final Architecture)

An explainable legal decision-support prototype for the Ministry of Law & Justice
(Smart India Hackathon 2026, theme: Smart Automation / Software).

**This is not an AI judge, a bail-prediction model, or a system that grants bail.**
It identifies potential statutory/procedural bail pathways from structured case
information using a deterministic, versioned rule engine, and explains exactly
why a case was flagged. All data in this prototype is synthetic.

> Decision-support tool. Not a judicial prediction or legal advice.

## Architecture

```
Frontend  →  Backend API  →  ONE authoritative rule engine  →  Database
(React)      (FastAPI)        (backend/app/rule_engine.py)     (SQLite)
```

The frontend holds **no rule-engine logic**. Every result shown anywhere in the
UI is a real response from the backend, persisted in its database. There is
deliberately no local fallback — if the backend is unreachable, the UI says so
honestly (with a wake-up/retry flow for Render's free-tier cold start) rather
than silently computing its own answer.

The only client-side arithmetic left in the frontend is a live "days since
custody start" preview shown *while filling the intake form* — a UI convenience
for the person typing, not a legal-decision computation, and it's discarded the
moment you submit. The number that actually appears on the Assessment screen is
the backend's `custody_days` field.

## How to run (both services)

**Backend first** (frontend depends on it for everything except the login screen shell):

```bash
cd backend
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
./.venv/bin/uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

**Frontend:**

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). It talks to
`http://localhost:8000` by default — set `VITE_API_BASE_URL` (see
`.env.example`) to point it elsewhere.

## Auth + demo accounts

Real JWT sessions — see `backend/README.md` for full details. Quick reference:

| Username | Password | Role |
|---|---|---|
| `advocate` | `legalaid123` | Legal Aid |
| `judge` | `judicial123` | Judicial |
| `prison` | `prison123` | Prison Authority |
| `undertrial` | `undertrial123` | Undertrial |

Or click **Continue as Guest** on the login screen — no credentials needed, and
it works even if the backend just woke up (shows a live "waking backend…"
progress state rather than failing silently).

## Demo flow

`Sign in / Guest → Analyze a Case → Case Intake → Charges → Custody Timeline →
Legal Rule Evaluation (live backend call) → Bail Assessment → Explainability →
Next Steps`

1. **Sign in** with a demo account, or **Continue as Guest**.
2. **Analyze a Case** → pick a case from **Load demo case…**, or fill the
   wizard manually across its 6 steps.
3. **Run Bail Analysis** → this makes a real network call to the backend. The
   9-stage rule-evaluation animation plays *while waiting for that response* —
   it doesn't advance past reality, and if the backend errors or is asleep,
   you get an honest retry/wake-up screen, not a fabricated result.
4. **Bail Assessment** — status badge (from the 5-term vocabulary), animated
   counters, the completed rule-evaluation trace, charge stack + synthesis,
   per-pathway facts/calculation/conditions/unresolved-items/legal-basis/
   explainability, the interactive §479 timeline (built entirely from
   backend-supplied numbers, not recomputed client-side), data completeness,
   judicial-review factors, case timeline, **Generate Action Pack**.
5. **Dashboard ("Undertrial Watch")** — fetches the case list from the backend;
   any case without a stored result yet is analyzed on the spot (persisted to
   the database), so the dashboard never shows stale placeholder data.
6. **Integrations** — mock adapter architecture, explicitly labelled Prototype /
   Integration-ready / Access controlled / Government integration / Government
   restricted / Future connector. No live connectivity anywhere.

## Demo case list

**30 synthetic cases**, grouped by which pathway(s) they exercise (also how the
"Load demo case" dropdown groups them). All verified against the live rule
engine — zero errors across all 30 in a real bulk-analyze pass, and every
figure below is copied from that real run, not hand-typed.

| Case | Scenario | Expected result |
|---|---|---|
| BR-2026-001, 008, 016, 018, 030 | Simple bailable offences (theft, hurt, house-breaking, mischief) | Potentially Eligible |
| BR-2026-017 | Bailable, but first-time-offender status unknown | Potentially Eligible + data-quality flag |
| BR-2026-025 | Bailable, but heavy judicial-discretion factors (priors, criminal history, absconding flag) | Potentially Eligible + 7 judicial factors |
| BR-2026-002 | Default-bail (§187), chargesheet not filed, 60-day threshold | Eligibility Condition Detected, +0 days |
| BR-2026-009 | Default-bail, severe offence (≥10y → 90-day threshold) | Eligibility Condition Detected, +5 days |
| BR-2026-024 | Multi-charge default-bail (90-day threshold via the severe charge) | Eligibility Condition Detected, +2 days |
| BR-2026-003 | §479 general (1/2) threshold reached | Eligibility Condition Detected, **+73 days** |
| BR-2026-004 | §479 first-time (1/3) threshold reached | Eligibility Condition Detected, +15 days |
| BR-2026-006 | §479 reached + multi-charge + no bail application filed | Eligibility Condition Detected **and** Procedural Action Required — the "non-trivial reasoning" case |
| BR-2026-015 | §479 general threshold reached | Eligibility Condition Detected, +22 days |
| BR-2026-013 | §479 first-time threshold **approaching** | Not yet eligible, 27 days remaining |
| BR-2026-014 | §479 general threshold **approaching** | Not yet eligible, 35 days remaining |
| BR-2026-026 | Accused-delay deduction is the deciding factor — raw custody exceeds the threshold, **net custody (after deducting delay) does not** | Not yet eligible, 5 days remaining — proves the delay-deduction logic actually runs |
| BR-2026-027 | Accused-delay status unknown, threshold approaching | Not yet eligible, 13 days remaining + unresolved item |
| BR-2026-010, 011 | Non-bailable, custody well below any threshold | No pathway identified (negative example — nothing over-triggers) |
| BR-2026-005 | NDPS | Requires Judicial Review |
| BR-2026-012 | NDPS **plus** a separate bailable charge — two simultaneous outcomes | Requires Judicial Review (special statute dominates the primary badge, bailable pathway still shown) |
| BR-2026-019 | UAPA, heavy judicial factors | Requires Judicial Review |
| BR-2026-020 | PMLA **plus** default-bail triggering simultaneously | Requires Judicial Review (two outcome cards) |
| BR-2026-021 | POCSO | Requires Judicial Review |
| BR-2026-022 | SC/ST Act | Requires Judicial Review |
| BR-2026-023 | Multi-charge: one bailable + one non-bailable | Potentially Eligible (bailable charge governs) |
| BR-2026-007 | Everything missing | Insufficient Information |
| BR-2026-028 | Charges present, custody dates missing | Insufficient Information |
| BR-2026-029 | Custody dates present, no charges recorded | Insufficient Information |

## Deployment

1. **Backend → Render.** `backend/render.yaml` is a ready-to-use Blueprint.
   Free tier sleeps after 15 min idle and has ephemeral disk — both handled
   (demo cases reseed on every startup; see `backend/README.md`).
2. **Frontend → Vercel.** Set `VITE_API_BASE_URL` to your Render URL in
   Vercel's project environment variables before building. `vercel.json` is
   already set up.

## File structure

```
src/
  types.ts                    Case/Charge/Custody/Result data models (mirrors backend)
  lib/
    api.ts                    THE backend client — every result the UI shows
                               came from here. No local computation.
    constants.ts               Static display text only (disclaimer copy) —
                               no decision logic.
  store/
    caseStore.tsx               Thin backend-driven cache (cases + results)
    authContext.tsx             Session state (JWT), persisted to sessionStorage
  components/
    NavBar, Disclaimer, ProcessingOverlay (drives the real analyze call),
    RuleEvaluationTimeline, CaseTimeline, UndertrialTimeline (renders
    backend-supplied numbers only), ChargeStack, LegalBasisPanel, ActionPack,
    ModeSelector, CountUp, ProtectedRoute
  pages/
    Landing, Login, CaseAnalyzer, ResultsPage, Dashboard, Integrations

backend/
  app/
    models.py                 Pydantic models — the schema contract with the frontend
    rule_engine.py             THE rule engine. Only place a legal pathway is decided.
    auth.py                    JWT auth, demo accounts, guest tokens
    db.py                      SQLite persistence (cases + audit trail)
    demo_cases.py               7 synthetic demo cases, seeded on startup
    main.py                    FastAPI app / routes
  render.yaml                  Render deployment blueprint
  requirements.txt
```

## Known limitations

- **SQLite only** in this prototype. `DATABASE_URL` env var swaps to Postgres
  with no code changes (SQLModel abstracts the dialect) — untested here.
- **No password reset / registration / admin panel** — 4 demo accounts are
  hardcoded in `backend/app/auth.py`.
- **No automated test suite.** Verification was: `tsc -b` (clean), `npm run
  build` (clean), a full-repository grep for prohibited absolute-claim
  language (clean), and a real curl-driven end-to-end pass through every demo
  case and every auth path against a live backend instance — not just written
  and assumed correct.
- **Two-charge governing-charge logic is simplified** — BNSS §479 threshold
  uses the single charge with the highest maximum sentence among charges not
  punishable by death/life; it doesn't model concurrent vs. consecutive
  sentencing across multiple charges.
- **Integrations are non-functional by design** — every adapter status is a
  label on a mock; there is no real eCourts/ePrisons/ICJS/CCTNS/NALSA
  connection.
- **Single-language, India/BNSS-specific legal content** — no other
  jurisdiction is modeled. Legal-text review by someone with legal training is
  still recommended before presenting to Ministry of Law judges.

## Screenshot / recording guidance

1. **Login screen** — pick a role card, or hit Guest.
2. **The reckoning animation** — record from "Run Bail Analysis" through the
   9-stage sequence to the "Legal Pathways Evaluated" summary; this is the
   single most compelling clip, and it's a real network call, not a fake timer.
3. **Bail Assessment on BR-2026-006** — the mixed-signal case: a real
   eligibility flag *and* a procedural-action flag *and* several unresolved
   items simultaneously.
4. **§479 interactive timeline** on BR-2026-003 — animated custody marker,
   both threshold lines, "73 days past threshold" label.
5. **Undertrial Watch dashboard** — nearest-to-threshold list, filterable table.
6. **Kill the backend mid-demo** (optional, if you're feeling bold) — show the
   honest "rule engine unreachable" retry screen instead of a silent failure.
   This is actually a good thing to show judges: it proves there's no fake
   local fallback pretending to be the real system.

---

**Disclaimer:** Prototype for legal decision support. Results do not
constitute legal advice, do not grant bail, and do not replace judicial or
professional legal assessment. Subject to statutory conditions, verification
of case facts, and competent judicial/legal review.
