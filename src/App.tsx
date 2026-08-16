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

function Footer() {
  return (
    <footer className="border-t border-line px-6 py-8 text-center lg:px-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">
        Bail // Reckoner — SIH260405 Prototype — Synthetic data only — Not connected to eCourts,
        ePrisons, CCTNS, ICJS or NALSA
      </p>
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
        {/* Landing and Integrations stay public — informational pages a
            judge should be able to see without logging in first. */}
        <Route path="/integrations" element={<Integrations />} />
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  return (
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
  );
}
