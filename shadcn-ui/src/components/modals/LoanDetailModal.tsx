import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
} from "lucide-react";

interface Loan {
  id: string;
  amount: number;
  purpose: string;
  term: number;
  monthlyPayment: number;
  remainingBalance: number;
  paidInstallments: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: string;
  collateral: string;
  nextPaymentDate: string;
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  status: string;
}

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
  if (!loan) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPurposeName = (purpose: string) => {
    switch (purpose) {
      case "business":
        return "Modal Usaha";
      case "education":
        return "Pendidikan";
      case "health":
        return "Kesehatan";
      case "home_improvement":
        return "Renovasi Rumah";
      case "vehicle":
        return "Kendaraan";
      case "emergency":
        return "Kebutuhan Darurat";
      default:
        return "Lainnya";
    }
  };

  const getCollateralName = (collateral: string) => {
    switch (collateral) {
      case "savings":
        return "Simpanan di Koperasi";
      case "certificate":
        return "Sertifikat Tanah/Rumah";
      case "vehicle":
        return "BPKB Kendaraan";
      case "salary":
        return "Slip Gaji";
      case "business":
        return "Surat Izin Usaha";
      case "guarantor":
        return "Penjamin Personal";
      default:
        return collateral;
    }
  };

  // Mock payment history
  const paymentHistory: PaymentHistory[] = [
    {
      id: "1",
      date: "2024-01-15",
      amount: 235442,
      principal: 200000,
      interest: 35442,
      remainingBalance: 4800000,
      status: "paid",
    },
    {
      id: "2",
      date: "2023-12-15",
      amount: 235442,
      principal: 198000,
      interest: 37442,
      remainingBalance: 5000000,
      status: "paid",
    },
    {
      id: "3",
      date: "2023-11-15",
      amount: 235442,
      principal: 196000,
      interest: 39442,
      remainingBalance: 5198000,
      status: "paid",
    },
  ];

  const calculateProgress = () => {
    return ((loan.paidInstallments / loan.term) * 100).toFixed(1);
  };

  const calculateRemainingMonths = () => {
    return loan.term - loan.paidInstallments;
  };

  const isOverdue = () => {
    const nextPayment = new Date(loan.nextPaymentDate);
    const today = new Date();
    return nextPayment < today && loan.status === "active";
  };

  const getDaysOverdue = () => {
    if (!isOverdue()) return 0;
    const nextPayment = new Date(loan.nextPaymentDate);
    const today = new Date();
    return Math.ceil(
      (today.getTime() - nextPayment.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

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
                  Detail Pinjaman
                </DialogTitle>
                <DialogDescription className="flex items-center space-x-2">
                  <span>{getPurposeName(loan.purpose)}</span>
                  {getStatusBadge(loan.status)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Overdue Alert */}
          {isOverdue() && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-medium text-red-900">
                  Pembayaran Terlambat
                </h4>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Pembayaran Anda sudah terlambat {getDaysOverdue()} hari. Segera
                lakukan pembayaran untuk menghindari denda.
              </p>
            </div>
          )}

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
                  {formatCurrency(loan.remainingBalance)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  dari {formatCurrency(loan.amount)}
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
                  {formatCurrency(loan.monthlyPayment)}
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
                  {loan.paidInstallments} dari {loan.term} cicilan
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
                  <p className="text-sm text-gray-500">Tujuan Pinjaman</p>
                  <p className="font-medium">{getPurposeName(loan.purpose)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jumlah Pinjaman</p>
                  <p className="font-medium">{formatCurrency(loan.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jangka Waktu</p>
                  <p className="font-medium">{loan.term} bulan</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Suku Bunga</p>
                  <p className="font-medium">{loan.interestRate}% per tahun</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Jadwal Pembayaran</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Tanggal Mulai</p>
                  <p className="font-medium">
                    {new Date(loan.startDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Berakhir</p>
                  <p className="font-medium">
                    {new Date(loan.endDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pembayaran Berikutnya</p>
                  <p
                    className={`font-medium ${
                      isOverdue() ? "text-red-600" : "text-blue-600"
                    }`}
                  >
                    {new Date(loan.nextPaymentDate).toLocaleDateString("id-ID")}
                    {isOverdue() && " (Terlambat)"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jaminan</p>
                  <p className="font-medium">
                    {getCollateralName(loan.collateral)}
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
                      {loan.paidInstallments} cicilan
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
                      {loan.term} cicilan
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Riwayat Pembayaran</span>
              </CardTitle>
              <CardDescription>3 pembayaran terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Pembayaran Cicilan</p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Pokok: {formatCurrency(payment.principal)} | Bunga:{" "}
                        {formatCurrency(payment.interest)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default LoanDetailModal;
