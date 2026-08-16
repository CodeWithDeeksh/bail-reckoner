import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, AlertTriangle, CheckCircle2, HelpCircle, FlaskConical, Loader2 } from "lucide-react";
import { useCaseStore } from "../store/caseStore";
import type { Case, EligibilityResult, PathwayStatus } from "../types";
import CaseTimeline from "../components/CaseTimeline";
import UndertrialTimeline from "../components/UndertrialTimeline";
import LegalBasisPanel from "../components/LegalBasisPanel";
import Disclaimer from "../components/Disclaimer";
import CountUp from "../components/CountUp";
import RuleEvaluationTimeline from "../components/RuleEvaluationTimeline";
import ChargeStack from "../components/ChargeStack";
import ActionPack from "../components/ActionPack";
import ModeSelector, { type ViewerMode } from "../components/ModeSelector";
import { STANDARD_QUALIFIER } from "../lib/constants";
import { fetchCase, fetchLatestResult } from "../lib/api";

const STATUS_TONE: Record<PathwayStatus, string> = {
  "Potentially Eligible": "text-cyan border-cyan-dim",
  "Eligibility Condition Detected": "text-good border-good",
  "Requires Judicial Review": "text-warn border-warn",
  "Insufficient Information": "text-alert border-alert",
  "Procedural Action Required": "text-gold border-gold",
};

export default function ResultsPage() {
  const { caseId } = useParams();
  const { getCase } = useCaseStore();
  const [mode, setMode] = useState<ViewerMode>("legal_aid");
  const [c, setC] = useState<Case | undefined>(() => (caseId ? getCase(caseId) : undefined));
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // The store may already have both (just-analyzed in this session) — but
  // this page also has to work from a direct link or a refresh, where the
  // only source of truth left is the backend/database.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!caseId) return;
      setLoading(true);
      const cached = getCase(caseId);
      const [caseRes, resultRes] = await Promise.all([
        cached ? Promise.resolve({ ok: true as const, data: cached }) : fetchCase(caseId),
        fetchLatestResult(caseId),
      ]);
      if (cancelled) return;
      if (caseRes.ok) setC(caseRes.data);
      if (resultRes.ok) {
        setResult(resultRes.data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={20} className="animate-spin text-cyan" />
      </div>
    );
  }

  if (!c || !result || notFound) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-mono text-sm text-paper-dim">No analysis found for this case yet.</p>
        <Link to="/analyze" className="mt-4 inline-block text-cyan underline">
          Run a new analysis
        </Link>
      </div>
    );
  }

  const custodyDays = result.custodyDays;
  const undertrialInfo = result.undertrial;
  const primaryOutcome = result.outcomes.find((o) => o.category === result.primaryCategory) ?? result.outcomes[0];
  const proceduralFlag = result.outcomes.find((o) => o.pathwayId === "pathway-e-procedural-prerequisite");

  const view = {
    calculation: mode !== "undertrial",
    conditions: mode === "legal_aid" || mode === "judicial",
    explain: mode !== "undertrial" && mode !== "prison_authority",
    legalBasis: mode !== "prison_authority",
    audit: mode === "judicial",
    batchNote: mode === "prison_authority",
  };

  return (
    <div>
      {/* ASSESSMENT HERO — the strongest visual screen in the prototype */}
      <section className="grid-field relative overflow-hidden border-b border-line px-6 pb-14 pt-14 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-ink" />
        <div className="relative mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Bail Assessment</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 border border-gold/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-gold">
                <FlaskConical size={11} /> Synthetic demo data
              </span>
              <ModeSelector mode={mode} onChange={setMode} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
            <h1 className="font-display text-4xl text-paper sm:text-5xl">Case #{c.caseId}</h1>
            <span className="font-mono text-[11px] text-paper-dim">Analysis {result.analysisId}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mt-6 inline-block border px-5 py-3 font-display text-2xl ${STATUS_TONE[primaryOutcome.status]}`}
          >
            {primaryOutcome.status}
          </motion.div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-paper-dim">
            This is a potential statutory pathway, not a bail grant and not a prediction of what a
            court will decide. {STANDARD_QUALIFIER}
          </p>

          {view.audit && (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-paper-dim">
              Audit trail — {new Date(result.timestamp).toLocaleString()} · Rule engine{" "}
              {result.ruleEngineVersion} · Computed server-side, stored in the case database
            </p>
          )}

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Custody completed</p>
              <p className="mono-num mt-1 font-display text-4xl text-paper">
                {custodyDays !== null ? (
                  <>
                    <CountUp value={custodyDays} /> <span className="text-lg text-paper-dim">days</span>
                  </>
                ) : (
                  <span className="text-paper-dim">—</span>
                )}
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Charges evaluated</p>
              <p className="mono-num mt-1 font-display text-4xl text-paper">
                <CountUp value={c.charges.length} />
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Pathways flagged</p>
              <p className="mono-num mt-1 font-display text-4xl text-paper">
                <CountUp value={result.outcomes.length} />
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-line pt-8">
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Rule evaluation trace</p>
            <RuleEvaluationTimeline activeIndex={5} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-14 lg:px-10">
        {view.batchNote && (
          <div className="mb-8 border border-cyan-dim bg-cyan/5 px-5 py-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-cyan">Prison authority mode — batch monitoring</p>
            <p className="mt-1 text-sm text-paper-dim">
              This is a single-case view. For batch monitoring of custody thresholds across a
              facility's caseload, use the{" "}
              <Link to="/dashboard" className="text-cyan underline">
                Undertrial Watch dashboard
              </Link>
              .
            </p>
          </div>
        )}

        {proceduralFlag && (
          <div className="mb-8 flex items-start gap-3 border border-gold/50 bg-gold/5 px-5 py-4">
            <HelpCircle size={16} className="mt-0.5 shrink-0 text-gold" />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gold">Procedural action required</p>
              <p className="mt-1 text-sm text-paper-dim">{proceduralFlag.summary}</p>
            </div>
          </div>
        )}

        {c.charges.length > 0 && (
          <div className="mb-8">
            <ChargeStack charges={c.charges} />
          </div>
        )}

        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">Potential statutory pathways</p>

        <div className="mt-4 space-y-10">
          {result.outcomes.map((o) => (
            <motion.div
              key={o.pathwayId}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.4 }}
              className="glass-panel p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className={`inline-block border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] ${STATUS_TONE[o.status]}`}>
                  {o.status}
                </div>
                <span className="font-mono text-[11px] text-paper-dim">{o.legalSource.section}</span>
              </div>
              <p className="mt-3 font-display text-lg text-paper">{o.headline}</p>
              <p className="mt-2 text-sm leading-relaxed text-paper">{o.summary}</p>

              <WhyFlagged title={o.headline} facts={o.factsUsed} />

              {o.pathwayId === "pathway-c-undertrial-threshold" && undertrialInfo && (
                <div className="mt-6 border-t border-line pt-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Custody vs. statutory threshold</p>
                  <div className="mt-3">
                    <UndertrialTimeline
                      arrestDate={c.custody.arrestDate}
                      maxYears={undertrialInfo.maxYears}
                      isFirstTime={undertrialInfo.isFirstTime}
                      generalThresholdDays={undertrialInfo.generalThresholdDays}
                      firstTimeThresholdDays={undertrialInfo.firstTimeThresholdDays}
                      applicableThresholdDays={undertrialInfo.applicableThresholdDays}
                      custodyDays={undertrialInfo.custodyDaysNet}
                      reached={undertrialInfo.reached}
                      remainingDays={undertrialInfo.remainingDays}
                      overDays={undertrialInfo.overDays}
                    />
                  </div>
                </div>
              )}

              {view.calculation && o.calculation.length > 0 && (
                <div className="mt-6 border-t border-line pt-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Calculation</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {o.calculation.map((line) => (
                      <div key={line.label} className="flex items-baseline justify-between gap-4 border-b border-line py-1.5 text-sm">
                        <span className="text-paper-dim">{line.label}</span>
                        <span className="mono-num text-right text-paper">{line.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view.conditions && o.conditionsChecked.length > 0 && (
                <div className="mt-6 border-t border-line pt-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Conditions / checks applied</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-paper-dim">
                    {o.conditionsChecked.map((cond, i) => (
                      <li key={i} className="flex gap-2">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-good" /> {cond}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {o.unresolvedItems.length > 0 && (
                <div className="mt-6 border-t border-line pt-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-warn">Unresolved items</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-paper-dim">
                    {o.unresolvedItems.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <HelpCircle size={14} className="mt-0.5 shrink-0 text-warn" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {view.legalBasis && (
                <div className="mt-6 border-t border-line pt-5">
                  <LegalBasisPanel source={o.legalSource} />
                </div>
              )}

              {view.explain && (
                <div className="mt-6 border-t border-line pt-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Why? — step by step</p>
                  <div className="mt-3 space-y-2">
                    {o.explanation.map((step) => (
                      <ExplainStep key={step.step} step={step.step} title={step.title} detail={step.detail} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          <section className="glass-panel p-6 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Data completeness</p>
            <div className="mt-3 space-y-2">
              {result.dataQuality.map((f) => (
                <div key={f.field} className="flex items-start gap-2.5 text-sm">
                  {f.ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-good" /> : <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warn" />}
                  <span>
                    <span className="text-paper">{f.field}</span> <span className="text-paper-dim">— {f.note}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel border-l-2 border-l-warn p-6 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-warn">Factors requiring judicial assessment</p>
            <ul className="mt-3 space-y-2 text-sm text-paper-dim">
              {result.judicialFactors.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-warn">—</span> {f}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.1em] text-paper">Requires human assessment — never scored</p>
          </section>

          <section className="glass-panel p-6 sm:p-8">
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Case timeline</p>
            <CaseTimeline c={c} />
          </section>

          <section className="border border-cyan-dim bg-cyan/5 p-6 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-cyan">Recommended next step</p>
            <p className="mt-2 text-sm text-paper">{result.nextStep}</p>
          </section>

          <div className="flex justify-center">
            <ActionPack c={c} result={result} />
          </div>

          <Disclaimer />

          <div className="flex justify-center">
            <Link to="/dashboard" className="font-mono text-xs uppercase tracking-[0.1em] text-paper-dim hover:text-cyan">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhyFlagged({ title, facts }: { title: string; facts: { label: string; value: string }[] }) {
  const [open, setOpen] = useState(true);
  if (facts.length === 0) return null;
  return (
    <div className="mt-6 border border-gold-dim/40">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 bg-gold/5 px-4 py-3 text-left">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-gold">Why was this flagged? — {title}</span>
        <ChevronDown size={14} className={`text-gold transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-1.5 px-4 py-4">
          {facts.map((f) => (
            <div key={f.label} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="text-paper-dim">{f.label}</span>
              <span className="mono-num text-paper">{f.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExplainStep({ step, title, detail }: { step: number; title: string; detail: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left">
        <span className="flex items-center gap-3">
          <span className="font-mono text-xs text-cyan">{String(step).padStart(2, "0")}</span>
          <span className="text-sm text-paper">{title}</span>
        </span>
        <ChevronDown size={14} className={`shrink-0 text-paper-dim transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="border-t border-line px-4 py-3 text-sm leading-relaxed text-paper-dim">{detail}</p>}
    </div>
  );
}
