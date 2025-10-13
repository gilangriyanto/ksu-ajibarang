import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'manager' ? '/manager' : '/member';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email atau password salah');
      }
      // Navigation will be handled by the login function
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'manager' | 'member') => {
    const demoCredentials = {
      manager: { email: 'manager@koperasi.com', password: 'manager123' },
      member: { email: 'member@koperasi.com', password: 'member123' }
    };
    
    setEmail(demoCredentials[role].email);
    setPassword(demoCredentials[role].password);
    setError('');
    setLoading(true);

    try {
      const success = await login(demoCredentials[role].email, demoCredentials[role].password);
      if (!success) {
        setError('Demo login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat demo login');
    } finally {
      setLoading(false);
    }
  };

  // Don't render login form if user is already logged in
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Koperasi Rumah Sakit</h1>
          <p className="text-gray-600 mt-2">Sistem Informasi Manajemen Koperasi</p>
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
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="h-4 w-4 mr-2" />
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">Demo Login:</p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('manager')}
                  disabled={loading}
                  className="text-xs"
                >
                  {loading ? 'Loading...' : 'Login sebagai Manager'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('member')}
                  disabled={loading}
                  className="text-xs"
                >
                  {loading ? 'Loading...' : 'Login sebagai Anggota'}
                </Button>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                <p><strong>Manager:</strong> manager@koperasi.com / manager123</p>
                <p><strong>Member:</strong> member@koperasi.com / member123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>&copy; 2024 Koperasi Rumah Sakit. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}