export default function Disclaimer() {
  return (
    <div className="glass-panel border-l-2 border-l-gold px-5 py-4 text-sm text-paper-dim">
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-gold">
        Decision-support tool. Not a judicial prediction or legal advice.
      </p>
      <p className="mt-2 leading-relaxed">
        This result does not constitute legal advice, does not grant bail and does not replace
        judicial or professional legal assessment. All case data in this prototype is synthetic.
      </p>
    </div>
  );
}
