import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, type UserRole } from "@/stores/authStore";

interface RequireAuthProps {
  children: ReactNode;
  /** Quando definido, além de estar logado o `role` do usuário precisa estar nesta lista. */
  roles?: UserRole[];
}

/** Protege uma rota atrás do login Supabase — opcionalmente também exige um papel específico (imposto de verdade no servidor via RLS, isto é só a UI). */
export function RequireAuth({ children, roles }: RequireAuthProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const initializing = useAuthStore((s) => s.initializing);
  const location = useLocation();

  if (initializing) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
