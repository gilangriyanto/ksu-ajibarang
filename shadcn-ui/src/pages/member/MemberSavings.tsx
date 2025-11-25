import React, { useState, useEffect } from "react";
import { MemberLayout } from "@/components/layout/MemberLayout";
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
import { SavingsDetailViewModal } from "@/components/modals/SavingsDetailViewModal";
import {
  PiggyBank,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import savingsService, {
  Saving,
  SavingsSummary,
} from "@/lib/api/savings.service";
import { toast } from "sonner";

interface SavingsAccount {
  id: string;
  type: string;
  balance: number;
  monthlyDeposit: number;
  openDate: string;
  lastTransaction: string;
  status: string;
  interestRate: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

export default function MemberSavings() {
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // API State
  const [savings, setSavings] = useState<Saving[]>([]);
  const [summary, setSummary] = useState<SavingsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [user?.id]);

  const loadAllData = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadMemberSavings(), loadMemberSummary()]);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data simpanan");
      toast.error("Gagal memuat data simpanan");
    } finally {
      setLoading(false);
    }
  };

  const loadMemberSavings = async () => {
    try {
      const response = await savingsService.getAll({ user_id: user?.id });
      setSavings(response.data || []);
    } catch (err: any) {
      console.error("Error loading member savings:", err);
      throw new Error("Gagal memuat data simpanan");
    }
  };

  const loadMemberSummary = async () => {
    try {
      const response = await savingsService.getSummary(user?.id);
      setSummary(response.data);
    } catch (err: any) {
      console.error("Error loading summary:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAllData();
      toast.success("Data berhasil diperbarui");
    } catch (err) {
      toast.error("Gagal memperbarui data");
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSavingsTypeName = (type: string) => {
    switch (type) {
      case "mandatory":
        return "Simpanan Wajib";
      case "voluntary":
        return "Simpanan Sukarela";
      case "principal":
        return "Simpanan Pokok";
      case "holiday":
        return "Simpanan Hari Raya";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "interest":
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  // Group savings by type
  const savingsByType = savings.reduce((acc, saving) => {
    const type = saving.saving_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(saving);
    return acc;
  }, {} as Record<string, Saving[]>);

  // Calculate total for this month (approved only)
  const thisMonthDeposit = savings
    .filter((s) => {
      const isThisMonth =
        new Date(s.created_at).getMonth() === new Date().getMonth() &&
        new Date(s.created_at).getFullYear() === new Date().getFullYear();
      return isThisMonth && s.status === "approved";
    })
    .reduce((sum, s) => sum + s.amount, 0);

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Simpanan Saya</h1>
            <p className="text-gray-600 mt-1">
              Kelola dan pantau simpanan Anda
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <PiggyBank className="h-4 w-4 mr-2" />
                Total Simpanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary?.total_balance || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Object.keys(savingsByType).length} jenis rekening
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Setoran Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(thisMonthDeposit)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total setoran periode ini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Savings Accounts by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Simpanan</CardTitle>
            <CardDescription>Daftar semua simpanan Anda</CardDescription>
          </CardHeader>
          <CardContent>
            {savings.length === 0 ? (
              <div className="text-center py-8">
                <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Anda belum memiliki simpanan</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(savingsByType).map(([type, typeSavings]) => {
                  const totalBalance = typeSavings
                    .filter((s) => s.status === "approved")
                    .reduce((sum, s) => sum + s.balance, 0);
                  const latestSaving = typeSavings.sort(
                    (a, b) =>
                      new Date(b.updated_at).getTime() -
                      new Date(a.updated_at).getTime()
                  )[0];

                  return (
                    <Card key={type} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {getSavingsTypeName(type)}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Terakhir:{" "}
                              {new Date(
                                latestSaving.updated_at
                              ).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                          {getStatusBadge(latestSaving.status)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Total Saldo:
                            </span>
                            <span className="font-medium">
                              {formatCurrency(totalBalance)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Jumlah Transaksi:
                            </span>
                            <span className="text-sm font-medium text-blue-600">
                              {typeSavings.length}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              // Use the latest saving for detail
                              const accountData: SavingsAccount = {
                                id: latestSaving.id.toString(),
                                type: latestSaving.saving_type,
                                balance: totalBalance,
                                monthlyDeposit: 0, // Can be calculated if needed
                                openDate: latestSaving.created_at,
                                lastTransaction: latestSaving.updated_at,
                                status: latestSaving.status,
                                interestRate: 0, // Add if available from API
                                totalDeposits: totalBalance,
                                totalWithdrawals: 0,
                              };
                              setSelectedAccount(accountData);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Detail
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>Riwayat setoran simpanan</CardDescription>
          </CardHeader>
          <CardContent>
            {savings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savings
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .slice(0, 10)
                  .map((saving) => (
                    <div
                      key={saving.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {getSavingsTypeName(saving.saving_type)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {saving.description || "Setoran simpanan"} •{" "}
                          {new Date(saving.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            saving.status === "approved"
                              ? "text-green-600"
                              : saving.status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(saving.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {saving.status === "approved"
                            ? "Disetujui"
                            : saving.status === "pending"
                            ? "Pending"
                            : "Ditolak"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Summary by Type */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Simpanan Pokok
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-purple-600">
                  {formatCurrency(summary.total_principal)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Simpanan Wajib
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(summary.total_mandatory)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Simpanan Sukarela
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(summary.total_voluntary)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Simpanan Hari Raya
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-orange-600">
                  {formatCurrency(summary.total_holiday)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Savings Detail Modal */}
      <SavingsDetailViewModal
        account={selectedAccount}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAccount(null);
        }}
      />
    </MemberLayout>
  );
}
