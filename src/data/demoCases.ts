import type { Case } from "../types";

// ============================================================
// SYNTHETIC DEMO DATA ONLY. Pure form-fill data for the "Load demo case"
// dropdown in the Analyzer — this is NEVER used to compute a result. The
// authoritative version of these same 30 cases lives in the backend
// (backend/app/demo_cases.py) and is what the rule engine actually runs
// against once you hit "Run Bail Analysis".
// ============================================================

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const DEMO_CASES: Case[] = [
  {
    caseId: "BR-2026-001", createdAt: daysAgo(2),
    person: { personId: "P-001", displayId: "Undertrial A.K.", age: 29, firstTimeOffender: "yes" },
    charges: [{ chargeId: "C-001-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §303(2) — Theft", offenceName: "Theft", maxImprisonmentYears: 3, isBailable: "yes", compoundability: "compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(20), custodyStartDate: daysAgo(20), policeCustodyDays: 2, judicialCustodyDays: 18, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "no" },
    status: { currentCourt: "Judicial Magistrate First Class, Bengaluru", caseStage: "Investigation", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-002", createdAt: daysAgo(3),
    person: { personId: "P-002", displayId: "Undertrial R.M.", age: 34, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-002-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §318(4) — Cheating", offenceName: "Cheating", maxImprisonmentYears: 7, isBailable: "no", compoundability: "compoundable_with_permission", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(64), custodyStartDate: daysAgo(64), policeCustodyDays: 4, judicialCustodyDays: 60, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "no" },
    status: { currentCourt: "Additional Sessions Court, Pune", caseStage: "Investigation — chargesheet pending", bail: { previouslyApplied: true, previouslyRejected: true }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-003", createdAt: daysAgo(5),
    person: { personId: "P-003", displayId: "Undertrial S.D.", age: 41, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-003-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §109 — Attempt to Murder", offenceName: "Attempt to Murder", maxImprisonmentYears: 3, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(621), custodyStartDate: daysAgo(621), policeCustodyDays: 5, judicialCustodyDays: 616, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "yes", chargesheetDate: daysAgo(560) },
    status: { currentCourt: "Sessions Court, Lucknow", caseStage: "Trial — evidence stage", bail: { previouslyApplied: true, previouslyRejected: true }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-004", createdAt: daysAgo(1),
    person: { personId: "P-004", displayId: "Undertrial N.P.", age: 23, firstTimeOffender: "yes" },
    charges: [{ chargeId: "C-004-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §305 — Theft in a dwelling house", offenceName: "Theft in a dwelling house", maxImprisonmentYears: 3, isBailable: "no", compoundability: "compoundable_with_permission", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(380), custodyStartDate: daysAgo(380), policeCustodyDays: 3, judicialCustodyDays: 377, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "yes", chargesheetDate: daysAgo(340) },
    status: { currentCourt: "Judicial Magistrate First Class, Nagpur", caseStage: "Trial — framing of charges", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-005", createdAt: daysAgo(7),
    person: { personId: "P-005", displayId: "Undertrial V.T.", age: 37, firstTimeOffender: "unknown" },
    charges: [{ chargeId: "C-005-1", statute: "Narcotic Drugs and Psychotropic Substances Act, 1985", section: "NDPS §21(c) — Commercial quantity", offenceName: "Possession — commercial quantity", maxImprisonmentYears: 20, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: true, specialStatuteName: "NDPS" }],
    custody: { arrestDate: daysAgo(140), custodyStartDate: daysAgo(140), policeCustodyDays: 6, judicialCustodyDays: 134, accusedDelayStatus: "yes", accusedAttributableDelayDays: 10, chargesheetFiled: "yes", chargesheetDate: daysAgo(100) },
    status: { currentCourt: "Special Court (NDPS), Mumbai", caseStage: "Trial — prosecution evidence", bail: { previouslyApplied: true, previouslyRejected: true }, multiplePendingCases: true, knownCriminalHistory: "unknown", specialConditionFlags: ["Commercial quantity — Section 37 NDPS conditions apply"] },
  },
  {
    caseId: "BR-2026-006", createdAt: daysAgo(1),
    person: { personId: "P-006", displayId: "Undertrial K.J.", age: 31, firstTimeOffender: "unknown" },
    charges: [
      { chargeId: "C-006-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §262 — Forgery", offenceName: "Forgery", maxImprisonmentYears: 4, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false },
      { chargeId: "C-006-2", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §316(2) — Criminal Breach of Trust", offenceName: "Criminal breach of trust", maxImprisonmentYears: 3, isBailable: "no", compoundability: "compoundable_with_permission", isDeathOrLifePunishable: false, isSpecialStatute: false },
    ],
    custody: { arrestDate: daysAgo(760), custodyStartDate: daysAgo(760), policeCustodyDays: 5, judicialCustodyDays: 755, accusedDelayStatus: "unknown", accusedAttributableDelayDays: 0, chargesheetFiled: "yes", chargesheetDate: daysAgo(700) },
    status: { currentCourt: "Sessions Court, Ahmedabad", caseStage: "Trial — prosecution evidence", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: true, knownCriminalHistory: "unknown", specialConditionFlags: ["Co-accused absconding — investigation ongoing"] },
  },
  {
    caseId: "BR-2026-007", createdAt: daysAgo(0),
    person: { personId: "P-007", displayId: "Undertrial (intake incomplete)", age: 0, firstTimeOffender: "unknown" },
    charges: [],
    custody: { arrestDate: "", custodyStartDate: "", policeCustodyDays: 0, judicialCustodyDays: 0, accusedDelayStatus: "unknown", accusedAttributableDelayDays: 0, chargesheetFiled: "unknown" },
    status: { currentCourt: "", caseStage: "Intake — incomplete", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "unknown", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-008", createdAt: daysAgo(1),
    person: { personId: "P-008", displayId: "Undertrial M.H.", age: 26, firstTimeOffender: "yes" },
    charges: [{ chargeId: "C-008-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §115(2) — Voluntarily Causing Hurt", offenceName: "Voluntarily causing hurt", maxImprisonmentYears: 1, isBailable: "yes", compoundability: "compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(10), custodyStartDate: daysAgo(10), policeCustodyDays: 1, judicialCustodyDays: 9, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "unknown" },
    status: { currentCourt: "Judicial Magistrate First Class, Bengaluru", caseStage: "Investigation", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-009", createdAt: daysAgo(4),
    person: { personId: "P-009", displayId: "Undertrial B.S.", age: 33, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-009-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §309(4) — Robbery", offenceName: "Robbery", maxImprisonmentYears: 10, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(95), custodyStartDate: daysAgo(95), policeCustodyDays: 5, judicialCustodyDays: 90, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "no" },
    status: { currentCourt: "Sessions Court, Delhi", caseStage: "Investigation — chargesheet pending", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-010", createdAt: daysAgo(0),
    person: { personId: "P-010", displayId: "Undertrial D.G.", age: 28, firstTimeOffender: "unknown" },
    charges: [{ chargeId: "C-010-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §310(2) — Dacoity", offenceName: "Dacoity", maxImprisonmentYears: 10, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(40), custodyStartDate: daysAgo(40), policeCustodyDays: 6, judicialCustodyDays: 34, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "no" },
    status: { currentCourt: "Sessions Court, Chennai", caseStage: "Investigation", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "unknown", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-011", createdAt: daysAgo(0),
    person: { personId: "P-011", displayId: "Undertrial T.R.", age: 45, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-011-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §316(5) — Criminal Breach of Trust by Public Servant", offenceName: "Criminal breach of trust by public servant", maxImprisonmentYears: 10, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(5), custodyStartDate: daysAgo(5), policeCustodyDays: 2, judicialCustodyDays: 3, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "no" },
    status: { currentCourt: "Special Court (Prevention of Corruption Act), Kolkata", caseStage: "Investigation", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-012", createdAt: daysAgo(2),
    person: { personId: "P-012", displayId: "Undertrial Z.A.", age: 30, firstTimeOffender: "unknown" },
    charges: [
      { chargeId: "C-012-1", statute: "Narcotic Drugs and Psychotropic Substances Act, 1985", section: "NDPS §22(c) — Commercial quantity, psychotropic substance", offenceName: "Possession — commercial quantity", maxImprisonmentYears: 10, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: true, specialStatuteName: "NDPS" },
      { chargeId: "C-012-2", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §303(2) — Theft", offenceName: "Theft", maxImprisonmentYears: 2, isBailable: "yes", compoundability: "compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false },
    ],
    custody: { arrestDate: daysAgo(65), custodyStartDate: daysAgo(65), policeCustodyDays: 6, judicialCustodyDays: 59, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "no" },
    status: { currentCourt: "Special Court (NDPS), Srinagar", caseStage: "Investigation", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "unknown", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-013", createdAt: daysAgo(3),
    person: { personId: "P-013", displayId: "Undertrial P.K.", age: 22, firstTimeOffender: "yes" },
    charges: [{ chargeId: "C-013-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §303(2) — Theft (aggravated)", offenceName: "Aggravated theft", maxImprisonmentYears: 4, isBailable: "no", compoundability: "compoundable_with_permission", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(460), custodyStartDate: daysAgo(460), policeCustodyDays: 4, judicialCustodyDays: 456, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "yes", chargesheetDate: daysAgo(420) },
    status: { currentCourt: "Judicial Magistrate First Class, Jaipur", caseStage: "Trial — evidence stage", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-014", createdAt: daysAgo(3),
    person: { personId: "P-014", displayId: "Undertrial G.N.", age: 39, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-014-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §303(2) — Theft (aggravated)", offenceName: "Aggravated theft", maxImprisonmentYears: 6, isBailable: "no", compoundability: "compoundable_with_permission", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(1060), custodyStartDate: daysAgo(1060), policeCustodyDays: 5, judicialCustodyDays: 1055, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "yes", chargesheetDate: daysAgo(1000) },
    status: { currentCourt: "Sessions Court, Patna", caseStage: "Trial — evidence stage", bail: { previouslyApplied: true, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-015", createdAt: daysAgo(6),
    person: { personId: "P-015", displayId: "Undertrial H.L.", age: 36, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-015-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §137(2) — Kidnapping", offenceName: "Kidnapping", maxImprisonmentYears: 7, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(1300), custodyStartDate: daysAgo(1300), policeCustodyDays: 6, judicialCustodyDays: 1294, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "yes", chargesheetDate: daysAgo(1240) },
    status: { currentCourt: "Sessions Court, Bhopal", caseStage: "Trial — prosecution evidence", bail: { previouslyApplied: true, previouslyRejected: true }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-016", createdAt: daysAgo(1),
    person: { personId: "P-016", displayId: "Undertrial S.B.", age: 24, firstTimeOffender: "yes" },
    charges: [{ chargeId: "C-016-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §331(4) — House-breaking", offenceName: "House-breaking", maxImprisonmentYears: 2, isBailable: "yes", compoundability: "compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(5), custodyStartDate: daysAgo(5), policeCustodyDays: 1, judicialCustodyDays: 4, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "unknown" },
    status: { currentCourt: "Judicial Magistrate First Class, Guwahati", caseStage: "Investigation", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-017", createdAt: daysAgo(1),
    person: { personId: "P-017", displayId: "Undertrial Y.C.", age: 27, firstTimeOffender: "unknown" },
    charges: [{ chargeId: "C-017-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §351(2) — Criminal Intimidation", offenceName: "Criminal intimidation", maxImprisonmentYears: 2, isBailable: "yes", compoundability: "compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(3), custodyStartDate: daysAgo(3), policeCustodyDays: 1, judicialCustodyDays: 2, accusedDelayStatus: "unknown", accusedAttributableDelayDays: 0, chargesheetFiled: "unknown" },
    status: { currentCourt: "Judicial Magistrate First Class, Chandigarh", caseStage: "Investigation", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "unknown", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-018", createdAt: daysAgo(2),
    person: { personId: "P-018", displayId: "Undertrial O.W.", age: 32, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-018-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §324 — Mischief Causing Damage", offenceName: "Mischief causing damage", maxImprisonmentYears: 2, isBailable: "yes", compoundability: "compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(8), custodyStartDate: daysAgo(8), policeCustodyDays: 1, judicialCustodyDays: 7, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "yes", chargesheetDate: daysAgo(2) },
    status: { currentCourt: "Judicial Magistrate First Class, Indore", caseStage: "Investigation", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-019", createdAt: daysAgo(10),
    person: { personId: "P-019", displayId: "Undertrial I.F.", age: 35, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-019-1", statute: "Unlawful Activities (Prevention) Act, 1967", section: "UAPA §13 — Unlawful activities", offenceName: "Unlawful activities", maxImprisonmentYears: 7, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: true, specialStatuteName: "UAPA" }],
    custody: { arrestDate: daysAgo(800), custodyStartDate: daysAgo(800), policeCustodyDays: 10, judicialCustodyDays: 790, accusedDelayStatus: "unknown", accusedAttributableDelayDays: 0, chargesheetFiled: "yes", chargesheetDate: daysAgo(720) },
    status: { currentCourt: "Special Court (NIA), Delhi", caseStage: "Trial — prosecution evidence", bail: { previouslyApplied: true, previouslyRejected: true }, multiplePendingCases: true, knownCriminalHistory: "yes", specialConditionFlags: ["Section 43D(5) UAPA bail restrictions apply"] },
  },
  {
    caseId: "BR-2026-020", createdAt: daysAgo(4),
    person: { personId: "P-020", displayId: "Undertrial C.M.", age: 48, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-020-1", statute: "Prevention of Money Laundering Act, 2002", section: "PMLA §3/4 — Money laundering", offenceName: "Money laundering", maxImprisonmentYears: 7, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: true, specialStatuteName: "PMLA" }],
    custody: { arrestDate: daysAgo(300), custodyStartDate: daysAgo(300), policeCustodyDays: 7, judicialCustodyDays: 293, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "no" },
    status: { currentCourt: "Special Court (PMLA), Mumbai", caseStage: "Investigation — complaint pending", bail: { previouslyApplied: true, previouslyRejected: true }, multiplePendingCases: true, knownCriminalHistory: "unknown", specialConditionFlags: ["Section 45 PMLA twin conditions apply"] },
  },
  {
    caseId: "BR-2026-021", createdAt: daysAgo(5),
    person: { personId: "P-021", displayId: "Undertrial E.D.", age: 29, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-021-1", statute: "Protection of Children from Sexual Offences Act, 2012", section: "POCSO §6 — Aggravated penetrative sexual assault", offenceName: "Aggravated penetrative sexual assault", maxImprisonmentYears: 10, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: true, specialStatuteName: "POCSO" }],
    custody: { arrestDate: daysAgo(450), custodyStartDate: daysAgo(450), policeCustodyDays: 5, judicialCustodyDays: 445, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "yes", chargesheetDate: daysAgo(400) },
    status: { currentCourt: "Special Court (POCSO), Ranchi", caseStage: "Trial — prosecution evidence", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: ["In-camera trial ordered"] },
  },
  {
    caseId: "BR-2026-022", createdAt: daysAgo(3),
    person: { personId: "P-022", displayId: "Undertrial J.R.", age: 40, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-022-1", statute: "Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989", section: "SC/ST Act §3(1) — Offences of atrocities", offenceName: "Offence of atrocity", maxImprisonmentYears: 5, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: true, specialStatuteName: "SC/ST Act" }],
    custody: { arrestDate: daysAgo(200), custodyStartDate: daysAgo(200), policeCustodyDays: 4, judicialCustodyDays: 196, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "yes", chargesheetDate: daysAgo(160) },
    status: { currentCourt: "Special Court (SC/ST Act), Bhubaneswar", caseStage: "Trial — framing of charges", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-023", createdAt: daysAgo(1),
    person: { personId: "P-023", displayId: "Undertrial L.V.", age: 25, firstTimeOffender: "yes" },
    charges: [
      { chargeId: "C-023-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §318(4) — Cheating", offenceName: "Cheating", maxImprisonmentYears: 7, isBailable: "no", compoundability: "compoundable_with_permission", isDeathOrLifePunishable: false, isSpecialStatute: false },
      { chargeId: "C-023-2", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §303(2) — Theft", offenceName: "Theft", maxImprisonmentYears: 3, isBailable: "yes", compoundability: "compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false },
    ],
    custody: { arrestDate: daysAgo(15), custodyStartDate: daysAgo(15), policeCustodyDays: 2, judicialCustodyDays: 13, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "no" },
    status: { currentCourt: "Judicial Magistrate First Class, Shimla", caseStage: "Investigation", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-024", createdAt: daysAgo(4),
    person: { personId: "P-024", displayId: "Undertrial W.Q.", age: 38, firstTimeOffender: "no" },
    charges: [
      { chargeId: "C-024-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §309(4) — Robbery", offenceName: "Robbery", maxImprisonmentYears: 10, isBailable: "no", compoundability: "non_compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false },
      { chargeId: "C-024-2", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §303(2) — Theft", offenceName: "Theft", maxImprisonmentYears: 3, isBailable: "no", compoundability: "compoundable_with_permission", isDeathOrLifePunishable: false, isSpecialStatute: false },
    ],
    custody: { arrestDate: daysAgo(92), custodyStartDate: daysAgo(92), policeCustodyDays: 6, judicialCustodyDays: 86, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "no" },
    status: { currentCourt: "Sessions Court, Dehradun", caseStage: "Investigation — chargesheet pending", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-025", createdAt: daysAgo(2),
    person: { personId: "P-025", displayId: "Undertrial X.S.", age: 44, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-025-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §303(2) — Theft", offenceName: "Theft", maxImprisonmentYears: 3, isBailable: "yes", compoundability: "compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(30), custodyStartDate: daysAgo(30), policeCustodyDays: 3, judicialCustodyDays: 27, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "unknown" },
    status: { currentCourt: "Judicial Magistrate First Class, Amaravati", caseStage: "Investigation", bail: { previouslyApplied: true, previouslyRejected: true }, multiplePendingCases: true, knownCriminalHistory: "yes", specialConditionFlags: ["Absconding risk flagged by investigating officer"] },
  },
  {
    caseId: "BR-2026-026", createdAt: daysAgo(2),
    person: { personId: "P-026", displayId: "Undertrial F.T.", age: 21, firstTimeOffender: "yes" },
    charges: [{ chargeId: "C-026-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §303(2) — Theft (aggravated)", offenceName: "Aggravated theft", maxImprisonmentYears: 3, isBailable: "no", compoundability: "compoundable_with_permission", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(400), custodyStartDate: daysAgo(400), policeCustodyDays: 4, judicialCustodyDays: 396, accusedDelayStatus: "yes", accusedAttributableDelayDays: 40, chargesheetFiled: "yes", chargesheetDate: daysAgo(360) },
    status: { currentCourt: "Judicial Magistrate First Class, Panaji", caseStage: "Trial — evidence stage", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-027", createdAt: daysAgo(3),
    person: { personId: "P-027", displayId: "Undertrial Q.U.", age: 42, firstTimeOffender: "no" },
    charges: [{ chargeId: "C-027-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §318(4) — Cheating (aggravated)", offenceName: "Aggravated cheating", maxImprisonmentYears: 5, isBailable: "no", compoundability: "compoundable_with_permission", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(899), custodyStartDate: daysAgo(899), policeCustodyDays: 5, judicialCustodyDays: 894, accusedDelayStatus: "unknown", accusedAttributableDelayDays: 0, chargesheetFiled: "yes", chargesheetDate: daysAgo(850) },
    status: { currentCourt: "Sessions Court, Shillong", caseStage: "Trial — evidence stage", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-028", createdAt: daysAgo(0),
    person: { personId: "P-028", displayId: "Undertrial (custody data pending)", age: 31, firstTimeOffender: "unknown" },
    charges: [{ chargeId: "C-028-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §303(2) — Theft", offenceName: "Theft", maxImprisonmentYears: 3, isBailable: "no", compoundability: "compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: "", custodyStartDate: "", policeCustodyDays: 0, judicialCustodyDays: 0, accusedDelayStatus: "unknown", accusedAttributableDelayDays: 0, chargesheetFiled: "unknown" },
    status: { currentCourt: "Judicial Magistrate First Class, Raipur", caseStage: "Intake — custody record pending", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "unknown", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-029", createdAt: daysAgo(0),
    person: { personId: "P-029", displayId: "Undertrial (charge sheet pending entry)", age: 27, firstTimeOffender: "unknown" },
    charges: [],
    custody: { arrestDate: daysAgo(12), custodyStartDate: daysAgo(12), policeCustodyDays: 2, judicialCustodyDays: 10, accusedDelayStatus: "unknown", accusedAttributableDelayDays: 0, chargesheetFiled: "unknown" },
    status: { currentCourt: "Judicial Magistrate First Class, Agartala", caseStage: "Intake — charge details pending", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "unknown", specialConditionFlags: [] },
  },
  {
    caseId: "BR-2026-030", createdAt: daysAgo(1),
    person: { personId: "P-030", displayId: "Undertrial N.A.", age: 24, firstTimeOffender: "yes" },
    charges: [{ chargeId: "C-030-1", statute: "Bharatiya Nyaya Sanhita, 2023", section: "BNS §303(2) — Theft", offenceName: "Theft", maxImprisonmentYears: 3, isBailable: "yes", compoundability: "compoundable", isDeathOrLifePunishable: false, isSpecialStatute: false }],
    custody: { arrestDate: daysAgo(6), custodyStartDate: daysAgo(6), policeCustodyDays: 1, judicialCustodyDays: 5, accusedDelayStatus: "no", accusedAttributableDelayDays: 0, chargesheetFiled: "unknown" },
    status: { currentCourt: "Judicial Magistrate First Class, Jammu", caseStage: "Investigation", bail: { previouslyApplied: false, previouslyRejected: false }, multiplePendingCases: false, knownCriminalHistory: "no", specialConditionFlags: [] },
  },
];

export function getDemoCase(caseId: string): Case | undefined {
  return DEMO_CASES.find((c) => c.caseId === caseId);
}

// Grouping metadata for the "Load demo case" dropdown only — purely a UI
// convenience so 30 cases stay scannable. Not used anywhere in analysis.
export const DEMO_CASE_GROUPS: { label: string; caseIds: string[] }[] = [
  { label: "Bailable pathway", caseIds: ["BR-2026-001", "BR-2026-008", "BR-2026-016", "BR-2026-017", "BR-2026-018", "BR-2026-025", "BR-2026-030"] },
  { label: "Default bail (§187)", caseIds: ["BR-2026-002", "BR-2026-009", "BR-2026-024"] },
  { label: "Undertrial threshold (§479) — reached", caseIds: ["BR-2026-003", "BR-2026-004", "BR-2026-006", "BR-2026-015"] },
  { label: "Undertrial threshold (§479) — approaching", caseIds: ["BR-2026-013", "BR-2026-014", "BR-2026-026", "BR-2026-027"] },
  { label: "No pathway yet identified", caseIds: ["BR-2026-010", "BR-2026-011"] },
  { label: "Special statute review", caseIds: ["BR-2026-005", "BR-2026-012", "BR-2026-019", "BR-2026-020", "BR-2026-021", "BR-2026-022"] },
  { label: "Multiple charges", caseIds: ["BR-2026-006", "BR-2026-012", "BR-2026-023", "BR-2026-024"] },
  { label: "Insufficient information", caseIds: ["BR-2026-007", "BR-2026-028", "BR-2026-029"] },
];
