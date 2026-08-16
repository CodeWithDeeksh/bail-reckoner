import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Case, Charge, YesNoUnknown, Compoundability } from "../types";
import { DEMO_CASES } from "../data/demoCases";
import { useCaseStore } from "../store/caseStore";
import { useAuth } from "../store/authContext";
import ProcessingOverlay from "../components/ProcessingOverlay";
import RuleEvaluationTimeline from "../components/RuleEvaluationTimeline";

const STEPS = ["Case ID", "Charges", "Custody", "Offender & Cases", "Procedural", "Review"];

function makeCaseId(): string {
  const year = new Date().getFullYear();
  return `BR-${year}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function emptyCharge(id: string): Charge {
  return {
    chargeId: id,
    statute: "",
    section: "",
    offenceName: "",
    maxImprisonmentYears: null,
    isBailable: "unknown",
    compoundability: "unknown",
    isDeathOrLifePunishable: false,
    isSpecialStatute: false,
  };
}

function emptyCase(caseId: string): Case {
  const today = new Date().toISOString().slice(0, 10);
  return {
    caseId,
    createdAt: today,
    person: { personId: caseId, displayId: "", age: 25, firstTimeOffender: "unknown" },
    charges: [emptyCharge(`${caseId}-C1`)],
    custody: {
      arrestDate: today,
      custodyStartDate: today,
      policeCustodyDays: 0,
      judicialCustodyDays: 0,
      accusedDelayStatus: "unknown",
      accusedAttributableDelayDays: 0,
      chargesheetFiled: "unknown",
    },
    status: {
      currentCourt: "",
      caseStage: "",
      bail: { previouslyApplied: false, previouslyRejected: false },
      multiplePendingCases: false,
      knownCriminalHistory: "unknown",
      specialConditionFlags: [],
    },
  };
}

const inputCls =
  "w-full border border-line-strong bg-navy px-3 py-2.5 text-sm text-paper placeholder:text-paper-dim/50 outline-none transition-colors focus:border-cyan";
const labelCls = "font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim";
const fieldWrap = "flex flex-col gap-1.5";

function YesNoUnknownSelect({ value, onChange, label }: { value: YesNoUnknown; onChange: (v: YesNoUnknown) => void; label: string }) {
  return (
    <div className={fieldWrap}>
      <label className={labelCls}>{label}</label>
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value as YesNoUnknown)}>
        <option value="yes">Yes</option>
        <option value="no">No</option>
        <option value="unknown">Unknown</option>
      </select>
    </div>
  );
}

const COMPOUNDABILITY_LABEL: Record<Compoundability, string> = {
  compoundable: "Compoundable",
  compoundable_with_permission: "Compoundable with court permission",
  non_compoundable: "Non-compoundable",
  unknown: "Unknown",
};

export default function CaseAnalyzer() {
  const navigate = useNavigate();
  const { analyze } = useCaseStore();
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [caseId] = useState(() => makeCaseId());
  const [c, setC] = useState<Case>(() => emptyCase(caseId));
  const [processing, setProcessing] = useState(false);

  function loadDemo(demoId: string) {
    const demo = DEMO_CASES.find((d) => d.caseId === demoId);
    if (!demo) return;
    setC({ ...demo, caseId });
    setStep(5);
  }

  function updateCharge(i: number, patch: Partial<Charge>) {
    setC((prev) => {
      const charges = [...prev.charges];
      charges[i] = { ...charges[i], ...patch };
      return { ...prev, charges };
    });
  }

  function addCharge() {
    setC((prev) => ({ ...prev, charges: [...prev.charges, emptyCharge(`${prev.caseId}-C${prev.charges.length + 1}`)] }));
  }

  function removeCharge(i: number) {
    setC((prev) => ({ ...prev, charges: prev.charges.filter((_, idx) => idx !== i) }));
  }

  function runAnalysis() {
    setProcessing(true);
  }

  function onAnalysisSuccess() {
    navigate(`/results/${c.caseId}`);
  }

  function onAnalysisCancel() {
    setProcessing(false);
  }

  const custodyDays = c.custody.custodyStartDate
    ? Math.max(0, Math.round((new Date().getTime() - new Date(c.custody.custodyStartDate).getTime()) / 86400000))
    : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
      {processing && (
        <ProcessingOverlay
          run={() => analyze(c, session?.accessToken || "")}
          onSuccess={onAnalysisSuccess}
          onCancel={onAnalysisCancel}
        />
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Case Analyzer</p>
          <h1 className="mt-2 font-display text-3xl text-paper">Case #{c.caseId}</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="border border-gold/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-gold">
            Synthetic Demo Data
          </span>
          <select
            className="border border-line-strong bg-navy px-3 py-2 text-xs text-paper-dim outline-none focus:border-cyan"
            defaultValue=""
            onChange={(e) => e.target.value && loadDemo(e.target.value)}
            aria-label="Load a synthetic demo case"
          >
            <option value="" disabled>
              Load demo case…
            </option>
            {DEMO_CASES.map((d) => (
              <option key={d.caseId} value={d.caseId}>
                {d.caseId} — {d.person.displayId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mt-8 flex items-center gap-2" role="tablist" aria-label="Case analysis steps">
        {STEPS.map((s, i) => (
          <button
            key={s}
            role="tab"
            aria-selected={i === step}
            onClick={() => setStep(i)}
            className="flex flex-1 flex-col items-start gap-2 text-left"
          >
            <div className={`h-1 w-full transition-colors ${i <= step ? "bg-cyan" : "bg-line-strong"}`} />
            <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${i === step ? "text-cyan" : "text-paper-dim"}`}>
              {String(i + 1).padStart(2, "0")} {s}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
          className="mt-10"
        >
          {/* STEP 0 — CASE IDENTIFICATION */}
          {step === 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className={fieldWrap}>
                <label className={labelCls}>Case ID</label>
                <input className={inputCls} value={c.caseId} disabled />
              </div>
              <div className={fieldWrap}>
                <label className={labelCls}>Name / anonymized identifier</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Undertrial A.K."
                  value={c.person.displayId}
                  onChange={(e) => setC({ ...c, person: { ...c.person, displayId: e.target.value } })}
                />
              </div>
              <div className={fieldWrap}>
                <label className={labelCls}>Age</label>
                <input type="number" className={inputCls} value={c.person.age} onChange={(e) => setC({ ...c, person: { ...c.person, age: Number(e.target.value) } })} />
              </div>
              <div className={fieldWrap}>
                <label className={labelCls}>Current court</label>
                <input className={inputCls} value={c.status.currentCourt} onChange={(e) => setC({ ...c, status: { ...c.status, currentCourt: e.target.value } })} />
              </div>
              <div className={`${fieldWrap} sm:col-span-2`}>
                <label className={labelCls}>Case stage</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Investigation, Trial — framing of charges"
                  value={c.status.caseStage}
                  onChange={(e) => setC({ ...c, status: { ...c.status, caseStage: e.target.value } })}
                />
              </div>
            </div>
          )}

          {/* STEP 1 — CHARGES */}
          {step === 1 && (
            <div className="space-y-6">
              {c.charges.map((ch, i) => (
                <div key={ch.chargeId} className="glass-panel space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-[0.1em] text-gold">Charge {i + 1}</span>
                    {c.charges.length > 1 && (
                      <button onClick={() => removeCharge(i)} className="text-xs text-paper-dim hover:text-alert">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className={fieldWrap}>
                      <label className={labelCls}>Statute</label>
                      <input className={inputCls} value={ch.statute} onChange={(e) => updateCharge(i, { statute: e.target.value })} />
                    </div>
                    <div className={fieldWrap}>
                      <label className={labelCls}>Section(s)</label>
                      <input className={inputCls} placeholder="e.g. BNS §303(2)" value={ch.section} onChange={(e) => updateCharge(i, { section: e.target.value })} />
                    </div>
                    <div className={fieldWrap}>
                      <label className={labelCls}>Offence name</label>
                      <input className={inputCls} placeholder="e.g. Theft" value={ch.offenceName ?? ""} onChange={(e) => updateCharge(i, { offenceName: e.target.value })} />
                    </div>
                    <div className={fieldWrap}>
                      <label className={labelCls}>Maximum prescribed imprisonment (years)</label>
                      <input
                        type="number"
                        className={inputCls}
                        value={ch.maxImprisonmentYears ?? ""}
                        onChange={(e) => updateCharge(i, { maxImprisonmentYears: e.target.value === "" ? null : Number(e.target.value) })}
                      />
                    </div>
                    <YesNoUnknownSelect label="Is offence bailable?" value={ch.isBailable} onChange={(v) => updateCharge(i, { isBailable: v })} />
                    <div className={fieldWrap}>
                      <label className={labelCls}>Compoundability</label>
                      <select className={inputCls} value={ch.compoundability} onChange={(e) => updateCharge(i, { compoundability: e.target.value as Compoundability })}>
                        {Object.entries(COMPOUNDABILITY_LABEL).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div className={fieldWrap}>
                      <label className={labelCls}>Punishable with death / life imprisonment?</label>
                      <select className={inputCls} value={ch.isDeathOrLifePunishable ? "yes" : "no"} onChange={(e) => updateCharge(i, { isDeathOrLifePunishable: e.target.value === "yes" })}>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                    <div className={fieldWrap}>
                      <label className={labelCls}>Under a special statute?</label>
                      <select className={inputCls} value={ch.isSpecialStatute ? "yes" : "no"} onChange={(e) => updateCharge(i, { isSpecialStatute: e.target.value === "yes" })}>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                    {ch.isSpecialStatute && (
                      <div className={fieldWrap}>
                        <label className={labelCls}>Special statute name</label>
                        <input
                          className={inputCls}
                          placeholder="e.g. NDPS, UAPA, PMLA, POCSO, SC/ST Act"
                          value={ch.specialStatuteName ?? ""}
                          onChange={(e) => updateCharge(i, { specialStatuteName: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                  {/* Charge card preview */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 font-mono text-[11px] text-paper-dim">
                    <span>{ch.section || "Section —"}</span>
                    <span>·</span>
                    <span>{ch.offenceName || "Offence —"}</span>
                    <span>·</span>
                    <span>Max {ch.maxImprisonmentYears ?? "?"}y</span>
                    <span>·</span>
                    <span>{ch.isBailable === "unknown" ? "Bailable: ?" : ch.isBailable === "yes" ? "Bailable" : "Non-bailable"}</span>
                    <span>·</span>
                    <span>{COMPOUNDABILITY_LABEL[ch.compoundability]}</span>
                  </div>
                </div>
              ))}
              <button onClick={addCharge} className="border border-dashed border-line-strong px-4 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-paper-dim hover:border-cyan hover:text-cyan">
                + Add another charge
              </button>
            </div>
          )}

          {/* STEP 2 — CUSTODY */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className={fieldWrap}>
                  <label className={labelCls}>Arrest date</label>
                  <input type="date" className={inputCls} value={c.custody.arrestDate} onChange={(e) => setC({ ...c, custody: { ...c.custody, arrestDate: e.target.value, custodyStartDate: e.target.value } })} />
                </div>
                <div className={fieldWrap}>
                  <label className={labelCls}>Custody start date</label>
                  <input type="date" className={inputCls} value={c.custody.custodyStartDate} onChange={(e) => setC({ ...c, custody: { ...c.custody, custodyStartDate: e.target.value } })} />
                </div>
                <div className={fieldWrap}>
                  <label className={labelCls}>Police custody (days)</label>
                  <input type="number" className={inputCls} value={c.custody.policeCustodyDays} onChange={(e) => setC({ ...c, custody: { ...c.custody, policeCustodyDays: Number(e.target.value) } })} />
                </div>
                <div className={fieldWrap}>
                  <label className={labelCls}>Judicial custody (days)</label>
                  <input type="number" className={inputCls} value={c.custody.judicialCustodyDays} onChange={(e) => setC({ ...c, custody: { ...c.custody, judicialCustodyDays: Number(e.target.value) } })} />
                </div>
                <YesNoUnknownSelect label="Chargesheet filed?" value={c.custody.chargesheetFiled} onChange={(v) => setC({ ...c, custody: { ...c.custody, chargesheetFiled: v } })} />
                {c.custody.chargesheetFiled === "yes" && (
                  <div className={fieldWrap}>
                    <label className={labelCls}>Chargesheet date</label>
                    <input type="date" className={inputCls} value={c.custody.chargesheetDate ?? ""} onChange={(e) => setC({ ...c, custody: { ...c.custody, chargesheetDate: e.target.value } })} />
                  </div>
                )}
              </div>
              <div className="glass-panel p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Custody duration (calculated)</p>
                <p className="mono-num mt-2 font-mono text-2xl text-cyan">
                  TODAY − {c.custody.custodyStartDate || "—"} = <span className="text-paper">{custodyDays ?? "—"} days</span>
                </p>
              </div>
            </div>
          )}

          {/* STEP 3 — OFFENDER & CASES */}
          {step === 3 && (
            <div className="grid gap-6 sm:grid-cols-2">
              <YesNoUnknownSelect label="First-time offender?" value={c.person.firstTimeOffender} onChange={(v) => setC({ ...c, person: { ...c.person, firstTimeOffender: v } })} />
              <div className={fieldWrap}>
                <label className={labelCls}>Multiple pending cases?</label>
                <select className={inputCls} value={c.status.multiplePendingCases ? "yes" : "no"} onChange={(e) => setC({ ...c, status: { ...c.status, multiplePendingCases: e.target.value === "yes" } })}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <YesNoUnknownSelect label="Known criminal history?" value={c.status.knownCriminalHistory} onChange={(v) => setC({ ...c, status: { ...c.status, knownCriminalHistory: v } })} />
              <div className={fieldWrap}>
                <label className={labelCls}>Bail previously applied?</label>
                <select className={inputCls} value={c.status.bail.previouslyApplied ? "yes" : "no"} onChange={(e) => setC({ ...c, status: { ...c.status, bail: { ...c.status.bail, previouslyApplied: e.target.value === "yes" } } })}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className={fieldWrap}>
                <label className={labelCls}>Bail previously rejected?</label>
                <select className={inputCls} value={c.status.bail.previouslyRejected ? "yes" : "no"} onChange={(e) => setC({ ...c, status: { ...c.status, bail: { ...c.status.bail, previouslyRejected: e.target.value === "yes" } } })}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4 — PROCEDURAL INFORMATION */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <YesNoUnknownSelect
                  label="Delay attributable to accused?"
                  value={c.custody.accusedDelayStatus}
                  onChange={(v) => setC({ ...c, custody: { ...c.custody, accusedDelayStatus: v } })}
                />
                {c.custody.accusedDelayStatus === "yes" && (
                  <div className={fieldWrap}>
                    <label className={labelCls}>Accused-attributable delay (days)</label>
                    <input
                      type="number"
                      className={inputCls}
                      value={c.custody.accusedAttributableDelayDays}
                      onChange={(e) => setC({ ...c, custody: { ...c.custody, accusedAttributableDelayDays: Number(e.target.value) } })}
                    />
                  </div>
                )}
              </div>
              <div className={fieldWrap}>
                <label className={labelCls}>Special conditions / flags (comma separated)</label>
                <input
                  className={inputCls}
                  value={c.status.specialConditionFlags.join(", ")}
                  onChange={(e) => setC({ ...c, status: { ...c.status, specialConditionFlags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })}
                />
              </div>
              <p className="text-xs leading-relaxed text-paper-dim">
                Delay attributable to the accused is deducted from custody only when explicitly recorded as
                <span className="text-paper"> Yes</span>. If left as <span className="text-paper">Unknown</span>, the
                engine surfaces this as an unresolved item rather than guessing.
              </p>
            </div>
          )}

          {/* STEP 5 — REVIEW */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="glass-panel p-6">
                <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Ready for rule evaluation</p>
                <RuleEvaluationTimeline activeIndex={0} compact />
              </div>
              <div className="glass-panel divide-y divide-line p-0">
                <SummaryRow label="Case ID" value={c.caseId} />
                <SummaryRow label="Person" value={`${c.person.displayId || "—"} · Age ${c.person.age} · First-time: ${c.person.firstTimeOffender}`} />
                <SummaryRow label="Charges" value={c.charges.map((ch) => `${ch.section || "—"} (${ch.offenceName || "?"}, max ${ch.maxImprisonmentYears ?? "?"}y, bailable: ${ch.isBailable})`).join("; ")} />
                <SummaryRow label="Custody" value={`${custodyDays ?? "—"} days since ${c.custody.custodyStartDate || "—"} · Chargesheet: ${c.custody.chargesheetFiled}`} />
                <SummaryRow label="Offender / Cases" value={`Multiple cases: ${c.status.multiplePendingCases ? "Yes" : "No"} · Criminal history: ${c.status.knownCriminalHistory}`} />
                <SummaryRow label="Procedural" value={`Accused delay: ${c.custody.accusedDelayStatus}${c.custody.accusedDelayStatus === "yes" ? ` (${c.custody.accusedAttributableDelayDays}d)` : ""}`} />
                <SummaryRow label="Court / Stage" value={`${c.status.currentCourt || "—"} · ${c.status.caseStage || "—"}`} />
                <SummaryRow label="Flags" value={c.status.specialConditionFlags.join(", ") || "None recorded"} />
              </div>
              <button
                onClick={runAnalysis}
                className="w-full bg-cyan py-4 text-center font-mono text-sm uppercase tracking-[0.14em] text-ink transition-transform hover:-translate-y-0.5"
              >
                Run Bail Analysis
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {step < 5 && (
        <div className="mt-10 flex items-center justify-between">
          <button disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="font-mono text-xs uppercase tracking-[0.1em] text-paper-dim disabled:opacity-30">
            ← Back
          </button>
          <button onClick={() => setStep((s) => Math.min(5, s + 1))} className="border border-cyan-dim px-6 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-cyan hover:bg-cyan hover:text-ink">
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-baseline sm:gap-6">
      <span className="w-40 shrink-0 font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">{label}</span>
      <span className="text-sm text-paper">{value}</span>
    </div>
  );
}
