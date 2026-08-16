"""
SYNTHETIC DEMO DATA ONLY. Mirrors src/data/demoCases.ts so the same 7
scenarios are available whether the frontend calls this backend or uses
its own in-memory TypeScript copy.
"""

from __future__ import annotations

from datetime import date, timedelta

from .models import (
    BailApplication,
    Case,
    CaseStatus,
    Charge,
    Compoundability,
    CustodyRecord,
    Person,
    YesNoUnknown,
)


def _days_ago(n: int) -> date:
    return date.today() - timedelta(days=n)


def _build_demo_cases() -> list[Case]:
    return [
        Case(
            case_id="BR-2026-001",
            created_at=_days_ago(2),
            person=Person(person_id="P-001", display_id="Undertrial A.K.", age=29, first_time_offender=YesNoUnknown.yes),
            charges=[Charge(
                charge_id="C-001-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §303(2) — Theft",
                offence_name="Theft", max_imprisonment_years=3, is_bailable=YesNoUnknown.yes,
                compoundability=Compoundability.compoundable, is_death_or_life_punishable=False, is_special_statute=False,
            )],
            custody=CustodyRecord(
                arrest_date=_days_ago(20), custody_start_date=_days_ago(20), police_custody_days=2, judicial_custody_days=18,
                accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.no,
            ),
            status=CaseStatus(
                current_court="Judicial Magistrate First Class, Bengaluru", case_stage="Investigation",
                bail=BailApplication(previously_applied=False, previously_rejected=False),
                multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[],
            ),
        ),
        Case(
            case_id="BR-2026-002",
            created_at=_days_ago(3),
            person=Person(person_id="P-002", display_id="Undertrial R.M.", age=34, first_time_offender=YesNoUnknown.no),
            charges=[Charge(
                charge_id="C-002-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §318(4) — Cheating",
                offence_name="Cheating", max_imprisonment_years=7, is_bailable=YesNoUnknown.no,
                compoundability=Compoundability.compoundable_with_permission, is_death_or_life_punishable=False, is_special_statute=False,
            )],
            custody=CustodyRecord(
                arrest_date=_days_ago(64), custody_start_date=_days_ago(64), police_custody_days=4, judicial_custody_days=60,
                accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.no,
            ),
            status=CaseStatus(
                current_court="Additional Sessions Court, Pune", case_stage="Investigation — chargesheet pending",
                bail=BailApplication(previously_applied=True, previously_rejected=True),
                multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[],
            ),
        ),
        Case(
            case_id="BR-2026-003",
            created_at=_days_ago(5),
            person=Person(person_id="P-003", display_id="Undertrial S.D.", age=41, first_time_offender=YesNoUnknown.no),
            charges=[Charge(
                charge_id="C-003-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §109 — Attempt to Murder",
                offence_name="Attempt to Murder", max_imprisonment_years=3, is_bailable=YesNoUnknown.no,
                compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False, is_special_statute=False,
            )],
            custody=CustodyRecord(
                arrest_date=_days_ago(621), custody_start_date=_days_ago(621), police_custody_days=5, judicial_custody_days=616,
                accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                chargesheet_date=_days_ago(560),
            ),
            status=CaseStatus(
                current_court="Sessions Court, Lucknow", case_stage="Trial — evidence stage",
                bail=BailApplication(previously_applied=True, previously_rejected=True),
                multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[],
            ),
        ),
        Case(
            case_id="BR-2026-004",
            created_at=_days_ago(1),
            person=Person(person_id="P-004", display_id="Undertrial N.P.", age=23, first_time_offender=YesNoUnknown.yes),
            charges=[Charge(
                charge_id="C-004-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §305 — Theft in a dwelling house",
                offence_name="Theft in a dwelling house", max_imprisonment_years=3, is_bailable=YesNoUnknown.no,
                compoundability=Compoundability.compoundable_with_permission, is_death_or_life_punishable=False, is_special_statute=False,
            )],
            custody=CustodyRecord(
                arrest_date=_days_ago(380), custody_start_date=_days_ago(380), police_custody_days=3, judicial_custody_days=377,
                accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                chargesheet_date=_days_ago(340),
            ),
            status=CaseStatus(
                current_court="Judicial Magistrate First Class, Nagpur", case_stage="Trial — framing of charges",
                bail=BailApplication(previously_applied=False, previously_rejected=False),
                multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[],
            ),
        ),
        Case(
            case_id="BR-2026-005",
            created_at=_days_ago(7),
            person=Person(person_id="P-005", display_id="Undertrial V.T.", age=37, first_time_offender=YesNoUnknown.unknown),
            charges=[Charge(
                charge_id="C-005-1", statute="Narcotic Drugs and Psychotropic Substances Act, 1985",
                section="NDPS §21(c) — Commercial quantity", offence_name="Possession — commercial quantity",
                max_imprisonment_years=20, is_bailable=YesNoUnknown.no, compoundability=Compoundability.non_compoundable,
                is_death_or_life_punishable=False, is_special_statute=True, special_statute_name="NDPS",
            )],
            custody=CustodyRecord(
                arrest_date=_days_ago(140), custody_start_date=_days_ago(140), police_custody_days=6, judicial_custody_days=134,
                accused_delay_status=YesNoUnknown.yes, accused_attributable_delay_days=10, chargesheet_filed=YesNoUnknown.yes,
                chargesheet_date=_days_ago(100),
            ),
            status=CaseStatus(
                current_court="Special Court (NDPS), Mumbai", case_stage="Trial — prosecution evidence",
                bail=BailApplication(previously_applied=True, previously_rejected=True),
                multiple_pending_cases=True, known_criminal_history=YesNoUnknown.unknown,
                special_condition_flags=["Commercial quantity — Section 37 NDPS conditions apply"],
            ),
        ),
        Case(
            case_id="BR-2026-006",
            created_at=_days_ago(1),
            person=Person(person_id="P-006", display_id="Undertrial K.J.", age=31, first_time_offender=YesNoUnknown.unknown),
            charges=[
                Charge(
                    charge_id="C-006-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §262 — Forgery",
                    offence_name="Forgery", max_imprisonment_years=4, is_bailable=YesNoUnknown.no,
                    compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False, is_special_statute=False,
                ),
                Charge(
                    charge_id="C-006-2", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §316(2) — Criminal Breach of Trust",
                    offence_name="Criminal breach of trust", max_imprisonment_years=3, is_bailable=YesNoUnknown.no,
                    compoundability=Compoundability.compoundable_with_permission, is_death_or_life_punishable=False, is_special_statute=False,
                ),
            ],
            custody=CustodyRecord(
                arrest_date=_days_ago(760), custody_start_date=_days_ago(760), police_custody_days=5, judicial_custody_days=755,
                accused_delay_status=YesNoUnknown.unknown, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                chargesheet_date=_days_ago(700),
            ),
            status=CaseStatus(
                current_court="Sessions Court, Ahmedabad", case_stage="Trial — prosecution evidence",
                bail=BailApplication(previously_applied=False, previously_rejected=False),
                multiple_pending_cases=True, known_criminal_history=YesNoUnknown.unknown,
                special_condition_flags=["Co-accused absconding — investigation ongoing"],
            ),
        ),
        Case(
            case_id="BR-2026-007",
            created_at=date.today(),
            person=Person(person_id="P-007", display_id="Undertrial (intake incomplete)", age=0, first_time_offender=YesNoUnknown.unknown),
            charges=[],
            custody=CustodyRecord(
                arrest_date=None, custody_start_date=None, police_custody_days=0, judicial_custody_days=0,
                accused_delay_status=YesNoUnknown.unknown, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.unknown,
            ),
            status=CaseStatus(
                current_court="", case_stage="Intake — incomplete",
                bail=BailApplication(previously_applied=False, previously_rejected=False),
                multiple_pending_cases=False, known_criminal_history=YesNoUnknown.unknown, special_condition_flags=[],
            ),
        ),
    ]


DEMO_CASES: list[Case] = _build_demo_cases()
