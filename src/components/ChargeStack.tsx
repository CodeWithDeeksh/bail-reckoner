import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { Charge } from "../types";

const COMPOUNDABILITY_LABEL: Record<string, string> = {
  compoundable: "Compoundable",
  compoundable_with_permission: "Compoundable with permission",
  non_compoundable: "Non-compoundable",
  unknown: "Unknown",
};

export default function ChargeStack({ charges }: { charges: Charge[] }) {
  return (
    <section className="glass-panel p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Charges evaluated</p>

      <div className="mt-4 space-y-3">
        {charges.map((ch, i) => (
          <motion.div
            key={ch.chargeId}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="border border-line p-4"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-gold">Charge {String(i + 1).padStart(2, "0")}</span>
            <p className="mt-1 font-display text-lg text-paper">{ch.section || "Section not recorded"}</p>
            <p className="text-sm text-paper-dim">{ch.offenceName || "Offence name not recorded"}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-paper-dim">
              <span>Max punishment: {ch.maxImprisonmentYears ?? "?"}y</span>
              <span>·</span>
              <span>{ch.isBailable === "unknown" ? "Bailable: unknown" : ch.isBailable === "yes" ? "Bailable" : "Non-bailable"}</span>
              <span>·</span>
              <span>{COMPOUNDABILITY_LABEL[ch.compoundability]}</span>
              {ch.isSpecialStatute && (
                <>
                  <span>·</span>
                  <span className="text-gold">Special statute: {ch.specialStatuteName || "Unspecified"}</span>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {charges.length > 1 && (
        <div className="mt-6 border-t border-line pt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-cyan">Charge synthesis</p>
          <p className="mt-2 text-sm leading-relaxed text-paper-dim">
            Multiple charges detected. Each charge has been evaluated individually — no single
            charge's status is assumed to determine the whole case.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li className="flex gap-2 text-paper-dim">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-good" /> Charge classification completed
            </li>
            <li className="flex gap-2 text-paper-dim">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-good" /> Maximum punishment mapped per charge
            </li>
            <li className="flex gap-2 text-paper-dim">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warn" /> Combined-case assessment required — a human reviewer should weigh all charges together
            </li>
          </ul>
        </div>
      )}
    </section>
  );
}
