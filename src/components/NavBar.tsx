import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, UserCircle2 } from "lucide-react";
import { useAuth, ROLE_LABEL } from "../store/authContext";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze a Case" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/integrations", label: "Integrations" },
];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAuth();

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
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
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
                aria-label="Sign out"
                className="flex items-center gap-1 border border-line-strong px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-paper-dim hover:border-alert hover:text-alert"
              >
                <LogOut size={12} /> Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-none border border-cyan-dim px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-cyan transition-colors hover:bg-cyan hover:text-ink md:block"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
