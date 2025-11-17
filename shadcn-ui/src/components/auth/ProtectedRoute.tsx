// src/components/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?:
    | "admin"
    | "manager"
    | "anggota"
    | "admin_kas_1"
    | "admin_kas_2"
    | "admin_kas_3"
    | "admin_kas_4";
  requiredRoles?: string[]; // Multiple roles
  kasId?: number; // Untuk validasi admin kas
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredRoles,
  kasId,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner saat checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Redirect ke login jika belum login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is active
  if (!user.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Akun Tidak Aktif
          </h2>
          <p className="text-gray-600 mb-6">
            Akun Anda saat ini tidak aktif. Silakan hubungi administrator untuk
            informasi lebih lanjut.
          </p>
        </div>
      </div>
    );
  }

  // Check single required role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={getRedirectPath(user.role, user.kas_id)} replace />;
  }

  // Check multiple required roles
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role)) {
      return <Navigate to={getRedirectPath(user.role, user.kas_id)} replace />;
    }
  }

  // Check kas_id untuk admin kas
  if (kasId && user.role.startsWith("admin_kas_")) {
    if (user.kas_id !== kasId) {
      // Admin kas tidak bisa akses kas lain
      return <Navigate to={`/kas/${user.kas_id}`} replace />;
    }
  }

  return <>{children}</>;
}

// Helper function untuk redirect path berdasarkan role
function getRedirectPath(role: string, kasId?: number): string {
  if (role === "admin" || role === "manager") return "/manager";
  if (role === "anggota") return "/member";
  if (role.startsWith("admin_kas_") && kasId) return `/kas/${kasId}`;
  return "/login";
}
