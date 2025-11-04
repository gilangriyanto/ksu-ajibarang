import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  role:
    | "manager"
    | "member"
    | "admin_kas_1"
    | "admin_kas_2"
    | "admin_kas_3"
    | "admin_kas_4";
  kas_id?: number; // untuk admin kas
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        if (
          window.location.pathname === "/login" ||
          window.location.pathname === "/"
        ) {
          const redirectPath = getRedirectPath(
            parsedUser.role,
            parsedUser.kas_id
          );
          navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, [navigate]);

  const getRedirectPath = (role: string, kasId?: number) => {
    if (role === "manager") return "/manager";
    if (role === "member") return "/member";
    if (role.startsWith("admin_kas_")) return `/kas/${kasId}`;
    return "/login";
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);

    // Mock authentication dengan admin kas
    const mockUsers = {
      "manager@koperasi.com": {
        id: "1",
        name: "Admin Koperasi",
        email: "manager@koperasi.com",
        role: "manager" as const,
        password: "manager123",
      },
      "member@koperasi.com": {
        id: "2",
        name: "Dr. Ahmad Santoso",
        email: "member@koperasi.com",
        role: "member" as const,
        password: "member123",
      },
      "kas1@koperasi.com": {
        id: "3",
        name: "Admin Kas 1",
        email: "kas1@koperasi.com",
        role: "admin_kas_1" as const,
        kas_id: 1,
        password: "kas1123",
      },
      "kas2@koperasi.com": {
        id: "4",
        name: "Admin Kas 2",
        email: "kas2@koperasi.com",
        role: "admin_kas_2" as const,
        kas_id: 2,
        password: "kas2123",
      },
      "kas3@koperasi.com": {
        id: "5",
        name: "Admin Kas 3",
        email: "kas3@koperasi.com",
        role: "admin_kas_3" as const,
        kas_id: 3,
        password: "kas3123",
      },
      "kas4@koperasi.com": {
        id: "6",
        name: "Admin Kas 4",
        email: "kas4@koperasi.com",
        role: "admin_kas_4" as const,
        kas_id: 4,
        password: "kas4123",
      },
    };

    const mockUser = mockUsers[email as keyof typeof mockUsers];

    if (mockUser && mockUser.password === password) {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

      // Gunakan optional chaining atau type guard
      const redirectPath = getRedirectPath(
        userWithoutPassword.role,
        "kas_id" in userWithoutPassword ? userWithoutPassword.kas_id : undefined
      );
      navigate(redirectPath, { replace: true });

      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
