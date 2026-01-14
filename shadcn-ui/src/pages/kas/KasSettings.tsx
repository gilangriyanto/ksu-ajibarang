import React, { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Settings,
  Plus,
  Edit,
  Trash2,
  Percent,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import interestRateService, {
  InterestRate,
  CreateInterestRateRequest,
} from "@/lib/api/interestRate.service";

export default function KasSettings() {
  const { user } = useAuth();
  const [rates, setRates] = useState<InterestRate[]>([]);
  const [cashAccountName, setCashAccountName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form states
  const [selectedRate, setSelectedRate] = useState<InterestRate | null>(null);
  const [formData, setFormData] = useState<CreateInterestRateRequest>({
    transaction_type: "savings",
    rate_percentage: 0,
    effective_date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [filterType, setFilterType] = useState<string>("all");

  // Get cash account ID from user
  const cashAccountId = user?.cash_account_id || user?.kas_id || 1;

  // Load interest rates on mount
  useEffect(() => {
    loadInterestRates();
  }, [cashAccountId]);

  const loadInterestRates = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Loading interest rates for cash account:", cashAccountId);

      const response = await interestRateService.getInterestRates(
        cashAccountId
      );

      console.log("✅ Interest rates loaded:", response);
      setRates(response.rates);
      setCashAccountName(response.cash_account.name);
    } catch (err: any) {
      console.error("❌ Error loading interest rates:", err);
      setError(err.message || "Gagal memuat data bunga");
      toast.error("Gagal memuat data bunga");
    } finally {
      setLoading(false);
    }
  };

  // Filter rates by type
  const filteredRates = rates.filter((rate) => {
    if (filterType === "all") return true;
    return rate.transaction_type === filterType;
  });

  // Group rates by type for summary
  const savingsRates = rates.filter((r) => r.transaction_type === "savings");
  const loanRates = rates.filter((r) => r.transaction_type === "loans");

  // Get current active rate (most recent effective date that's <= today)
  const getCurrentRate = (type: "savings" | "loans"): InterestRate | null => {
    const typeRates = rates
      .filter((r) => r.transaction_type === type)
      .filter((r) => new Date(r.effective_date) <= new Date())
      .sort(
        (a, b) =>
          new Date(b.effective_date).getTime() -
          new Date(a.effective_date).getTime()
      );

    return typeRates[0] || null;
  };

  const currentSavingsRate = getCurrentRate("savings");
  const currentLoanRate = getCurrentRate("loans");

  const handleCreate = async () => {
    try {
      setSubmitting(true);
      console.log("📤 Creating interest rate:", formData);

      await interestRateService.createInterestRate(cashAccountId, formData);

      toast.success("Bunga berhasil ditambahkan");
      setIsCreateModalOpen(false);
      resetForm();
      await loadInterestRates();
    } catch (err: any) {
      console.error("❌ Error creating rate:", err);
      toast.error(err.message || "Gagal menambahkan bunga");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedRate) return;

    try {
      setSubmitting(true);
      console.log("📤 Updating interest rate:", selectedRate.id, formData);

      await interestRateService.updateInterestRate(selectedRate.id, {
        transaction_type: formData.transaction_type,
        rate_percentage: formData.rate_percentage,
        effective_date: formData.effective_date,
      });

      toast.success("Bunga berhasil diperbarui");
      setIsEditModalOpen(false);
      resetForm();
      await loadInterestRates();
    } catch (err: any) {
      console.error("❌ Error updating rate:", err);
      toast.error(err.message || "Gagal memperbarui bunga");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRate) return;

    try {
      setSubmitting(true);
      console.log("🗑️ Deleting interest rate:", selectedRate.id);

      await interestRateService.deleteInterestRate(selectedRate.id);

      toast.success("Bunga berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setSelectedRate(null);
      await loadInterestRates();
    } catch (err: any) {
      console.error("❌ Error deleting rate:", err);
      toast.error(err.message || "Gagal menghapus bunga");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (rate: InterestRate) => {
    setSelectedRate(rate);
    setFormData({
      transaction_type: rate.transaction_type,
      rate_percentage: parseFloat(rate.rate_percentage),
      effective_date: rate.effective_date.split("T")[0],
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (rate: InterestRate) => {
    setSelectedRate(rate);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      transaction_type: "savings",
      rate_percentage: 0,
      effective_date: new Date().toISOString().split("T")[0],
    });
    setSelectedRate(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTransactionTypeBadge = (type: string) => {
    return type === "savings" ? (
      <Badge className="bg-green-100 text-green-800">Simpanan</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800">Pinjaman</Badge>
    );
  };

  if (loading) {
    return (
      <KasLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Memuat data...</span>
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Settings className="h-8 w-8" />
              <span>Pengaturan Bunga</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola bunga simpanan dan pinjaman - {cashAccountName}
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Bunga
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Active Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Bunga Simpanan Aktif</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentSavingsRate ? (
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {parseFloat(currentSavingsRate.rate_percentage).toFixed(2)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    Berlaku sejak:{" "}
                    {formatDate(currentSavingsRate.effective_date)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Diperbarui oleh: {currentSavingsRate.updated_by.full_name}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Belum ada bunga aktif</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                <span>Bunga Pinjaman Aktif</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentLoanRate ? (
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {parseFloat(currentLoanRate.rate_percentage).toFixed(2)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    Berlaku sejak: {formatDate(currentLoanRate.effective_date)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Diperbarui oleh: {currentLoanRate.updated_by.full_name}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Belum ada bunga aktif</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Riwayat Bunga</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rates.length}
                  </p>
                </div>
                <Percent className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bunga Simpanan</p>
                  <p className="text-2xl font-bold text-green-600">
                    {savingsRates.length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bunga Pinjaman</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loanRates.length}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Bunga yang aktif adalah bunga dengan tanggal efektif paling baru
            yang sudah lewat atau hari ini. Anda dapat menambahkan bunga baru
            dengan tanggal efektif di masa depan untuk penjadwalan otomatis.
          </AlertDescription>
        </Alert>

        {/* Interest Rates Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Riwayat Bunga</CardTitle>
                <CardDescription>
                  Daftar semua perubahan bunga simpanan dan pinjaman
                </CardDescription>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="savings">Simpanan</SelectItem>
                  <SelectItem value="loans">Pinjaman</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Persentase</TableHead>
                    <TableHead>Tanggal Efektif</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Diperbarui Oleh</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Belum ada riwayat bunga</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRates.map((rate) => {
                      const effectiveDate = new Date(rate.effective_date);
                      const today = new Date();
                      const isActive = effectiveDate <= today;
                      const isFuture = effectiveDate > today;

                      return (
                        <TableRow key={rate.id}>
                          <TableCell>
                            {getTransactionTypeBadge(rate.transaction_type)}
                          </TableCell>
                          <TableCell className="font-bold text-lg">
                            {parseFloat(rate.rate_percentage).toFixed(2)}%
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{formatDate(rate.effective_date)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isFuture ? (
                              <Badge className="bg-orange-100 text-orange-800">
                                Terjadwal
                              </Badge>
                            ) : isActive ? (
                              <Badge className="bg-green-100 text-green-800">
                                Aktif
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                Tidak Aktif
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium">
                                  {rate.updated_by.full_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(rate.updated_at).toLocaleDateString(
                                    "id-ID"
                                  )}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(rate)}
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(rate)}
                                className="h-8 w-8 p-0 hover:bg-red-50"
                                title="Hapus"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Bunga Baru</DialogTitle>
              <DialogDescription>
                Tambahkan persentase bunga baru untuk simpanan atau pinjaman
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-type">
                  Jenis Transaksi <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.transaction_type}
                  onValueChange={(value: "savings" | "loans") =>
                    setFormData({ ...formData, transaction_type: value })
                  }
                >
                  <SelectTrigger id="create-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Simpanan</SelectItem>
                    <SelectItem value="loans">Pinjaman</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-percentage">
                  Persentase Bunga (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="create-percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="10.5"
                  value={formData.rate_percentage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rate_percentage: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-date">
                  Tanggal Efektif <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="create-date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) =>
                    setFormData({ ...formData, effective_date: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500">
                  Bunga akan aktif mulai tanggal ini
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleCreate}
                disabled={submitting || !formData.rate_percentage}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Bunga</DialogTitle>
              <DialogDescription>
                Perbarui persentase atau tanggal efektif bunga
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-type">
                  Jenis Transaksi <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.transaction_type}
                  onValueChange={(value: "savings" | "loans") =>
                    setFormData({ ...formData, transaction_type: value })
                  }
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Simpanan</SelectItem>
                    <SelectItem value="loans">Pinjaman</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-percentage">
                  Persentase Bunga (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.rate_percentage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rate_percentage: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-date">
                  Tanggal Efektif <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) =>
                    setFormData({ ...formData, effective_date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleEdit}
                disabled={submitting || !formData.rate_percentage}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  "Perbarui"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Bunga</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus bunga{" "}
                <strong>
                  {selectedRate?.transaction_type === "savings"
                    ? "Simpanan"
                    : "Pinjaman"}
                </strong>{" "}
                sebesar{" "}
                <strong>
                  {selectedRate
                    ? parseFloat(selectedRate.rate_percentage).toFixed(2)
                    : 0}
                  %
                </strong>
                ? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedRate(null);
                }}
                disabled={submitting}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Hapus"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </KasLayout>
  );
}
