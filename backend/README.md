# Bail // Reckoner — Backend (FastAPI + SQLite)

A faithful Python port of the frontend's TypeScript rule engine
(`src/rules/ruleEngine.ts` → `app/rule_engine.py`), exposed as a real REST
API with SQLite persistence and an audit trail.

Decision-support tool. Not a judicial prediction or legal advice. All data
is synthetic. Not connected to eCourts, ePrisons, CCTNS, ICJS or NALSA.

## Run it

```bash
cd backend
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
./.venv/bin/uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

## Quick smoke test

```bash
curl -X POST localhost:8000/api/demo-cases/seed        # loads the 7 demo cases
curl localhost:8000/api/cases                           # list them
curl -X POST localhost:8000/api/cases/BR-2026-003/analyze  # run the rule engine
curl localhost:8000/api/cases/BR-2026-003/audit-trail   # see the audit trail
```

## Endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/api/health` | Liveness + rule-engine version |
| GET | `/api/demo-cases` | The 7 synthetic demo cases (not persisted) |
| POST | `/api/demo-cases/seed` | Upserts the 7 demo cases into the database |
| GET | `/api/cases` | List all stored cases |
| GET | `/api/cases/{case_id}` | Fetch one case |
| PUT | `/api/cases/{case_id}` | Create/update a case |
| POST | `/api/cases/{case_id}/analyze` | Run the rule engine (body optional — analyzes the stored case if omitted) |
| GET | `/api/cases/{case_id}/result` | Latest analysis result for a case |
| GET | `/api/cases/{case_id}/audit-trail` | Every analysis run for a case, with input snapshots |
| GET | `/api/rule-engine/info` | Version + list of the 5 pathway rules the engine checks |

## What's verified

- All 7 demo cases run through `/analyze` and produce the same
  `primary_category` as the frontend's TypeScript engine for the same input.
- 404 handling for unknown case IDs.
- OpenAPI schema generates correctly (`/docs`, `/openapi.json`).
- Audit trail correctly accumulates one row per analysis run.

## Auth (demo-grade, not production-grade)

Real JWT auth — actual password hashing (bcrypt), actual signed tokens,
actual 401s for missing/invalid/expired tokens. It's demo-grade in scope
(one write-permission level, seeded accounts, no password reset/registration
flow), not in implementation.

| Endpoint | Auth required | Notes |
|---|---|---|
| `POST /api/auth/login` | No | username + password → JWT |
| `POST /api/auth/guest` | No | issues a real, time-limited guest token, no credentials |
| `GET /api/auth/me` | Yes (any role) | introspect the current token |
| `GET /api/auth/demo-accounts` | No | publicly lists the demo usernames/passwords below — intentional, so a judge can log in without asking you |
| `PUT /api/cases/{id}`, `POST /api/cases/{id}/analyze` | Yes (any role, including guest) | write endpoints — anonymous requests get 401 |
| everything else (`GET /api/cases`, `/api/demo-cases`, `/api/health`, etc.) | No | read-only, left open for the demo |

Demo accounts (seeded in `app/auth.py`):

| Username | Password | Role |
|---|---|---|
| `advocate` | `legalaid123` | Legal Aid |
| `judge` | `judicial123` | Judicial |
| `prison` | `prison123` | Prison Authority |
| `undertrial` | `undertrial123` | Undertrial |

Set `AUTH_SECRET_KEY` before deploying anywhere reachable by a stranger —
it defaults to an insecure dev value on purpose so local `npm run dev` /
`uvicorn` never requires extra setup.

## Deploy to Render

1. Push this repo to GitHub.
2. In Render: New → Blueprint → point at the repo (`backend/render.yaml` is
   already set up) — or New → Web Service manually with:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Render's free-tier disk is ephemeral — the app reseeds the 7 demo cases
   on every startup (see `lifespan()` in `app/main.py`), so this is expected
   and harmless, not a bug.
4. Free tier sleeps after 15 min idle; first request after that takes
   ~20–30s to wake. Fine for a judged demo, worth knowing about live.
5. Copy the resulting `https://….onrender.com` URL into the frontend's
   `VITE_API_BASE_URL` (see `.env.example` in the repo root) before building
   for Vercel.

## What's not done yet

- The React frontend does **not** call this API for its core analysis flow —
  it still uses its own in-memory TypeScript copy of the rule engine (by
  design, so the demo works even if the backend is asleep/unreachable). It
  does call this backend for login, guest sessions, and the optional
  "Verify against backend" cross-check.
- No password reset, registration, or admin panel — the 4 demo accounts are
  hardcoded in `app/auth.py`.
- SQLite only. Swap `DATABASE_URL` env var for a `postgresql://` URL to
  move to Postgres — no other code changes needed since SQLModel abstracts
  the dialect.
- No automated tests (pytest) yet — verification so far is the manual
  curl smoke tests documented above, covering all 7 demo cases and every
  auth path (login success/failure, guest token, protected-endpoint 401s,
  token introspection, garbage-token rejection).
