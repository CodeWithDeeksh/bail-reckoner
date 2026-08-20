"""
Bail // Reckoner — FastAPI backend

Decision-support tool. Not a judicial prediction or legal advice.
All data is synthetic. Not connected to eCourts, ePrisons, CCTNS, ICJS or NALSA.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session

from . import auth, db
from .demo_cases import DEMO_CASES
from .models import Case, EligibilityResult
from .i18n import SUPPORTED_LANGUAGES, localize_result
from .rule_engine import RULE_ENGINE_VERSION, TOTAL_PATHWAYS_CHECKED, run_eligibility_analysis


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    # Reseed demo cases on every startup — Render's free tier disk is
    # ephemeral, so this keeps the service demo-ready after any redeploy
    # or wake-from-sleep without a manual step.
    with Session(db.engine) as session:
        for c in DEMO_CASES:
            db.save_case(session, c.case_id, c.model_dump(mode="json"))
    yield


app = FastAPI(
    title="Bail // Reckoner API",
    description=(
        "Explainable legal decision-support prototype (SIH260405). "
        "Deterministic, versioned rule engine — not an AI judge, not a "
        "bail-prediction model, not connected to any live government system. "
        "All data is synthetic."
    ),
    version=RULE_ENGINE_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # demo only — restrict to the frontend origin before any real deployment
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/api/auth/login", response_model=auth.TokenResponse)
def login(body: LoginRequest):
    user = auth.authenticate(body.username, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password.")
    return auth.TokenResponse(access_token=auth.create_access_token(user), role=user.role, display_name=user.display_name)


@app.post("/api/auth/guest", response_model=auth.TokenResponse)
def guest_login():
    """No credentials required — issues a real, time-limited guest session token."""
    return auth.TokenResponse(access_token=auth.create_guest_token(), role="guest", display_name="Guest (Demo Mode)")


@app.get("/api/auth/me", response_model=auth.DemoUser)
def me(user: auth.DemoUser = Depends(auth.require_user)):
    return user


@app.get("/api/auth/demo-accounts")
def demo_accounts():
    """Publicly listed on purpose — these are demo credentials, not real ones."""
    return auth.public_demo_accounts()


@app.get("/api/health")
def health():
    return {"status": "ok", "rule_engine_version": RULE_ENGINE_VERSION, "synthetic_data_only": True}


@app.get("/api/demo-cases", response_model=list[Case])
def get_demo_cases():
    """The 7 synthetic demo scenarios. Not real prisoner or court data."""
    return DEMO_CASES


@app.post("/api/demo-cases/seed")
def seed_demo_cases():
    """Load the 7 demo cases into the database (idempotent — upserts by case_id)."""
    with Session(db.engine) as session:
        for c in DEMO_CASES:
            db.save_case(session, c.case_id, c.model_dump(mode="json"))
    return {"seeded": len(DEMO_CASES)}


@app.get("/api/cases", response_model=list[Case])
def list_cases():
    with Session(db.engine) as session:
        return db.list_cases(session)


@app.get("/api/cases/{case_id}", response_model=Case)
def get_case(case_id: str):
    with Session(db.engine) as session:
        row = db.get_case_row(session, case_id)
        if not row:
            raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
        return row


@app.put("/api/cases/{case_id}", response_model=Case)
def upsert_case(case_id: str, case: Case, user: auth.DemoUser = Depends(auth.require_user)):
    if case.case_id != case_id:
        raise HTTPException(status_code=400, detail="case_id in path and body must match")
    with Session(db.engine) as session:
        db.save_case(session, case_id, case.model_dump(mode="json"))
    return case


@app.post("/api/cases/{case_id}/analyze", response_model=EligibilityResult)
def analyze_case(case_id: str, case: Case | None = None, lang: str = Query("en"), user: auth.DemoUser = Depends(auth.require_user)):
    """
    Run the deterministic rule engine against a case. Requires an
    authenticated session (any role, including guest) — anonymous requests
    are rejected.

    If a case body is supplied it is analyzed and upserted; otherwise the
    already-stored case for case_id is analyzed. Every run is written to the
    audit trail (analysis id, timestamp, rule-engine version, full input
    snapshot, full result) regardless of which path is used.
    """
    with Session(db.engine) as session:
        if case is not None:
            if case.case_id != case_id:
                raise HTTPException(status_code=400, detail="case_id in path and body must match")
            db.save_case(session, case_id, case.model_dump(mode="json"))
            target = case
        else:
            row = db.get_case_row(session, case_id)
            if not row:
                raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
            target = Case.model_validate(row)

        result = run_eligibility_analysis(target)

        db.save_audit(
            session,
            analysis_id=result.analysis_id,
            case_id=case_id,
            timestamp=result.timestamp,
            rule_engine_version=result.rule_engine_version,
            input_snapshot=target.model_dump(mode="json"),
            result=result.model_dump(mode="json"),
        )
        return localize_result(result, lang if lang in SUPPORTED_LANGUAGES else "en")


@app.get("/api/cases/{case_id}/result", response_model=EligibilityResult | None)
def latest_result(case_id: str, lang: str = Query("en")):
    with Session(db.engine) as session:
        result = db.latest_result_for_case(session, case_id)
        if result is None:
            raise HTTPException(status_code=404, detail=f"No analysis found for case {case_id}")
        return localize_result(EligibilityResult.model_validate(result), lang if lang in SUPPORTED_LANGUAGES else "en")


@app.get("/api/cases/{case_id}/audit-trail")
def audit_trail(case_id: str):
    """Full audit trail for a case: every analysis run, in order, with input snapshots."""
    with Session(db.engine) as session:
        return db.audit_trail_for_case(session, case_id)


@app.get("/api/rule-engine/info")
def rule_engine_info():
    return {
        "version": RULE_ENGINE_VERSION,
        "total_pathways_checked": TOTAL_PATHWAYS_CHECKED,
        "pathways": [
            "Bailable offence (statutory pathway)",
            "Default bail — BNSS §187 (60/90 day)",
            "Undertrial detention threshold — BNSS §479 (1/2 general, 1/3 first-time)",
            "Special-statute enhanced review (NDPS, UAPA, PMLA, POCSO, SC/ST Act)",
            "Procedural prerequisite (bail application not yet filed)",
        ],
    }
