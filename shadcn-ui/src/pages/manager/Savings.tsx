import React, { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import { BackButton } from "@/components/ui/back-button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PiggyBank,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { SavingsAddModal } from "@/components/modals/SavingsAddModal";
import SavingsDetailModal from "@/components/modals/SavingsDetailModal";
import { SavingsEditModal } from "@/components/modals/SavingsEditModal";
import { ExportSavingsModalClientSide } from "@/components/modals/ExportSavingsModalClientSide"; // ✅ Client-side export
import { toast } from "sonner";
import savingsService, {
  Saving,
  SavingsSummary,
} from "@/lib/api/savings.service";

export default function SavingsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<Saving | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<Saving | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // API State
  const [savings, setSavings] = useState<Saving[]>([]);
  const [summary, setSummary] = useState<SavingsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Loading all data...");
      await loadSavings();
      await loadSummaryFromTypeEndpoints();
      console.log("✅ All data loaded successfully");
    } catch (err: any) {
      console.error("❌ Error loading data:", err);
      setError(err.message || "Gagal memuat data simpanan");
      toast.error("Gagal memuat data simpanan");
    } finally {
      setLoading(false);
    }
  };

  const loadSavings = async () => {
    try {
      console.log("📋 Loading all savings...");
      const response = await savingsService.getAll({ all: true });

      let savingsData: Saving[] = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        savingsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        savingsData = response.data;
      } else if (Array.isArray(response)) {
        savingsData = response;
      }

      console.log("📋 Parsed savings array:", savingsData.length, "items");
      setSavings(savingsData);

      if (savingsData.length === 0) {
        console.warn("⚠️ No savings data found");
      } else {
        console.log(`✅ Successfully loaded ${savingsData.length} savings`);
      }
    } catch (err: any) {
      console.error("❌ Error loading savings:", err);
      throw new Error("Gagal memuat data simpanan");
    }
  };

  const loadSummaryFromTypeEndpoints = async () => {
    try {
      console.log("📊 Loading summary from type endpoints...");

      const [mandatoryRes, voluntaryRes, principalRes, holidayRes] =
        await Promise.all([
          savingsService.getByType.mandatory().catch(() => ({ data: [] })),
          savingsService.getByType.voluntary().catch(() => ({ data: [] })),
          savingsService.getByType.principal().catch(() => ({ data: [] })),
          savingsService.getByType.holiday().catch(() => ({ data: [] })),
        ]);

      const mandatoryData = Array.isArray(mandatoryRes?.data?.data)
        ? mandatoryRes.data.data
        : Array.isArray(mandatoryRes?.data)
        ? mandatoryRes.data
        : [];

      const voluntaryData = Array.isArray(voluntaryRes?.data?.data)
        ? voluntaryRes.data.data
        : Array.isArray(voluntaryRes?.data)
        ? voluntaryRes.data
        : [];

      const principalData = Array.isArray(principalRes?.data?.data)
        ? principalRes.data.data
        : Array.isArray(principalRes?.data)
        ? principalRes.data
        : [];

      const holidayData = Array.isArray(holidayRes?.data?.data)
        ? holidayRes.data.data
        : Array.isArray(holidayRes?.data)
        ? holidayRes.data
        : [];

      const calculateTotal = (data: Saving[]) => {
        return data.reduce((sum, item) => {
          const amount = parseFloat(
            item.final_amount?.toString() || item.amount?.toString() || "0"
          );
          return sum + amount;
        }, 0);
      };

      const total_mandatory = calculateTotal(mandatoryData);
      const total_voluntary = calculateTotal(voluntaryData);
      const total_principal = calculateTotal(principalData);
      const total_holiday = calculateTotal(holidayData);
      const total_balance =
        total_mandatory + total_voluntary + total_principal + total_holiday;

      const allSavings = [
        ...mandatoryData,
        ...voluntaryData,
        ...principalData,
        ...holidayData,
      ];
      const uniqueUserIds = new Set(allSavings.map((s) => s.user_id));
      const active_members = uniqueUserIds.size;
      const total_deposits = allSavings.length;

      const calculatedSummary: SavingsSummary = {
        total_balance,
        total_principal,
        total_mandatory,
        total_voluntary,
        total_holiday,
        total_deposits,
        active_members,
      };

      setSummary(calculatedSummary);
    } catch (err: any) {
      console.error("❌ Error loading summary:", err);
      setSummary({
        total_balance: 0,
        total_principal: 0,
        total_mandatory: 0,
        total_voluntary: 0,
        total_holiday: 0,
        total_deposits: 0,
        active_members: 0,
      });
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

  const filteredRecords = savings.filter((record) => {
    const userName = record.user?.full_name || record.user_name || "";
    const userCode = record.user?.employee_id || record.user_code || "";
    const savingsType = record.savings_type || record.saving_type || "";

    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || savingsType === typeFilter;
    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSavingsTypeBadge = (type: string) => {
    switch (type) {
      case "mandatory":
        return (
          <Badge className="bg-blue-100 text-blue-800">Simpanan Wajib</Badge>
        );
      case "voluntary":
        return (
          <Badge className="bg-green-100 text-green-800">
            Simpanan Sukarela
          </Badge>
        );
      case "principal":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Simpanan Pokok
          </Badge>
        );
      case "holiday":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            Simpanan Hari Raya
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Disetujui
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Ditolak
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewRecord = (record: Saving) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleEditRecord = (record: Saving) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleSaveSavings = async (updatedSavings: any) => {
    try {
      await savingsService.update(updatedSavings.id, {
        user_id: updatedSavings.user_id,
        cash_account_id: updatedSavings.cash_account_id,
        savings_type: updatedSavings.savings_type || updatedSavings.saving_type,
        amount:
          typeof updatedSavings.amount === "string"
            ? parseFloat(updatedSavings.amount)
            : updatedSavings.amount,
        transaction_date: updatedSavings.transaction_date,
        description: updatedSavings.description || updatedSavings.notes,
        status: updatedSavings.status,
      });

      toast.success("Data simpanan berhasil diperbarui");
      await loadAllData();
      setIsEditModalOpen(false);
      setSelectedRecord(null);
    } catch (err: any) {
      console.error("❌ Error updating savings:", err);
      const errorMsg =
        err.data?.message || err.message || "Gagal memperbarui simpanan";
      toast.error(errorMsg);
    }
  };

  const handleApprove = async (record: Saving) => {
    try {
      await savingsService.approve(record.id, "Disetujui oleh manager");
      toast.success("Simpanan berhasil disetujui");
      await loadAllData();
    } catch (err: any) {
      const errorMsg =
        err.data?.message || err.message || "Gagal menyetujui simpanan";
      toast.error(errorMsg);
    }
  };

  const handleReject = async (record: Saving) => {
    try {
      await savingsService.reject(record.id, "Ditolak oleh manager");
      toast.success("Simpanan berhasil ditolak");
      await loadAllData();
    } catch (err: any) {
      const errorMsg =
        err.data?.message || err.message || "Gagal menolak simpanan";
      toast.error(errorMsg);
    }
  };

  const handleDeleteRecord = (record: Saving) => {
    setRecordToDelete(record);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRecord = async () => {
    if (recordToDelete) {
      try {
        await savingsService.delete(recordToDelete.id);
        toast.success("Simpanan berhasil dihapus");
        await loadAllData();
        setRecordToDelete(null);
        setIsDeleteDialogOpen(false);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Gagal menghapus simpanan");
      }
    }
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Memuat data...</span>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <BackButton to="/manager" />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Simpanan
            </h1>
            <p className="text-gray-600">Kelola simpanan anggota koperasi</p>
          </div>
          <div className="flex space-x-2">
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
            {/* ✅ Export Button - Client Side */}
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(true)}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              disabled={savings.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Simpanan
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Simpanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary.total_balance)}
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
                  {formatCurrency(summary.total_mandatory)}
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
                  {formatCurrency(summary.total_voluntary)}
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
                  {formatCurrency(summary.total_principal)}
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
                  {formatCurrency(summary.total_holiday)}
                </div>
                <p className="text-xs text-gray-500">Tahunan</p>
              </CardContent>
            </Card>
          </div>
        )}

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
                  Kelola semua jenis simpanan anggota
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
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
                    <TableHead>Saldo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Tidak ada simpanan yang ditemukan
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {record.user?.full_name ||
                                record.user_name ||
                                "-"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.user?.employee_id ||
                                record.user_code ||
                                "-"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSavingsTypeBadge(
                            record.savings_type || record.saving_type
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(
                            parseFloat(record.amount?.toString() || "0")
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-blue-600">
                          {formatCurrency(
                            parseFloat(
                              record.final_amount?.toString() ||
                                record.balance?.toString() ||
                                "0"
                            )
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          {new Date(record.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            {record.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(record)}
                                  className="h-8 w-8 p-0 hover:bg-green-50"
                                  title="Setujui"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject(record)}
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                  title="Tolak"
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRecord(record)}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRecord(record)}
                              className="h-8 w-8 p-0 hover:bg-green-50"
                              title="Edit Simpanan"
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecord(record)}
                              className="h-8 w-8 p-0 hover:bg-red-50"
                              title="Hapus Simpanan"
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

        {/* Modals */}
        <SavingsAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={async () => {
            setIsAddModalOpen(false);
            await new Promise((resolve) => setTimeout(resolve, 500));
            await loadAllData();
          }}
        />

        <SavingsDetailModal
          savings={selectedRecord}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedRecord(null);
          }}
          onEdit={(savings) => {
            setIsDetailModalOpen(false);
            handleEditRecord(savings);
          }}
        />

        <SavingsEditModal
          savings={selectedRecord}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRecord(null);
          }}
          onSave={handleSaveSavings}
        />

        {/* ✅ Client-Side Export Modal */}
        <ExportSavingsModalClientSide
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          savings={savings}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Simpanan</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus simpanan{" "}
                <strong>
                  {recordToDelete?.user?.full_name || recordToDelete?.user_name}
                </strong>
                ? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setRecordToDelete(null);
                }}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteRecord}
                className="bg-red-600 hover:bg-red-700"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ManagerLayout>
  );
}
