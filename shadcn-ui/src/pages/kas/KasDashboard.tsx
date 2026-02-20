// src/pages/kas/KasDashboard.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Users,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Shield,
  Wallet,
  Building2,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminDashboard, useManagerDashboard } from "@/hooks/useDashboard";
import { useNavigate } from "react-router-dom";
import type {
  AdminDashboardData,
  ManagerDashboardData,
} from "@/lib/api/dashboard.service";
import { KasLayout } from "@/components/layout/KasLayout";

function KasDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log("👤 Current User:", user);
  console.log("🔑 kas_id:", user?.kas_id);
  console.log("🎭 role:", user?.role);

  // Detect user role
  const isAdmin = user?.role?.toLowerCase() === "admin" && !user?.kas_id;
  const isManager = user?.role?.toLowerCase() === "manager" && user?.kas_id;

  // Use appropriate hook based on role
  const adminHook = useAdminDashboard();
  const managerHook = useManagerDashboard();

  // Select active dashboard based on role
  const activeDashboard = isAdmin ? adminHook : managerHook;
  const { data: dashboardData, loading, error, refresh } = activeDashboard;

  console.log("📊 Dashboard Data:", dashboardData);
  console.log("🏢 Is Admin:", isAdmin);
  console.log("👔 Is Manager:", isManager);

  // Helper functions
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "danger":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      case "success":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  // Loading state
  if (loading && !dashboardData) {
    return (
      <KasLayout>
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Memuat dashboard...</span>
      </div>
      </KasLayout>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <KasLayout>
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
      </KasLayout>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <KasLayout>
      <div className="flex flex-col items-center justify-center h-64">
        <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600">Data dashboard tidak tersedia</p>
      </div>
      </KasLayout>
    );
  }

  // ==================== ADMIN DASHBOARD ====================
  if (isAdmin) {
    const adminData = dashboardData as AdminDashboardData;
    const { overview, financial_summary, recent_activities, alerts } =
      adminData;

    // Kas accounts data (for admin view)
    const kasAccounts = [
      {
        id: 1,
        name: "Kas 1 - Pembiayaan Umum",
        balance: overview.cash_accounts.total_balance * 0.35,
      },
      {
        id: 2,
        name: "Kas 2 - Barang & Logistik",
        balance: overview.cash_accounts.total_balance * 0.25,
      },
      {
        id: 3,
        name: "Kas 3 - Sebrakan",
        balance: overview.cash_accounts.total_balance * 0.25,
      },
      {
        id: 4,
        name: "Kas 4 - Kantin",
        balance: overview.cash_accounts.total_balance * 0.15,
      },
    ];

    return (
      <KasLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-600" />
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.full_name || "Admin"}! Monitoring seluruh
              sistem koperasi.
            </p>
          </div>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Alert Cards */}
        {alerts && alerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert, index) => (
              <Card
                key={index}
                className={`border-l-4 ${getAlertColor(alert.type)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.message}
                      </p>
                      {alert.action && alert.link && (
                        <Button
                          variant="link"
                          className="p-0 h-auto mt-2"
                          onClick={() => navigate(alert.link)}
                        >
                          {alert.action} <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Stats - Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Cash Balance */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-gray-600">
                <Wallet className="h-4 w-4 mr-2" />
                Total Kas System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(overview.cash_accounts.total_balance)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {overview.cash_accounts.active_accounts} kas aktif
              </p>
            </CardContent>
          </Card>

          {/* Total Members */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                Total Anggota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {overview.members.total}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                +{overview.members.new_this_month} bulan ini
              </p>
            </CardContent>
          </Card>

          {/* Pending Loans */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                Pinjaman Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {overview.loans.pending_applications}
              </div>
              <p className="text-xs text-gray-500 mt-1">Menunggu approval</p>
            </CardContent>
          </Card>

          {/* Active Loans */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-gray-600">
                <CreditCard className="h-4 w-4 mr-2" />
                Pinjaman Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {overview.loans.active_count}
              </div>
              <p className="text-xs text-gray-500 mt-1">Sedang berjalan</p>
            </CardContent>
          </Card>
        </div>

        {/* Kas Accounts Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Kas Accounts Overview
            </CardTitle>
            <CardDescription>Monitor semua kas dalam sistem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kasAccounts.map((kas) => (
                <div
                  key={kas.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/kas/${kas.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{kas.name}</p>
                      <p className="text-sm text-gray-500">KAS-{kas.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(kas.balance)}
                    </p>
                    <Button size="sm" variant="ghost" className="mt-1">
                      View Details →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary & Other Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Savings Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PiggyBank className="h-5 w-5" />
                <span>Simpanan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Saldo Simpanan</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(overview.savings.total_balance)}
                </p>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Transaksi</span>
                  <span className="font-medium">
                    {overview.savings.transactions_count}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Bulan Ini</span>
                  <span className="font-medium">
                    {overview.savings.this_month}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installments Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Cicilan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Terlambat</p>
                  <p className="text-2xl font-bold text-red-600">
                    {overview.installments?.overdue_count || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {overview.installments?.pending_count || 0}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Jatuh Tempo 7 Hari</span>
                  <span className="font-medium">
                    {overview.installments?.upcoming_7days || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loans Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Pinjaman</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Pokok Pinjaman</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(overview.loans.total_principal)}
                </p>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aktif</span>
                  <span className="font-medium text-green-600">
                    {overview.loans.active_count}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-yellow-600">
                    {overview.loans.pending_applications}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>10 transaksi terakhir di sistem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recent_activities &&
                  recent_activities.slice(0, 10).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 pb-3 border-b last:border-b-0"
                    >
                      <div className="flex-shrink-0">
                        {activity.type === "loan" ? (
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        ) : activity.type === "saving" ? (
                          <PiggyBank className="h-5 w-5 text-green-600" />
                        ) : (
                          <DollarSign className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.description}
                        </p>
                        {activity.member_name && (
                          <p className="text-sm text-gray-600">
                            {activity.member_name}
                          </p>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      {activity.amount && (
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(activity.amount)}
                        </div>
                      )}
                    </div>
                  ))}

                {(!recent_activities || recent_activities.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Belum ada aktivitas terbaru</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Keuangan {financial_summary.year}</CardTitle>
              <CardDescription>Total transaksi tahun ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Simpanan Terkumpul</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(financial_summary.savings_collected)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Pinjaman Disalurkan</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(financial_summary.loans_disbursed)}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Cicilan Terkumpul</p>
                    <p className="text-lg font-bold text-purple-600">
                      {formatCurrency(financial_summary.installments_collected)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>

                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Jasa Pelayanan</p>
                    <p className="text-lg font-bold text-orange-600">
                      {formatCurrency(
                        financial_summary.service_allowances_distributed
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Akses cepat ke fungsi administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-blue-50"
                onClick={() => navigate("/manager/members")}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Kelola Anggota</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-purple-50"
                onClick={() => navigate("/manager/kas")}
              >
                <Wallet className="h-6 w-6" />
                <span className="text-sm">Kelola Kas</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-green-50"
                onClick={() => navigate("/manager/reports")}
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Laporan</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-orange-50"
                onClick={() => navigate("/manager/settings")}
              >
                <Settings className="h-6 w-6" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Note */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900">
                  Super Administrator Access
                </p>
                <p className="text-sm mt-1 text-purple-700">
                  Anda memiliki akses penuh ke seluruh sistem koperasi. Data
                  yang ditampilkan adalah agregat dari semua kas accounts.
                  Gunakan menu navigasi untuk mengakses fungsi-fungsi
                  administratif atau klik pada kas account untuk melihat detail
                  spesifik.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </KasLayout>
    );
  }

  // ==================== MANAGER DASHBOARD ====================
  const managerData = dashboardData as ManagerDashboardData;
  const {
    manager_info,
    managed_accounts,
    summary,
    recent_transactions,
    alerts,
    statistics,
  } = managerData;

  return (
    <KasLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-purple-600" />
            Dashboard Manager - {manager_info.full_name}
          </h1>
          <p className="text-gray-600 mt-2">
            Mengelola {manager_info.managed_accounts_count} kas account •{" "}
            {manager_info.employee_id}
          </p>
        </div>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Alert Cards */}
      {alerts && alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert, index) => (
            <Card
              key={index}
              className={`border-l-4 ${getAlertColor(alert.type)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.message}
                    </p>
                    {alert.action && alert.link && (
                      <Button
                        variant="link"
                        className="p-0 h-auto mt-2"
                        onClick={() => navigate(alert.link)}
                      >
                        {alert.action} <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center text-gray-600">
              <Wallet className="h-4 w-4 mr-2" />
              Total Saldo Kas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.total_balance)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.total_accounts} kas aktif
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center text-gray-600">
              <PiggyBank className="h-4 w-4 mr-2" />
              Total Simpanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.total_savings)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Simpanan terkumpul</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center text-gray-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Pinjaman Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {summary.active_loans}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(summary.total_loans_disbursed)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summary.pending_loans}
            </div>
            <p className="text-xs text-gray-500 mt-1">Pinjaman menunggu</p>
          </CardContent>
        </Card>
      </div>

      {/* Managed Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Kas yang Dikelola
          </CardTitle>
          <CardDescription>Daftar kas account under management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {managed_accounts.map((kas) => (
              <div
                key={kas.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/kas/${kas.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{kas.name}</p>
                    <p className="text-sm text-gray-500">{kas.code}</p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span>{kas.savings_count} simpanan</span>
                      <span>{kas.active_loans_count} pinjaman</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      kas.current_balance >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(kas.current_balance)}
                  </p>
                  <Badge
                    variant={kas.is_active ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {kas.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>15 transaksi terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent_transactions.slice(0, 15).map((transaction) => (
                <div
                  key={`${transaction.type}-${transaction.id}`}
                  className="flex items-start space-x-3 pb-3 border-b last:border-b-0"
                >
                  <div className="flex-shrink-0">
                    {transaction.type === "loan" ? (
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    ) : (
                      <PiggyBank className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString("id-ID")}
                      </span>
                      <Badge
                        variant={
                          transaction.status === "active"
                            ? "default"
                            : transaction.status === "approved"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}

              {(!recent_transactions || recent_transactions.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Belum ada transaksi</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistik Keuangan 2026</CardTitle>
            <CardDescription>Ringkasan transaksi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Simpanan (Bulan Ini)</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(statistics.this_month.savings_collected)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Pinjaman (Bulan Ini)</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(statistics.this_month.loans_disbursed)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Cicilan (Bulan Ini)</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatCurrency(
                      statistics.this_month.installments_collected
                    )}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Tahun Ini</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      statistics.this_year.savings_collected +
                        statistics.this_year.loans_disbursed +
                        statistics.this_year.installments_collected
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Info Dashboard Manager
              </p>
              <p className="text-sm mt-1 text-blue-700">
                Anda mengelola {manager_info.managed_accounts_count} kas
                account. Data yang ditampilkan adalah agregat dari seluruh kas
                yang Anda kelola. Klik pada kas account untuk melihat detail
                spesifik atau gunakan menu navigasi untuk mengakses transaksi
                dan laporan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </KasLayout>
  );
}

export default KasDashboard;
