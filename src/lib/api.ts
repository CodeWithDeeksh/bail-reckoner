import { currentLanguage } from "../i18n/language";
import type { Case, EligibilityResult } from "../types";

// ============================================================
// Backend API client
//
// Architecture: Frontend -> Backend API -> ONE authoritative rule engine
// (Python, backend/app/rule_engine.py) -> Database (SQLite/Postgres).
//
// The frontend holds NO rule-engine logic of its own. Every analysis
// result the UI ever displays came from a real backend response, stored
// in the backend's database. There is no local fallback — if the backend
// is unreachable, the UI says so honestly (with a retry/wake-up path for
// Render's free-tier cold start) rather than silently computing its own
// answer.
// ============================================================

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000";

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

export async function checkBackendHealth(timeoutMs = 4000): Promise<{ ok: boolean; version?: string }> {
  const { signal, cancel } = withTimeout(timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal });
    cancel();
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, version: data.rule_engine_version };
  } catch {
    cancel();
    return { ok: false };
  }
}

/**
 * Polls /api/health with backoff to ride out Render's free-tier cold start
 * (~20-30s to wake from sleep). Calls onTick with elapsed seconds so the UI
 * can show real progress instead of a bare spinner. Resolves true once
 * healthy, false if it gives up after maxWaitMs.
 */
export async function wakeBackend(onTick?: (elapsedSeconds: number) => void, maxWaitMs = 45000): Promise<boolean> {
  const start = Date.now();
  let delay = 1500;
  while (Date.now() - start < maxWaitMs) {
    const { ok } = await checkBackendHealth(3000);
    onTick?.(Math.round((Date.now() - start) / 1000));
    if (ok) return true;
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * 1.4, 4000);
  }
  return false;
}

// ---------------------------------------------------------------
// Case: frontend (camelCase) <-> backend (snake_case) conversion
// ---------------------------------------------------------------
function caseToBackend(c: Case): unknown {
  return {
    case_id: c.caseId,
    created_at: c.createdAt || null,
    person: {
      person_id: c.person.personId,
      display_id: c.person.displayId,
      age: c.person.age,
      first_time_offender: c.person.firstTimeOffender,
    },
    charges: c.charges.map((ch) => ({
      charge_id: ch.chargeId,
      statute: ch.statute,
      section: ch.section,
      offence_name: ch.offenceName || null,
      max_imprisonment_years: ch.maxImprisonmentYears,
      is_bailable: ch.isBailable,
      compoundability: ch.compoundability,
      is_death_or_life_punishable: ch.isDeathOrLifePunishable,
      is_special_statute: ch.isSpecialStatute,
      special_statute_name: ch.specialStatuteName || null,
    })),
    custody: {
      arrest_date: c.custody.arrestDate || null,
      custody_start_date: c.custody.custodyStartDate || null,
      police_custody_days: c.custody.policeCustodyDays,
      judicial_custody_days: c.custody.judicialCustodyDays,
      accused_delay_status: c.custody.accusedDelayStatus,
      accused_attributable_delay_days: c.custody.accusedAttributableDelayDays,
      chargesheet_filed: c.custody.chargesheetFiled,
      chargesheet_date: c.custody.chargesheetDate || null,
    },
    status: {
      current_court: c.status.currentCourt,
      case_stage: c.status.caseStage,
      bail: {
        previously_applied: c.status.bail.previouslyApplied,
        previously_rejected: c.status.bail.previouslyRejected,
      },
      multiple_pending_cases: c.status.multiplePendingCases,
      known_criminal_history: c.status.knownCriminalHistory,
      special_condition_flags: c.status.specialConditionFlags,
    },
  };
}

function backendCaseToFrontend(json: any): Case {
  return {
    caseId: json.case_id,
    createdAt: json.created_at || "",
    person: {
      personId: json.person.person_id,
      displayId: json.person.display_id,
      age: json.person.age,
      firstTimeOffender: json.person.first_time_offender,
    },
    charges: json.charges.map((ch: any) => ({
      chargeId: ch.charge_id,
      statute: ch.statute,
      section: ch.section,
      offenceName: ch.offence_name || undefined,
      maxImprisonmentYears: ch.max_imprisonment_years,
      isBailable: ch.is_bailable,
      compoundability: ch.compoundability,
      isDeathOrLifePunishable: ch.is_death_or_life_punishable,
      isSpecialStatute: ch.is_special_statute,
      specialStatuteName: ch.special_statute_name || undefined,
    })),
    custody: {
      arrestDate: json.custody.arrest_date || "",
      custodyStartDate: json.custody.custody_start_date || "",
      policeCustodyDays: json.custody.police_custody_days,
      judicialCustodyDays: json.custody.judicial_custody_days,
      accusedDelayStatus: json.custody.accused_delay_status,
      accusedAttributableDelayDays: json.custody.accused_attributable_delay_days,
      chargesheetFiled: json.custody.chargesheet_filed,
      chargesheetDate: json.custody.chargesheet_date || undefined,
    },
    status: {
      currentCourt: json.status.current_court,
      caseStage: json.status.case_stage,
      bail: {
        previouslyApplied: json.status.bail.previously_applied,
        previouslyRejected: json.status.bail.previously_rejected,
      },
      multiplePendingCases: json.status.multiple_pending_cases,
      knownCriminalHistory: json.status.known_criminal_history,
      specialConditionFlags: json.status.special_condition_flags,
    },
  };
}

function backendResultToFrontend(json: any): EligibilityResult {
  return {
    analysisId: json.analysis_id,
    caseId: json.case_id,
    timestamp: json.timestamp,
    ruleEngineVersion: json.rule_engine_version,
    primaryCategory: json.primary_category,
    nextStep: json.next_step,
    judicialFactors: json.judicial_factors,
    custodyDays: json.custody_days ?? null,
    undertrial: json.undertrial
      ? {
          governingChargeSection: json.undertrial.governing_charge_section,
          maxYears: json.undertrial.max_years,
          isFirstTime: json.undertrial.is_first_time,
          generalThresholdDays: json.undertrial.general_threshold_days,
          firstTimeThresholdDays: json.undertrial.first_time_threshold_days,
          applicableThresholdDays: json.undertrial.applicable_threshold_days,
          custodyDaysNet: json.undertrial.custody_days_net,
          reached: json.undertrial.reached,
          remainingDays: json.undertrial.remaining_days,
          overDays: json.undertrial.over_days,
        }
      : null,
    dataQuality: json.data_quality.map((f: any) => ({ field: f.field, ok: f.ok, note: f.note })),
    outcomes: json.outcomes.map((o: any) => ({
      pathwayId: o.pathway_id,
      category: o.category,
      status: o.status,
      headline: o.headline,
      summary: o.summary,
      legalSource: {
        statute: o.legal_source.statute,
        section: o.legal_source.section,
        shortTitle: o.legal_source.short_title,
        sourceName: o.legal_source.source_name,
        ruleVersion: o.legal_source.rule_version,
        lastReviewed: o.legal_source.last_reviewed,
      },
      factsUsed: o.facts_used.map((l: any) => ({ label: l.label, value: l.value })),
      calculation: o.calculation.map((l: any) => ({ label: l.label, value: l.value })),
      conditionsChecked: o.conditions_checked,
      unresolvedItems: o.unresolved_items,
      explanation: o.explanation,
      priority: o.priority,
    })),
  };
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };

async function authedFetch(path: string, accessToken: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {}),
    },
  });
}

/**
 * THE analysis call. Sends the case to the backend's rule engine, persists
 * it, and returns the authoritative result. This is the only place in the
 * frontend that produces an EligibilityResult — there is no local
 * computation to fall back to.
 */
export async function analyzeCase(c: Case, accessToken: string): Promise<ApiResult<EligibilityResult>> {
  try {
    const res = await authedFetch(`/api/cases/${encodeURIComponent(c.caseId)}/analyze?lang=${currentLanguage()}`, accessToken, {
      method: "POST",
      body: JSON.stringify(caseToBackend(c)),
    });
    if (res.status === 401) return { ok: false, error: "Session expired — please sign in again.", status: 401 };
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return { ok: false, error: body?.detail || `Rule engine returned an error (HTTP ${res.status}).`, status: res.status };
    }
    return { ok: true, data: backendResultToFrontend(await res.json()) };
  } catch {
    return { ok: false, error: "Rule engine unreachable. The backend may be asleep (free tier) or not running." };
  }
}

export async function fetchDemoCases(): Promise<ApiResult<Case[]>> {
  try {
    const res = await fetch(`${API_BASE}/api/demo-cases`);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const json = await res.json();
    return { ok: true, data: json.map(backendCaseToFrontend) };
  } catch {
    return { ok: false, error: "Backend unreachable." };
  }
}

export async function fetchCase(caseId: string): Promise<ApiResult<Case>> {
  try {
    const res = await fetch(`${API_BASE}/api/cases/${encodeURIComponent(caseId)}`);
    if (res.status === 404) return { ok: false, error: "Case not found.", status: 404 };
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, data: backendCaseToFrontend(await res.json()) };
  } catch {
    return { ok: false, error: "Backend unreachable." };
  }
}

export async function fetchCases(): Promise<ApiResult<Case[]>> {
  try {
    const res = await fetch(`${API_BASE}/api/cases`);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const json = await res.json();
    return { ok: true, data: json.map(backendCaseToFrontend) };
  } catch {
    return { ok: false, error: "Backend unreachable." };
  }
}

export async function fetchLatestResult(caseId: string): Promise<ApiResult<EligibilityResult>> {
  try {
    const res = await fetch(`${API_BASE}/api/cases/${encodeURIComponent(caseId)}/result?lang=${currentLanguage()}`);
    if (res.status === 404) return { ok: false, error: "No analysis found for this case yet.", status: 404 };
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, data: backendResultToFrontend(await res.json()) };
  } catch {
    return { ok: false, error: "Backend unreachable." };
  }
}

export interface RuleEngineInfo {
  version: string;
  totalPathwaysChecked: number;
  pathways: string[];
}

export async function fetchRuleEngineInfo(): Promise<RuleEngineInfo | null> {
  try {
    const res = await fetch(`${API_BASE}/api/rule-engine/info`);
    if (!res.ok) return null;
    const json = await res.json();
    return { version: json.version, totalPathwaysChecked: json.total_pathways_checked, pathways: json.pathways };
  } catch {
    return null;
  }
}

export const BACKEND_API_BASE = API_BASE;

// ---------------------------------------------------------------
// Auth
// ---------------------------------------------------------------
export interface AuthSession {
  accessToken: string;
  role: "undertrial" | "legal_aid" | "judicial" | "prison_authority" | "guest";
  displayName: string;
}

export interface DemoAccount {
  username: string;
  password: string;
  display_name: string;
  role: string;
}

export async function fetchDemoAccounts(): Promise<DemoAccount[]> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/demo-accounts`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function login(username: string, password: string): Promise<{ session?: AuthSession; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return { error: body?.detail || "Login failed." };
    }
    const data = await res.json();
    return { session: { accessToken: data.access_token, role: data.role, displayName: data.display_name } };
  } catch {
    return { error: "Backend not reachable. Is the FastAPI service running?" };
  }
}

export async function loginAsGuest(): Promise<{ session?: AuthSession; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/guest`, { method: "POST" });
    if (!res.ok) return { error: "Guest login failed." };
    const data = await res.json();
    return { session: { accessToken: data.access_token, role: data.role, displayName: data.display_name } };
  } catch {
    return { error: "backend-unreachable" };
  }
}
