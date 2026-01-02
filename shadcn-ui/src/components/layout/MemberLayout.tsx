// components/layout/MemberLayout.tsx
// ✅ UPDATED: Display real data from API + Working notification dropdown

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  User,
  PiggyBank,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  DollarSign,
  Loader2,
  AlertCircle,
  Calendar,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import axios from "axios";

interface MemberLayoutProps {
  children: React.ReactNode;
}

interface UserData {
  id: number;
  full_name: string;
  employee_id: string;
  email: string;
  role: string;
  joined_at: string;
  phone_number?: string;
  address?: string;
  work_unit?: string;
  position?: string;
}

interface DashboardData {
  profile: {
    full_name: string;
    employee_id: string;
    email: string;
    joined_at: string;
    membership_duration: string;
    status: string;
  };
  financial_summary: {
    savings: {
      total: number;
    };
    loans: {
      active_count: number;
      total_borrowed: number;
      remaining_balance: number;
      monthly_installment: number;
    };
    net_position: number;
  };
  upcoming_installments: Array<{
    id: number;
    loan_number: string;
    installment_number: number;
    amount: string;
    due_date: string;
    status: string;
    days_until_due: number;
  }>;
}

export function MemberLayout({ children }: MemberLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // ✅ State for real data
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingCount, setUpcomingCount] = useState(0);

  const navigation = [
    { name: "Dashboard", href: "/member", icon: LayoutDashboard },
    { name: "Profil Saya", href: "/member/profile", icon: User },
    { name: "Simpanan", href: "/member/savings", icon: PiggyBank },
    { name: "Pinjaman", href: "/member/loans", icon: CreditCard },
    { name: "Jasa Pelayanan", href: "/member/payroll", icon: DollarSign },
  ];

  // ✅ Load user data on mount
  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, []);

  // ✅ Load user profile
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://ksp.gascpns.id/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("👤 User data loaded:", response.data);

      if (response.data.success && response.data.data) {
        setUserData(response.data.data);
      }
    } catch (err) {
      console.error("❌ Error loading user data:", err);
    }
  };

  // ✅ Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://ksp.gascpns.id/api/dashboard/member",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("📊 Dashboard data loaded:", response.data);

      if (response.data.success && response.data.data) {
        setDashboardData(response.data.data);

        // Count upcoming installments (overdue or due soon)
        const upcoming = response.data.data.upcoming_installments || [];
        const overdueOrDueSoon = upcoming.filter(
          (inst: any) => inst.days_until_due <= 7 || inst.days_until_due < 0
        );
        setUpcomingCount(overdueOrDueSoon.length);
      }
    } catch (err) {
      console.error("❌ Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Format currency
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "Rp 0";
    
    // Format in millions for compact display
    if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `Rp ${(num / 1000).toFixed(0)}K`;
    }
    
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // ✅ Format full currency (for notifications)
  const formatFullCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);
  };

  // ✅ Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // ✅ Get due status
  const getDueStatus = (daysUntilDue: number) => {
    if (daysUntilDue < 0) {
      return {
        label: "Terlambat",
        color: "text-red-600",
        bgColor: "bg-red-50",
        icon: AlertCircle,
      };
    } else if (daysUntilDue <= 3) {
      return {
        label: "Jatuh tempo hari ini",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        icon: AlertCircle,
      };
    } else if (daysUntilDue <= 7) {
      return {
        label: `${daysUntilDue} hari lagi`,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        icon: Calendar,
      };
    }
    return {
      label: "Normal",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      icon: CheckCircle,
    };
  };

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    window.location.href = "/login";
  };

  // ✅ Get member data (with fallback)
  const memberName = userData?.full_name || dashboardData?.profile?.full_name || "Member";
  const memberId = userData?.employee_id || dashboardData?.profile?.employee_id || "N/A";
  const joinDate = userData?.joined_at || dashboardData?.profile?.joined_at || new Date().toISOString();
  
  const savingsTotal = dashboardData?.financial_summary?.savings?.total || 0;
  const loanRemaining = dashboardData?.financial_summary?.loans?.remaining_balance || 0;

  // ✅ Get urgent notifications
  const urgentInstallments = (dashboardData?.upcoming_installments || [])
    .filter((inst) => inst.days_until_due <= 7 || inst.days_until_due < 0)
    .slice(0, 5); // Show max 5

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Overlay untuk mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
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
              <span className="text-lg font-bold text-gray-900">
                KSU Ceria
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

          {/* Member Info */}
          <div className="p-4">
            {loading ? (
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600">
                <CardContent className="p-4 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {memberName}
                      </p>
                      <p className="text-xs opacity-90">ID: {memberId}</p>
                      <p className="text-xs opacity-75">
                        Bergabung: {formatDate(joinDate)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white bg-opacity-10 rounded p-2">
                      <p className="opacity-75">Simpanan</p>
                      <p className="font-semibold">
                        {formatCurrency(savingsTotal)}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-10 rounded p-2">
                      <p className="opacity-75">Pinjaman</p>
                      <p className="font-semibold">
                        {formatCurrency(loanRemaining)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
                  {item.name === "Dashboard" && upcomingCount > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5">
                      {upcomingCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* ✅ Notification Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {upcomingCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                      {upcomingCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>
                  <div className="flex items-center justify-between">
                    <span>Notifikasi</span>
                    {upcomingCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {upcomingCount} penting
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {urgentInstallments.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Tidak ada notifikasi penting</p>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto">
                    {urgentInstallments.map((installment) => {
                      const status = getDueStatus(installment.days_until_due);
                      const StatusIcon = status.icon;

                      return (
                        <DropdownMenuItem
                          key={installment.id}
                          className="cursor-pointer"
                          onClick={() => {
                            navigate("/member/loans");
                          }}
                        >
                          <div className={cn("w-full p-2 rounded", status.bgColor)}>
                            <div className="flex items-start gap-3">
                              <StatusIcon className={cn("h-5 w-5 mt-0.5", status.color)} />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">
                                  {installment.loan_number}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Cicilan #{installment.installment_number}
                                </p>
                                <p className="text-sm font-semibold mt-1">
                                  {formatFullCurrency(installment.amount)}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-gray-500">
                                    Jatuh tempo: {formatDate(installment.due_date)}
                                  </p>
                                  <Badge
                                    variant={installment.days_until_due < 0 ? "destructive" : "secondary"}
                                    className="text-xs"
                                  >
                                    {status.label}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer justify-center text-blue-600 hover:text-blue-700"
                  onClick={() => navigate("/member/loans")}
                >
                  Lihat Semua Pinjaman
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}