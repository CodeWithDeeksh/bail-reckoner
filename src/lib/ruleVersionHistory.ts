export interface RuleVersionEntry {
  version: string;
  date: string;
  summary: string;
  changes: string[];
}

// Manually maintained changelog. The CURRENT version's live pathway list is
// fetched from the backend (/api/rule-engine/info) — this file only records
// history, it never determines a result.
export const RULE_VERSION_HISTORY: RuleVersionEntry[] = [
  {
    version: "rules-2026.08.0",
    date: "2026-08-01",
    summary: "Current version. Five configured pathways, single authoritative backend engine.",
    changes: [
      "Added Pathway E — procedural prerequisite (bail application not yet filed)",
      "Added accused-attributable-delay deduction to the BNSS §479 threshold calculation",
      "Standardized result vocabulary to five canonical statuses (Potentially Eligible / Eligibility Condition Detected / Requires Judicial Review / Insufficient Information / Procedural Action Required)",
      "Collapsed to a single authoritative engine on the backend — frontend no longer performs any rule computation",
    ],
  },
  {
    version: "rules-2026.07.0",
    date: "2026-07-10",
    summary: "Added special-statute detection and multi-charge governing-charge selection.",
    changes: [
      "Added special-statute registry (NDPS, UAPA, PMLA, POCSO, SC/ST Act) routing to enhanced legal review",
      "Governing charge for BNSS §479 now selected as the highest-maximum-sentence charge among those not punishable by death/life, across multiple charges",
      "Added data-completeness checks (arrest date, charge information, custody duration, criminal history, first-time-offender status, delay status)",
    ],
  },
  {
    version: "rules-2026.06.0",
    date: "2026-06-15",
    summary: "Initial prototype release.",
    changes: [
      "Bailable-offence pathway",
      "BNSS §187 default-bail pathway (60/90-day)",
      "BNSS §479 undertrial-detention threshold (1/2 general, 1/3 first-time offender)",
    ],
  },
];
