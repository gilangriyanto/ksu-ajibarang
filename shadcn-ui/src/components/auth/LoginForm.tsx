import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, LogIn } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Mock authentication - replace with real API call
    const mockUsers = {
      'manager@koperasi.com': {
        id: '1',
        name: 'Admin Koperasi',
        email: 'manager@koperasi.com',
        role: 'manager' as const,
        password: 'manager123'
      },
      'member@koperasi.com': {
        id: '2',
        name: 'Dr. Ahmad Santoso',
        email: 'member@koperasi.com',
        role: 'member' as const,
        password: 'member123'
      }
    };

    const mockUser = mockUsers[email as keyof typeof mockUsers];
    
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userWithoutPassword } = mockUser;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Redirect to appropriate dashboard
      const redirectPath = userWithoutPassword.role === 'manager' ? '/manager' : '/member';
      navigate(redirectPath, { replace: true });
      
      setLoading(false);
    } else {
      setError('Email atau password salah');
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

    const mockUser = role === 'manager' ? {
      id: '1',
      name: 'Admin Koperasi',
      email: 'manager@koperasi.com',
      role: 'manager' as const
    } : {
      id: '2',
      name: 'Dr. Ahmad Santoso',
      email: 'member@koperasi.com',
      role: 'member' as const
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Redirect to appropriate dashboard
    const redirectPath = mockUser.role === 'manager' ? '/manager' : '/member';
    navigate(redirectPath, { replace: true });
    
    setLoading(false);
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