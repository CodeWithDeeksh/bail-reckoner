import { motion, useReducedMotion } from "framer-motion";
import type { Case } from "../types";

interface Milestone {
  label: string;
  date?: string;
  note?: string;
}

export default function CaseTimeline({ c }: { c: Case }) {
  const prefersReducedMotion = useReducedMotion();
  const today = new Date().toISOString().slice(0, 10);
  const milestones: Milestone[] = [
    { label: "Arrest", date: c.custody.arrestDate },
    { label: "Police custody", note: `${c.custody.policeCustodyDays} days` },
    { label: "Judicial custody", note: `${c.custody.judicialCustodyDays} days` },
    {
      label: "Chargesheet",
      date: c.custody.chargesheetFiled === "yes" ? c.custody.chargesheetDate : undefined,
      note: c.custody.chargesheetFiled === "yes" ? undefined : "Not filed",
    },
    {
      label: "Bail application",
      note: c.status.bail.previouslyApplied ? (c.status.bail.previouslyRejected ? "Previously rejected" : "Previously applied") : "Not yet applied",
    },
    { label: "Today", date: today },
  ];

  return (
    <div className="relative pl-6">
      <motion.div
        initial={prefersReducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: "easeOut" }}
        style={{ transformOrigin: "top" }}
        className="absolute bottom-2 left-[7px] top-2 w-px bg-line-strong"
      />
      <div className="space-y-7">
        {milestones.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="relative"
          >
            <span
              className="absolute -left-6 top-1 block h-3.5 w-3.5 rounded-full border-2"
              style={{
                borderColor: m.label === "Today" ? "var(--color-cyan)" : "var(--color-gold-dim)",
                background: "var(--color-ink)",
              }}
            />
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-paper-dim">{m.label}</p>
            <p className="mt-0.5 text-sm text-paper">
              {m.date || m.note || "—"}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
