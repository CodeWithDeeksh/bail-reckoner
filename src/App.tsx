import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CaseStoreProvider } from "./store/caseStore";
import { AuthProvider } from "./store/authContext";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import CaseAnalyzer from "./pages/CaseAnalyzer";
import ResultsPage from "./pages/ResultsPage";
import Dashboard from "./pages/Dashboard";
import Integrations from "./pages/Integrations";
import CaseLookup from "./pages/CaseLookup";
import CompareCases from "./pages/CompareCases";
import RuleHistory from "./pages/RuleHistory";
import { LanguageProvider, useLanguage } from "./i18n/language";

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-line px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">
          Bail // Reckoner — SIH260405 Prototype — {t("footer")}
        </p>
        <div className="mt-6 text-center text-[10px] leading-relaxed text-paper-dim">
          <p className="mb-2">
            <strong>Disclaimer:</strong> This is a decision-support tool only, not a substitute for judicial review. All bail decisions are ultimately judicial discretion.
          </p>
          <p className="mb-2">
            Rule engine based on BNSS 2023. Does not account for case law precedent, state-specific rules, or judicial interpretations.
          </p>
          <p>
            For use by authorized judicial/legal professionals only. Not intended for undertrial prisoners without professional guidance.
          </p>
        </div>
      </div>
    </footer>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();
  if (prefersReducedMotion) return <>{children}</>;
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/analyze"
          element={
            <ProtectedRoute>
              <CaseAnalyzer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results/:caseId"
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <CompareCases />
            </ProtectedRoute>
          }
        />
        {/* Landing, Integrations, Lookup, and Rule History stay public —
            informational / status-only pages a judge should be able to see
            without logging in first. */}
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/lookup" element={<CaseLookup />} />
        <Route path="/rule-history" element={<RuleHistory />} />
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CaseStoreProvider>
          <HashRouter>
            <div className="grid-field min-h-screen">
              <NavBar />
              <AppRoutes />
              <Footer />
            </div>
          </HashRouter>
        </CaseStoreProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
