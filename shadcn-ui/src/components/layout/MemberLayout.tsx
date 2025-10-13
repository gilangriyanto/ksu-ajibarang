import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  User,
  PiggyBank,
  CreditCard,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberLayoutProps {
  children: React.ReactNode;
}

export function MemberLayout({ children }: MemberLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/member', icon: LayoutDashboard },
    { name: 'Profil Saya', href: '/member/profile', icon: User },
    { name: 'Simpanan', href: '/member/savings', icon: PiggyBank },
    { name: 'Pinjaman', href: '/member/loans', icon: CreditCard },
    { name: 'Jasa Pelayanan', href: '/member/payroll', icon: DollarSign },
    { name: 'Riwayat Transaksi', href: '/member/transactions', icon: History },
  ];

  const memberData = {
    name: 'Ahmad Sutanto',
    memberId: 'A001',
    joinDate: '2023-01-15',
    notifications: 2
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Overlay untuk mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">KoperasiKu</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Member Info */}
          <div className="p-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{memberData.name}</p>
                    <p className="text-xs opacity-90">ID: {memberData.memberId}</p>
                    <p className="text-xs opacity-75">
                      Bergabung: {new Date(memberData.joinDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white bg-opacity-10 rounded p-2">
                    <p className="opacity-75">Simpanan</p>
                    <p className="font-semibold">Rp 2.5M</p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded p-2">
                    <p className="opacity-75">Pinjaman</p>
                    <p className="font-semibold">Rp 3.5M</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {item.name === 'Dashboard' && memberData.notifications > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5">
                      {memberData.notifications}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <Link
                to="/member/settings"
                className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-4 h-4 mr-3" />
                Pengaturan
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Konten utama */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top bar untuk mobile */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white border-b">
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
              {memberData.notifications > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5">
                  {memberData.notifications}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
