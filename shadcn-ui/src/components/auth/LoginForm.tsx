// src/components/auth/LoginForm.tsx
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, LogIn, AlertCircle } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi input
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }

    try {
      setLoading(true);

      // Call login dari AuthContext
      await login(email, password);

      // Redirect akan dihandle oleh AuthContext
    } catch (err: any) {
      // Tampilkan error message dari backend
      setError(err.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            KSU Ceria Ajibarang
          </h1>
          <p className="text-gray-600 mt-2">
            Sistem Informasi Manajemen Koperasi
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Masuk ke Sistem</CardTitle>
            <CardDescription>
              Masukkan email dan password untuk mengakses sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="h-4 w-4 mr-2" />
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">Demo Login:</p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDemoLogin("admin@ksu-ceria.test", "password")
                  }
                  disabled={loading}
                  className="text-xs"
                >
                  Login sebagai Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDemoLogin("manager@ksu-ceria.test", "password")
                  }
                  disabled={loading}
                  className="text-xs"
                >
                  Login sebagai Manager
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDemoLogin("anggota@ksu-ceria.test", "password")
                  }
                  disabled={loading}
                  className="text-xs"
                >
                  Login sebagai Anggota
                </Button>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                <p className="mb-1">
                  Gunakan kredensial yang telah terdaftar di sistem
                </p>
                <p className="text-xs">
                  atau klik tombol demo di atas untuk percobaan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>&copy; 2025 KSU Ceria Ajibarang. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
