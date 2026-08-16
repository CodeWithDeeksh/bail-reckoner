import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, UserRound, Scale, Landmark, ShieldCheck, ArrowRight, Loader2, ServerCog } from "lucide-react";
import { useAuth } from "../store/authContext";
import { login, loginAsGuest, fetchDemoAccounts, wakeBackend, type DemoAccount } from "../lib/api";

const ROLE_ICON: Record<string, typeof UserRound> = {
  undertrial: UserRound,
  legal_aid: Scale,
  judicial: Landmark,
  prison_authority: ShieldCheck,
};

export default function Login() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [selected, setSelected] = useState<DemoAccount | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [waking, setWaking] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<"login" | "guest" | null>(null);

  useEffect(() => {
    fetchDemoAccounts().then(setAccounts);
  }, []);

  const from = (location.state as any)?.from?.pathname || "/analyze";

  async function wakeThenRetry(action: "login" | "guest") {
    setWaking(0);
    setError(null);
    const ok = await wakeBackend((elapsed) => setWaking(elapsed));
    setWaking(null);
    if (!ok) {
      setError("Backend still unreachable after 45s. Check it's deployed and running, then try again.");
      return;
    }
    if (action === "login") await handleLogin();
    else await handleGuest();
  }

  async function handleLogin() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setPendingAction("login");
    const result = await login(selected.username, password);
    setBusy(false);
    if (result.session) {
      setSession(result.session);
      navigate(from, { replace: true });
    } else {
      setError(result.error || "Login failed.");
    }
  }

  async function handleGuest() {
    setBusy(true);
    setError(null);
    setPendingAction("guest");
    const result = await loginAsGuest();
    setBusy(false);
    if (result.session) {
      setSession(result.session);
      navigate(from, { replace: true });
    } else {
      setError(
        result.error === "backend-unreachable"
          ? "Rule-engine backend isn't responding — it may be waking up from sleep (free tier)."
          : result.error || "Guest login failed."
      );
    }
  }

  return (
    <div className="grid-field flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel w-full max-w-md p-8 sm:p-10"
      >
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Bail // Reckoner</p>
        <h1 className="mt-2 font-display text-2xl text-paper">Sign in</h1>
        <p className="mt-2 text-sm text-paper-dim">
          Demo credentials only — this gates the prototype, not real case data. Every analysis you
          run is computed by the live backend rule engine, not this browser.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {accounts.length === 0 && (
            <p className="col-span-2 text-xs text-paper-dim">
              Loading demo accounts… if this doesn't populate, the backend may be asleep — try
              Guest mode below, which can wake it for you.
            </p>
          )}
          {accounts.map((a) => {
            const Icon = ROLE_ICON[a.role] || UserRound;
            const active = selected?.username === a.username;
            return (
              <button
                key={a.username}
                onClick={() => {
                  setSelected(a);
                  setError(null);
                }}
                className={`flex flex-col items-start gap-1.5 border p-3 text-left transition-colors ${
                  active ? "border-cyan text-cyan" : "border-line-strong text-paper-dim hover:border-line-strong hover:text-paper"
                }`}
              >
                <Icon size={16} />
                <span className="font-mono text-[10px] uppercase tracking-[0.06em]">{a.display_name.split("(")[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {selected && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3 overflow-hidden">
            <div className="flex items-center gap-2 border border-line-strong bg-navy px-3 py-2.5">
              <Lock size={14} className="text-paper-dim" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-transparent text-sm text-paper outline-none placeholder:text-paper-dim/50"
                autoFocus
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={busy || waking !== null || !password}
              className="flex w-full items-center justify-center gap-2 bg-cyan py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-40"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              Sign in as {selected.display_name.split("(")[0].trim()}
            </button>
          </motion.div>
        )}

        {waking !== null && (
          <div className="mt-4 flex items-center gap-2.5 border border-cyan-dim bg-cyan/5 px-3 py-2.5 text-sm text-paper-dim">
            <ServerCog size={14} className="animate-spin text-cyan" />
            Waking the rule-engine backend… {waking}s
          </div>
        )}

        {error && (
          <div className="mt-4 space-y-2">
            <p className="text-xs leading-relaxed text-warn">{error}</p>
            {pendingAction && waking === null && (
              <button
                onClick={() => wakeThenRetry(pendingAction)}
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan underline"
              >
                Wake backend &amp; retry
              </button>
            )}
          </div>
        )}

        <div className="mt-8 border-t border-line pt-6 text-center">
          <button
            onClick={handleGuest}
            disabled={busy || waking !== null}
            className="font-mono text-xs uppercase tracking-[0.1em] text-paper-dim underline hover:text-cyan disabled:opacity-40"
          >
            Continue as Guest — see the demo without an account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
