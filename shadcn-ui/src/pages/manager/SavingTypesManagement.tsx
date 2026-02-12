// src/pages/admin/SavingTypesManagement.tsx
// 🆕 NEW FEATURE: Manage saving types (Admin only)

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
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Percent,
} from "lucide-react";
import { SavingTypeAddModal } from "@/components/modals/SavingTypeAddModal";
import { SavingTypeEditModal } from "@/components/modals/SavingTypeEditModal";
import { SavingTypeDetailModal } from "@/components/modals/SavingTypeDetailModal";
import { toast } from "sonner";
import savingsService, { SavingType } from "@/lib/api/savings.service";

export default function SavingTypesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mandatoryFilter, setMandatoryFilter] = useState("all");
  const [selectedType, setSelectedType] = useState<SavingType | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<SavingType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // API State
  const [savingTypes, setSavingTypes] = useState<SavingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSavingTypes();
  }, []);

  const loadSavingTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Loading saving types...");
      const response = await savingsService.getSavingTypes({
        is_active: undefined, // Get all (active & inactive)
      });

      const typesData = response.data?.data || response.data || [];
      console.log(`✅ Loaded ${typesData.length} saving types`);
      setSavingTypes(typesData);
    } catch (err: any) {
      console.error("❌ Error loading saving types:", err);
      setError(err.message || "Gagal memuat jenis simpanan");
      toast.error("Gagal memuat jenis simpanan");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSavingTypes();
      toast.success("Data berhasil diperbarui");
    } catch (err) {
      toast.error("Gagal memperbarui data");
    } finally {
      setRefreshing(false);
    }
  };

  // Filter logic
  const filteredTypes = savingTypes.filter((type) => {
    const matchesSearch =
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? type.is_active : !type.is_active);

    const matchesMandatory =
      mandatoryFilter === "all" ||
      (mandatoryFilter === "mandatory"
        ? type.is_mandatory
        : !type.is_mandatory);

    return matchesSearch && matchesStatus && matchesMandatory;
  });

  const handleViewType = (type: SavingType) => {
    setSelectedType(type);
    setIsDetailModalOpen(true);
  };

  const handleEditType = (type: SavingType) => {
    setSelectedType(type);
    setIsEditModalOpen(true);
  };

  const handleDeleteType = (type: SavingType) => {
    setTypeToDelete(type);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteType = async () => {
    if (typeToDelete) {
      try {
        await savingsService.deleteSavingType(typeToDelete.id);
        toast.success("Jenis simpanan berhasil dihapus");
        await loadSavingTypes();
        setTypeToDelete(null);
        setIsDeleteDialogOpen(false);
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Gagal menghapus jenis simpanan";
        toast.error(errorMsg);
      }
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-blue-100 text-blue-800 flex items-center space-x-1">
        <CheckCircle className="h-3 w-3" />
        <span>Aktif</span>
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 flex items-center space-x-1">
        <XCircle className="h-3 w-3" />
        <span>Nonaktif</span>
      </Badge>
    );
  };

  // Calculate summary
  const totalTypes = savingTypes.length;
  const activeTypes = savingTypes.filter((t) => t.is_active).length;
  const mandatoryTypes = savingTypes.filter((t) => t.is_mandatory).length;
  const optionalTypes = savingTypes.filter((t) => !t.is_mandatory).length;

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
              Manajemen Jenis Simpanan
            </h1>
            <p className="text-gray-600">
              Kelola jenis-jenis simpanan koperasi
            </p>
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
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jenis Simpanan
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Jenis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalTypes}
              </div>
              <p className="text-xs text-gray-500">Semua jenis simpanan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {activeTypes}
              </div>
              <p className="text-xs text-gray-500">Dapat digunakan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Wajib
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {mandatoryTypes}
              </div>
              <p className="text-xs text-gray-500">Simpanan wajib</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sukarela
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {optionalTypes}
              </div>
              <p className="text-xs text-gray-500">Simpanan sukarela</p>
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
                  <span>Daftar Jenis Simpanan</span>
                </CardTitle>
                <CardDescription>
                  Kelola semua jenis simpanan yang tersedia
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari jenis simpanan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={mandatoryFilter}
                  onValueChange={setMandatoryFilter}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="mandatory">Wajib</SelectItem>
                    <SelectItem value="optional">Sukarela</SelectItem>
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
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Wajib</TableHead>
                    <TableHead>Dapat Ditarik</TableHead>
                    <TableHead>Bunga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Tidak ada jenis simpanan yang ditemukan
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell>
                          <span className="font-mono text-sm font-medium">
                            {type.code}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{type.name}</div>
                            {type.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {type.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {type.is_mandatory ? (
                            <Badge className="bg-red-100 text-red-800">
                              Ya
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              Tidak
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {type.is_withdrawable ? (
                            <Badge className="bg-green-100 text-green-800">
                              Ya
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-800">
                              Tidak
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {type.has_interest ? (
                            <span className="flex items-center text-green-600 font-medium">
                              <Percent className="h-3 w-3 mr-1" />
                              {type.default_interest_rate || 0}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(type.is_active)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewType(type)}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditType(type)}
                              className="h-8 w-8 p-0 hover:bg-green-50"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteType(type)}
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
      </div>

      {/* Modals */}
      <SavingTypeAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={async () => {
          setIsAddModalOpen(false);
          await loadSavingTypes();
        }}
      />

      <SavingTypeDetailModal
        savingType={selectedType}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedType(null);
        }}
        onEdit={(type) => {
          setIsDetailModalOpen(false);
          handleEditType(type);
        }}
      />

      <SavingTypeEditModal
        savingType={selectedType}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedType(null);
        }}
        onSuccess={async () => {
          setIsEditModalOpen(false);
          setSelectedType(null);
          await loadSavingTypes();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jenis Simpanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jenis simpanan{" "}
              <strong>{typeToDelete?.name}</strong>? Tindakan ini tidak dapat
              dibatalkan.
              <br />
              <br />
              <span className="text-red-600 font-medium">
                Catatan: Jenis simpanan yang sudah digunakan tidak dapat
                dihapus.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setTypeToDelete(null);
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteType}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagerLayout>
  );
}
