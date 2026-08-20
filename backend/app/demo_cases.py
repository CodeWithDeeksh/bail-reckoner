"""
SYNTHETIC DEMO DATA ONLY. 30 cases spanning every pathway the rule engine
checks — bailable, default-bail (§187), undertrial threshold (§479, general
and first-time, reached / approaching / not-yet), special statutes (NDPS,
UAPA, PMLA, POCSO, SC/ST Act), multi-charge combinations, conflicting/
multiple simultaneous flags, delay-deduction edge cases, and several
distinct insufficient-data variants. No real prisoner, court, or
law-enforcement data is used anywhere in this prototype.
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


def _days_ago(n: int) -> date | None:
    if n is None:
        return None
    return date.today() - timedelta(days=n)


def _build_demo_cases() -> list[Case]:
    return [
        # 001 — bailable, first-time offender
        Case(
            case_id="BR-2026-001", created_at=_days_ago(2),
            person=Person(person_id="P-001", display_id="Undertrial A.K.", age=29, first_time_offender=YesNoUnknown.yes),
            charges=[Charge(charge_id="C-001-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §303(2) — Theft",
                             offence_name="Theft", max_imprisonment_years=3, is_bailable=YesNoUnknown.yes,
                             compoundability=Compoundability.compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(20), custody_start_date=_days_ago(20), police_custody_days=2, judicial_custody_days=18,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.no),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Bengaluru", case_stage="Investigation",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 002 — default bail (§187), severity below 10y, chargesheet not filed, threshold reached
        Case(
            case_id="BR-2026-002", created_at=_days_ago(3),
            person=Person(person_id="P-002", display_id="Undertrial R.M.", age=34, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-002-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §318(4) — Cheating",
                             offence_name="Cheating", max_imprisonment_years=7, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.compoundable_with_permission, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(64), custody_start_date=_days_ago(64), police_custody_days=4, judicial_custody_days=60,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.no),
            status=CaseStatus(current_court="Additional Sessions Court, Pune", case_stage="Investigation — chargesheet pending",
                               bail=BailApplication(previously_applied=True, previously_rejected=True),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 003 — §479 general threshold reached, +73 days
        Case(
            case_id="BR-2026-003", created_at=_days_ago(5),
            person=Person(person_id="P-003", display_id="Undertrial S.D.", age=41, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-003-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §109 — Attempt to Murder",
                             offence_name="Attempt to Murder", max_imprisonment_years=3, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(621), custody_start_date=_days_ago(621), police_custody_days=5, judicial_custody_days=616,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(560)),
            status=CaseStatus(current_court="Sessions Court, Lucknow", case_stage="Trial — evidence stage",
                               bail=BailApplication(previously_applied=True, previously_rejected=True),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 004 — §479 first-time threshold reached, +15 days
        Case(
            case_id="BR-2026-004", created_at=_days_ago(1),
            person=Person(person_id="P-004", display_id="Undertrial N.P.", age=23, first_time_offender=YesNoUnknown.yes),
            charges=[Charge(charge_id="C-004-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §305 — Theft in a dwelling house",
                             offence_name="Theft in a dwelling house", max_imprisonment_years=3, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.compoundable_with_permission, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(380), custody_start_date=_days_ago(380), police_custody_days=3, judicial_custody_days=377,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(340)),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Nagpur", case_stage="Trial — framing of charges",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 005 — NDPS special statute
        Case(
            case_id="BR-2026-005", created_at=_days_ago(7),
            person=Person(person_id="P-005", display_id="Undertrial V.T.", age=37, first_time_offender=YesNoUnknown.unknown),
            charges=[Charge(charge_id="C-005-1", statute="Narcotic Drugs and Psychotropic Substances Act, 1985",
                             section="NDPS §21(c) — Commercial quantity", offence_name="Possession — commercial quantity",
                             max_imprisonment_years=20, is_bailable=YesNoUnknown.no, compoundability=Compoundability.non_compoundable,
                             is_death_or_life_punishable=False, is_special_statute=True, special_statute_name="NDPS")],
            custody=CustodyRecord(arrest_date=_days_ago(140), custody_start_date=_days_ago(140), police_custody_days=6, judicial_custody_days=134,
                                   accused_delay_status=YesNoUnknown.yes, accused_attributable_delay_days=10, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(100)),
            status=CaseStatus(current_court="Special Court (NDPS), Mumbai", case_stage="Trial — prosecution evidence",
                               bail=BailApplication(previously_applied=True, previously_rejected=True),
                               multiple_pending_cases=True, known_criminal_history=YesNoUnknown.unknown,
                               special_condition_flags=["Commercial quantity — Section 37 NDPS conditions apply"]),
        ),
        # 006 — multi-charge, eligibility + procedural (bail not filed), heavy unresolved items
        Case(
            case_id="BR-2026-006", created_at=_days_ago(1),
            person=Person(person_id="P-006", display_id="Undertrial K.J.", age=31, first_time_offender=YesNoUnknown.unknown),
            charges=[
                Charge(charge_id="C-006-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §262 — Forgery",
                       offence_name="Forgery", max_imprisonment_years=4, is_bailable=YesNoUnknown.no,
                       compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False, is_special_statute=False),
                Charge(charge_id="C-006-2", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §316(2) — Criminal Breach of Trust",
                       offence_name="Criminal breach of trust", max_imprisonment_years=3, is_bailable=YesNoUnknown.no,
                       compoundability=Compoundability.compoundable_with_permission, is_death_or_life_punishable=False, is_special_statute=False),
            ],
            custody=CustodyRecord(arrest_date=_days_ago(760), custody_start_date=_days_ago(760), police_custody_days=5, judicial_custody_days=755,
                                   accused_delay_status=YesNoUnknown.unknown, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(700)),
            status=CaseStatus(current_court="Sessions Court, Ahmedabad", case_stage="Trial — prosecution evidence",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=True, known_criminal_history=YesNoUnknown.unknown,
                               special_condition_flags=["Co-accused absconding — investigation ongoing"]),
        ),
        # 007 — insufficient data: everything missing
        Case(
            case_id="BR-2026-007", created_at=_days_ago(0),
            person=Person(person_id="P-007", display_id="Undertrial (intake incomplete)", age=0, first_time_offender=YesNoUnknown.unknown),
            charges=[],
            custody=CustodyRecord(arrest_date=None, custody_start_date=None, police_custody_days=0, judicial_custody_days=0,
                                   accused_delay_status=YesNoUnknown.unknown, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.unknown),
            status=CaseStatus(current_court="", case_stage="Intake — incomplete",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.unknown, special_condition_flags=[]),
        ),
        # 008 — simple bailable
        Case(
            case_id="BR-2026-008", created_at=_days_ago(1),
            person=Person(person_id="P-008", display_id="Undertrial M.H.", age=26, first_time_offender=YesNoUnknown.yes),
            charges=[Charge(charge_id="C-008-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §115(2) — Voluntarily Causing Hurt",
                             offence_name="Voluntarily causing hurt", max_imprisonment_years=1, is_bailable=YesNoUnknown.yes,
                             compoundability=Compoundability.compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(10), custody_start_date=_days_ago(10), police_custody_days=1, judicial_custody_days=9,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.unknown),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Bengaluru", case_stage="Investigation",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 009 — default bail, severe (>=10y), 90-day threshold reached +5
        Case(
            case_id="BR-2026-009", created_at=_days_ago(4),
            person=Person(person_id="P-009", display_id="Undertrial B.S.", age=33, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-009-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §309(4) — Robbery",
                             offence_name="Robbery", max_imprisonment_years=10, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(95), custody_start_date=_days_ago(95), police_custody_days=5, judicial_custody_days=90,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.no),
            status=CaseStatus(current_court="Sessions Court, Delhi", case_stage="Investigation — chargesheet pending",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 010 — non-bailable, custody well below any threshold: no pathway identified (negative example)
        Case(
            case_id="BR-2026-010", created_at=_days_ago(0),
            person=Person(person_id="P-010", display_id="Undertrial D.G.", age=28, first_time_offender=YesNoUnknown.unknown),
            charges=[Charge(charge_id="C-010-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §310(2) — Dacoity",
                             offence_name="Dacoity", max_imprisonment_years=10, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(40), custody_start_date=_days_ago(40), police_custody_days=6, judicial_custody_days=34,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.no),
            status=CaseStatus(current_court="Sessions Court, Chennai", case_stage="Investigation",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.unknown, special_condition_flags=[]),
        ),
        # 011 — very recent arrest, non-bailable, severe: too early for any pathway
        Case(
            case_id="BR-2026-011", created_at=_days_ago(0),
            person=Person(person_id="P-011", display_id="Undertrial T.R.", age=45, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-011-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §316(5) — Criminal Breach of Trust by Public Servant",
                             offence_name="Criminal breach of trust by public servant", max_imprisonment_years=10, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(5), custody_start_date=_days_ago(5), police_custody_days=2, judicial_custody_days=3,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.no),
            status=CaseStatus(current_court="Special Court (Prevention of Corruption Act), Kolkata", case_stage="Investigation",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 012 — special statute (NDPS) + separate bailable charge: two simultaneous outcomes, special dominates primary
        Case(
            case_id="BR-2026-012", created_at=_days_ago(2),
            person=Person(person_id="P-012", display_id="Undertrial Z.A.", age=30, first_time_offender=YesNoUnknown.unknown),
            charges=[
                Charge(charge_id="C-012-1", statute="Narcotic Drugs and Psychotropic Substances Act, 1985", section="NDPS §22(c) — Commercial quantity, psychotropic substance",
                       offence_name="Possession — commercial quantity", max_imprisonment_years=10, is_bailable=YesNoUnknown.no,
                       compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False, is_special_statute=True, special_statute_name="NDPS"),
                Charge(charge_id="C-012-2", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §303(2) — Theft",
                       offence_name="Theft", max_imprisonment_years=2, is_bailable=YesNoUnknown.yes,
                       compoundability=Compoundability.compoundable, is_death_or_life_punishable=False, is_special_statute=False),
            ],
            custody=CustodyRecord(arrest_date=_days_ago(65), custody_start_date=_days_ago(65), police_custody_days=6, judicial_custody_days=59,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.no),
            status=CaseStatus(current_court="Special Court (NDPS), Srinagar", case_stage="Investigation",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.unknown, special_condition_flags=[]),
        ),
        # 013 — approaching §479 first-time threshold (27 days remaining)
        Case(
            case_id="BR-2026-013", created_at=_days_ago(3),
            person=Person(person_id="P-013", display_id="Undertrial P.K.", age=22, first_time_offender=YesNoUnknown.yes),
            charges=[Charge(charge_id="C-013-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §303(2) — Theft (aggravated)",
                             offence_name="Aggravated theft", max_imprisonment_years=4, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.compoundable_with_permission, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(460), custody_start_date=_days_ago(460), police_custody_days=4, judicial_custody_days=456,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(420)),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Jaipur", case_stage="Trial — evidence stage",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 014 — approaching §479 general threshold (35 days remaining)
        Case(
            case_id="BR-2026-014", created_at=_days_ago(3),
            person=Person(person_id="P-014", display_id="Undertrial G.N.", age=39, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-014-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §303(2) — Theft (aggravated)",
                             offence_name="Aggravated theft", max_imprisonment_years=6, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.compoundable_with_permission, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(1060), custody_start_date=_days_ago(1060), police_custody_days=5, judicial_custody_days=1055,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(1000)),
            status=CaseStatus(current_court="Sessions Court, Patna", case_stage="Trial — evidence stage",
                               bail=BailApplication(previously_applied=True, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 015 — §479 general threshold reached, +22 days
        Case(
            case_id="BR-2026-015", created_at=_days_ago(6),
            person=Person(person_id="P-015", display_id="Undertrial H.L.", age=36, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-015-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §137(2) — Kidnapping",
                             offence_name="Kidnapping", max_imprisonment_years=7, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(1300), custody_start_date=_days_ago(1300), police_custody_days=6, judicial_custody_days=1294,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(1240)),
            status=CaseStatus(current_court="Sessions Court, Bhopal", case_stage="Trial — prosecution evidence",
                               bail=BailApplication(previously_applied=True, previously_rejected=True),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 016 — simple bailable
        Case(
            case_id="BR-2026-016", created_at=_days_ago(1),
            person=Person(person_id="P-016", display_id="Undertrial S.B.", age=24, first_time_offender=YesNoUnknown.yes),
            charges=[Charge(charge_id="C-016-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §331(4) — House-breaking",
                             offence_name="House-breaking", max_imprisonment_years=2, is_bailable=YesNoUnknown.yes,
                             compoundability=Compoundability.compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(5), custody_start_date=_days_ago(5), police_custody_days=1, judicial_custody_days=4,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.unknown),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Guwahati", case_stage="Investigation",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 017 — bailable, but first-time-offender status unknown (data-quality flag alongside an eligible pathway)
        Case(
            case_id="BR-2026-017", created_at=_days_ago(1),
            person=Person(person_id="P-017", display_id="Undertrial Y.C.", age=27, first_time_offender=YesNoUnknown.unknown),
            charges=[Charge(charge_id="C-017-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §351(2) — Criminal Intimidation",
                             offence_name="Criminal intimidation", max_imprisonment_years=2, is_bailable=YesNoUnknown.yes,
                             compoundability=Compoundability.compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(3), custody_start_date=_days_ago(3), police_custody_days=1, judicial_custody_days=2,
                                   accused_delay_status=YesNoUnknown.unknown, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.unknown),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Chandigarh", case_stage="Investigation",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.unknown, special_condition_flags=[]),
        ),
        # 018 — simple bailable
        Case(
            case_id="BR-2026-018", created_at=_days_ago(2),
            person=Person(person_id="P-018", display_id="Undertrial O.W.", age=32, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-018-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §324 — Mischief Causing Damage",
                             offence_name="Mischief causing damage", max_imprisonment_years=2, is_bailable=YesNoUnknown.yes,
                             compoundability=Compoundability.compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(8), custody_start_date=_days_ago(8), police_custody_days=1, judicial_custody_days=7,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(2)),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Indore", case_stage="Investigation",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 019 — UAPA, heavy judicial factors
        Case(
            case_id="BR-2026-019", created_at=_days_ago(10),
            person=Person(person_id="P-019", display_id="Undertrial I.F.", age=35, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-019-1", statute="Unlawful Activities (Prevention) Act, 1967", section="UAPA §13 — Unlawful activities",
                             offence_name="Unlawful activities", max_imprisonment_years=7, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False,
                             is_special_statute=True, special_statute_name="UAPA")],
            custody=CustodyRecord(arrest_date=_days_ago(800), custody_start_date=_days_ago(800), police_custody_days=10, judicial_custody_days=790,
                                   accused_delay_status=YesNoUnknown.unknown, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(720)),
            status=CaseStatus(current_court="Special Court (NIA), Delhi", case_stage="Trial — prosecution evidence",
                               bail=BailApplication(previously_applied=True, previously_rejected=True),
                               multiple_pending_cases=True, known_criminal_history=YesNoUnknown.yes,
                               special_condition_flags=["Section 43D(5) UAPA bail restrictions apply"]),
        ),
        # 020 — PMLA + default bail simultaneously (chargesheet not filed, <10y so 60-day period reached)
        Case(
            case_id="BR-2026-020", created_at=_days_ago(4),
            person=Person(person_id="P-020", display_id="Undertrial C.M.", age=48, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-020-1", statute="Prevention of Money Laundering Act, 2002", section="PMLA §3/4 — Money laundering",
                             offence_name="Money laundering", max_imprisonment_years=7, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False,
                             is_special_statute=True, special_statute_name="PMLA")],
            custody=CustodyRecord(arrest_date=_days_ago(300), custody_start_date=_days_ago(300), police_custody_days=7, judicial_custody_days=293,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.no),
            status=CaseStatus(current_court="Special Court (PMLA), Mumbai", case_stage="Investigation — complaint pending",
                               bail=BailApplication(previously_applied=True, previously_rejected=True),
                               multiple_pending_cases=True, known_criminal_history=YesNoUnknown.unknown,
                               special_condition_flags=["Section 45 PMLA twin conditions apply"]),
        ),
        # 021 — POCSO
        Case(
            case_id="BR-2026-021", created_at=_days_ago(5),
            person=Person(person_id="P-021", display_id="Undertrial E.D.", age=29, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-021-1", statute="Protection of Children from Sexual Offences Act, 2012", section="POCSO §6 — Aggravated penetrative sexual assault",
                             offence_name="Aggravated penetrative sexual assault", max_imprisonment_years=10, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False,
                             is_special_statute=True, special_statute_name="POCSO")],
            custody=CustodyRecord(arrest_date=_days_ago(450), custody_start_date=_days_ago(450), police_custody_days=5, judicial_custody_days=445,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(400)),
            status=CaseStatus(current_court="Special Court (POCSO), Ranchi", case_stage="Trial — prosecution evidence",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no,
                               special_condition_flags=["In-camera trial ordered"]),
        ),
        # 022 — SC/ST Act
        Case(
            case_id="BR-2026-022", created_at=_days_ago(3),
            person=Person(person_id="P-022", display_id="Undertrial J.R.", age=40, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-022-1", statute="Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989",
                             section="SC/ST Act §3(1) — Offences of atrocities", offence_name="Offence of atrocity",
                             max_imprisonment_years=5, is_bailable=YesNoUnknown.no, compoundability=Compoundability.non_compoundable,
                             is_death_or_life_punishable=False, is_special_statute=True, special_statute_name="SC/ST Act")],
            custody=CustodyRecord(arrest_date=_days_ago(200), custody_start_date=_days_ago(200), police_custody_days=4, judicial_custody_days=196,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(160)),
            status=CaseStatus(current_court="Special Court (SC/ST Act), Bhubaneswar", case_stage="Trial — framing of charges",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 023 — multi-charge: one bailable + one non-bailable, bailable pathway triggers
        Case(
            case_id="BR-2026-023", created_at=_days_ago(1),
            person=Person(person_id="P-023", display_id="Undertrial L.V.", age=25, first_time_offender=YesNoUnknown.yes),
            charges=[
                Charge(charge_id="C-023-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §318(4) — Cheating",
                       offence_name="Cheating", max_imprisonment_years=7, is_bailable=YesNoUnknown.no,
                       compoundability=Compoundability.compoundable_with_permission, is_death_or_life_punishable=False, is_special_statute=False),
                Charge(charge_id="C-023-2", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §303(2) — Theft",
                       offence_name="Theft", max_imprisonment_years=3, is_bailable=YesNoUnknown.yes,
                       compoundability=Compoundability.compoundable, is_death_or_life_punishable=False, is_special_statute=False),
            ],
            custody=CustodyRecord(arrest_date=_days_ago(15), custody_start_date=_days_ago(15), police_custody_days=2, judicial_custody_days=13,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.no),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Shimla", case_stage="Investigation",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 024 — multi-charge, both non-bailable, default bail (90-day) reached +2 via the severe charge
        Case(
            case_id="BR-2026-024", created_at=_days_ago(4),
            person=Person(person_id="P-024", display_id="Undertrial W.Q.", age=38, first_time_offender=YesNoUnknown.no),
            charges=[
                Charge(charge_id="C-024-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §309(4) — Robbery",
                       offence_name="Robbery", max_imprisonment_years=10, is_bailable=YesNoUnknown.no,
                       compoundability=Compoundability.non_compoundable, is_death_or_life_punishable=False, is_special_statute=False),
                Charge(charge_id="C-024-2", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §303(2) — Theft",
                       offence_name="Theft", max_imprisonment_years=3, is_bailable=YesNoUnknown.no,
                       compoundability=Compoundability.compoundable_with_permission, is_death_or_life_punishable=False, is_special_statute=False),
            ],
            custody=CustodyRecord(arrest_date=_days_ago(92), custody_start_date=_days_ago(92), police_custody_days=6, judicial_custody_days=86,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.no),
            status=CaseStatus(current_court="Sessions Court, Dehradun", case_stage="Investigation — chargesheet pending",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 025 — bailable pathway but heavy judicial-discretion factors (priors, criminal history, special flags)
        Case(
            case_id="BR-2026-025", created_at=_days_ago(2),
            person=Person(person_id="P-025", display_id="Undertrial X.S.", age=44, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-025-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §303(2) — Theft",
                             offence_name="Theft", max_imprisonment_years=3, is_bailable=YesNoUnknown.yes,
                             compoundability=Compoundability.compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(30), custody_start_date=_days_ago(30), police_custody_days=3, judicial_custody_days=27,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.unknown),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Amaravati", case_stage="Investigation",
                               bail=BailApplication(previously_applied=True, previously_rejected=True),
                               multiple_pending_cases=True, known_criminal_history=YesNoUnknown.yes,
                               special_condition_flags=["Absconding risk flagged by investigating officer"]),
        ),
        # 026 — accused-attributable delay deduction is the deciding factor: raw custody > threshold, net custody < threshold
        Case(
            case_id="BR-2026-026", created_at=_days_ago(2),
            person=Person(person_id="P-026", display_id="Undertrial F.T.", age=21, first_time_offender=YesNoUnknown.yes),
            charges=[Charge(charge_id="C-026-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §303(2) — Theft (aggravated)",
                             offence_name="Aggravated theft", max_imprisonment_years=3, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.compoundable_with_permission, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(400), custody_start_date=_days_ago(400), police_custody_days=4, judicial_custody_days=396,
                                   accused_delay_status=YesNoUnknown.yes, accused_attributable_delay_days=40, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(360)),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Panaji", case_stage="Trial — evidence stage",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 027 — accused-attributable delay status unknown, approaching threshold, unresolved item surfaced
        Case(
            case_id="BR-2026-027", created_at=_days_ago(3),
            person=Person(person_id="P-027", display_id="Undertrial Q.U.", age=42, first_time_offender=YesNoUnknown.no),
            charges=[Charge(charge_id="C-027-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §318(4) — Cheating (aggravated)",
                             offence_name="Aggravated cheating", max_imprisonment_years=5, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.compoundable_with_permission, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(899), custody_start_date=_days_ago(899), police_custody_days=5, judicial_custody_days=894,
                                   accused_delay_status=YesNoUnknown.unknown, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.yes,
                                   chargesheet_date=_days_ago(850)),
            status=CaseStatus(current_court="Sessions Court, Shillong", case_stage="Trial — evidence stage",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
        # 028 — insufficient data variant: charges present, custody dates missing
        Case(
            case_id="BR-2026-028", created_at=_days_ago(0),
            person=Person(person_id="P-028", display_id="Undertrial (custody data pending)", age=31, first_time_offender=YesNoUnknown.unknown),
            charges=[Charge(charge_id="C-028-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §303(2) — Theft",
                             offence_name="Theft", max_imprisonment_years=3, is_bailable=YesNoUnknown.no,
                             compoundability=Compoundability.compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=None, custody_start_date=None, police_custody_days=0, judicial_custody_days=0,
                                   accused_delay_status=YesNoUnknown.unknown, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.unknown),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Raipur", case_stage="Intake — custody record pending",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.unknown, special_condition_flags=[]),
        ),
        # 029 — insufficient data variant: custody dates present, no charges recorded yet
        Case(
            case_id="BR-2026-029", created_at=_days_ago(0),
            person=Person(person_id="P-029", display_id="Undertrial (charge sheet pending entry)", age=27, first_time_offender=YesNoUnknown.unknown),
            charges=[],
            custody=CustodyRecord(arrest_date=_days_ago(12), custody_start_date=_days_ago(12), police_custody_days=2, judicial_custody_days=10,
                                   accused_delay_status=YesNoUnknown.unknown, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.unknown),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Agartala", case_stage="Intake — charge details pending",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.unknown, special_condition_flags=[]),
        ),
        # 030 — clean simple case + procedural (bail not yet filed) — good closing/demo case
        Case(
            case_id="BR-2026-030", created_at=_days_ago(1),
            person=Person(person_id="P-030", display_id="Undertrial N.A.", age=24, first_time_offender=YesNoUnknown.yes),
            charges=[Charge(charge_id="C-030-1", statute="Bharatiya Nyaya Sanhita, 2023", section="BNS §303(2) — Theft",
                             offence_name="Theft", max_imprisonment_years=3, is_bailable=YesNoUnknown.yes,
                             compoundability=Compoundability.compoundable, is_death_or_life_punishable=False, is_special_statute=False)],
            custody=CustodyRecord(arrest_date=_days_ago(6), custody_start_date=_days_ago(6), police_custody_days=1, judicial_custody_days=5,
                                   accused_delay_status=YesNoUnknown.no, accused_attributable_delay_days=0, chargesheet_filed=YesNoUnknown.unknown),
            status=CaseStatus(current_court="Judicial Magistrate First Class, Jammu", case_stage="Investigation",
                               bail=BailApplication(previously_applied=False, previously_rejected=False),
                               multiple_pending_cases=False, known_criminal_history=YesNoUnknown.no, special_condition_flags=[]),
        ),
    ]


DEMO_CASES: list[Case] = _build_demo_cases()


def get_demo_case(case_id: str) -> Case | None:
    return next((c for c in DEMO_CASES if c.case_id == case_id), None)
