// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService, type User } from "@/lib/api/auth.service";

// ==================== TYPES ====================

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ==================== CONTEXT ====================

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// ==================== PROVIDER ====================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }

          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            if (
              window.location.pathname === "/login" ||
              window.location.pathname === "/"
            ) {
              const redirectPath = getRedirectPath(
                currentUser.role,
                currentUser.kas_id
              );
              navigate(redirectPath, { replace: true });
            }
          } catch (error) {
            console.error("Token verification failed:", error);
            setUser(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate]);

  const getRedirectPath = (role: string, kasId?: number) => {
    if (role === "admin" || role === "manager") return "/manager";
    if (role === "anggota") return "/member";
    if (role.startsWith("admin_kas_") && kasId) return `/kas/${kasId}`;
    return "/login";
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      setUser(response.user);
      
      // ✅ TAMBAHAN: Store role di localStorage (untuk backward compatibility)
      localStorage.setItem('userRole', response.user.role);
      
      const redirectPath = getRedirectPath(
        response.user.role,
        response.user.kas_id
      );
      navigate(redirectPath, { replace: true });
      return true;
    } catch (error: any) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      
      // ✅ TAMBAHAN: Remove userRole dari localStorage
      localStorage.removeItem('userRole');
      
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      localStorage.removeItem('userRole');
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      // ✅ TAMBAHAN: Update userRole di localStorage
      localStorage.setItem('userRole', currentUser.role);
    } catch (error) {
      console.error("Refresh user error:", error);
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ==================== HOOK ====================
// ✅ TAMBAHAN: Export useAuth hook

/**
 * Custom hook to access auth context
 * Must be used within AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};