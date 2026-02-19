// src/pages/kas/Savings.tsx
// ✅ UPDATED: Import & Export now use real backend endpoints
//    POST /savings/import (formdata: file)
//    GET  /savings/export?savings_type=
//    GET  /savings/import/template

import React, { useState } from "react";
import { KasLayout } from "@/components/layout/KasLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PiggyBank,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSavings } from "@/hooks/useSavings";
import { SavingsAddModal } from "@/components/modals/SavingsAddModal";
import { SavingsDetailViewModal } from "@/components/modals/SavingsDetailViewModal";
import { SavingsEditModal } from "@/components/modals/SavingsEditModal";
// ✅ Import modal & export helper
import {
  ImportModal,
  handleExportFromBackend,
} from "@/components/modals/ImportExportModal";
import { toast } from "sonner";

export default function KasSavings() {
  const { user } = useAuth();
  const kasId = user?.kas_id || 1;

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState(null);

  // ✅ Import/Export states
  const [showImportModal, setShowImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { savings, loading, deleteSaving, refresh } = useSavings({ all: true });

  const kasSavings = savings.filter(
    (saving) => saving.cash_account_id === kasId,
  );

  const filteredSavings = kasSavings.filter((saving) => {
    const matchesSearch =
      saving.user?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      saving.user?.employee_id
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" || saving.savings_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number | string) => {
    const n = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n || 0);
  };

  const getSavingsTypeBadge = (type: string) => {
    const typeMap = {
      mandatory: { color: "bg-blue-100 text-blue-800", text: "Simpanan Wajib" },
      voluntary: {
        color: "bg-green-100 text-green-800",
        text: "Simpanan Sukarela",
      },
      principal: {
        color: "bg-purple-100 text-purple-800",
        text: "Simpanan Pokok",
      },
      holiday: {
        color: "bg-orange-100 text-orange-800",
        text: "Simpanan Hari Raya",
      },
    };
    const config = typeMap[type as keyof typeof typeMap] || {
      color: "bg-gray-100 text-gray-800",
      text: type,
    };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      approved: { color: "bg-green-100 text-green-800", text: "Disetujui" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      rejected: { color: "bg-red-100 text-red-800", text: "Ditolak" },
    };
    const config = statusMap[status as keyof typeof statusMap] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const handleViewSaving = (saving: any) => {
    setSelectedSaving(saving);
    setIsDetailModalOpen(true);
  };
  const handleEditSaving = (saving: any) => {
    setSelectedSaving(saving);
    setIsEditModalOpen(true);
  };

  const handleDeleteSaving = async (savingId: number) => {
    if (!confirm("Yakin ingin menghapus simpanan ini?")) return;
    try {
      await deleteSaving(savingId);
      toast.success("Simpanan berhasil dihapus");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus simpanan");
    }
  };

  // ✅ Export handler - uses backend endpoint
  const handleExport = async () => {
    try {
      setExporting(true);
      const filters: Record<string, string> = {};
      if (typeFilter !== "all") filters.savings_type = typeFilter;
      await handleExportFromBackend("savings", filters);
      toast.success("Export simpanan berhasil diunduh");
    } catch (err: any) {
      toast.error(err.message || "Gagal export data");
    } finally {
      setExporting(false);
    }
  };

  // Calculate totals
  const totalMandatory = kasSavings
    .filter((s) => s.savings_type === "mandatory")
    .reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0);
  const totalVoluntary = kasSavings
    .filter((s) => s.savings_type === "voluntary")
    .reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0);
  const totalPrincipal = kasSavings
    .filter((s) => s.savings_type === "principal")
    .reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0);
  const totalHoliday = kasSavings
    .filter((s) => s.savings_type === "holiday")
    .reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0);
  const totalSavings =
    totalMandatory + totalVoluntary + totalPrincipal + totalHoliday;

  if (loading && savings.length === 0) {
    return (
      <KasLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Memuat data simpanan...</span>
        </div>
      </KasLayout>
    );
  }

  return (
    <KasLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Simpanan
            </h1>
            <p className="text-gray-600">Kelola simpanan anggota Kas {kasId}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting || kasSavings.length === 0}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {exporting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Excel
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Simpanan
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Simpanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalSavings)}
              </div>
              <p className="text-xs text-gray-500">Keseluruhan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Simpanan Wajib
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalMandatory)}
              </div>
              <p className="text-xs text-gray-500">Bulanan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Simpanan Sukarela
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalVoluntary)}
              </div>
              <p className="text-xs text-gray-500">Fleksibel</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Simpanan Pokok
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalPrincipal)}
              </div>
              <p className="text-xs text-gray-500">Satu kali</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Simpanan Hari Raya
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalHoliday)}
              </div>
              <p className="text-xs text-gray-500">Tahunan</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <PiggyBank className="h-5 w-5" />
                  <span>Daftar Simpanan</span>
                </CardTitle>
                <CardDescription>
                  Kelola semua jenis simpanan anggota di Kas {kasId}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari simpanan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="mandatory">Simpanan Wajib</SelectItem>
                    <SelectItem value="voluntary">Simpanan Sukarela</SelectItem>
                    <SelectItem value="principal">Simpanan Pokok</SelectItem>
                    <SelectItem value="holiday">Simpanan Hari Raya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Jenis Simpanan</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSavings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Tidak ada simpanan yang ditemukan
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSavings.map((saving) => (
                      <TableRow key={saving.id}>
                        <TableCell>
                          <div className="font-medium">
                            {saving.user?.full_name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {saving.user?.employee_id || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSavingsTypeBadge(saving.savings_type)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(saving.amount)}
                        </TableCell>
                        <TableCell>
                          {new Date(saving.transaction_date).toLocaleDateString(
                            "id-ID",
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(saving.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewSaving(saving)}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSaving(saving)}
                              className="h-8 w-8 p-0 hover:bg-green-50"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSaving(saving.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Info Data Simpanan
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Menampilkan data simpanan untuk Kas {kasId}. Total{" "}
                  {kasSavings.length} transaksi simpanan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <SavingsAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refresh}
      />
      <SavingsDetailViewModal
        account={selectedSaving}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSaving(null);
        }}
      />
      <SavingsEditModal
        savings={selectedSaving}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSaving(null);
        }}
        onSave={(updated) => {
          refresh();
        }}
      />

      {/* ✅ Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        type="savings"
        onSuccess={() => {
          refresh();
          toast.success("Data simpanan berhasil diimport");
        }}
      />
    </KasLayout>
  );
}
