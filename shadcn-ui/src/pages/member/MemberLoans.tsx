// =====================================================
// FIXED: MemberLoans.tsx (Member)
// =====================================================

import React, { useState } from "react";
import { MemberLayout } from "@/components/layout/MemberLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, DollarSign, Calendar, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// ✅ Import the hooks
import useLoans from "@/hooks/useLoans";
import useInstallments from "@/hooks/useInstallments";
import useLoanSimulation from "@/hooks/useLoanSimulation";

// ✅ CRITICAL: Import modal components (named exports)
import { LoanApplicationModal } from "@/components/modals/LoanApplicationModal";
import { LoanDetailModal } from "@/components/modals/LoanDetailModal";
import { LoanPaymentModal } from "@/components/modals/LoanPaymentModal";

export default function MemberLoans() {
  const { user } = useAuth();

  // ✅ Use the hooks (filtered by user_id)
  const { loans, summary, loading, createLoan, refresh } = useLoans({
    user_id: user?.id, // Member only sees their own loans
    autoLoad: true,
  });

  const { installments, getInstallments, payInstallment } = useInstallments();
  const { simulate, simulation } = useLoanSimulation();

  // ✅ Local state for modals
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [applicationModal, setApplicationModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);

  // Mock availableKas data - replace with actual API call
  const availableKas = [
    {
      id: 1,
      name: "Kas Umum",
      description: "Pinjaman dengan bunga standar untuk kebutuhan umum",
      interest_rate: 12,
      max_amount: 50000000,
    },
    {
      id: 3,
      name: "Kas Sebrakan",
      description: "Pinjaman tanpa bunga untuk kebutuhan mendesak",
      interest_rate: 0,
      max_amount: 10000000,
    },
  ];

  // ✅ Format helpers
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { color: "bg-green-100 text-green-800", text: "Aktif" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      completed: { color: "bg-blue-100 text-blue-800", text: "Lunas" },
      overdue: { color: "bg-red-100 text-red-800", text: "Terlambat" },
      rejected: { color: "bg-red-100 text-red-800", text: "Ditolak" },
    };

    const config = statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  // ✅ Handle actions
  const handleApplyLoan = async (formData: any) => {
    try {
      if (!user?.id) {
        console.error("User ID not found");
        return;
      }

      await createLoan({
        user_id: user.id,
        cash_account_id: formData.cash_account_id,
        principal_amount: formData.principal_amount,
        tenure_months: formData.tenure_months,
        application_date: new Date().toISOString().split("T")[0],
        loan_purpose: formData.loan_purpose,
      });
      setApplicationModal(false);
      refresh(); // Reload data after apply
    } catch (err) {
      console.error("Error applying loan:", err);
    }
  };

  // ✅ Handle view detail - FIXED
  const handleViewDetail = (loan: any) => {
    console.log("🔍 Opening detail for loan:", loan);
    setSelectedLoan(loan);
    setDetailModal(true);
  };

  // ✅ Handle payment click - FIXED
  const handlePaymentClick = async (loan: any) => {
    console.log("💰 Opening payment for loan:", loan);
    setSelectedLoan(loan);
    // Load installments first to get upcoming installment
    await getInstallments(loan.id);
    setPaymentModal(true);
  };

  // Get next unpaid installment
  const getUpcomingInstallment = () => {
    if (!installments || installments.length === 0) return null;
    return (
      installments.find(
        (i) => i.status === "pending" || i.status === "overdue"
      ) || null
    );
  };

  // ✅ Calculate statistics
  const activeLoans = loans.filter((loan) => loan.status === "active");
  const completedLoans = loans.filter((loan) => loan.status === "completed");

  const totalOutstanding = activeLoans.reduce((sum, loan) => {
    const remaining = loan.remaining_balance || loan.principal_amount;
    const amount =
      typeof remaining === "string" ? parseFloat(remaining) : remaining;
    return sum + (amount || 0);
  }, 0);

  const totalMonthlyPayment = activeLoans.reduce((sum, loan) => {
    const monthly = loan.monthly_payment || 0;
    const amount = typeof monthly === "string" ? parseFloat(monthly) : monthly;
    return sum + (amount || 0);
  }, 0);

  // ✅ Calculate progress
  const calculateProgress = (loan: any) => {
    const paid = loan.paid_installments || 0;
    const total = loan.total_installments || loan.tenure_months || 1;
    return ((paid / total) * 100).toFixed(1);
  };

  // ✅ Loading state
  if (loading && loans.length === 0) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </MemberLayout>
    );
  }

  // ✅ Render UI
  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pinjaman Saya</h1>
            <p className="text-gray-600">Kelola pinjaman dan pembayaran Anda</p>
          </div>
          <Button
            onClick={() => {
              console.log("➕ Opening loan application modal");
              setApplicationModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajukan Pinjaman
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Total Pinjaman Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary?.total_outstanding || totalOutstanding)}
              </div>
              <p className="text-xs text-gray-500">
                {activeLoans.length} pinjaman aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Angsuran Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalMonthlyPayment)}
              </div>
              <p className="text-xs text-gray-500">Total per bulan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pinjaman Selesai</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedLoans.length}
              </div>
              <p className="text-xs text-gray-500">Pinjaman lunas</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Loans */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pinjaman Aktif</h2>

          {activeLoans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  Anda belum memiliki pinjaman aktif
                </p>
              </CardContent>
            </Card>
          ) : (
            activeLoans.map((loan) => (
              <Card key={loan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Pinjaman #{loan.id}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(loan.status)}
                        <span className="text-sm text-gray-500">
                          Progress: {calculateProgress(loan)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(
                          loan.remaining_balance || loan.principal_amount
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        dari {formatCurrency(loan.principal_amount)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${calculateProgress(loan)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Angsuran Bulanan
                        </p>
                        <p className="font-medium">
                          {formatCurrency(loan.monthly_payment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tenor</p>
                        <p className="font-medium">
                          {loan.tenure_months} bulan
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bunga</p>
                        <p className="font-medium">{loan.interest_rate}%</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(loan)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePaymentClick(loan)}
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
            ))
          )}
        </div>

        {/* Pending Applications */}
        {loans.filter((l) => l.status === "pending").length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pengajuan Pending</h2>
            {loans
              .filter((l) => l.status === "pending")
              .map((loan) => (
                <Card key={loan.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pinjaman #{loan.id}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(loan.principal_amount)} •{" "}
                          {loan.tenure_months} bulan
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(loan.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(loan)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* ✅ CRITICAL FIX: Render modal components at the bottom */}
      <LoanApplicationModal
        isOpen={applicationModal}
        onClose={() => setApplicationModal(false)}
        onSubmit={handleApplyLoan}
        userId={user?.id || 0}
        availableKas={availableKas}
      />

      <LoanDetailModal
        loan={selectedLoan}
        isOpen={detailModal}
        onClose={() => {
          setDetailModal(false);
          setSelectedLoan(null);
        }}
      />

      <LoanPaymentModal
        loan={selectedLoan}
        isOpen={paymentModal}
        onClose={() => {
          setPaymentModal(false);
          setSelectedLoan(null);
        }}
        onSuccess={async () => {
          console.log("🔄 Payment successful, refreshing data...");

          // Reload loans data
          await refresh();

          // Reload installments for the loan
          if (selectedLoan) {
            await getInstallments(selectedLoan.id);
          }

          console.log("✅ Data refreshed successfully");
        }}
        upcomingInstallment={getUpcomingInstallment()}
      />
    </MemberLayout>
  );
}
