// =====================================================
// FIXED: LoanManagement.tsx (Manager)
// =====================================================

import React, { useState } from "react";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, CheckCircle, XCircle, RefreshCw } from "lucide-react";

// ✅ Import the hooks
import useLoans from "@/hooks/useLoans";
import useInstallments from "@/hooks/useInstallments";
import useLoanSimulation from "@/hooks/useLoanSimulation";

// ✅ CRITICAL: Import modal components (named exports)
import { LoanAddModal } from "@/components/modals/LoanAddModal";
import { LoanDetailModal } from "@/components/modals/LoanDetailModal";

export default function LoanManagement() {
  // ✅ Use the hooks
  const {
    loans,
    summary,
    loading,
    loadLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    approveLoan,
    rejectLoan,
    refresh,
  } = useLoans({
    all: true, // Manager sees all loans
    autoLoad: true, // Auto load on mount
  });

  const { getInstallments, getOverdueInstallments } = useInstallments();
  const { simulate } = useLoanSimulation();

  // ✅ Local state for modals
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [addLoanModal, setAddLoanModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);

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
      approved: { color: "bg-blue-100 text-blue-800", text: "Disetujui" },
      rejected: { color: "bg-red-100 text-red-800", text: "Ditolak" },
      completed: { color: "bg-gray-100 text-gray-800", text: "Lunas" },
      overdue: { color: "bg-red-100 text-red-800", text: "Menunggak" },
    };

    const config = statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  // ✅ Handle actions
  const handleCreateLoan = async (formData: any) => {
    try {
      await createLoan({
        user_id: formData.user_id,
        cash_account_id: formData.cash_account_id,
        principal_amount: formData.principal_amount,
        tenure_months: formData.tenure_months,
        application_date: formData.application_date,
        loan_purpose: formData.loan_purpose,
      });
      setAddLoanModal(false);
      refresh(); // Reload data after create
    } catch (err) {
      console.error("Error creating loan:", err);
    }
  };

  const handleApprove = async (loanId: number) => {
    try {
      const disbursementDate = new Date().toISOString().split("T")[0];
      await approveLoan(loanId, disbursementDate);
      refresh();
    } catch (err) {
      console.error("Error approving loan:", err);
    }
  };

  const handleReject = async (loanId: number) => {
    try {
      const reason = prompt("Alasan penolakan:");
      if (reason) {
        await rejectLoan(loanId, reason);
        refresh();
      }
    } catch (err) {
      console.error("Error rejecting loan:", err);
    }
  };

  const handleDelete = async (loanId: number) => {
    if (confirm("Yakin ingin menghapus pengajuan pinjaman ini?")) {
      try {
        await deleteLoan(loanId);
        refresh();
      } catch (err) {
        console.error("Error deleting loan:", err);
      }
    }
  };

  // ✅ Handle view detail - FIXED
  const handleViewDetail = (loan: any) => {
    console.log("🔍 Opening detail for loan:", loan);
    setSelectedLoan(loan);
    setDetailModal(true);
  };

  // ✅ Calculate statistics
  const activeLoans = loans.filter((loan) => loan.status === "active");
  const pendingLoans = loans.filter((loan) => loan.status === "pending");
  const overdueLoans = loans.filter((loan) => loan.status === "overdue");

  const totalActiveAmount = activeLoans.reduce((sum, loan) => {
    const amount =
      typeof loan.principal_amount === "string"
        ? parseFloat(loan.principal_amount)
        : loan.principal_amount;
    return sum + (amount || 0);
  }, 0);

  // ✅ Loading state
  if (loading && loans.length === 0) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ManagerLayout>
    );
  }

  // ✅ Render UI
  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Pinjaman</h1>
            <p className="text-gray-600">Kelola pinjaman anggota koperasi</p>
          </div>
          <Button
            onClick={() => {
              console.log("➕ Opening add loan modal");
              setAddLoanModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Pinjaman Baru
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Pinjaman Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  summary?.total_outstanding || totalActiveAmount
                )}
              </div>
              <p className="text-xs text-gray-500">
                {activeLoans.length} pinjaman
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pengajuan Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingLoans.length}
              </div>
              <p className="text-xs text-gray-500">Perlu review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pinjaman Menunggak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {overdueLoans.length}
              </div>
              <p className="text-xs text-gray-500">Perlu tindakan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Pinjaman</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loans.length}
              </div>
              <p className="text-xs text-gray-500">Semua status</p>
            </CardContent>
          </Card>
        </div>

        {/* Loans Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pinjaman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Anggota</th>
                    <th className="text-left py-3 px-4">Jumlah</th>
                    <th className="text-left py-3 px-4">Tenor</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Tanggal</th>
                    <th className="text-left py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">#{loan.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {loan.user?.full_name || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {loan.user?.employee_id || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(loan.principal_amount)}
                      </td>
                      <td className="py-3 px-4">{loan.tenure_months} bulan</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(loan.status)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(loan.application_date).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {loan.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(loan.id)}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(loan.id)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(loan)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ✅ CRITICAL FIX: Render modal components at the bottom */}
      <LoanAddModal
        isOpen={addLoanModal}
        onClose={() => setAddLoanModal(false)}
        onSuccess={refresh}
      />

      <LoanDetailModal
        loan={selectedLoan}
        isOpen={detailModal}
        onClose={() => {
          setDetailModal(false);
          setSelectedLoan(null);
        }}
      />
    </ManagerLayout>
  );
}
