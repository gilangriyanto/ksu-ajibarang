// src/components/ProtectedRoute.tsx
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireKasId?: boolean;
}

/**
 * Get redirect path for user based on their role
 */
const getRedirectPathForRole = (role: string): string => {
  switch (role) {
    case "admin":
      return "/manager";
    case "manager":
      return "/manager"; // ✅ Manager now goes to /manager (can manage multiple kas)
    case "anggota":
      return "/member";
    default:
      return "/login";
  }
};

/**
 * ProtectedRoute Component
 *
 * NEW ROLE MAPPING (Multiple Kas Support):
 * - "admin" = Super Admin (ManagerLayout) - Full system access
 * - "manager" = Manager (ManagerLayout) - Can manage multiple kas
 * - "anggota" = Member (MemberLayout) - Limited access
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  requireKasId = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const params = useParams();
  const kasId = params.kasId ? parseInt(params.kasId) : undefined;

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
    console.log("🔒 Not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // Check if user is active
  if (!user.is_active) {
    console.log("⚠️ User is not active");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Akun Tidak Aktif
          </h2>
          <p className="text-gray-600 mb-6">
            Akun Anda saat ini tidak aktif. Silakan hubungi administrator.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Check if role is allowed
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      console.log(
        `🔒 Role ${user.role} not allowed. Allowed: ${allowedRoles.join(", ")}`
      );
      const redirectPath = getRedirectPathForRole(user.role);
      console.log(`🔄 Redirecting to ${redirectPath}`);
      return <Navigate to={redirectPath} replace />;
    }
  }

  // ✅ Additional validation for /kas routes
  if (requireKasId && kasId === undefined) {
    console.log("⚠️ Route requires kasId but none provided in URL");
    return <Navigate to="/manager" replace />;
  }

  // All checks passed
  console.log(
    `✅ Access granted for ${user.role} to ${window.location.pathname}`
  );
  return <>{children}</>;
}
