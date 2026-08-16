"""
Bail // Reckoner — Data Models
Mirrors src/types.ts in the frontend. Kept as plain Pydantic models (not
SQLModel tables) for the case/charge/result shapes, since these are stored
as JSON blobs in the audit trail rather than normalized relational tables —
matching how the frontend already treats a Case as a single structured
document. SQLModel is used only for the thin persistence tables in db.py.
"""

from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class YesNoUnknown(str, Enum):
    yes = "yes"
    no = "no"
    unknown = "unknown"


class Compoundability(str, Enum):
    compoundable = "compoundable"
    compoundable_with_permission = "compoundable_with_permission"
    non_compoundable = "non_compoundable"
    unknown = "unknown"


class Person(BaseModel):
    person_id: str
    display_id: str
    age: int
    first_time_offender: YesNoUnknown


class Charge(BaseModel):
    charge_id: str
    statute: str
    section: str
    offence_name: Optional[str] = None
    max_imprisonment_years: Optional[float] = None
    is_bailable: YesNoUnknown
    compoundability: Compoundability = Compoundability.unknown
    is_death_or_life_punishable: bool = False
    is_special_statute: bool = False
    special_statute_name: Optional[str] = None


class CustodyRecord(BaseModel):
    arrest_date: Optional[date] = None
    custody_start_date: Optional[date] = None
    police_custody_days: int = 0
    judicial_custody_days: int = 0
    accused_delay_status: YesNoUnknown = YesNoUnknown.unknown
    accused_attributable_delay_days: int = 0
    chargesheet_filed: YesNoUnknown = YesNoUnknown.unknown
    chargesheet_date: Optional[date] = None


class BailApplication(BaseModel):
    previously_applied: bool = False
    previously_rejected: bool = False


class CaseStatus(BaseModel):
    current_court: str = ""
    case_stage: str = ""
    bail: BailApplication = Field(default_factory=BailApplication)
    multiple_pending_cases: bool = False
    known_criminal_history: YesNoUnknown = YesNoUnknown.unknown
    special_condition_flags: list[str] = Field(default_factory=list)


class Case(BaseModel):
    case_id: str
    created_at: Optional[date] = None
    person: Person
    charges: list[Charge] = Field(default_factory=list)
    custody: CustodyRecord = Field(default_factory=CustodyRecord)
    status: CaseStatus = Field(default_factory=CaseStatus)


# ---------------------------------------------------------------
# Result models
# ---------------------------------------------------------------

class ResultCategory(str, Enum):
    POTENTIAL_STATUTORY_PATHWAY = "POTENTIAL_STATUTORY_PATHWAY"
    POTENTIAL_DEFAULT_BAIL_PATHWAY = "POTENTIAL_DEFAULT_BAIL_PATHWAY"
    UNDERTRIAL_THRESHOLD_REACHED = "UNDERTRIAL_THRESHOLD_REACHED"
    DISCRETIONARY_JUDICIAL_REVIEW = "DISCRETIONARY_JUDICIAL_REVIEW"
    ENHANCED_SPECIAL_STATUTE_REVIEW = "ENHANCED_SPECIAL_STATUTE_REVIEW"
    NOT_CURRENTLY_ELIGIBLE = "NOT_CURRENTLY_ELIGIBLE"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    CONFLICTING_MULTIPLE_CASE_FLAGS = "CONFLICTING_MULTIPLE_CASE_FLAGS"


class PathwayStatus(str, Enum):
    potentially_eligible = "Potentially Eligible"
    eligibility_condition_detected = "Eligibility Condition Detected"
    requires_judicial_review = "Requires Judicial Review"
    insufficient_information = "Insufficient Information"
    procedural_action_required = "Procedural Action Required"


class LegalSource(BaseModel):
    statute: str
    section: str
    short_title: str
    source_name: str
    rule_version: str
    last_reviewed: str


class CalculationLine(BaseModel):
    label: str
    value: str


class ExplanationStep(BaseModel):
    step: int
    title: str
    detail: str


class DataQualityFlag(BaseModel):
    field: str
    ok: bool
    note: str


class RuleOutcome(BaseModel):
    pathway_id: str
    category: ResultCategory
    status: PathwayStatus
    headline: str
    summary: str
    legal_source: LegalSource
    facts_used: list[CalculationLine] = Field(default_factory=list)
    calculation: list[CalculationLine] = Field(default_factory=list)
    conditions_checked: list[str] = Field(default_factory=list)
    unresolved_items: list[str] = Field(default_factory=list)
    explanation: list[ExplanationStep] = Field(default_factory=list)
    priority: str = "medium"
    remaining_days: Optional[int] = None


class UndertrialVisual(BaseModel):
    """
    Structured numbers for rendering the §479 custody-vs-threshold timeline.
    Computed once by the backend rule engine and handed to the frontend as
    data — the frontend does no threshold arithmetic of its own.
    """
    governing_charge_section: str
    max_years: float
    is_first_time: bool
    general_threshold_days: int
    first_time_threshold_days: int
    applicable_threshold_days: int
    custody_days_net: int
    reached: bool
    remaining_days: int
    over_days: int


class EligibilityResult(BaseModel):
    analysis_id: str
    case_id: str
    timestamp: str
    rule_engine_version: str
    outcomes: list[RuleOutcome]
    primary_category: ResultCategory
    data_quality: list[DataQualityFlag]
    judicial_factors: list[str]
    next_step: str
    custody_days: Optional[int] = None
    undertrial: Optional[UndertrialVisual] = None
