import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import type { OfficerRole } from "@/lib/authStorage";

function FullScreenStatus({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function ProtectedRoute({ roles }: { roles?: OfficerRole[] }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <FullScreenStatus label="Restoring session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenStatus label="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
