import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthSession } from "../lib/api";

const STORAGE_KEY = "bail-reckoner-session";

interface AuthShape {
  session: AuthSession | null;
  setSession: (s: AuthSession | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthShape | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // sessionStorage unavailable (private browsing etc) — session still
      // works for the current render, just won't survive a refresh.
    }
  }, [session]);

  function setSession(s: AuthSession | null) {
    setSessionState(s);
  }

  function logout() {
    setSessionState(null);
  }

  return <AuthContext.Provider value={{ session, setSession, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const ROLE_LABEL: Record<string, string> = {
  undertrial: "Undertrial",
  legal_aid: "Legal Aid",
  judicial: "Judicial",
  prison_authority: "Prison Authority",
  guest: "Guest",
};
