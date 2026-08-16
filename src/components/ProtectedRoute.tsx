import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/authContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
