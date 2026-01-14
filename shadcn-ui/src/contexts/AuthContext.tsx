// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { authService, User, LoginResponse } from "@/lib/api/auth.service";

// Define AuthContext interface
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          // ✅ Map cash_account_id to kas_id
          const mappedUser = {
            ...currentUser,
            kas_id: currentUser.kas_id || currentUser.cash_account_id || null,
          };
          setUser(mappedUser);
        } else {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            // ✅ Map cash_account_id to kas_id
            const mappedUser = {
              ...storedUser,
              kas_id: storedUser.kas_id || storedUser.cash_account_id || null,
            };
            setUser(mappedUser);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function - Returns User object
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response: LoginResponse = await authService.login({
        email,
        password,
      });

      console.log("✅ Login response:", response);
      console.log("✅ Raw user:", response.user);
      console.log(
        "✅ cash_account_id:",
        (response.user as any).cash_account_id
      );

      // ✅ CRITICAL: Map cash_account_id to kas_id for consistency
      const userData: User = {
        ...response.user,
        kas_id:
          response.user.kas_id ||
          (response.user as any).cash_account_id ||
          null,
      };

      setUser(userData);

      console.log("✅ User set in context:", userData);
      console.log("✅ Final kas_id:", userData.kas_id);

      return userData;
    } catch (error) {
      console.error("❌ Login failed in AuthContext:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ✅ EXPORT useAuth HOOK HERE
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Export User type
export type { User };
