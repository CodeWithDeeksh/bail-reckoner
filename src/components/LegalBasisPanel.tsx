import { useState } from "react";
import { Scale, ChevronDown } from "lucide-react";
import type { LegalSource } from "../types";

export default function LegalBasisPanel({ source }: { source: LegalSource }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-navy-light/40"
      >
        <span className="flex items-center gap-2.5">
          <Scale size={14} className="text-gold" strokeWidth={1.5} />
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-gold">View legal basis</span>
        </span>
        <ChevronDown size={14} className={`text-paper-dim transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-line px-4 py-4">
          <p className="font-display text-lg text-paper">{source.section}</p>
          <p className="mt-1 text-sm text-paper-dim">{source.statute}</p>
          <p className="mt-2 text-sm italic text-paper-dim">&ldquo;{source.shortTitle}&rdquo;</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-paper-dim">
            <span>Source: {source.sourceName}</span>
            <span>Rule version: {source.ruleVersion}</span>
            <span>Last reviewed: {source.lastReviewed}</span>
          </div>
        </div>
      )}
    </div>
  );
}
