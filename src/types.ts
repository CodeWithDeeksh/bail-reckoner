// ============================================================
// BAIL // RECKONER — Core Data Models
// Synthetic-data prototype. Not connected to any live system.
// ============================================================

export type YesNoUnknown = "yes" | "no" | "unknown";

export interface Person {
  personId: string;
  displayId: string; // anonymized identifier shown in UI
  age: number;
  firstTimeOffender: YesNoUnknown;
}

export interface SpecialStatuteFlag {
  name: string; // e.g. "NDPS Act, 1985"
  section?: string;
}

export type Compoundability = "compoundable" | "non_compoundable" | "compoundable_with_permission" | "unknown";

export interface Charge {
  chargeId: string;
  statute: string; // e.g. "Bharatiya Nyaya Sanhita, 2023"
  section: string; // e.g. "BNS §304"
  offenceName?: string; // e.g. "Theft"
  maxImprisonmentYears: number | null; // null = unspecified in prototype
  isBailable: YesNoUnknown;
  compoundability: Compoundability;
  isDeathOrLifePunishable: boolean;
  isSpecialStatute: boolean;
  specialStatuteName?: string;
}

export interface CustodyRecord {
  arrestDate: string; // ISO date
  custodyStartDate: string; // ISO date
  policeCustodyDays: number;
  judicialCustodyDays: number;
  accusedDelayStatus: YesNoUnknown;
  accusedAttributableDelayDays: number;
  chargesheetFiled: YesNoUnknown;
  chargesheetDate?: string;
}

export interface BailApplication {
  previouslyApplied: boolean;
  previouslyRejected: boolean;
}

export interface CaseStatus {
  currentCourt: string;
  caseStage: string;
  bail: BailApplication;
  multiplePendingCases: boolean;
  knownCriminalHistory: YesNoUnknown;
  specialConditionFlags: string[];
}

export interface Case {
  caseId: string; // e.g. BR-2026-001
  person: Person;
  charges: Charge[];
  custody: CustodyRecord;
  status: CaseStatus;
  createdAt: string;
}

// ---- Legal source metadata (never invent citations) ----
export interface LegalSource {
  statute: string;
  section: string;
  shortTitle: string;
  sourceName: string; // e.g. "India Code"
  ruleVersion: string;
  lastReviewed: string; // ISO date
}

export type ResultCategory =
  | "POTENTIAL_STATUTORY_PATHWAY"
  | "POTENTIAL_DEFAULT_BAIL_PATHWAY"
  | "UNDERTRIAL_THRESHOLD_REACHED"
  | "DISCRETIONARY_JUDICIAL_REVIEW"
  | "ENHANCED_SPECIAL_STATUTE_REVIEW"
  | "NOT_CURRENTLY_ELIGIBLE"
  | "INSUFFICIENT_DATA"
  | "CONFLICTING_MULTIPLE_CASE_FLAGS";

export const RESULT_CATEGORY_LABEL: Record<ResultCategory, string> = {
  POTENTIAL_STATUTORY_PATHWAY: "Potential Statutory Pathway",
  POTENTIAL_DEFAULT_BAIL_PATHWAY: "Potential Default Bail Pathway",
  UNDERTRIAL_THRESHOLD_REACHED: "Undertrial Threshold Reached",
  DISCRETIONARY_JUDICIAL_REVIEW: "Discretionary / Judicial Review",
  ENHANCED_SPECIAL_STATUTE_REVIEW: "Enhanced Special-Statute Review",
  NOT_CURRENTLY_ELIGIBLE: "Not Currently Eligible Under Checked Rules",
  INSUFFICIENT_DATA: "Insufficient Data",
  CONFLICTING_MULTIPLE_CASE_FLAGS: "Conflicting / Multiple Case Flags",
};

export interface ExplanationStep {
  step: number;
  title: string;
  detail: string;
}

export interface CalculationLine {
  label: string;
  value: string;
}

export interface DataQualityFlag {
  field: string;
  ok: boolean;
  note: string;
}

export type PathwayStatus =
  | "Potentially Eligible"
  | "Eligibility Condition Detected"
  | "Requires Judicial Review"
  | "Insufficient Information"
  | "Procedural Action Required";

export interface RuleOutcome {
  pathwayId: string;
  category: ResultCategory;
  status: PathwayStatus;
  headline: string;
  summary: string;
  legalSource: LegalSource;
  factsUsed: CalculationLine[];
  calculation: CalculationLine[];
  conditionsChecked: string[];
  unresolvedItems: string[];
  explanation: ExplanationStep[];
  priority: "low" | "medium" | "high";
  remaining?: { days: number; label: string } | null;
}

export interface UndertrialVisual {
  governingChargeSection: string;
  maxYears: number;
  isFirstTime: boolean;
  generalThresholdDays: number;
  firstTimeThresholdDays: number;
  applicableThresholdDays: number;
  custodyDaysNet: number;
  reached: boolean;
  remainingDays: number;
  overDays: number;
}

export interface EligibilityResult {
  analysisId: string;
  caseId: string;
  timestamp: string;
  ruleEngineVersion: string;
  outcomes: RuleOutcome[]; // one case can surface more than one pathway
  primaryCategory: ResultCategory;
  dataQuality: DataQualityFlag[];
  judicialFactors: string[]; // factors requiring human assessment, always shown
  nextStep: string;
  custodyDays: number | null;
  undertrial: UndertrialVisual | null;
}
