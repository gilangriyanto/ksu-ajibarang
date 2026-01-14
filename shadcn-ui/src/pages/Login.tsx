// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/lib/api/auth.service";
import apiClient from "@/lib/api/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * Get redirect path after successful login based on user role
 *
 * NEW LOGIC:
 * - admin → /manager (full access)
 * - manager → Fetch /dashboard/manager first, then redirect to first kas or /manager
 * - anggota → /member
 */
const getRedirectPath = async (user: User): Promise<string> => {
  console.log("🔍 Determining redirect for role:", user.role);
  console.log("🔍 User object:", user);

  switch (user.role) {
    case "admin":
      // ✅ admin = Super Admin → Manager Layout
      console.log("✅ Admin detected, fetching admin dashboard...");
      try {
        await apiClient.get("/dashboard/admin");
        console.log("✅ Admin dashboard accessible, redirecting to /manager");
      } catch (error) {
        console.error("❌ Admin dashboard fetch failed:", error);
      }
      return "/manager";

    case "manager":
      // ✅ manager = Fetch dashboard to get managed accounts
      console.log("✅ Manager detected, fetching manager dashboard...");
      try {
        const response = await apiClient.get("/dashboard/manager");
        const data = response.data.data;

        console.log("✅ Manager dashboard data:", data);
        console.log("✅ Managed accounts:", data.managed_accounts);
        console.log(
          "✅ Managed accounts count:",
          data.manager_info.managed_accounts_count
        );

        const managedAccounts = data.managed_accounts || [];

        if (managedAccounts.length === 0) {
          console.error("⚠️ Manager has no managed accounts!");
          alert(
            "Error: Manager tidak memiliki kas yang dikelola. Hubungi administrator."
          );
          return "/login";
        }

        // ✅ If manager has multiple kas (5 kas), redirect to manager layout to see all
        if (managedAccounts.length > 1) {
          console.log(
            `✅ Manager has ${managedAccounts.length} kas, redirecting to /manager`
          );
          return "/manager";
        }

        // ✅ If manager has only 1 kas, redirect directly to that kas
        const firstKas = managedAccounts[0];
        console.log(
          `✅ Manager has 1 kas (id: ${firstKas.id}), redirecting to /kas/${firstKas.id}`
        );
        return `/kas/${firstKas.id}`;
      } catch (error: any) {
        console.error("❌ Manager dashboard fetch failed:", error);
        console.error("❌ Error response:", error.response?.data);

        // Fallback: redirect to manager layout
        console.log("⚠️ Falling back to /manager");
        return "/manager";
      }

    case "anggota":
      // ✅ anggota = Member → Member Layout
      console.log("✅ Member detected, fetching member dashboard...");
      try {
        await apiClient.get("/dashboard/member");
        console.log("✅ Member dashboard accessible, redirecting to /member");
      } catch (error) {
        console.error("❌ Member dashboard fetch failed:", error);
      }
      return "/member";

    default:
      console.error("❌ Unknown role:", user.role);
      return "/login";
  }
};

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  let authContext;
  try {
    authContext = useAuth();
  } catch (err) {
    console.error("❌ useAuth error:", err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-2xl">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Authentication system not ready. Please refresh the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const { login } = authContext;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("📧 Attempting login with:", email);

      // ✅ Step 1: Login
      const user: User = await login(email, password);

      console.log("✅ Login successful!");
      console.log("👤 User:", user);
      console.log("📍 Role:", user.role);
      console.log("🆔 User ID:", user.id);

      // ✅ Step 2: Fetch role-specific dashboard and get redirect path
      const redirectPath = await getRedirectPath(user);

      console.log("🔄 Redirecting to:", redirectPath);

      // ✅ Step 3: Redirect
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      console.error("❌ Login error:", err);

      const errorMessage =
        err.message ||
        err.response?.data?.message ||
        "Login gagal. Silakan coba lagi.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Koperasi Simpan Pinjam
          </h2>
          <p className="mt-2 text-gray-600">Silakan login untuk melanjutkan</p>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Memproses...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>Lupa password? Hubungi administrator</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
