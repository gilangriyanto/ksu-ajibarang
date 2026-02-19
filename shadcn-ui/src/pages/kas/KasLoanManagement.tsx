// src/pages/kas/LoanManagement.tsx
// ✅ UPDATED: Added Import Excel, Export Excel, Early Settlement
//    POST /loans/import (formdata: file)
//    GET  /loans/export?status=
//    GET  /loans/import/template
//    POST /loans/{id}/early-settlement
//    GET  /loans/{id}/early-settlement/preview

import React, { useState } from "react";
import { KasLayout } from "@/components/layout/KasLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  AlertCircle,
  Download,
  Upload,
  Coins,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import useLoans from "@/hooks/useLoans";
import { LoanAddModal } from "@/components/modals/LoanAddModal";
import { LoanDetailModal } from "@/components/modals/LoanDetailModal";
// ✅ Import, Export, Early Settlement
import {
  ImportModal,
  handleExportFromBackend,
} from "@/components/modals/ImportExportModal";
import EarlySettlementModal from "@/components/modals/EarlySettlementModal";
import { toast } from "sonner";

export default function KasLoanManagement() {
  const { user } = useAuth();
  const kasId = user?.kas_id || 1;

  const [searchTerm, setSearchTerm] = useState("");
  const [addLoanModal, setAddLoanModal] = useState(false);
  const [viewLoanModal, setViewLoanModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // ✅ Import/Export states
  const [showImportModal, setShowImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ✅ Early Settlement states
  const [showEarlySettlementModal, setShowEarlySettlementModal] =
    useState(false);
  const [settlementLoanId, setSettlementLoanId] = useState<number | null>(null);
  const [settlementLoanNumber, setSettlementLoanNumber] = useState<string>("");

  const {
    loans,
    summary,
    loading,
    approveLoan,
    rejectLoan,
    deleteLoan,
    refresh,
  } = useLoans({ all: true, autoLoad: true });

  // Filter by kas
  const kasLoans = loans.filter((loan) => loan.cash_account_id === kasId);
  const activeLoans = kasLoans.filter((loan) => loan.status === "active");
  const pendingLoans = kasLoans.filter((loan) => loan.status === "pending");
  const overdueLoans = kasLoans.filter((loan) => loan.status === "overdue");

  const filteredLoans = kasLoans.filter((loan) => {
    const s = searchTerm.toLowerCase();
    return (
      loan.user?.full_name?.toLowerCase().includes(s) ||
      loan.user?.employee_id?.toLowerCase().includes(s) ||
      loan.id.toString().includes(s)
    );
  });

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
      completed: { color: "bg-blue-100 text-blue-800", text: "Lunas" },
      overdue: { color: "bg-red-100 text-red-800", text: "Menunggak" },
      approved: { color: "bg-green-100 text-green-800", text: "Disetujui" },
      rejected: { color: "bg-red-100 text-red-800", text: "Ditolak" },
    };
    const c = m[status] || { color: "bg-gray-100 text-gray-800", text: status };
    return <Badge className={c.color}>{c.text}</Badge>;
  };

  const handleApprove = async (loanId: number) => {
    try {
      await approveLoan(loanId, new Date().toISOString().split("T")[0]);
      toast.success("Pinjaman berhasil disetujui");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyetujui pinjaman");
    }
  };

  const handleReject = async (loanId: number) => {
    const reason = prompt("Alasan penolakan:");
    if (!reason) return;
    try {
      await rejectLoan(loanId, reason);
      toast.success("Pinjaman berhasil ditolak");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal menolak pinjaman");
    }
  };

  const handleViewDetail = (loan: any) => {
    setSelectedLoan(loan);
    setViewLoanModal(true);
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

  // ✅ Early Settlement handler
  const handleEarlySettlement = (loan: any) => {
    setSettlementLoanId(loan.id);
    setSettlementLoanNumber(loan.loan_number || `#${loan.id}`);
    setShowEarlySettlementModal(true);
  };

  const totalActiveAmount = activeLoans.reduce(
    (s, l) => s + (parseFloat(l.principal_amount?.toString()) || 0),
    0,
  );
  const totalRemaining = activeLoans.reduce(
    (s, l) => s + (parseFloat(l.remaining_balance?.toString()) || 0),
    0,
  );

  if (loading && loans.length === 0) {
    return (
      <KasLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Memuat data pinjaman...</span>
        </div>
      </KasLayout>
    );
  }

  return (
    <KasLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manajemen Pinjaman
            </h1>
            <p className="text-gray-600 mt-1">Kelola pinjaman Kas {kasId}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting || kasLoans.length === 0}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {exporting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setAddLoanModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Pinjaman Baru
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Pinjaman Aktif
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalActiveAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Sisa Pinjaman
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <XCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Pinjaman Menunggak
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overdueLoans.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <CheckCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Pengajuan Pending
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingLoans.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Pinjaman Aktif ({activeLoans.length})
            </TabsTrigger>
            <TabsTrigger value="applications">
              Pengajuan Baru ({pendingLoans.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Semua Pinjaman ({kasLoans.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Loans Tab */}
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pencarian Pinjaman</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama anggota atau ID pinjaman..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daftar Pinjaman Aktif</CardTitle>
                <CardDescription>
                  Menampilkan {activeLoans.length} pinjaman aktif di Kas {kasId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Anggota
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Jumlah
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Sisa
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Tanggal
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLoans.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">
                              Belum ada pinjaman aktif di Kas {kasId}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        activeLoans.map((loan) => (
                          <tr
                            key={loan.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 font-medium">
                              #{loan.id}
                            </td>
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
                            <td className="py-3 px-4 font-medium text-red-600">
                              {formatCurrency(loan.remaining_balance || 0)}
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(loan.status)}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {new Date(
                                loan.application_date,
                              ).toLocaleDateString("id-ID")}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetail(loan)}
                                  title="Detail"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {/* ✅ Early Settlement Button */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEarlySettlement(loan)}
                                  className="text-green-600"
                                  title="Pelunasan Dipercepat"
                                >
                                  <Coins className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengajuan Pinjaman Baru</CardTitle>
                <CardDescription>
                  Menampilkan {pendingLoans.length} pengajuan yang perlu
                  ditinjau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingLoans.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Tidak ada pengajuan pinjaman baru
                      </p>
                    </div>
                  ) : (
                    pendingLoans.map((loan) => (
                      <div key={loan.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {loan.user?.full_name || "N/A"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  ID: {loan.user?.employee_id || "N/A"} • #
                                  {loan.id}
                                </p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-blue-600">
                                  {formatCurrency(loan.principal_amount)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {loan.tenure_months} bulan
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  {loan.loan_purpose}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Diajukan:{" "}
                                  {new Date(
                                    loan.application_date,
                                  ).toLocaleDateString("id-ID")}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetail(loan)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(loan.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(loan.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Tolak
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Loans Tab */}
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Semua Pinjaman</CardTitle>
                <CardDescription>
                  Menampilkan {filteredLoans.length} pinjaman di Kas {kasId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">ID</th>
                        <th className="text-left py-3 px-4">Anggota</th>
                        <th className="text-left py-3 px-4">Jumlah</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Tanggal</th>
                        <th className="text-left py-3 px-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoans.map((loan) => (
                        <tr key={loan.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">#{loan.id}</td>
                          <td className="py-3 px-4">
                            {loan.user?.full_name || "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            {formatCurrency(loan.principal_amount)}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(loan.status)}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(loan.application_date).toLocaleDateString(
                              "id-ID",
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
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
                                  onClick={() => handleEarlySettlement(loan)}
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <LoanAddModal
        isOpen={addLoanModal}
        onClose={() => setAddLoanModal(false)}
        onSuccess={refresh}
      />
      <LoanDetailModal
        loan={selectedLoan}
        isOpen={viewLoanModal}
        onClose={() => {
          setViewLoanModal(false);
          setSelectedLoan(null);
        }}
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

      {/* ✅ Early Settlement Modal */}
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
    </KasLayout>
  );
}
