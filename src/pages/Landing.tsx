import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Scale, UserRound, Landmark, ShieldCheck } from "lucide-react";
import { useLanguage } from "../i18n/language";

const NARRATIVE = [
  {
    id: "case-data",
    stage: "Case Data",
    title: "Structured case information, entered once",
    body: "Person, charges, custody dates and procedural facts — captured as discrete fields, not free text. Nothing is inferred that wasn't supplied.",
  },
  {
    id: "normalization",
    stage: "Normalization",
    title: "Facts are normalized against known statutes",
    body: "Sections are matched to their statute, maximum sentence, bailability, and compoundability so every downstream rule works from the same vocabulary.",
  },
  {
    id: "rule-engine",
    stage: "Legal Rule Engine",
    title: "A deterministic, versioned rule engine — not a model",
    body: "Every pathway is a fixed statutory test: BNSS §187, BNSS §479, offence classification, special-statute registry. Same facts in, same result out, every time.",
  },
  {
    id: "custody-timeline",
    stage: "Custody Timeline",
    title: "Custody duration calculated against today, visibly",
    body: "Arrest date, custody start, chargesheet status and any delay attributable to the accused are laid out on a timeline you can inspect, not a hidden variable.",
  },
  {
    id: "pathways",
    stage: "Potential Pathways",
    title: "Pathways are flagged, never scores",
    body: "A case can surface a statutory-bail pathway, a default-bail pathway, an undertrial threshold, or a special-statute review — each independently triggered and shown together.",
  },
  {
    id: "explainability",
    stage: "Explainability",
    title: "Every flag traces back to a provision and a fact",
    body: "Expand \"Why was this flagged?\" on any pathway to see the exact facts, the calculation, the conditions checked, and anything still unresolved.",
  },
  {
    id: "integration",
    stage: "Integration",
    title: "Built to connect later, not connected now",
    body: "Adapters for eCourts, ePrisons, ICJS and CCTNS are integration-ready or government-restricted stubs. Nothing in this prototype touches a live system.",
  },
];

export default function Landing() {
  const { t } = useLanguage();

  const users = [
    { icon: UserRound, label: t("undertrial"), detail: t("undertrialDetail") },
    { icon: Scale, label: t("legalAid"), detail: t("legalAidDetail") },
    { icon: Landmark, label: t("judiciary"), detail: t("judiciaryDetail") },
  ];

  return (
    <div>
      <Hero t={t} />
      <ScrollNarrative t={t} />

      {/* USERS */}
      <section className="border-b border-line px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">{t("serves")}</p>
          <div className="mt-8 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
            {users.map((u, i) => (
              <motion.div
                key={u.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-ink p-8"
              >
                <u.icon size={22} className="text-cyan" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-xl text-paper">{u.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper-dim">{u.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* POSITIONING STATEMENT */}
      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <ShieldCheck size={22} className="mx-auto text-gold" strokeWidth={1.5} />
          <p className="mt-6 font-display text-2xl leading-snug text-paper sm:text-3xl">
            {t("positioning")}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-paper-dim">
            {t("positioningBody")}
          </p>
        </div>
      </section>
    </div>
  );
}

function Hero({ t }: { t: (key: string) => string }) {
  return (
    <section className="grid-field relative overflow-hidden border-b border-line px-6 pb-20 pt-20 lg:px-10 lg:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink" />
      <div className="relative mx-auto max-w-7xl">
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">
          {t("ministry")}
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-6 font-display text-6xl font-medium leading-[0.95] text-paper sm:text-7xl lg:text-8xl">
          Bail
          <br />
          <span className="text-cyan">Reckoner</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-8 max-w-xl font-display text-2xl italic leading-snug text-paper-dim">
          {t("heroTagline")}
        </motion.p>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-4 max-w-xl text-paper-dim">
          {t("heroBody")}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-10 flex flex-wrap items-center gap-4">
          <Link to="/analyze" className="group flex items-center gap-2 bg-cyan px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-transform hover:-translate-y-0.5">
            {t("analyze")}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a href="#how-it-works" className="border border-line-strong px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-paper-dim transition-colors hover:border-cyan-dim hover:text-paper">
            {t("explore")}
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function ScrollNarrative({ t }: { t: (key: string) => string }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="how-it-works" ref={ref} className="relative border-b border-line px-6 py-4 lg:px-10 scroll-mt-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:gap-16">
        {/* PINNED STAGE RAIL */}
        <div className="top-24 h-max shrink-0 lg:sticky lg:w-56">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">{t("how")}</p>
          <div className="relative mt-6 space-y-5 pl-5">
            <div className="absolute bottom-2 left-[3px] top-2 w-px bg-line-strong" />
            {!prefersReducedMotion && (
              <motion.div
                className="absolute left-[3px] top-2 w-px origin-top bg-cyan"
                style={{ scaleY: scrollYProgress, height: "calc(100% - 16px)" }}
              />
            )}
            {NARRATIVE.map((n, i) => (
              <StageLabel key={n.id} index={i} stage={n.stage} progress={scrollYProgress} total={NARRATIVE.length} />
            ))}
          </div>
        </div>

        {/* NARRATIVE CONTENT */}
        <div className="flex-1 space-y-32 py-16 lg:py-24">
          {NARRATIVE.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30% 0px -30% 0px" }}
              transition={{ duration: 0.5 }}
              className="max-w-xl"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-cyan">
                {String(i + 1).padStart(2, "0")} / {String(NARRATIVE.length).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-3xl leading-tight text-paper sm:text-4xl">{n.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-paper-dim">{n.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StageLabel({
  index,
  stage,
  progress,
  total,
}: {
  index: number;
  stage: string;
  progress: import("framer-motion").MotionValue<number>;
  total: number;
}) {
  const isActive = useTransform(progress, (p) => {
    const band = 1 / total;
    return p >= band * index - band * 0.4 && p < band * (index + 1) + band * 0.1;
  });
  const dotColor = useTransform(isActive, (a) => (a ? "var(--color-cyan)" : "var(--color-line-strong)"));
  const textColor = useTransform(isActive, (a) => (a ? "var(--color-cyan)" : "var(--color-paper-dim)"));
  return (
    <motion.div className="relative flex items-center gap-3">
      <motion.span className="absolute -left-5 h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
      <motion.span className="font-mono text-xs uppercase tracking-[0.08em]" style={{ color: textColor }}>
        {stage}
      </motion.span>
    </motion.div>
  );
}
