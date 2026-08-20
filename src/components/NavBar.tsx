import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, UserCircle2, ChevronDown } from "lucide-react";
import { useAuth, ROLE_LABEL } from "../store/authContext";
import { useLanguage, type AppLanguage } from "../i18n/language";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze a Case" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/integrations", label: "Integrations" },
];

const MORE_ITEMS = [
  { to: "/compare", label: "Compare Cases" },
  { to: "/lookup", label: "Public Case Lookup" },
  { to: "/rule-history", label: "Rule Version History" },
];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();

  // Close the "More" dropdown on any click/tap outside it — this works
  // reliably on both desktop and touch, unlike onMouseLeave which fires
  // immediately on tap and closes the menu before a link click registers.
  useEffect(() => {
    if (!moreOpen) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [moreOpen]);

  const navLabels: Record<string, string> = {
    Home: t("home"),
    "Analyze a Case": t("analyze"),
    Dashboard: t("dashboard"),
    Integrations: t("integrations"),
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg tracking-tight text-paper">Bail</span>
          <span className="font-mono text-lg text-cyan">// Reckoner</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
                  active ? "text-cyan" : "text-paper-dim hover:text-paper"
                }`}
              >
                {navLabels[item.label]}
              </Link>
            );
          })}

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className={`flex items-center gap-1 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
                MORE_ITEMS.some((m) => m.to === location.pathname) ? "text-cyan" : "text-paper-dim hover:text-paper"
              }`}
              aria-expanded={moreOpen}
              aria-label="More options"
            >
              More <ChevronDown size={12} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 border border-line-strong bg-navy shadow-lg z-50">
                {MORE_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className={`block px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
                      location.pathname === item.to ? "text-cyan" : "text-paper-dim hover:bg-navy-light hover:text-paper"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 font-mono text-[10px] uppercase text-paper-dim">
            <span className="hidden sm:inline">{t("language")}</span>
            <select
              aria-label={t("language")}
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className="border border-line bg-ink px-1 py-1 text-paper text-[11px]"
              title={t("language")}
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="kn">KN</option>
            </select>
          </label>

          {session ? (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-paper-dim">
                <UserCircle2 size={14} className="text-cyan" />
                {ROLE_LABEL[session.role] || session.role}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                aria-label={t("signOut")}
                className="flex items-center gap-1 border border-line-strong px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-paper-dim hover:border-alert hover:text-alert"
              >
                <LogOut size={12} /> {t("signOut")}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-none border border-cyan-dim px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-cyan transition-colors hover:bg-cyan hover:text-ink md:block"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
