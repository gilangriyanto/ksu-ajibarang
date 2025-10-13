import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'member';
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

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Redirect to appropriate dashboard if on login page
        if (window.location.pathname === '/login' || window.location.pathname === '/') {
          const redirectPath = parsedUser.role === 'manager' ? '/manager' : '/member';
          navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, [navigate]);

  const login = async (email: string, password: string): Promise<boolean> => {
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
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Redirect to appropriate dashboard
      const redirectPath = userWithoutPassword.role === 'manager' ? '/manager' : '/member';
      navigate(redirectPath, { replace: true });
      
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}