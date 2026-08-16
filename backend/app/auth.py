"""
Bail // Reckoner — Auth

Real JWT auth for a HACKATHON DEMO, not a production security system. It
demonstrates the concept the "Mode" presentation levels were gesturing at —
that different user types (Undertrial / Legal Aid / Judicial / Prison
Authority) can have real, enforced sessions — without over-building RBAC
for a prototype that has one write-scope (case create/update/analyze).

DEMO CREDENTIALS ONLY. The JWT secret defaults to an insecure dev value;
override AUTH_SECRET_KEY before deploying anywhere a stranger can reach it.
Passwords below are intentionally simple and are printed in /api/auth/demo-accounts
so judges/graders can log in without you needing to read them out loud.
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from pydantic import BaseModel

SECRET_KEY = os.environ.get("AUTH_SECRET_KEY", "dev-only-insecure-secret-change-before-deploying")
ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 8

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


class DemoUser(BaseModel):
    username: str
    display_name: str
    role: str  # undertrial | legal_aid | judicial | prison_authority | guest


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    display_name: str
    expires_in_hours: int = TOKEN_EXPIRY_HOURS


# ---------------------------------------------------------------
# Seeded demo accounts — one per presentation mode. Real passwords,
# real hashing, real JWTs; just not real people.
# ---------------------------------------------------------------
_DEMO_ACCOUNTS: dict[str, dict] = {
    "advocate": {
        "password_hash": pwd_context.hash("legalaid123"),
        "display_name": "Adv. Priya Menon (Legal Aid)",
        "role": "legal_aid",
    },
    "judge": {
        "password_hash": pwd_context.hash("judicial123"),
        "display_name": "Judicial Officer (Demo)",
        "role": "judicial",
    },
    "prison": {
        "password_hash": pwd_context.hash("prison123"),
        "display_name": "Prison Authority (Demo)",
        "role": "prison_authority",
    },
    "undertrial": {
        "password_hash": pwd_context.hash("undertrial123"),
        "display_name": "Undertrial Access (Demo)",
        "role": "undertrial",
    },
}


def public_demo_accounts() -> list[dict]:
    """Non-secret listing so a judge can see who to log in as without asking you."""
    return [
        {"username": u, "password": {"advocate": "legalaid123", "judge": "judicial123", "prison": "prison123", "undertrial": "undertrial123"}[u],
         "display_name": v["display_name"], "role": v["role"]}
        for u, v in _DEMO_ACCOUNTS.items()
    ]


def authenticate(username: str, password: str) -> Optional[DemoUser]:
    account = _DEMO_ACCOUNTS.get(username)
    if not account or not pwd_context.verify(password, account["password_hash"]):
        return None
    return DemoUser(username=username, display_name=account["display_name"], role=account["role"])


def create_access_token(user: DemoUser) -> str:
    payload = {
        "sub": user.username,
        "role": user.role,
        "display_name": user.display_name,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_guest_token() -> str:
    payload = {
        "sub": "guest",
        "role": "guest",
        "display_name": "Guest (Demo Mode)",
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> DemoUser:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired — please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token.")
    return DemoUser(username=payload["sub"], display_name=payload["display_name"], role=payload["role"])


def require_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)) -> DemoUser:
    """Any authenticated session, including guest — used to gate write endpoints."""
    if creds is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in required.")
    return decode_token(creds.credentials)


def require_non_guest(user: DemoUser = Depends(require_user)) -> DemoUser:
    """For actions guest sessions shouldn't perform (currently unused, reserved)."""
    if user.role == "guest":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Guest mode is read-only for this action.")
    return user
