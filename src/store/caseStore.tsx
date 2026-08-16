import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Case, EligibilityResult } from "../types";
import { DEMO_CASES } from "../data/demoCases";
import { analyzeCase, fetchCases, type ApiResult } from "../lib/api";

// ============================================================
// Architecture: Frontend -> Backend API -> ONE authoritative rule engine
// -> Database. This store holds NO rule-engine logic. `analyze()` is a
// thin wrapper around the backend call; every EligibilityResult in this
// app's memory came from a real backend response.
//
// `DEMO_CASES` (imported above) is pure form-fill data for the "Load demo
// case" convenience dropdown in the Analyzer — it is never used to compute
// a result. The actual demo cases judges see analyzed come from the
// backend's own database, seeded independently on backend startup.
// ============================================================

interface StoreShape {
  cases: Case[];
  results: Record<string, EligibilityResult>;
  backendReachable: boolean | null; // null = not yet checked
  loadingCases: boolean;
  refreshCases: () => Promise<void>;
  analyze: (c: Case, accessToken: string) => Promise<ApiResult<EligibilityResult>>;
  getCase: (caseId: string) => Case | undefined;
  demoCaseTemplates: Case[];
}

const StoreContext = createContext<StoreShape | null>(null);

export function CaseStoreProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<Case[]>([]);
  const [results, setResults] = useState<Record<string, EligibilityResult>>({});
  const [backendReachable, setBackendReachable] = useState<boolean | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);

  async function refreshCases() {
    setLoadingCases(true);
    const result = await fetchCases();
    if (result.ok) {
      setCases(result.data);
      setBackendReachable(true);
    } else {
      setBackendReachable(false);
    }
    setLoadingCases(false);
  }

  useEffect(() => {
    refreshCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<StoreShape>(
    () => ({
      cases,
      results,
      backendReachable,
      loadingCases,
      refreshCases,
      analyze: async (c: Case, accessToken: string) => {
        const result = await analyzeCase(c, accessToken);
        if (result.ok) {
          setResults((prev) => ({ ...prev, [c.caseId]: result.data }));
          setCases((prev) => {
            const exists = prev.some((p) => p.caseId === c.caseId);
            return exists ? prev.map((p) => (p.caseId === c.caseId ? c : p)) : [c, ...prev];
          });
        }
        return result;
      },
      getCase: (caseId: string) => cases.find((c) => c.caseId === caseId),
      demoCaseTemplates: DEMO_CASES,
    }),
    [cases, results, backendReachable, loadingCases]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useCaseStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useCaseStore must be used within CaseStoreProvider");
  return ctx;
}
