import type { Case } from "../types";

// ============================================================
// SYNTHETIC DEMO DATA ONLY.
// No real prisoner, court, or law-enforcement data is used
// anywhere in this prototype.
// ============================================================

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const DEMO_CASES: Case[] = [
  {
    caseId: "BR-2026-001",
    createdAt: daysAgo(2),
    person: {
      personId: "P-001",
      displayId: "Undertrial A.K.",
      age: 29,
      firstTimeOffender: "yes",
    },
    charges: [
      {
        chargeId: "C-001-1",
        statute: "Bharatiya Nyaya Sanhita, 2023",
        section: "BNS §303(2) — Theft",
        offenceName: "Theft",
        maxImprisonmentYears: 3,
        isBailable: "yes",
        compoundability: "compoundable",
        isDeathOrLifePunishable: false,
        isSpecialStatute: false,
      },
    ],
    custody: {
      arrestDate: daysAgo(20),
      custodyStartDate: daysAgo(20),
      policeCustodyDays: 2,
      judicialCustodyDays: 18,
      accusedDelayStatus: "no",
      accusedAttributableDelayDays: 0,
      chargesheetFiled: "no",
    },
    status: {
      currentCourt: "Judicial Magistrate First Class, Bengaluru",
      caseStage: "Investigation",
      bail: { previouslyApplied: false, previouslyRejected: false },
      multiplePendingCases: false,
      knownCriminalHistory: "no",
      specialConditionFlags: [],
    },
  },
  {
    caseId: "BR-2026-002",
    createdAt: daysAgo(3),
    person: {
      personId: "P-002",
      displayId: "Undertrial R.M.",
      age: 34,
      firstTimeOffender: "no",
    },
    charges: [
      {
        chargeId: "C-002-1",
        statute: "Bharatiya Nyaya Sanhita, 2023",
        section: "BNS §318(4) — Cheating",
        offenceName: "Cheating",
        maxImprisonmentYears: 7,
        isBailable: "no",
        compoundability: "compoundable_with_permission",
        isDeathOrLifePunishable: false,
        isSpecialStatute: false,
      },
    ],
    custody: {
      arrestDate: daysAgo(64),
      custodyStartDate: daysAgo(64),
      policeCustodyDays: 4,
      judicialCustodyDays: 60,
      accusedDelayStatus: "no",
      accusedAttributableDelayDays: 0,
      chargesheetFiled: "no",
    },
    status: {
      currentCourt: "Additional Sessions Court, Pune",
      caseStage: "Investigation — chargesheet pending",
      bail: { previouslyApplied: true, previouslyRejected: true },
      multiplePendingCases: false,
      knownCriminalHistory: "no",
      specialConditionFlags: [],
    },
  },
  {
    caseId: "BR-2026-003",
    createdAt: daysAgo(5),
    person: {
      personId: "P-003",
      displayId: "Undertrial S.D.",
      age: 41,
      firstTimeOffender: "no",
    },
    charges: [
      {
        chargeId: "C-003-1",
        statute: "Bharatiya Nyaya Sanhita, 2023",
        section: "BNS §109 — Attempt to Murder",
        offenceName: "Attempt to Murder",
        maxImprisonmentYears: 3,
        isBailable: "no",
        compoundability: "non_compoundable",
        isDeathOrLifePunishable: false,
        isSpecialStatute: false,
      },
    ],
    custody: {
      arrestDate: daysAgo(621),
      custodyStartDate: daysAgo(621),
      policeCustodyDays: 5,
      judicialCustodyDays: 616,
      accusedDelayStatus: "no",
      accusedAttributableDelayDays: 0,
      chargesheetFiled: "yes",
      chargesheetDate: daysAgo(560),
    },
    status: {
      currentCourt: "Sessions Court, Lucknow",
      caseStage: "Trial — evidence stage",
      bail: { previouslyApplied: true, previouslyRejected: true },
      multiplePendingCases: false,
      knownCriminalHistory: "no",
      specialConditionFlags: [],
    },
  },
  {
    caseId: "BR-2026-004",
    createdAt: daysAgo(1),
    person: {
      personId: "P-004",
      displayId: "Undertrial N.P.",
      age: 23,
      firstTimeOffender: "yes",
    },
    charges: [
      {
        chargeId: "C-004-1",
        statute: "Bharatiya Nyaya Sanhita, 2023",
        section: "BNS §305 — Theft in a dwelling house",
        offenceName: "Theft in a dwelling house",
        maxImprisonmentYears: 3,
        isBailable: "no",
        compoundability: "compoundable_with_permission",
        isDeathOrLifePunishable: false,
        isSpecialStatute: false,
      },
    ],
    custody: {
      arrestDate: daysAgo(380),
      custodyStartDate: daysAgo(380),
      policeCustodyDays: 3,
      judicialCustodyDays: 377,
      accusedDelayStatus: "no",
      accusedAttributableDelayDays: 0,
      chargesheetFiled: "yes",
      chargesheetDate: daysAgo(340),
    },
    status: {
      currentCourt: "Judicial Magistrate First Class, Nagpur",
      caseStage: "Trial — framing of charges",
      bail: { previouslyApplied: false, previouslyRejected: false },
      multiplePendingCases: false,
      knownCriminalHistory: "no",
      specialConditionFlags: [],
    },
  },
  {
    caseId: "BR-2026-005",
    createdAt: daysAgo(7),
    person: {
      personId: "P-005",
      displayId: "Undertrial V.T.",
      age: 37,
      firstTimeOffender: "unknown",
    },
    charges: [
      {
        chargeId: "C-005-1",
        statute: "Narcotic Drugs and Psychotropic Substances Act, 1985",
        section: "NDPS §21(c) — Commercial quantity",
        offenceName: "Possession — commercial quantity",
        maxImprisonmentYears: 20,
        isBailable: "no",
        compoundability: "non_compoundable",
        isDeathOrLifePunishable: false,
        isSpecialStatute: true,
        specialStatuteName: "NDPS",
      },
    ],
    custody: {
      arrestDate: daysAgo(140),
      custodyStartDate: daysAgo(140),
      policeCustodyDays: 6,
      judicialCustodyDays: 134,
      accusedDelayStatus: "yes",
      accusedAttributableDelayDays: 10,
      chargesheetFiled: "yes",
      chargesheetDate: daysAgo(100),
    },
    status: {
      currentCourt: "Special Court (NDPS), Mumbai",
      caseStage: "Trial — prosecution evidence",
      bail: { previouslyApplied: true, previouslyRejected: true },
      multiplePendingCases: true,
      knownCriminalHistory: "unknown",
      specialConditionFlags: ["Commercial quantity — Section 37 NDPS conditions apply"],
    },
  },
  {
    caseId: "BR-2026-006",
    createdAt: daysAgo(1),
    person: {
      personId: "P-006",
      displayId: "Undertrial K.J.",
      age: 31,
      firstTimeOffender: "unknown",
    },
    charges: [
      {
        chargeId: "C-006-1",
        statute: "Bharatiya Nyaya Sanhita, 2023",
        section: "BNS §262 — Forgery",
        offenceName: "Forgery",
        maxImprisonmentYears: 4,
        isBailable: "no",
        compoundability: "non_compoundable",
        isDeathOrLifePunishable: false,
        isSpecialStatute: false,
      },
      {
        chargeId: "C-006-2",
        statute: "Bharatiya Nyaya Sanhita, 2023",
        section: "BNS §316(2) — Criminal Breach of Trust",
        offenceName: "Criminal breach of trust",
        maxImprisonmentYears: 3,
        isBailable: "no",
        compoundability: "compoundable_with_permission",
        isDeathOrLifePunishable: false,
        isSpecialStatute: false,
      },
    ],
    custody: {
      arrestDate: daysAgo(760),
      custodyStartDate: daysAgo(760),
      policeCustodyDays: 5,
      judicialCustodyDays: 755,
      accusedDelayStatus: "unknown",
      accusedAttributableDelayDays: 0,
      chargesheetFiled: "yes",
      chargesheetDate: daysAgo(700),
    },
    status: {
      currentCourt: "Sessions Court, Ahmedabad",
      caseStage: "Trial — prosecution evidence",
      bail: { previouslyApplied: false, previouslyRejected: false },
      multiplePendingCases: true,
      knownCriminalHistory: "unknown",
      specialConditionFlags: ["Co-accused absconding — investigation ongoing"],
    },
  },
  {
    caseId: "BR-2026-007",
    createdAt: daysAgo(0),
    person: {
      personId: "P-007",
      displayId: "Undertrial (intake incomplete)",
      age: 0,
      firstTimeOffender: "unknown",
    },
    charges: [],
    custody: {
      arrestDate: "",
      custodyStartDate: "",
      policeCustodyDays: 0,
      judicialCustodyDays: 0,
      accusedDelayStatus: "unknown",
      accusedAttributableDelayDays: 0,
      chargesheetFiled: "unknown",
    },
    status: {
      currentCourt: "",
      caseStage: "Intake — incomplete",
      bail: { previouslyApplied: false, previouslyRejected: false },
      multiplePendingCases: false,
      knownCriminalHistory: "unknown",
      specialConditionFlags: [],
    },
  },
];

export function getDemoCase(caseId: string): Case | undefined {
  return DEMO_CASES.find((c) => c.caseId === caseId);
}

export function nextCaseId(): string {
  const n = DEMO_CASES.length + 1;
  return `BR-2026-${String(n).padStart(3, "0")}`;
}
