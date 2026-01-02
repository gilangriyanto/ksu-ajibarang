// src/pages/member/MemberDashboard.tsx
import React from "react";
import { MemberLayout } from "@/components/layout/MemberLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  PiggyBank,
  Banknote,
  Calculator,
  AlertCircle,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useMemberDashboard } from "@/hooks/useDashboard";
import { useNavigate } from "react-router-dom";

export default function MemberDashboard() {
  const { data, loading, error, refresh } = useMemberDashboard();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (days: number) => {
    if (days < 0)
      return <Badge className="bg-red-100 text-red-800">Terlambat</Badge>;
    if (days === 0)
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          Jatuh Tempo Hari Ini
        </Badge>
      );
    if (days <= 7)
      return (
        <Badge className="bg-orange-100 text-orange-800">
          {days} hari lagi
        </Badge>
      );
    return (
      <Badge className="bg-green-100 text-green-800">{days} hari lagi</Badge>
    );
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Memuat data dashboard...</span>
        </div>
      </MemberLayout>
    );
  }

  if (error) {
    return (
      <MemberLayout>
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
      </MemberLayout>
    );
  }

  if (!data) {
    return (
      <MemberLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada data dashboard</p>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Anggota
            </h1>
            <p className="text-gray-600 mt-1">
              Selamat datang, {data.profile?.full_name || "Anggota"}
            </p>
          </div>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Member Info Card */}
        {data.profile && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Anggota</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID Karyawan</p>
                  <p className="font-semibold">
                    {data.profile.employee_id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className="bg-green-100 text-green-800">
                    {data.profile.status || "active"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Bergabung</p>
                  <p className="font-semibold">
                    {data.profile.joined_at || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lama Keanggotaan</p>
                  <p className="font-semibold">
                    {data.profile.membership_duration || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Overview */}
        {data.financial_summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Simpanan
                    </p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {formatCurrency(
                        data.financial_summary.savings?.total || 0
                      )}
                    </p>
                  </div>
                  <PiggyBank className="h-10 w-10 text-green-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Pinjaman
                    </p>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                      {formatCurrency(
                        data.financial_summary.loans?.remaining_balance || 0
                      )}
                    </p>
                  </div>
                  <CreditCard className="h-10 w-10 text-red-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Posisi Bersih
                    </p>
                    <p
                      className={`text-2xl font-bold mt-2 ${
                        (data.financial_summary.net_position || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(data.financial_summary.net_position || 0)}
                    </p>
                  </div>
                  <TrendingUp
                    className={`h-10 w-10 opacity-80 ${
                      (data.financial_summary.net_position || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Savings Breakdown */}
        {data.savings_summary && (
          <Card>
            <CardHeader>
              <CardTitle>Rincian Simpanan</CardTitle>
              <CardDescription>Simpanan berdasarkan jenis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {data.savings_summary.pokok && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      {data.savings_summary.pokok.name || "Simpanan Pokok"}
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(data.savings_summary.pokok.balance || 0)}
                    </p>
                  </div>
                )}
                {data.savings_summary.wajib && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      {data.savings_summary.wajib.name || "Simpanan Wajib"}
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(data.savings_summary.wajib.balance || 0)}
                    </p>
                  </div>
                )}
                {data.savings_summary.sukarela && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      {data.savings_summary.sukarela.name ||
                        "Simpanan Sukarela"}
                    </p>
                    <p className="text-xl font-bold text-purple-600">
                      {formatCurrency(
                        data.savings_summary.sukarela.balance || 0
                      )}
                    </p>
                  </div>
                )}
                {data.savings_summary.hari_raya && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      {data.savings_summary.hari_raya.name ||
                        "Simpanan Hari Raya"}
                    </p>
                    <p className="text-xl font-bold text-orange-600">
                      {formatCurrency(
                        data.savings_summary.hari_raya.balance || 0
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loans and Installments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loan Summary */}
          {data.loans_summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-red-600" />
                  Ringkasan Pinjaman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Pinjaman Aktif
                    </span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {data.loans_summary.active_count || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Total Dipinjam
                    </span>
                    <span className="text-lg font-bold">
                      {formatCurrency(data.loans_summary.total_borrowed || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Sisa Hutang
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(
                        data.loans_summary.remaining_balance || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="text-sm font-medium text-gray-600">
                      Cicilan Bulanan
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(
                        data.loans_summary.monthly_installment || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Pinjaman Lunas
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      {data.loans_summary.paid_off_count || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Installments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Cicilan Mendatang
              </CardTitle>
              <CardDescription>5 cicilan terdekat</CardDescription>
            </CardHeader>
            <CardContent>
              {data.upcoming_installments &&
              data.upcoming_installments.length > 0 ? (
                <div className="space-y-3">
                  {data.upcoming_installments.map((installment) => (
                    <div
                      key={installment.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {installment.loan_number || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600">
                          Cicilan ke-{installment.installment_number || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          Jatuh tempo: {installment.due_date || "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">
                          {formatCurrency(installment.amount || 0)}
                        </p>
                        {getDaysUntilDue(installment.days_until_due || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Tidak ada cicilan mendatang
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>10 transaksi terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recent_transactions && data.recent_transactions.length > 0 ? (
              <div className="space-y-3">
                {data.recent_transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "savings"
                            ? "bg-green-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {transaction.type === "savings" ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.description || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.type === "savings"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {transaction.type === "savings" ? "+" : ""}
                        {formatCurrency(transaction.amount || 0)}
                      </p>
                      <Badge
                        className={`text-xs ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.status || "N/A"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Belum ada transaksi
              </p>
            )}
          </CardContent>
        </Card>

        {/* This Year Summary */}
        {data.this_year_summary && (
          <Card>
            <CardHeader>
              <CardTitle>
                Ringkasan Tahun{" "}
                {data.this_year_summary.year || new Date().getFullYear()}
              </CardTitle>
              <CardDescription>Total transaksi tahun ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Simpanan</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(data.this_year_summary.total_savings || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cicilan Dibayar</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(
                      data.this_year_summary.total_installments_paid || 0
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jasa Pelayanan</p>
                  <p className="text-xl font-bold text-purple-600">
                    {formatCurrency(
                      data.this_year_summary.service_allowance_received || 0
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hadiah Diterima</p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(data.this_year_summary.gifts_received || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MemberLayout>
  );
}
