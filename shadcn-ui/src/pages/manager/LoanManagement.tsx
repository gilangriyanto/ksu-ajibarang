// pages/manager/LoanManagement.tsx
// ✅ UPDATED: Added Import Excel & Export Excel buttons
// ✅ Uses backend endpoints: POST /loans/import, GET /loans/export, GET /loans/import/template

import React, { useState } from "react";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EarlySettlementModal from "@/components/modals/EarlySettlementModal";
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Coins,
  Upload,
  Download,
} from "lucide-react";

import useLoans from "@/hooks/useLoans";
import useInstallments from "@/hooks/useInstallments";
import useLoanSimulation from "@/hooks/useLoanSimulation";

import { LoanAddModal } from "@/components/modals/LoanAddModal";
import { LoanDetailModal } from "@/components/modals/LoanDetailModal";
import {
  ImportModal,
  handleExportFromBackend,
} from "@/components/modals/ImportExportModal";
import { toast } from "sonner";

export default function LoanManagement() {
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
  } = useLoans({ all: true, autoLoad: true });

  const { getInstallments, getOverdueInstallments } = useInstallments();
  const { simulate } = useLoanSimulation();

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [addLoanModal, setAddLoanModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [showEarlySettlementModal, setShowEarlySettlementModal] =
    useState(false);
  const [settlementLoanId, setSettlementLoanId] = useState<number | null>(null);
  const [settlementLoanNumber, setSettlementLoanNumber] = useState<string>("");

  // ✅ Import/Export states
  const [showImportModal, setShowImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const getDeductionMethodBadge = (method: string) => {
    const badges: Record<
      string,
      { color: string; text: string; icon: string }
    > = {
      salary: {
        color: "bg-blue-100 text-blue-800",
        text: "Auto Potong Gaji",
        icon: "💰",
      },
      service_allowance: {
        color: "bg-purple-100 text-purple-800",
        text: "Potong Jasa Pelayanan",
        icon: "🎁",
      },
      mixed: {
        color: "bg-orange-100 text-orange-800",
        text: "Campuran",
        icon: "🔄",
      },
      none: { color: "bg-gray-100 text-gray-800", text: "Manual", icon: "👤" },
    };
    const badge = badges[method] || badges.none;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
      >
        <span>{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  const formatCurrency = (amount: number | string) => {
    const n = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n || 0);
  };

  const getStatusBadge = (status: string) => {
    const m: Record<string, { color: string; text: string }> = {
      active: { color: "bg-green-100 text-green-800", text: "Aktif" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      approved: { color: "bg-blue-100 text-blue-800", text: "Disetujui" },
      rejected: { color: "bg-red-100 text-red-800", text: "Ditolak" },
      completed: { color: "bg-gray-100 text-gray-800", text: "Lunas" },
      overdue: { color: "bg-red-100 text-red-800", text: "Menunggak" },
    };
    const c = m[status] || { color: "bg-gray-100 text-gray-800", text: status };
    return <Badge className={c.color}>{c.text}</Badge>;
  };

  const handleApprove = async (loanId: number) => {
    try {
      await approveLoan(loanId, new Date().toISOString().split("T")[0]);
      refresh();
    } catch (err) {
      console.error("Error approving loan:", err);
    }
  };

  const handleReject = async (loanId: number) => {
    const reason = prompt("Alasan penolakan:");
    if (reason) {
      try {
        await rejectLoan(loanId, reason);
        refresh();
      } catch (err) {
        console.error("Error rejecting loan:", err);
      }
    }
  };

  const handleViewDetail = (loan: any) => {
    setSelectedLoan(loan);
    setDetailModal(true);
  };

  // ✅ Export handler
  const handleExport = async () => {
    try {
      setExporting(true);
      await handleExportFromBackend("loans");
      toast.success("Export pinjaman berhasil diunduh");
    } catch (err: any) {
      toast.error(err.message || "Gagal export data");
    } finally {
      setExporting(false);
    }
  };

  const activeLoans = loans.filter((l) => l.status === "active");
  const pendingLoans = loans.filter((l) => l.status === "pending");
  const overdueLoans = loans.filter((l) => l.status === "overdue");
  const totalActiveAmount = activeLoans.reduce((s, l) => {
    const a =
      typeof l.principal_amount === "string"
        ? parseFloat(l.principal_amount)
        : l.principal_amount;
    return s + (a || 0);
  }, 0);

  if (loading && loans.length === 0) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Pinjaman</h1>
            <p className="text-gray-600">Kelola pinjaman anggota koperasi</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Excel
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting || loans.length === 0}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {exporting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Excel
            </Button>
            <Button onClick={() => setAddLoanModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Pinjaman Baru
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Pinjaman Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  summary?.total_outstanding || totalActiveAmount,
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
                    <th className="text-left py-3 px-4">Metode Potongan</th>
                    <th className="text-left py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">#{loan.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium">
                          {loan.user?.full_name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {loan.user?.employee_id || "N/A"}
                        </p>
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
                          "id-ID",
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getDeductionMethodBadge(loan.deduction_method)}
                        {loan.deduction_method === "salary" && (
                          <p className="text-xs text-gray-500 mt-1">
                            Cicilan otomatis via potongan gaji
                          </p>
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
                          {loan.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSettlementLoanId(loan.id);
                                setSettlementLoanNumber(
                                  loan.loan_number || `#${loan.id}`,
                                );
                                setShowEarlySettlementModal(true);
                              }}
                              className="text-green-600"
                              title="Pelunasan Dipercepat"
                            >
                              <Coins className="h-4 w-4" />
                            </Button>
                          )}
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

      {/* Modals */}
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
      <EarlySettlementModal
        isOpen={showEarlySettlementModal}
        onClose={() => {
          setShowEarlySettlementModal(false);
          setSettlementLoanId(null);
          setSettlementLoanNumber("");
        }}
        loanId={settlementLoanId}
        loanNumber={settlementLoanNumber}
        onSuccess={refresh}
      />

      {/* ✅ Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        type="loans"
        onSuccess={() => {
          refresh();
          toast.success("Data pinjaman berhasil diimport");
        }}
      />
    </ManagerLayout>
  );
}
