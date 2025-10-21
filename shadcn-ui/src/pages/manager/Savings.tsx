import React, { useState } from "react";
// import { Layout } from "@/components/layout/Layout";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { SavingsAddModal } from "@/components/modals/SavingsAddModal";
import { SavingsDetailModal } from "@/components/modals/SavingsDetailModal";
import { SavingsEditModal } from "@/components/modals/SavingsEditModal";
import { toast } from "sonner";
import { ManagerLayout } from "@/components/layout/ManagerLayout";

interface SavingsRecord {
  id: string;
  memberNumber: string;
  memberName: string;
  savingsType: string;
  amount: number;
  balance: number;
  lastTransaction: string;
  status: string;
  description?: string;
}

interface NewSavings {
  memberNumber: string;
  memberName: string;
  savingsType: string;
  amount: number;
  description: string;
}

export default function Savings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<SavingsRecord | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<SavingsRecord | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Mock data for savings
  const [savingsRecords, setSavingsRecords] = useState<SavingsRecord[]>([
    {
      id: "1",
      memberNumber: "M001",
      memberName: "Dr. Ahmad Santoso",
      savingsType: "wajib",
      amount: 100000,
      balance: 2400000,
      lastTransaction: "2024-01-28",
      status: "active",
      description: "Simpanan wajib bulanan",
    },
    {
      id: "2",
      memberNumber: "M001",
      memberName: "Dr. Ahmad Santoso",
      savingsType: "sukarela",
      amount: 500000,
      balance: 8500000,
      lastTransaction: "2024-01-25",
      status: "active",
      description: "Simpanan sukarela",
    },
    {
      id: "3",
      memberNumber: "M002",
      memberName: "Siti Nurhaliza",
      savingsType: "wajib",
      amount: 100000,
      balance: 1200000,
      lastTransaction: "2024-01-28",
      status: "active",
      description: "Simpanan wajib bulanan",
    },
    {
      id: "4",
      memberNumber: "M002",
      memberName: "Siti Nurhaliza",
      savingsType: "hariRaya",
      amount: 200000,
      balance: 2400000,
      lastTransaction: "2024-01-20",
      status: "active",
      description: "Simpanan hari raya",
    },
    {
      id: "5",
      memberNumber: "M003",
      memberName: "Budi Prasetyo",
      savingsType: "pokok",
      amount: 500000,
      balance: 500000,
      lastTransaction: "2023-03-10",
      status: "active",
      description: "Simpanan pokok",
    },
  ]);

  const filteredRecords = savingsRecords.filter((record) => {
    const matchesSearch =
      record.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.memberNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" || record.savingsType === typeFilter;
    return matchesSearch && matchesType;
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
      case "wajib":
        return (
          <Badge className="bg-blue-100 text-blue-800">Simpanan Wajib</Badge>
        );
      case "sukarela":
        return (
          <Badge className="bg-green-100 text-green-800">
            Simpanan Sukarela
          </Badge>
        );
      case "pokok":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Simpanan Pokok
          </Badge>
        );
      case "hariRaya":
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
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Aktif</Badge>
    ) : (
      <Badge variant="secondary">Tidak Aktif</Badge>
    );
  };

  const generateSavingsId = () => {
    return (savingsRecords.length + 1).toString();
  };

  // Calculate totals
  const totalSavings = savingsRecords.reduce(
    (sum, record) => sum + record.balance,
    0
  );
  const totalWajib = savingsRecords
    .filter((r) => r.savingsType === "wajib")
    .reduce((sum, record) => sum + record.balance, 0);
  const totalSukarela = savingsRecords
    .filter((r) => r.savingsType === "sukarela")
    .reduce((sum, record) => sum + record.balance, 0);
  const totalPokok = savingsRecords
    .filter((r) => r.savingsType === "pokok")
    .reduce((sum, record) => sum + record.balance, 0);
  const totalHariRaya = savingsRecords
    .filter((r) => r.savingsType === "hariRaya")
    .reduce((sum, record) => sum + record.balance, 0);

  const handleViewRecord = (record: SavingsRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleEditRecord = (record: SavingsRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleAddSavings = (newSavingsData: NewSavings) => {
    const newSavings: SavingsRecord = {
      id: generateSavingsId(),
      ...newSavingsData,
      balance: newSavingsData.amount,
      lastTransaction: new Date().toISOString().split("T")[0],
      status: "active",
    };

    setSavingsRecords((prev) => [newSavings, ...prev]);
    toast.success(
      `Simpanan ${newSavingsData.memberName} berhasil ditambahkan`,
      {
        description: `${getSavingsTypeBadge(
          newSavingsData.savingsType
        )} - ${formatCurrency(newSavingsData.amount)}`,
      }
    );
  };

  const handleSaveSavings = (updatedSavings: SavingsRecord) => {
    setSavingsRecords((prev) =>
      prev.map((r) => (r.id === updatedSavings.id ? updatedSavings : r))
    );
    toast.success(
      `Data simpanan ${updatedSavings.memberName} berhasil diperbarui`
    );
  };

  const handleDeleteRecord = (record: SavingsRecord) => {
    setRecordToDelete(record);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRecord = () => {
    if (recordToDelete) {
      setSavingsRecords((prev) =>
        prev.filter((r) => r.id !== recordToDelete.id)
      );
      toast.success(`Simpanan ${recordToDelete.memberName} berhasil dihapus`);
      setRecordToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <BackButton to="/manager" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Simpanan
            </h1>
            <p className="text-gray-600">Kelola simpanan anggota koperasi</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
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
                {formatCurrency(totalWajib)}
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
                {formatCurrency(totalSukarela)}
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
                {formatCurrency(totalPokok)}
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
                {formatCurrency(totalHariRaya)}
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
                    <SelectItem value="wajib">Simpanan Wajib</SelectItem>
                    <SelectItem value="sukarela">Simpanan Sukarela</SelectItem>
                    <SelectItem value="pokok">Simpanan Pokok</SelectItem>
                    <SelectItem value="hariRaya">Simpanan Hari Raya</SelectItem>
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
                    <TableHead>Setoran Terakhir</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Transaksi Terakhir</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.memberName}</div>
                          <div className="text-sm text-gray-500">
                            {record.memberNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSavingsTypeBadge(record.savingsType)}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(record.amount)}
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {formatCurrency(record.balance)}
                      </TableCell>
                      <TableCell>
                        {new Date(record.lastTransaction).toLocaleDateString(
                          "id-ID"
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
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
                  ))}
                </TableBody>
              </Table>

              {filteredRecords.length === 0 && (
                <div className="text-center py-8">
                  <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Tidak ada simpanan yang ditemukan
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Savings Add Modal */}
        <SavingsAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddSavings}
        />

        {/* Savings Detail Modal */}
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

        {/* Savings Edit Modal */}
        <SavingsEditModal
          savings={selectedRecord}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRecord(null);
          }}
          onSave={handleSaveSavings}
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
                <strong>{recordToDelete?.memberName}</strong>? Tindakan ini
                tidak dapat dibatalkan.
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
