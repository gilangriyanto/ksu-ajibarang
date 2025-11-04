import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  PiggyBank,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  Building,
  Calculator,
  BarChart3,
  TrendingUp,
  Wallet,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/manager",
      icon: LayoutDashboard,
      current: location.pathname === "/manager",
    },
    {
      name: "Manajemen Anggota",
      href: "/manager/members",
      icon: Users,
      current: location.pathname === "/manager/members",
    },
    {
      name: "Manajemen Simpanan",
      href: "/manager/savings",
      icon: PiggyBank,
      current: location.pathname === "/manager/savings",
    },
    {
      name: "Manajemen Pinjaman",
      href: "/manager/loans",
      icon: CreditCard,
      current: location.pathname === "/manager/loans",
    },
    {
      name: "Jasa Pelayanan",
      href: "/manager/payroll",
      icon: DollarSign,
      current: location.pathname === "/manager/payroll",
    },
    {
      name: "Manajemen Akun",
      href: "/manager/accounts",
      icon: Wallet,
      current: location.pathname === "/manager/accounts",
    },
    {
      name: "Manajemen Aset",
      href: "/manager/assets",
      icon: Building,
      current: location.pathname === "/manager/assets",
    },
    {
      name: "Akuntansi & Jurnal",
      href: "/manager/accounting",
      icon: Calculator,
      current: location.pathname === "/manager/accounting",
    },
    {
      name: "Neraca",
      href: "/manager/balance-sheet",
      icon: BarChart3,
      current: location.pathname === "/manager/balance-sheet",
    },
    {
      name: "Laporan Laba Rugi",
      href: "/manager/income-statement",
      icon: TrendingUp,
      current: location.pathname === "/manager/income-statement",
    },
    // {
    //   name: "Laporan & Analitik",
    //   href: "/manager/reports",
    //   icon: FileText,
    //   current: location.pathname === "/manager/reports",
    // },
    // {
    //   name: "Pengaturan",
    //   href: "/manager/settings",
    //   icon: Settings,
    //   current: location.pathname === "/manager/settings",
    // },
  ];

  // Mock manager data
  const managerData = {
    name: "Dr. Siti Nurhaliza",
    role: "Manager Koperasi",
    employeeId: "MGR001",
    notifications: 5,
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.clear();
    sessionStorage.clear();

    // Clear any cookies if they exist
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Force full page reload to login
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
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
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                KoperasiKu
              </span>
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

          {/* Manager Info Card */}
          <div className="p-4">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {managerData.name}
                    </p>
                    <p className="text-xs opacity-90">{managerData.role}</p>
                    <p className="text-xs opacity-75">
                      ID: {managerData.employeeId}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white bg-opacity-10 rounded p-2">
                    <p className="opacity-75">Total Anggota</p>
                    <p className="font-semibold">150</p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded p-2">
                    <p className="opacity-75">Pinjaman Aktif</p>
                    <p className="font-semibold">45</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
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
                      ? "bg-green-100 text-green-700 border-r-2 border-green-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {item.name === "Dashboard" &&
                    managerData.notifications > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5">
                        {managerData.notifications}
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
                to="/manager/settings"
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

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
                {managerData.notifications > 0 && (
                  <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5">
                    {managerData.notifications}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
