// src/pages/manager/ManagerDashboard.tsx
import React, { useState } from "react";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  PiggyBank,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  FileText,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "@/hooks/useDashboard";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { data, loading, error, refresh } = useAdminDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "member_registration":
      case "member":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "loan_application":
      case "loan":
        return <CreditCard className="h-4 w-4 text-orange-600" />;
      case "payment":
      case "installment":
      case "savings":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "danger":
        return "destructive";
      case "warning":
        return "default";
      case "success":
        return "default";
      default:
        return "default";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "danger":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "success":
        return "border-green-200 bg-green-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Memuat dashboard...</span>
        </div>
      </ManagerLayout>
    );
  }

  if (error) {
    return (
      <ManagerLayout>
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </ManagerLayout>
    );
  }

  if (!data) {
    return (
      <ManagerLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada data dashboard</p>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Selamat Datang, Manager!
            </h1>
            <p className="text-gray-600">
              Berikut adalah ringkasan aktivitas koperasi
            </p>
          </div>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate("/manager/members")}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Anggota
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.overview.members.total}
                  </p>
                  <p className="text-xs text-green-600">
                    +{data.overview.members.new_this_month} bulan ini
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate("/manager/savings")}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <PiggyBank className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Simpanan
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.overview.savings.total_balance)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {data.overview.savings.transactions_count} transaksi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate("/manager/loans")}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Pinjaman Aktif
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.overview.loans.active_count}
                  </p>
                  <p className="text-xs text-orange-600">
                    {data.overview.loans.pending_applications} pengajuan pending
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate("/manager/reports")}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Saldo Kas Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.overview.cash_accounts.total_balance)}
                  </p>
                  <p className="text-xs text-purple-600">
                    {data.overview.cash_accounts.active_accounts} akun aktif
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Akses fitur utama dengan cepat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-blue-50"
                onClick={() => navigate("/manager/members")}
              >
                <UserPlus className="h-6 w-6" />
                <span className="text-sm">Kelola Anggota</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-green-50"
                onClick={() => navigate("/manager/loans")}
              >
                <CheckCircle className="h-6 w-6" />
                <span className="text-sm">Review Pinjaman</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-purple-50"
                onClick={() => navigate("/manager/savings")}
              >
                <PiggyBank className="h-6 w-6" />
                <span className="text-sm">Kelola Simpanan</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 hover:bg-orange-50"
                onClick={() => navigate("/manager/reports")}
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Generate Laporan</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {data.alerts && data.alerts.length > 0 && (
          <div className="space-y-4 mb-8">
            {data.alerts.map((alert, index) => (
              <Alert key={index} className={getAlertColor(alert.type)}>
                <AlertTriangle className="h-4 w-4" />
                <div className="flex-1">
                  <h3 className="font-medium">{alert.title}</h3>
                  <AlertDescription>{alert.message}</AlertDescription>
                </div>
                {alert.link && (
                  <Button size="sm" onClick={() => navigate(alert.link!)}>
                    {alert.action || "Lihat Detail"}
                  </Button>
                )}
              </Alert>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>
                Ringkasan Keuangan {data.financial_summary.year}
              </CardTitle>
              <CardDescription>Total transaksi tahun ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Simpanan Terkumpul
                  </span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(data.financial_summary.savings_collected)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Pinjaman Disalurkan
                  </span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(data.financial_summary.loans_disbursed)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Angsuran Terkumpul
                  </span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(
                      data.financial_summary.installments_collected
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Jasa Pelayanan</span>
                  <span className="font-bold text-purple-600">
                    {formatCurrency(
                      data.financial_summary.service_allowances_distributed
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Aktivitas Terbaru</CardTitle>
                  <CardDescription>
                    10 aktivitas terakhir di sistem
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/manager/reports")}
                >
                  Lihat Semua
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recent_activities && data.recent_activities.length > 0 ? (
                  data.recent_activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        {activity.amount && (
                          <p className="text-sm text-gray-600">
                            {formatCurrency(activity.amount)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada aktivitas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ManagerLayout>
  );
}
