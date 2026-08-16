"""
Bail // Reckoner — Deterministic Rule Engine (Python port)

This engine performs NO prediction and NO scoring. It matches structured
case facts against versioned statutory rule definitions and returns
explainable pathways only. It does not grant bail and is not a substitute
for judicial or legal professional assessment.

This is a line-for-line port of src/rules/ruleEngine.ts so the two
implementations can be diffed against each other and kept in sync.
"""

from __future__ import annotations

from datetime import date
from typing import Optional
from uuid import uuid4

from .models import (
    Case,
    CalculationLine,
    DataQualityFlag,
    EligibilityResult,
    ExplanationStep,
    LegalSource,
    PathwayStatus,
    ResultCategory,
    RuleOutcome,
    UndertrialVisual,
    YesNoUnknown,
)

RULE_ENGINE_VERSION = "rules-2026.08.0-py"
TOTAL_PATHWAYS_CHECKED = 5  # Bailable, Default Bail §187, Undertrial §479, Special Statute, Procedural Prerequisite

STANDARD_QUALIFIER = (
    "Subject to statutory conditions, verification of case facts, "
    "and competent judicial/legal review."
)

SOURCE_BNSS_187 = LegalSource(
    statute="Bharatiya Nagarik Suraksha Sanhita, 2023",
    section="BNSS §187",
    short_title="Procedure when investigation cannot be completed in 24 hours",
    source_name="India Code",
    rule_version=RULE_ENGINE_VERSION,
    last_reviewed="2026-04-01",
)

SOURCE_BNSS_479 = LegalSource(
    statute="Bharatiya Nagarik Suraksha Sanhita, 2023",
    section="BNSS §479",
    short_title="Maximum period for which an undertrial prisoner can be detained",
    source_name="India Code",
    rule_version=RULE_ENGINE_VERSION,
    last_reviewed="2026-04-01",
)

SOURCE_GENERIC_BAILABLE = LegalSource(
    statute="Bharatiya Nagarik Suraksha Sanhita, 2023",
    section="BNSS, First Schedule (offence classification)",
    short_title="Classification of offences as bailable / non-bailable",
    source_name="India Code",
    rule_version=RULE_ENGINE_VERSION,
    last_reviewed="2026-04-01",
)

SPECIAL_STATUTES_REGISTRY = ["NDPS", "UAPA", "PMLA", "POCSO", "SC/ST Act"]


def _days_between(start: Optional[date], end: date) -> int:
    if start is None:
        return 0
    return max(0, (end - start).days)


def total_custody_days(c: Case, today: Optional[date] = None) -> int:
    today = today or date.today()
    return _days_between(c.custody.custody_start_date, today)


# ---------------------------------------------------------------
# Data quality
# ---------------------------------------------------------------
def assess_data_quality(c: Case) -> list[DataQualityFlag]:
    flags: list[DataQualityFlag] = []
    flags.append(DataQualityFlag(
        field="Arrest date",
        ok=c.custody.arrest_date is not None,
        note="Provided" if c.custody.arrest_date else "Missing — required for custody calculation",
    ))
    flags.append(DataQualityFlag(
        field="Charge information",
        ok=len(c.charges) > 0 and all(ch.section and ch.statute for ch in c.charges),
        note="Provided for all charges" if c.charges else "No charges recorded",
    ))
    flags.append(DataQualityFlag(
        field="Custody duration",
        ok=c.custody.custody_start_date is not None,
        note="Calculated from custody start date" if c.custody.custody_start_date else "Cannot be calculated",
    ))
    flags.append(DataQualityFlag(
        field="Criminal history",
        ok=c.status.known_criminal_history != YesNoUnknown.unknown,
        note="Not verified against any external record" if c.status.known_criminal_history == YesNoUnknown.unknown else "Recorded as supplied by user",
    ))
    flags.append(DataQualityFlag(
        field="First-time offender status",
        ok=c.person.first_time_offender != YesNoUnknown.unknown,
        note="Unknown — general (1/2) threshold applied conservatively" if c.person.first_time_offender == YesNoUnknown.unknown else "Recorded as supplied by user",
    ))
    flags.append(DataQualityFlag(
        field="Delay attributable to accused",
        ok=c.custody.accused_delay_status != YesNoUnknown.unknown,
        note="Not verified — none deducted from custody calculation" if c.custody.accused_delay_status == YesNoUnknown.unknown else "Recorded as supplied by user",
    ))
    return flags


# ---------------------------------------------------------------
# Pathway A — Bailable offence
# ---------------------------------------------------------------
def evaluate_bailable_pathway(c: Case) -> Optional[RuleOutcome]:
    bailable_charges = [ch for ch in c.charges if ch.is_bailable == YesNoUnknown.yes]
    if not bailable_charges:
        return None

    explanation = [
        ExplanationStep(step=1, title="Offence identified",
                         detail=f"{len(bailable_charges)} of {len(c.charges)} charge(s) classified as bailable in the case record."),
        ExplanationStep(step=2, title="Classification checked",
                         detail="Offence classification (bailable / non-bailable) read from the structured charge data supplied."),
        ExplanationStep(step=3, title="Exceptions checked",
                         detail="No override applied: bailable classification is independent of custody duration."),
        ExplanationStep(step=4, title="Result generated",
                         detail="Case flagged for the statutory bail pathway, subject to procedural requirements."),
    ]

    unresolved: list[str] = []
    if c.status.multiple_pending_cases:
        unresolved.append("Multiple pending cases recorded — may affect procedural requirements.")

    return RuleOutcome(
        pathway_id="pathway-a-bailable",
        category=ResultCategory.POTENTIAL_STATUTORY_PATHWAY,
        status=PathwayStatus.potentially_eligible,
        headline="POTENTIAL STATUTORY PATHWAY IDENTIFIED",
        summary=(
            "This case is classified as bailable based on the offence classification supplied "
            "to the system. Eligible to seek release subject to statutory/procedural requirements."
        ),
        legal_source=SOURCE_GENERIC_BAILABLE,
        facts_used=[CalculationLine(label=ch.section, value=f"{ch.offence_name or 'Offence'} — classified as bailable") for ch in bailable_charges],
        calculation=[CalculationLine(label="Bailable charge(s)", value=f"{len(bailable_charges)} of {len(c.charges)}")],
        conditions_checked=[
            "Offence classification read directly from charge record (bailable / non-bailable).",
            "No custody-duration threshold applies to this pathway.",
        ],
        unresolved_items=unresolved,
        explanation=explanation,
        priority="medium",
    )


# ---------------------------------------------------------------
# Pathway B — Default bail (BNSS §187)
# ---------------------------------------------------------------
def evaluate_default_bail_pathway(c: Case) -> Optional[RuleOutcome]:
    if c.custody.chargesheet_filed == YesNoUnknown.yes:
        return None

    custody_days = total_custody_days(c)
    severe = any(ch.is_death_or_life_punishable or (ch.max_imprisonment_years or 0) >= 10 for ch in c.charges)
    threshold = 90 if severe else 60

    if custody_days < threshold:
        return None

    calculation = [
        CalculationLine(label="Custody completed", value=f"{custody_days} days"),
        CalculationLine(label="Applicable statutory period", value=f"{threshold} days"),
        CalculationLine(label="Difference", value=f"+{custody_days - threshold} days over threshold"),
    ]
    facts_used = [
        CalculationLine(label="Chargesheet filed", value="No"),
        CalculationLine(label="Offence severity", value="≥10 years / death / life imprisonment" if severe else "Below 10-year threshold"),
        CalculationLine(label="Custody start date", value=str(c.custody.custody_start_date)),
    ]
    explanation = [
        ExplanationStep(step=1, title="Offence — severity assessed",
                         detail="Offence severity checked to determine the applicable statutory period (60 or 90 days)."),
        ExplanationStep(step=2, title="Offence — maximum punishment retrieved",
                         detail="At least one charge carries ≥10 years, death, or life imprisonment — 90-day period applies." if severe else "No charge reaches the ≥10-year threshold — 60-day period applies."),
        ExplanationStep(step=3, title="Applicable rule — statute selected",
                         detail="BNSS §187 default-bail rule selected because the chargesheet has not been filed."),
        ExplanationStep(step=4, title="Custody — duration calculated",
                         detail=f"Custody start date compared against today: {custody_days} days."),
        ExplanationStep(step=5, title="Threshold — statutory period compared",
                         detail=f"Statutory period of {threshold} days compared against custody completed."),
        ExplanationStep(step=6, title="Conditions / exceptions checked",
                         detail="No chargesheet-filed override applies, since the chargesheet is recorded as not filed."),
        ExplanationStep(step=7, title="Result generated",
                         detail="Default-bail threshold reached; pathway flagged for review."),
    ]

    return RuleOutcome(
        pathway_id="pathway-b-default-bail",
        category=ResultCategory.POTENTIAL_DEFAULT_BAIL_PATHWAY,
        status=PathwayStatus.eligibility_condition_detected,
        headline="POTENTIAL DEFAULT-BAIL PATHWAY",
        summary="Potential default-bail pathway identified. This is not an automatic grant of bail.",
        legal_source=SOURCE_BNSS_187,
        facts_used=facts_used,
        calculation=calculation,
        conditions_checked=[
            "Chargesheet-filed status checked as of today.",
            "Offence severity checked against the ≥10-year / death / life threshold to select 60 vs 90 days.",
        ],
        unresolved_items=["Chargesheet-filed status not confirmed."] if c.custody.chargesheet_filed == YesNoUnknown.unknown else [],
        explanation=explanation,
        priority="high",
    )


# ---------------------------------------------------------------
# Pathway C — Undertrial detention (BNSS §479)
# ---------------------------------------------------------------
class UndertrialThresholdInfo:
    def __init__(self, governing_charge, max_years, is_first_time, threshold_days,
                 custody_days_raw, custody_days_net, delay_deducted, reached,
                 remaining_days, over_days):
        self.governing_charge = governing_charge
        self.max_years = max_years
        self.is_first_time = is_first_time
        self.threshold_days = threshold_days
        self.custody_days_raw = custody_days_raw
        self.custody_days_net = custody_days_net
        self.delay_deducted = delay_deducted
        self.reached = reached
        self.remaining_days = remaining_days
        self.over_days = over_days


def compute_undertrial_threshold(c: Case) -> Optional[UndertrialThresholdInfo]:
    eligible = [ch for ch in c.charges if not ch.is_death_or_life_punishable and ch.max_imprisonment_years is not None]
    if not eligible:
        return None

    governing_charge = max(eligible, key=lambda ch: ch.max_imprisonment_years or 0)
    max_years = governing_charge.max_imprisonment_years or 0
    is_first_time = c.person.first_time_offender == YesNoUnknown.yes
    fraction = (1 / 3) if is_first_time else (1 / 2)
    threshold_days = round(max_years * 365 * fraction)

    custody_days_raw = total_custody_days(c)
    delay_deducted = c.custody.accused_attributable_delay_days if c.custody.accused_delay_status == YesNoUnknown.yes else 0
    custody_days_net = max(0, custody_days_raw - delay_deducted)
    reached = custody_days_net >= threshold_days
    remaining_days = max(0, threshold_days - custody_days_net)
    over_days = max(0, custody_days_net - threshold_days)

    return UndertrialThresholdInfo(
        governing_charge, max_years, is_first_time, threshold_days,
        custody_days_raw, custody_days_net, delay_deducted, reached,
        remaining_days, over_days,
    )


def evaluate_undertrial_threshold_pathway(c: Case) -> Optional[RuleOutcome]:
    info = compute_undertrial_threshold(c)
    if not info or not info.governing_charge:
        return None
    if not info.reached:
        return None  # approaching cases surfaced separately on the dashboard, not as a triggered pathway

    governing_charge = info.governing_charge
    calculation = [
        CalculationLine(label="Maximum sentence", value=f"{info.max_years} years"),
        CalculationLine(label="Threshold fraction", value="1/3 (first-time offender)" if info.is_first_time else "1/2 (general)"),
        CalculationLine(label="Threshold", value=f"{info.threshold_days / 365:.2f} years ({info.threshold_days} days)"),
        CalculationLine(label="Custody completed (net of accused delay)", value=f"{info.custody_days_net / 365:.2f} years ({info.custody_days_net} days)"),
        CalculationLine(label="Status", value="THRESHOLD REACHED"),
    ]
    facts_used = [
        CalculationLine(label="Governing charge", value=governing_charge.section),
        CalculationLine(label="First-time offender",
                         value="Unknown (general threshold applied)" if c.person.first_time_offender == YesNoUnknown.unknown
                         else ("Yes" if info.is_first_time else "No")),
        CalculationLine(label="Multiple cases", value="Yes" if c.status.multiple_pending_cases else "No"),
        CalculationLine(label="Delay attributable to accused",
                         value="Unknown" if c.custody.accused_delay_status == YesNoUnknown.unknown
                         else (f"Yes — {info.delay_deducted} days deducted" if c.custody.accused_delay_status == YesNoUnknown.yes else "No")),
    ]
    explanation = [
        ExplanationStep(step=1, title="Offence — governing charge identified",
                         detail=f"Governing charge selected as {governing_charge.section} (highest maximum sentence among charges not punishable with death/life)."),
        ExplanationStep(step=2, title="Offence — maximum punishment retrieved",
                         detail=f"Maximum prescribed imprisonment of {info.max_years} years read from the charge record."),
        ExplanationStep(step=3, title="Applicable rule — statute selected",
                         detail="BNSS §479 undertrial detention rule selected."),
        ExplanationStep(step=4, title="Custody — duration calculated",
                         detail=f"Custody start date compared against today, less {info.delay_deducted} day(s) attributable to accused delay."),
        ExplanationStep(step=5, title="Threshold — fraction applied",
                         detail=f"{'First-time offender' if info.is_first_time else 'General'} fraction ({'1/3' if info.is_first_time else '1/2'}) applied to maximum sentence."),
        ExplanationStep(step=6, title="Conditions / exceptions checked",
                         detail="Charges punishable with death or life imprisonment were excluded from the governing-charge calculation, per BNSS §479 proviso."),
        ExplanationStep(step=7, title="Result generated",
                         detail="Custody completed meets or exceeds the calculated threshold."),
    ]

    unresolved: list[str] = []
    if c.person.first_time_offender == YesNoUnknown.unknown:
        unresolved.append("First-time offender status not confirmed — general (1/2) threshold used conservatively.")
    if c.custody.accused_delay_status == YesNoUnknown.unknown:
        unresolved.append("Delay attributable to accused not confirmed — no days deducted from custody.")
    if c.status.multiple_pending_cases:
        unresolved.append("Multiple pending cases recorded — may affect how this threshold is applied.")

    return RuleOutcome(
        pathway_id="pathway-c-undertrial-threshold",
        category=ResultCategory.UNDERTRIAL_THRESHOLD_REACHED,
        status=PathwayStatus.eligibility_condition_detected,
        headline="STATUTORY THRESHOLD REACHED",
        summary="Potential undertrial-release pathway identified under BNSS §479. This is not an automatic grant of bail.",
        legal_source=SOURCE_BNSS_479,
        facts_used=facts_used,
        calculation=calculation,
        conditions_checked=[
            "Charges punishable with death or life imprisonment excluded from the governing-charge calculation.",
            "First-time-offender fraction (1/3) applied only when explicitly recorded as Yes.",
            "Accused-attributable delay deducted from custody only when explicitly recorded as Yes.",
        ],
        unresolved_items=unresolved,
        explanation=explanation,
        priority="high",
        remaining_days=None if info.reached else info.remaining_days,
    )


# ---------------------------------------------------------------
# Pathway D — Special statute review
# ---------------------------------------------------------------
def evaluate_special_statute_pathway(c: Case) -> Optional[RuleOutcome]:
    special_charges = [ch for ch in c.charges if ch.is_special_statute]
    if not special_charges:
        return None

    names = [ch.special_statute_name or "Unspecified special statute" for ch in special_charges]

    explanation = [
        ExplanationStep(step=1, title="Offence identified",
                         detail=f"Charge(s) matched against the configured special-statute registry: {', '.join(SPECIAL_STATUTES_REGISTRY)}."),
        ExplanationStep(step=2, title="Special statute detected", detail=f"Detected: {', '.join(names)}."),
        ExplanationStep(step=3, title="Standard pathway suppressed",
                         detail="Normal statutory / default-bail / undertrial thresholds are not treated as sufficient on their own for special-statute offences."),
        ExplanationStep(step=4, title="Result generated", detail="Case routed for enhanced legal review rather than an automated pathway."),
    ]

    return RuleOutcome(
        pathway_id="pathway-d-special-statute",
        category=ResultCategory.ENHANCED_SPECIAL_STATUTE_REVIEW,
        status=PathwayStatus.requires_judicial_review,
        headline="ENHANCED SPECIAL-STATUTE REVIEW",
        summary="This case involves a special statute with additional conditions for bail. Normal rule pathways may not be sufficient. Human legal review is required.",
        legal_source=LegalSource(
            statute=names[0],
            section=special_charges[0].section,
            short_title="Special statutory conditions for release",
            source_name="India Code",
            rule_version=RULE_ENGINE_VERSION,
            last_reviewed="2026-04-01",
        ),
        facts_used=[CalculationLine(label=ch.special_statute_name or "Special statute", value=ch.section) for ch in special_charges],
        calculation=[],
        conditions_checked=["Charge-level special-statute flag checked against the configured registry."],
        unresolved_items=["Applicable special conditions (e.g. Section 37 NDPS twin conditions) require case-specific legal review — not evaluated by this engine."],
        explanation=explanation,
        priority="high",
    )


# ---------------------------------------------------------------
# Pathway E — Procedural prerequisite (bail application not yet filed)
# ---------------------------------------------------------------
def evaluate_procedural_prerequisite(c: Case, triggered: list[RuleOutcome]) -> Optional[RuleOutcome]:
    has_eligibility = any(
        o.category in (
            ResultCategory.POTENTIAL_STATUTORY_PATHWAY,
            ResultCategory.POTENTIAL_DEFAULT_BAIL_PATHWAY,
            ResultCategory.UNDERTRIAL_THRESHOLD_REACHED,
        ) for o in triggered
    )
    if not has_eligibility or c.status.bail.previously_applied:
        return None

    return RuleOutcome(
        pathway_id="pathway-e-procedural-prerequisite",
        category=ResultCategory.DISCRETIONARY_JUDICIAL_REVIEW,
        status=PathwayStatus.procedural_action_required,
        headline="BAIL APPLICATION NOT YET FILED",
        summary=(
            "One or more pathways above were flagged, but no bail application has been filed "
            "for this case yet. Filing an application is a procedural prerequisite before any "
            "pathway can be considered by a court."
        ),
        legal_source=SOURCE_GENERIC_BAILABLE,
        facts_used=[CalculationLine(label="Bail previously applied", value="No")],
        calculation=[],
        conditions_checked=["Bail-application status checked against the pathways triggered above."],
        unresolved_items=["No bail application has been filed with the current court for this case."],
        explanation=[
            ExplanationStep(step=1, title="Eligibility condition detected", detail="At least one statutory or procedural pathway was flagged above."),
            ExplanationStep(step=2, title="Application status checked", detail="Case record shows no bail application has been filed yet."),
            ExplanationStep(step=3, title="Result generated", detail="Filing a bail application is surfaced as the required procedural next step."),
        ],
        priority="medium",
    )


# ---------------------------------------------------------------
# Judicial-discretion factors (always surfaced, never scored)
# ---------------------------------------------------------------
def judicial_discretion_factors(c: Case) -> list[str]:
    factors: list[str] = []
    if c.status.multiple_pending_cases:
        factors.append("Multiple pending cases recorded — flight risk and case-linkage require human assessment.")
    if c.status.known_criminal_history == YesNoUnknown.yes:
        factors.append("Known criminal history recorded — requires human assessment.")
    if c.status.known_criminal_history == YesNoUnknown.unknown:
        factors.append("Criminal history not verified — requires human assessment before relying on this pathway.")
    if c.status.bail.previously_rejected:
        factors.append("A prior bail application was rejected — reasons for rejection require human review.")
    if c.status.special_condition_flags:
        factors.append(f"Special condition flag(s) recorded: {', '.join(c.status.special_condition_flags)}.")
    factors.append("Flight risk — requires human assessment.")
    factors.append("Risk of influencing witnesses or evidence — requires human assessment.")
    factors.append("Seriousness of the offence in the specific facts of the case — requires human assessment.")
    return factors


def next_step_for(category: ResultCategory) -> str:
    if category == ResultCategory.ENHANCED_SPECIAL_STATUTE_REVIEW:
        return "Refer to an authorized legal professional experienced in the relevant special statute for case-specific verification."
    if category == ResultCategory.INSUFFICIENT_DATA:
        return "Complete the missing case fields, then re-run the analysis."
    return "Refer to legal-aid provider / authorized legal professional for case-specific verification."


# ---------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------
def run_eligibility_analysis(c: Case) -> EligibilityResult:
    data_quality = assess_data_quality(c)
    custody_days = total_custody_days(c) if c.custody.custody_start_date else None
    undertrial_info = compute_undertrial_threshold(c)
    missing_critical = [
        f for f in data_quality
        if not f.ok and f.field in ("Arrest date", "Charge information", "Custody duration")
    ]

    outcomes: list[RuleOutcome] = []

    if missing_critical:
        outcomes.append(RuleOutcome(
            pathway_id="pathway-insufficient-data",
            category=ResultCategory.INSUFFICIENT_DATA,
            status=PathwayStatus.insufficient_information,
            headline="INSUFFICIENT INFORMATION",
            summary=f"Analysis could not be completed reliably: {', '.join(f.field for f in missing_critical)} missing.",
            legal_source=SOURCE_GENERIC_BAILABLE,
            facts_used=[],
            calculation=[],
            conditions_checked=[],
            unresolved_items=[f.field for f in missing_critical],
            explanation=[ExplanationStep(step=1, title="Data completeness checked", detail="One or more fields required for any rule pathway are missing.")],
            priority="medium",
        ))
    else:
        special = evaluate_special_statute_pathway(c)
        bailable = evaluate_bailable_pathway(c)
        default_bail = evaluate_default_bail_pathway(c)
        undertrial = evaluate_undertrial_threshold_pathway(c)

        for o in (special, bailable, default_bail, undertrial):
            if o:
                outcomes.append(o)

        procedural = evaluate_procedural_prerequisite(c, outcomes)
        if procedural:
            outcomes.append(procedural)

        if not outcomes:
            info = undertrial_info
            outcomes.append(RuleOutcome(
                pathway_id="pathway-not-eligible",
                category=ResultCategory.NOT_CURRENTLY_ELIGIBLE,
                status=PathwayStatus.requires_judicial_review,
                headline="NO PATHWAY IDENTIFIED UNDER CHECKED RULES",
                summary="None of the configured statutory pathways are currently triggered by the facts supplied. This may change as custody continues or as the case progresses.",
                legal_source=SOURCE_GENERIC_BAILABLE,
                facts_used=[CalculationLine(label="Custody completed", value=f"{custody_days} days")],
                calculation=([
                    CalculationLine(label="Applicable §479 threshold", value=f"{info.threshold_days / 365:.2f} years ({info.threshold_days} days)"),
                    CalculationLine(label="Remaining until threshold", value=f"{info.remaining_days} days"),
                ] if info else []),
                conditions_checked=["Bailable, default-bail, undertrial-threshold and special-statute rules were each checked."],
                unresolved_items=[],
                explanation=[ExplanationStep(step=1, title="All configured pathways evaluated", detail="Bailable, default-bail, undertrial-threshold and special-statute rules were each checked and did not trigger.")],
                priority="low",
                remaining_days=info.remaining_days if info and not info.reached else None,
            ))

    primary_candidates = [o for o in outcomes if o.pathway_id != "pathway-e-procedural-prerequisite"]
    categories = {o.category for o in primary_candidates}
    primary_category = (primary_candidates[0].category if primary_candidates
                         else (outcomes[0].category if outcomes else ResultCategory.INSUFFICIENT_DATA))
    if ResultCategory.ENHANCED_SPECIAL_STATUTE_REVIEW in categories:
        primary_category = ResultCategory.ENHANCED_SPECIAL_STATUTE_REVIEW
    elif len(categories) > 2:
        primary_category = ResultCategory.CONFLICTING_MULTIPLE_CASE_FLAGS

    undertrial_visual: Optional[UndertrialVisual] = None
    if undertrial_info and undertrial_info.governing_charge:
        undertrial_visual = UndertrialVisual(
            governing_charge_section=undertrial_info.governing_charge.section,
            max_years=undertrial_info.max_years,
            is_first_time=undertrial_info.is_first_time,
            general_threshold_days=round(undertrial_info.max_years * 365 * 0.5),
            first_time_threshold_days=round(undertrial_info.max_years * 365 * (1 / 3)),
            applicable_threshold_days=undertrial_info.threshold_days,
            custody_days_net=undertrial_info.custody_days_net,
            reached=undertrial_info.reached,
            remaining_days=undertrial_info.remaining_days,
            over_days=undertrial_info.over_days,
        )

    return EligibilityResult(
        analysis_id=f"AN-{c.case_id}-{uuid4().hex[:8].upper()}",
        case_id=c.case_id,
        timestamp=date.today().isoformat(),
        rule_engine_version=RULE_ENGINE_VERSION,
        outcomes=outcomes,
        primary_category=primary_category,
        data_quality=data_quality,
        judicial_factors=judicial_discretion_factors(c),
        next_step=next_step_for(primary_category),
        custody_days=custody_days,
        undertrial=undertrial_visual,
    )
