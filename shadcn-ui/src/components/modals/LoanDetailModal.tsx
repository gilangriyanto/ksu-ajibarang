import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  TrendingDown,
  Clock,
  X,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Loan, Installment } from "@/lib/api/loans.service";
import useInstallments from "@/hooks/useInstallments";

interface LoanDetailModalProps {
  loan: Loan | null;
  isOpen: boolean;
  onClose: () => void;
  onMakePayment?: (loan: Loan) => void;
}

export function LoanDetailModal({
  loan,
  isOpen,
  onClose,
  onMakePayment,
}: LoanDetailModalProps) {
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const { schedule, getSchedule, installments, getInstallments } =
    useInstallments();

  useEffect(() => {
    if (loan && isOpen) {
      loadScheduleData();
    }
  }, [loan, isOpen]);

  const loadScheduleData = async () => {
    if (!loan) return;

    setLoadingSchedule(true);
    try {
      await Promise.all([getSchedule(loan.id), getInstallments(loan.id)]);
    } catch (err) {
      console.error("Error loading schedule:", err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  if (!loan) return null;

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Terlambat</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Lunas</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800">Disetujui</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInstallmentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Lunas</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Belum Bayar</Badge>
        );
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Terlambat</Badge>;
      case "partial":
        return <Badge className="bg-orange-100 text-orange-800">Parsial</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateProgress = () => {
    const paid = loan.paid_installments || 0;
    const total = loan.total_installments || loan.tenure_months || 1;
    return ((paid / total) * 100).toFixed(1);
  };

  const calculateRemainingMonths = () => {
    const paid = loan.paid_installments || 0;
    const total = loan.total_installments || loan.tenure_months || 0;
    return total - paid;
  };

  const principalAmount =
    typeof loan.principal_amount === "string"
      ? parseFloat(loan.principal_amount)
      : loan.principal_amount;

  const remainingBalance = loan.remaining_balance
    ? typeof loan.remaining_balance === "string"
      ? parseFloat(loan.remaining_balance)
      : loan.remaining_balance
    : principalAmount;

  const monthlyPayment =
    typeof loan.monthly_payment === "string"
      ? parseFloat(loan.monthly_payment)
      : loan.monthly_payment;

  const paidInstallments = installments
    .filter((i) => i.status === "paid")
    .slice(0, 3);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Detail Pinjaman #{loan.id}
                </DialogTitle>
                {/* ✅ FIX: Use <div> instead of <DialogDescription> to avoid <p> containing <div> (Badge) */}
                <div className="text-sm text-muted-foreground flex items-center space-x-2 mt-1">
                  <span>{loan.user?.full_name || "N/A"}</span>
                  {getStatusBadge(loan.status)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadScheduleData}
                disabled={loadingSchedule}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loadingSchedule ? "animate-spin" : ""}`}
                />
              </Button>
              {loan.status === "active" && onMakePayment && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMakePayment(loan)}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Bayar Cicilan
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Loan Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Sisa Pinjaman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(remainingBalance)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  dari {formatCurrency(principalAmount)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Angsuran Bulanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(monthlyPayment)}
                </div>
                <p className="text-xs text-gray-500 mt-1">per bulan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {calculateProgress()}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {loan.paid_installments || 0} dari {loan.tenure_months}{" "}
                  cicilan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Sisa Waktu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {calculateRemainingMonths()}
                </div>
                <p className="text-xs text-gray-500 mt-1">bulan tersisa</p>
              </CardContent>
            </Card>
          </div>

          {/* Loan Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Informasi Pinjaman</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Anggota</p>
                  <p className="font-medium">{loan.user?.full_name || "N/A"}</p>
                  <p className="text-xs text-gray-500">
                    {loan.user?.employee_id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kas</p>
                  <p className="font-medium">
                    {loan.cash_account?.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {loan.cash_account?.code || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jumlah Pinjaman</p>
                  <p className="font-medium">
                    {formatCurrency(principalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jangka Waktu</p>
                  <p className="font-medium">{loan.tenure_months} bulan</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Suku Bunga</p>
                  <p className="font-medium">
                    {typeof loan.interest_rate === "string"
                      ? parseFloat(loan.interest_rate)
                      : loan.interest_rate}
                    % per tahun
                  </p>
                </div>
                {loan.deduction_method && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      Metode Potongan Angsuran
                    </p>
                    <div className="flex items-center gap-2">
                      {loan.deduction_method === "none" && (
                        <Badge className="bg-gray-100 text-gray-800">
                          Tidak Ada Potongan (Manual)
                        </Badge>
                      )}

                      {loan.deduction_method === "salary" && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            Potongan Gaji
                          </Badge>
                          <span className="text-sm font-medium text-blue-900">
                            {loan.salary_deduction_percentage}% dari gaji
                          </span>
                        </div>
                      )}

                      {loan.deduction_method === "service_allowance" && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            Potongan Jasa Pelayanan
                          </Badge>
                          <span className="text-sm font-medium text-green-900">
                            {loan.service_allowance_deduction_percentage}% dari
                            jasa pelayanan
                          </span>
                        </div>
                      )}

                      {loan.deduction_method === "mixed" && (
                        <div className="space-y-2">
                          <Badge className="bg-purple-100 text-purple-800">
                            Kombinasi (Gaji + Jasa Pelayanan)
                          </Badge>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-blue-50 p-2 rounded">
                              <p className="text-xs text-blue-700">Dari Gaji</p>
                              <p className="font-medium text-blue-900">
                                {loan.salary_deduction_percentage}%
                              </p>
                            </div>
                            <div className="bg-green-50 p-2 rounded">
                              <p className="text-xs text-green-700">
                                Dari Jasa Pelayanan
                              </p>
                              <p className="font-medium text-green-900">
                                {loan.service_allowance_deduction_percentage}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mt-2">
                      <p className="text-xs text-gray-600">
                        {loan.deduction_method === "none" &&
                          "💡 Pembayaran angsuran dilakukan secara manual via kas atau transfer bank"}
                        {loan.deduction_method === "salary" &&
                          `💡 Angsuran akan dipotong otomatis ${loan.salary_deduction_percentage}% dari gaji bulanan`}
                        {loan.deduction_method === "service_allowance" &&
                          `💡 Angsuran akan dipotong otomatis ${loan.service_allowance_deduction_percentage}% dari jasa pelayanan`}
                        {loan.deduction_method === "mixed" &&
                          `💡 Angsuran akan dipotong ${loan.salary_deduction_percentage}% dari gaji dan ${loan.service_allowance_deduction_percentage}% dari jasa pelayanan`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Jadwal & Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Tanggal Pengajuan</p>
                  <p className="font-medium">
                    {new Date(loan.application_date).toLocaleDateString(
                      "id-ID",
                    )}
                  </p>
                </div>
                {loan.disbursement_date && (
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Pencairan</p>
                    <p className="font-medium">
                      {new Date(loan.disbursement_date).toLocaleDateString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(loan.status)}</div>
                </div>
                {loan.rejection_reason && (
                  <div>
                    <p className="text-sm text-gray-500">Alasan Penolakan</p>
                    <p className="font-medium text-red-600">
                      {loan.rejection_reason}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Tujuan Pinjaman</p>
                  <p className="font-medium text-sm">
                    {loan.loan_purpose || "Tidak ada keterangan"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5" />
                <span>Progress Pembayaran</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500">Sudah Dibayar</p>
                    <p className="font-medium text-green-600">
                      {loan.paid_installments || 0} cicilan
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Sisa Cicilan</p>
                    <p className="font-medium text-orange-600">
                      {calculateRemainingMonths()} cicilan
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Total Cicilan</p>
                    <p className="font-medium text-blue-600">
                      {loan.tenure_months} cicilan
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installment Schedule */}
          {loadingSchedule ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-3 text-gray-600">Memuat jadwal...</span>
                </div>
              </CardContent>
            </Card>
          ) : schedule.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Jadwal Angsuran</span>
                </CardTitle>
                <CardDescription>
                  Menampilkan {Math.min(schedule.length, 6)} dari{" "}
                  {schedule.length} cicilan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.slice(0, 6).map((installment) => (
                    <div
                      key={installment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Cicilan</p>
                          <p className="font-bold text-blue-600">
                            #{installment.installment_number}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">
                            {formatCurrency(installment.total_amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Jatuh tempo:{" "}
                            {new Date(installment.due_date).toLocaleDateString(
                              "id-ID",
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getInstallmentStatusBadge(installment.status)}
                        {installment.payment_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Dibayar:{" "}
                            {new Date(
                              installment.payment_date,
                            ).toLocaleDateString("id-ID")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Payment History */}
          {paidInstallments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Riwayat Pembayaran</span>
                </CardTitle>
                <CardDescription>
                  {paidInstallments.length} pembayaran terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paidInstallments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Cicilan #{payment.installment_number}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payment.payment_date
                              ? new Date(
                                  payment.payment_date,
                                ).toLocaleDateString("id-ID")
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatCurrency(payment.total_amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.payment_method || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoanDetailModal;
