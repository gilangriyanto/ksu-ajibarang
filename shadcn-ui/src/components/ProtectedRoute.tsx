// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireKasId?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireKasId = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === "anggota") {
      return <Navigate to="/member" replace />;
    }
    if (user.role === "manager" || user.role === "admin") {
      return <Navigate to="/manager" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Check if kas_id is required but missing
  if (requireKasId && !user.kas_id) {
    // User doesn't have kas_id, redirect to main manager
    return <Navigate to="/manager" replace />;
  }

  // If user has kas_id but trying to access manager routes, redirect to kas
  if (user.kas_id && window.location.pathname.startsWith("/manager")) {
    return <Navigate to={`/kas/${user.kas_id}`} replace />;
  }

  // All checks passed, render children
  return <>{children}</>;
}
