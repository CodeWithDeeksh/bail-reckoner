export type ViewerMode = "undertrial" | "legal_aid" | "judicial" | "prison_authority";

const MODES: { id: ViewerMode; label: string }[] = [
  { id: "undertrial", label: "Undertrial" },
  { id: "legal_aid", label: "Legal Aid" },
  { id: "judicial", label: "Judicial" },
  { id: "prison_authority", label: "Prison Authority" },
];

export default function ModeSelector({ mode, onChange }: { mode: ViewerMode; onChange: (m: ViewerMode) => void }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-paper-dim">Mode</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Presentation mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={mode === m.id}
            onClick={() => onChange(m.id)}
            className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors ${
              mode === m.id ? "border-cyan text-cyan" : "border-line-strong text-paper-dim hover:text-paper"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
