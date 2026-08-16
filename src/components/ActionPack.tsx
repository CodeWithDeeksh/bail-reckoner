import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X } from "lucide-react";
import type { Case, EligibilityResult } from "../types";
import { RESULT_CATEGORY_LABEL } from "../types";

export default function ActionPack({ c, result }: { c: Case; result: EligibilityResult }) {
  const [open, setOpen] = useState(false);
  const primary = result.outcomes.find((o) => o.category === result.primaryCategory) ?? result.outcomes[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 bg-cyan py-4 font-mono text-sm uppercase tracking-[0.14em] text-ink transition-transform hover:-translate-y-0.5 sm:w-auto sm:px-8"
      >
        <FileText size={15} /> Generate Action Pack
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/90 px-4 py-10 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Action pack for case ${c.caseId}`}
              className="glass-panel w-full max-w-2xl border-cyan-dim p-8 sm:p-10"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-gold">
                    Prototype-generated decision-support report
                  </span>
                  <h2 className="mt-2 font-display text-2xl text-paper">Action Pack — Case #{c.caseId}</h2>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close" className="text-paper-dim hover:text-paper">
                  <X size={18} />
                </button>
              </div>

              <div className="mt-8 space-y-6 text-sm leading-relaxed text-paper">
                <ReportSection title="Case summary">
                  <p>
                    {c.person.displayId || "Unnamed"} · Age {c.person.age} · {c.status.currentCourt || "Court not recorded"} ·{" "}
                    {c.status.caseStage || "Stage not recorded"}
                  </p>
                </ReportSection>

                <ReportSection title="Applicable legal pathway">
                  <p>{RESULT_CATEGORY_LABEL[result.primaryCategory]} — {primary?.headline}</p>
                </ReportSection>

                <ReportSection title="Custody calculation">
                  {primary && primary.calculation.length > 0 ? (
                    <ul className="space-y-1">
                      {primary.calculation.map((l) => (
                        <li key={l.label} className="flex justify-between gap-4 font-mono text-xs">
                          <span className="text-paper-dim">{l.label}</span>
                          <span>{l.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-paper-dim">No calculation applicable to this pathway.</p>
                  )}
                </ReportSection>

                <ReportSection title="Relevant statutory provisions">
                  <ul className="space-y-1">
                    {result.outcomes.map((o) => (
                      <li key={o.pathwayId}>
                        {o.legalSource.section} — {o.legalSource.shortTitle}
                      </li>
                    ))}
                  </ul>
                </ReportSection>

                <ReportSection title="Data gaps">
                  {result.dataQuality.filter((f) => !f.ok).length > 0 ? (
                    <ul className="space-y-1">
                      {result.dataQuality
                        .filter((f) => !f.ok)
                        .map((f) => (
                          <li key={f.field}>
                            {f.field} — {f.note}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-paper-dim">No critical data gaps recorded.</p>
                  )}
                </ReportSection>

                <ReportSection title="Flags requiring human review">
                  <ul className="space-y-1">
                    {result.judicialFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </ReportSection>

                <ReportSection title="Suggested next procedural steps">
                  <p>{result.nextStep}</p>
                </ReportSection>

                <ReportSection title="Legal-aid checklist">
                  <ul className="list-inside list-disc space-y-1 text-paper-dim">
                    <li>Verify identity and custody dates against the case file</li>
                    <li>Confirm chargesheet-filing status with the investigating officer</li>
                    <li>Confirm first-time-offender and criminal-history status</li>
                    <li>Confirm whether a bail application has already been filed</li>
                    <li>Escalate special-statute charges to counsel experienced in that statute</li>
                  </ul>
                </ReportSection>

                <ReportSection title="Documents / information requiring verification">
                  <p className="text-paper-dim">
                    Arrest memo, custody register extract, chargesheet (if filed), prior bail
                    orders (if any), and identity documents.
                  </p>
                </ReportSection>
              </div>

              <p className="mt-8 border-t border-line pt-5 text-xs leading-relaxed text-paper-dim">
                This is a prototype-generated decision-support report built from synthetic demo
                data. It is not a court filing, not legal advice, and does not determine or grant
                bail.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-cyan">{title}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
