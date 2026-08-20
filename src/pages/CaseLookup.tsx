import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, FlaskConical } from "lucide-react";
import { fetchCase, fetchLatestResult } from "../lib/api";
import type { Case, EligibilityResult, PathwayStatus } from "../types";
import { STANDARD_QUALIFIER } from "../lib/constants";

const STATUS_TONE: Record<PathwayStatus, string> = {
  "Potentially Eligible": "text-cyan border-cyan-dim",
  "Eligibility Condition Detected": "text-good border-good",
  "Requires Judicial Review": "text-warn border-warn",
  "Insufficient Information": "text-alert border-alert",
  "Procedural Action Required": "text-gold border-gold",
};

export default function CaseLookup() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [c, setC] = useState<Case | null>(null);
  const [result, setResult] = useState<EligibilityResult | null>(null);

  async function runLookup() {
    const caseId = query.trim().toUpperCase();
    if (!caseId) return;
    setLoading(true);
    setError(null);
    setC(null);
    setResult(null);
    const [caseRes, resultRes] = await Promise.all([fetchCase(caseId), fetchLatestResult(caseId)]);
    setLoading(false);
    if (!caseRes.ok) {
      setError("No case found with that ID. Double-check the Case ID and try again.");
      return;
    }
    setC(caseRes.data);
    if (resultRes.ok) setResult(resultRes.data);
  }

  const primaryOutcome = result?.outcomes.find((o) => o.category === result.primaryCategory) ?? result?.outcomes[0];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Public Case Status Lookup</p>
      <h1 className="mt-2 font-display text-3xl text-paper">Check a case's status</h1>
      <p className="mt-3 text-sm leading-relaxed text-paper-dim">
        Enter a Case ID to see its current status only — no sign-in required, and no calculation
        details or full case record are shown here. This mirrors how case-status lookups work on
        public court-tracking systems.
      </p>
      <div className="mt-3 inline-flex items-center gap-1.5 border border-gold/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-gold">
        <FlaskConical size={11} /> Synthetic demo data
      </div>

      <div className="mt-8 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runLookup()}
          placeholder="e.g. BR-2026-003"
          className="flex-1 border border-line-strong bg-navy px-3 py-2.5 text-sm text-paper outline-none placeholder:text-paper-dim/50 focus:border-cyan"
        />
        <button
          onClick={runLookup}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 bg-cyan px-5 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-ink disabled:opacity-40"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Look up
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-warn">{error}</p>}

      {c && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel mt-8 p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Case</p>
          <p className="mt-1 font-display text-2xl text-paper">#{c.caseId}</p>
          <p className="mt-1 text-sm text-paper-dim">{c.status.currentCourt || "Court not recorded"}</p>

          {result && primaryOutcome ? (
            <>
              <div className={`mt-6 inline-block border px-4 py-2 font-mono text-sm uppercase tracking-[0.08em] ${STATUS_TONE[primaryOutcome.status]}`}>
                {primaryOutcome.status}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-paper-dim">
                A statutory or procedural pathway has been flagged for review. {STANDARD_QUALIFIER}
              </p>
            </>
          ) : (
            <p className="mt-6 text-sm text-paper-dim">This case has not been analyzed yet.</p>
          )}

          <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-paper-dim">
            For full case details, calculations, and legal basis, an authorized legal-aid provider
            or the case's registered advocate should sign in.
          </p>
        </motion.div>
      )}
    </div>
  );
}
