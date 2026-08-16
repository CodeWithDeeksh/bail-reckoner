"""
Persistence layer. Two thin tables:
  - cases: one row per case, full Case document stored as JSON
  - audit_trail: one row per analysis run, full EligibilityResult stored as
    JSON alongside the input snapshot — matching the frontend's audit-trail
    requirement (timestamp, input snapshot, rules executed, rule version,
    result, data-quality flags).

SQLite for the prototype; swap DATABASE_URL for a postgresql:// URL to move
to Postgres without touching any other file.
"""

from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Optional

from sqlmodel import Field, Session, SQLModel, create_engine, select

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./bail_reckoner.db")
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})


class CaseRow(SQLModel, table=True):
    __tablename__ = "cases"
    case_id: str = Field(primary_key=True)
    data: str  # JSON-serialized Case
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class AuditRow(SQLModel, table=True):
    __tablename__ = "audit_trail"
    analysis_id: str = Field(primary_key=True)
    case_id: str = Field(index=True)
    timestamp: str
    rule_engine_version: str
    input_snapshot: str  # JSON-serialized Case at time of analysis
    result: str  # JSON-serialized EligibilityResult


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


def save_case(session: Session, case_id: str, case_json: dict) -> None:
    existing = session.get(CaseRow, case_id)
    now = datetime.utcnow().isoformat()
    if existing:
        existing.data = json.dumps(case_json)
        existing.updated_at = now
        session.add(existing)
    else:
        session.add(CaseRow(case_id=case_id, data=json.dumps(case_json), created_at=now, updated_at=now))
    session.commit()


def list_cases(session: Session) -> list[dict]:
    rows = session.exec(select(CaseRow).order_by(CaseRow.created_at.desc())).all()
    return [json.loads(r.data) for r in rows]


def get_case_row(session: Session, case_id: str) -> Optional[dict]:
    row = session.get(CaseRow, case_id)
    return json.loads(row.data) if row else None


def save_audit(session: Session, analysis_id: str, case_id: str, timestamp: str,
                rule_engine_version: str, input_snapshot: dict, result: dict) -> None:
    session.add(AuditRow(
        analysis_id=analysis_id,
        case_id=case_id,
        timestamp=timestamp,
        rule_engine_version=rule_engine_version,
        input_snapshot=json.dumps(input_snapshot),
        result=json.dumps(result),
    ))
    session.commit()


def latest_result_for_case(session: Session, case_id: str) -> Optional[dict]:
    rows = session.exec(
        select(AuditRow).where(AuditRow.case_id == case_id).order_by(AuditRow.timestamp.desc())
    ).all()
    return json.loads(rows[0].result) if rows else None


def audit_trail_for_case(session: Session, case_id: str) -> list[dict]:
    rows = session.exec(
        select(AuditRow).where(AuditRow.case_id == case_id).order_by(AuditRow.timestamp.desc())
    ).all()
    return [
        {
            "analysis_id": r.analysis_id,
            "case_id": r.case_id,
            "timestamp": r.timestamp,
            "rule_engine_version": r.rule_engine_version,
            "input_snapshot": json.loads(r.input_snapshot),
            "result": json.loads(r.result),
        }
        for r in rows
    ]
