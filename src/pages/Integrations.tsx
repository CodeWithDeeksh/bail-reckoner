import { motion } from "framer-motion";

type IntegrationStatus =
  | "integration_ready"
  | "access_controlled"
  | "government_integration"
  | "government_restricted"
  | "future_connector";

const STATUS_LABEL: Record<IntegrationStatus, string> = {
  integration_ready: "Integration-ready",
  access_controlled: "Access controlled",
  government_integration: "Government integration",
  government_restricted: "Government restricted",
  future_connector: "Future connector",
};

const STATUS_DESC: Record<IntegrationStatus, string> = {
  integration_ready: "Adapter interface is defined in this codebase and ready to be pointed at a real endpoint once authorized. No live data.",
  access_controlled: "Endpoint access is governed by role-based permissions on the source system — connection is not available in this prototype.",
  government_integration: "Would require a formal integration agreement with the owning department before any connection can be attempted.",
  government_restricted: "Requires government authorization / MoU before any connection can even be scoped.",
  future_connector: "Not yet designed. Planned for a later phase, pending institutional sign-off.",
};

const STATUS_TONE: Record<IntegrationStatus, string> = {
  integration_ready: "text-good border-good",
  access_controlled: "text-cyan border-cyan-dim",
  government_integration: "text-gold border-gold",
  government_restricted: "text-warn border-warn",
  future_connector: "text-paper-dim border-line-strong",
};

const INTEGRATIONS: { name: string; status: IntegrationStatus }[] = [
  { name: "eCourts / CIS", status: "integration_ready" },
  { name: "NJDG", status: "access_controlled" },
  { name: "ePrisons", status: "government_integration" },
  { name: "ICJS", status: "government_restricted" },
  { name: "CCTNS", status: "government_restricted" },
  { name: "NALSA / DLSA", status: "future_connector" },
];

const LAYERS = ["Government Systems", "Authentication / Authorization", "Adapter Layer", "Normalization Layer", "Bail Reckoner Rule Engine"];

export default function Integrations() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Integrations</p>
        <span className="border border-gold/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-gold">
          Prototype • No live government data
        </span>
      </div>
      <h1 className="mt-2 font-display text-4xl text-paper">Government system adapters</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper-dim">
        This prototype is not connected to any live government system. Every case shown elsewhere
        in this application is synthetic. The statuses below distinguish what exists as a working
        mock, what is technically ready to connect, and what requires government authorization
        before any connection can even be scoped.
      </p>
      <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-paper">
        Live access requires appropriate authorization, authentication and institutional
        integration.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {(Object.keys(STATUS_LABEL) as IntegrationStatus[]).map((s) => (
          <span key={s} className={`border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${STATUS_TONE[s]}`}>
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      <div className="mt-8 overflow-hidden border border-line">
        {INTEGRATIONS.map((it, i) => (
          <motion.div
            key={it.name}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="border-b border-line px-5 py-4 last:border-b-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-sm text-paper">{it.name}</span>
              <span className={`border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] ${STATUS_TONE[it.status]}`}>
                {STATUS_LABEL[it.status]}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-paper-dim">{STATUS_DESC[it.status]}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Architecture</p>
        <div className="mt-6 space-y-0">
          {LAYERS.map((layer, i) => (
            <div key={layer}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className={`glass-panel px-5 py-4 text-center font-mono text-sm ${layer === "Bail Reckoner Rule Engine" ? "border-cyan-dim text-cyan" : "text-paper"}`}
              >
                {layer}
              </motion.div>
              {i < LAYERS.length - 1 && (
                <div className="flex justify-center py-1">
                  <svg width="16" height="20" aria-hidden="true">
                    <line x1="8" y1="0" x2="8" y2="18" stroke="var(--color-cyan-dim)" strokeWidth="1.5" className="flow-line" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 glass-panel border-l-2 border-l-gold p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gold">Note on authorization</p>
        <p className="mt-2 text-sm leading-relaxed text-paper-dim">
          No credentials are configured in this prototype, and nothing here implies live
          connectivity to eCourts, ePrisons, CCTNS, ICJS or NALSA. Government-restricted and
          government-integration connectors require formal authorization before any adapter can
          be pointed at a real endpoint.
        </p>
      </div>
    </div>
  );
}
