import { useEffect, useState } from "react";
import { Loader2, ArrowLeftRight } from "lucide-react";
import { useCaseStore } from "../store/caseStore";
import { fetchLatestResult } from "../lib/api";
import type { EligibilityResult, PathwayStatus } from "../types";

const STATUS_TONE: Record<PathwayStatus, string> = {
  "Potentially Eligible": "text-cyan border-cyan-dim",
  "Eligibility Condition Detected": "text-good border-good",
  "Requires Judicial Review": "text-warn border-warn",
  "Insufficient Information": "text-alert border-alert",
  "Procedural Action Required": "text-gold border-gold",
};

function useCaseResult(caseId: string) {
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!caseId) {
      setResult(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchLatestResult(caseId).then((res) => {
      if (cancelled) return;
      setResult(res.ok ? res.data : null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  return { result, loading };
}

function CaseColumn({ caseId, onChange, allCaseIds }: { caseId: string; onChange: (id: string) => void; allCaseIds: string[] }) {
  const { getCase } = useCaseStore();
  const { result, loading } = useCaseResult(caseId);
  const c = caseId ? getCase(caseId) : undefined;
  const primaryOutcome = result?.outcomes.find((o) => o.category === result.primaryCategory) ?? result?.outcomes[0];

  return (
    <div className="glass-panel flex-1 p-6">
      <select
        value={caseId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line-strong bg-navy px-3 py-2 text-sm text-paper outline-none focus:border-cyan"
      >
        <option value="">Select a case…</option>
        {allCaseIds.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>

      {loading && (
        <div className="mt-6 flex justify-center">
          <Loader2 size={16} className="animate-spin text-cyan" />
        </div>
      )}

      {!loading && c && (
        <div className="mt-6 space-y-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Person</p>
            <p className="text-sm text-paper">{c.person.displayId} · Age {c.person.age}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Court</p>
            <p className="text-sm text-paper">{c.status.currentCourt || "—"}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Charges</p>
            <p className="text-sm text-paper">{c.charges.length} charge(s) — {c.charges.map((ch) => ch.section).join("; ") || "—"}</p>
          </div>
          {result ? (
            <>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Status</p>
                <span className={`mt-1 inline-block border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${STATUS_TONE[primaryOutcome!.status]}`}>
                  {primaryOutcome!.status}
                </span>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Custody completed</p>
                <p className="mono-num text-sm text-paper">{result.custodyDays ?? "—"} days</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Pathways flagged</p>
                <p className="mono-num text-sm text-paper">{result.outcomes.length}</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Priority</p>
                <p className="text-sm text-paper">{primaryOutcome?.priority ?? "—"}</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Judicial factors</p>
                <p className="text-sm text-paper">{result.judicialFactors.length} flagged</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Next step</p>
                <p className="text-sm text-paper-dim">{result.nextStep}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-paper-dim">Not analyzed yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CompareCases() {
  const { cases, loadingCases } = useCaseStore();
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");

  const allCaseIds = cases.map((c) => c.caseId);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Legal-Aid Triage</p>
      <h1 className="mt-2 font-display text-4xl text-paper">Compare Cases</h1>
      <p className="mt-3 max-w-2xl text-sm text-paper-dim">
        Pick two cases to compare their statutory pathways side by side — useful for triaging
        which case in a caseload needs attention first. Data comes from the same live rule engine
        as everywhere else in this prototype.
      </p>

      {loadingCases ? (
        <div className="mt-10 flex justify-center">
          <Loader2 size={20} className="animate-spin text-cyan" />
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-stretch gap-4 lg:flex-row lg:items-start">
          <CaseColumn caseId={idA} onChange={setIdA} allCaseIds={allCaseIds} />
          <div className="hidden items-center justify-center px-2 pt-10 lg:flex">
            <ArrowLeftRight size={18} className="text-paper-dim" />
          </div>
          <CaseColumn caseId={idB} onChange={setIdB} allCaseIds={allCaseIds} />
        </div>
      )}
    </div>
  );
}
