import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  Calculator,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface KasLayoutProps {
  children: React.ReactNode;
}

export function KasLayout({ children }: KasLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const kasId = user?.kas_id || 1;
  const kasNames = {
    1: "Kas 1 - Pembiayaan Umum",
    2: "Kas 2 - Barang & Logistik",
    3: "Kas 3 - Sebrakan",
    4: "Kas 4 - Kantin",
  };

  const navigation = [
    {
      name: "Dashboard",
      href: `/kas/${kasId}`,
      icon: LayoutDashboard,
      current: location.pathname === `/kas/${kasId}`,
    },
    {
      name: "Manajemen Pinjaman",
      href: `/kas/${kasId}/loans`,
      icon: CreditCard,
      current: location.pathname === `/kas/${kasId}/loans`,
    },
    {
      name: "Manajemen Simpanan",
      href: `/kas/${kasId}/savings`,
      icon: PiggyBank,
      current: location.pathname === `/kas/${kasId}/savings`,
    },
    {
      name: "Akuntansi & Jurnal",
      href: `/kas/${kasId}/accounting`,
      icon: Calculator,
      current: location.pathname === `/kas/${kasId}/accounting`,
    },
  ];

  const kasData = {
    name: user?.full_name || "Admin Kas",
    kasId: kasId,
    kasName: kasNames[kasId as keyof typeof kasNames],
    notifications: 3,
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600/75 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - FIXED */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 flex flex-col bg-white shadow-lg transition-transform duration-200 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
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

        {/* Kas Card */}
        <div className="p-4 flex-shrink-0">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{kasData.name}</p>
                  <p className="text-xs opacity-90 truncate">
                    {kasData.kasName}
                  </p>
                  <p className="text-xs opacity-75">ID: KAS{kasData.kasId}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 rounded p-2">
                  <p className="opacity-75">Pinjaman Pending</p>
                  <p className="font-semibold">5</p>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <p className="opacity-75">Pinjaman Aktif</p>
                  <p className="font-semibold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  item.current
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
                {item.name === "Dashboard" && kasData.notifications > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 flex-shrink-0">
                    {kasData.notifications}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="space-y-2">
            <Link
              to={`/kas/${kasId}/settings`}
              className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Settings className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">Pengaturan</span>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">Keluar</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content area - FIXED with explicit width */}
      <div className="w-full lg:ml-64 lg:w-[calc(100vw-16rem)]">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {kasData.notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                    {kasData.notifications}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default KasLayout;
