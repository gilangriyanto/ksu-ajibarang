import React, { useState, useEffect } from "react";
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
  UserCog,
  Loader2,
  ArrowLeftRight, // ✅ NEW: Icon untuk Cash Transfer
} from "lucide-react";
import { cn } from "@/lib/utils";
import authService, { User } from "@/lib/api/auth.service";
import { toast } from "sonner";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ User state management
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // ✅ Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoadingUser(true);
        setUserError(null);
        console.log("🔄 Fetching current user...");

        // Try to get from localStorage first for instant display
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setCurrentUser(storedUser);
          console.log("📦 Loaded user from localStorage:", storedUser);
        }

        // Then fetch from API for fresh data
        const user = await authService.getCurrentUser();

        console.log("✅ User data loaded from API:", user);
        setCurrentUser(user);
      } catch (error: any) {
        console.error("❌ Error fetching user:", error);
        setUserError(error.message || "Gagal memuat data user");

        // If token is invalid, redirect to login
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
          setTimeout(() => {
            handleLogout();
          }, 1500);
        } else {
          toast.error("Gagal memuat data pengguna");
        }
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

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
      name: "Manajemen Kas",
      href: "/manager/kas",
      icon: Wallet,
      current:
        location.pathname.startsWith("/manager/kas") ||
        location.pathname.startsWith("/manager/cash-managers"),
      badge: null,
    },
    {
      name: "Transfer Kas", // ✅ NEW: Cash Transfer Menu
      href: "/manager/cash-transfers",
      icon: ArrowLeftRight,
      current: location.pathname === "/manager/cash-transfers",
    },
    {
      name: "Manajemen Simpanan",
      href: "/manager/savings",
      icon: PiggyBank,
      current: location.pathname === "/manager/savings",
    },
    {
      name: "Jenis Simpanan",
      href: "/manager/saving-types",
      icon: PiggyBank,
      current: location.pathname === "/manager/saving-types",
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
      name: "Potongan Gaji",
      href: "/manager/salary-deductions",
      icon: Calculator,
      current: location.pathname === "/manager/salary-deductions",
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
    {
      name: "Pengunduran Diri",
      href: "/manager/resignations",
      icon: TrendingUp,
      current: location.pathname === "/manager/resignations",
    },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Redirect to login
      window.location.href = "/login";
    }
  };

  // ✅ Get role-specific icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return Shield;
      case "manager":
        return UserCog;
      case "anggota":
      case "member":
        return Users;
      case "admin_kas_1":
      case "admin_kas_2":
      case "admin_kas_3":
      case "admin_kas_4":
        return Wallet;
      default:
        return Shield;
    }
  };

  // ✅ Get role display name in Indonesian
  const getRoleDisplay = (role: string): string => {
    const roleMap: Record<string, string> = {
      admin: "Administrator",
      manager: "Manager Koperasi",
      anggota: "Anggota",
      member: "Anggota",
      admin_kas_1: "Admin Kas 1",
      admin_kas_2: "Admin Kas 2",
      admin_kas_3: "Admin Kas 3",
      admin_kas_4: "Admin Kas 4",
    };
    return roleMap[role] || role;
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
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
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

        {/* ✅ DYNAMIC: User Card */}
        <div className="p-4 flex-shrink-0">
          {loadingUser ? (
            // Loading state
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Memuat data...</span>
                </div>
              </CardContent>
            </Card>
          ) : userError ? (
            // Error state
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">Gagal memuat data</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => window.location.reload()}
                  >
                    Coba Lagi
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : currentUser ? (
            // ✅ SUCCESS: Display real user data
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    {React.createElement(getRoleIcon(currentUser.role), {
                      className: "w-6 h-6",
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {currentUser.full_name}
                    </p>
                    <p className="text-xs opacity-90 truncate">
                      {getRoleDisplay(currentUser.role)}
                    </p>
                    <p className="text-xs opacity-75">
                      ID: {currentUser.employee_id}
                    </p>
                  </div>
                </div>

                {/* Additional info if available */}
                {(currentUser.work_unit || currentUser.position) && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    {currentUser.position && (
                      <p className="text-xs opacity-90 truncate">
                        {currentUser.position}
                      </p>
                    )}
                    {currentUser.work_unit && (
                      <p className="text-xs opacity-75 truncate">
                        {currentUser.work_unit}
                      </p>
                    )}
                  </div>
                )}

                {/* Statistics - can be made dynamic later */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/10 rounded p-2">
                    <p className="opacity-75">Total Anggota</p>
                    <p className="font-semibold">150</p>
                  </div>
                  <div className="bg-white/10 rounded p-2">
                    <p className="opacity-75">Pinjaman Aktif</p>
                    <p className="font-semibold">45</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
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
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
                {item.name === "Dashboard" && (
                  <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 flex-shrink-0">
                    5
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
              to="/manager/settings"
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
              <LogOut className="w-4 w-4 mr-3 flex-shrink-0" />
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
              {currentUser && (
                <span className="text-sm font-medium text-gray-700 hidden sm:block truncate max-w-[150px]">
                  {currentUser.full_name}
                </span>
              )}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                  5
                </Badge>
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
