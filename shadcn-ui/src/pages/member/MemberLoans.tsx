import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Plus,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  TrendingDown,
} from "lucide-react";
import { LoanApplicationModal } from "@/components/modals/LoanApplicationModal";
import { LoanDetailModal } from "@/components/modals/LoanDetailModal";
import { LoanPaymentModal } from "@/components/modals/LoanPaymentModal";

interface Loan {
  id: string;
  kas_id: number;
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

export default function MemberLoans() {
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Tambahkan interface ini
  interface KasOption {
    id: number;
    name: string;
    description: string;
    interest_rate: number;
    max_amount: number;
  }

  // Tambahkan data kas yang tersedia untuk member
  const availableKas: KasOption[] = [
    {
      id: 1,
      name: "Kas 1 - Pembiayaan Umum",
      description: "Pinjaman untuk kebutuhan operasional dan pembiayaan umum",
      interest_rate: 12,
      max_amount: 50000000,
    },
    {
      id: 3,
      name: "Kas 3 - Sebrakan",
      description:
        "Pinjaman tanpa bunga untuk kebutuhan khusus (pernikahan, pendidikan, dll)",
      interest_rate: 0,
      max_amount: 20000000,
    },
  ];

  // Mock data - replace with actual API calls
  const loans: Loan[] = [
    {
      id: "1",
      kas_id: 1,
      amount: 10000000,
      purpose: "business",
      term: 24,
      monthlyPayment: 500000,
      remainingBalance: 6000000,
      paidInstallments: 8,
      interestRate: 12,
      startDate: "2023-06-01",
      endDate: "2025-06-01",
      status: "active",
      collateral: "certificate",
      nextPaymentDate: "2024-02-15",
    },
    {
      id: "2",
      kas_id: 21,
      amount: 5000000,
      purpose: "education",
      term: 12,
      monthlyPayment: 450000,
      remainingBalance: 1800000,
      paidInstallments: 8,
      interestRate: 10,
      startDate: "2023-08-01",
      endDate: "2024-08-01",
      status: "active",
      collateral: "savings",
      nextPaymentDate: "2024-02-10",
    },
    {
      id: "3",
      kas_id: 11,
      amount: 15000000,
      purpose: "home_improvement",
      term: 36,
      monthlyPayment: 520000,
      remainingBalance: 0,
      paidInstallments: 36,
      interestRate: 11,
      startDate: "2021-01-01",
      endDate: "2024-01-01",
      status: "completed",
      collateral: "vehicle",
      nextPaymentDate: "2024-01-01",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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

  const activeLoans = loans.filter((loan) => loan.status === "active");
  const totalOutstanding = activeLoans.reduce(
    (sum, loan) => sum + loan.remainingBalance,
    0
  );
  const totalMonthlyPayment = activeLoans.reduce(
    (sum, loan) => sum + loan.monthlyPayment,
    0
  );

  const handleLoanApplication = (applicationData: any) => {
    console.log("Submitting loan application:", applicationData);
    alert(
      "Pengajuan pinjaman berhasil dikirim! Silakan tunggu persetujuan dari admin."
    );
  };

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDetailModalOpen(true);
  };

  const handleMakePayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsPaymentModalOpen(true);
  };

  const handlePayment = (paymentData: any) => {
    console.log("Processing payment:", paymentData);
    alert("Pembayaran berhasil diproses!");
  };

  const calculateProgress = (loan: Loan) => {
    return ((loan.paidInstallments / loan.term) * 100).toFixed(1);
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pinjaman Saya</h1>
            <p className="text-gray-600 mt-1">
              Kelola pinjaman dan pembayaran Anda
            </p>
          </div>
          <Button
            onClick={() => setIsApplicationModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajukan Pinjaman Baru
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Total Pinjaman Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalOutstanding)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {activeLoans.length} pinjaman aktif
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
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalMonthlyPayment)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total per bulan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingDown className="h-4 w-4 mr-2" />
                Pinjaman Selesai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loans.filter((loan) => loan.status === "completed").length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Pinjaman lunas</p>
            </CardContent>
          </Card>
        </div>

        {/* Loans */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Pinjaman Aktif</TabsTrigger>
            <TabsTrigger value="completed">Pinjaman Lunas</TabsTrigger>
            <TabsTrigger value="all">Semua Pinjaman</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeLoans.map((loan) => (
              <Card key={loan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Pinjaman {getPurposeName(loan.purpose)}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(loan.status)}
                          <span className="text-sm text-gray-500">
                            Progress: {calculateProgress(loan)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(loan.remainingBalance)}
                      </div>
                      <p className="text-sm text-gray-500">
                        dari {formatCurrency(loan.amount)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress(loan)}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Angsuran Bulanan
                        </p>
                        <p className="font-medium">
                          {formatCurrency(loan.monthlyPayment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Jatuh Tempo Berikutnya
                        </p>
                        <p className="font-medium">
                          {new Date(loan.nextPaymentDate).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Cicilan Tersisa</p>
                        <p className="font-medium">
                          {loan.term - loan.paidInstallments} dari {loan.term}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(loan)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleMakePayment(loan)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Bayar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Other tab contents would be similar */}
        </Tabs>

        {/* Modals */}
        <LoanApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={() => setIsApplicationModalOpen(false)}
          onSubmit={handleLoanApplication}
          availableKas={availableKas}
        />

        <LoanDetailModal
          loan={selectedLoan}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedLoan(null);
          }}
          onMakePayment={handleMakePayment}
        />

        <LoanPaymentModal
          loan={selectedLoan}
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedLoan(null);
          }}
          onSubmit={handlePayment}
        />
      </div>
    </MemberLayout>
  );
}
