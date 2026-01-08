// src/contexts/AuthContext.tsx
// ⚠️ TEMPORARY VERSION - All login goes to /manager

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService, type User } from "@/lib/api/auth.service";
import { getRedirectPath } from "@/utils/loginRedirect";

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
              // ⚠️ TEMPORARY: Force to /manager
              console.log("⚠️ TEMPORARY: Auto-redirecting to /manager");
              navigate("/manager", { replace: true });

              // ✅ Uncomment this after creating manager account
              // const redirectPath = getRedirectPath(currentUser);
              // console.log("🔄 Auto-redirecting to:", redirectPath);
              // navigate(redirectPath, { replace: true });
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });

      console.log("✅ Login successful, user:", response.user);
      console.log("🔑 kas_id:", response.user.kas_id);
      console.log("🎭 role:", response.user.role);

      setUser(response.user);

      // ✅ Uncomment this after creating manager account
      // const redirectPath = getRedirectPath(response.user);
      // console.log("🔄 Redirecting to:", redirectPath);
      // navigate(redirectPath, { replace: true });
      // return true;
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
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
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

/**
 * Custom hook to access auth context
 * Must be used within AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
