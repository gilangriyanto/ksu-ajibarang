import React, { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
  Building,
  Car,
  Monitor,
  Package,
  TrendingDown,
  Calendar,
  DollarSign,
  Calculator,
  Loader2,
  AlertCircle,
  MapPin,
} from "lucide-react";
import assetsService from "@/lib/api/assets.service";
import { toast } from "sonner";

// Import types separately
import type {
  Asset,
  AssetSummary,
  DepreciationSchedule,
} from "@/lib/api/assets.service";

// =====================================================
// MODAL: Add/Edit Asset
// =====================================================
const AssetFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  asset,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  asset?: Asset | null;
}) => {
  const [formData, setFormData] = useState({
    asset_name: "",
    category: "equipment" as Asset["category"],
    acquisition_cost: "",
    acquisition_date: "",
    useful_life_months: "",
    residual_value: "",
    location: "",
    status: "active" as "active" | "inactive",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData({
        asset_name: asset.asset_name,
        category: asset.category,
        acquisition_cost: parseFloat(asset.acquisition_cost).toString(),
        acquisition_date: asset.acquisition_date.split("T")[0],
        useful_life_months: asset.useful_life_months.toString(),
        residual_value: parseFloat(asset.residual_value).toString(),
        location: asset.location,
        status: asset.status === "disposed" ? "inactive" : asset.status,
        notes: asset.notes || "",
      });
    } else {
      // Reset form
      setFormData({
        asset_name: "",
        category: "equipment",
        acquisition_cost: "",
        acquisition_date: "",
        useful_life_months: "",
        residual_value: "",
        location: "",
        status: "active",
        notes: "",
      });
    }
  }, [asset, isOpen]);

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.asset_name ||
      !formData.acquisition_cost ||
      !formData.acquisition_date ||
      !formData.useful_life_months ||
      !formData.location
    ) {
      toast.error("Lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        asset_name: formData.asset_name,
        category: formData.category,
        acquisition_cost: parseFloat(formData.acquisition_cost),
        acquisition_date: formData.acquisition_date,
        useful_life_months: parseInt(formData.useful_life_months),
        residual_value: parseFloat(formData.residual_value || "0"),
        location: formData.location,
        status: formData.status,
        notes: formData.notes || undefined,
      };

      if (asset) {
        await assetsService.update(asset.id, payload);
        toast.success("Aset berhasil diperbarui");
      } else {
        await assetsService.create(payload);
        toast.success("Aset berhasil ditambahkan");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving asset:", error);
      toast.error(error.message || "Gagal menyimpan aset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Aset" : "Tambah Aset Baru"}</DialogTitle>
          <DialogDescription>
            {asset
              ? "Perbarui informasi aset tetap"
              : "Masukkan informasi aset tetap baru"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="asset-name" className="text-right">
              Nama Aset <span className="text-red-500">*</span>
            </Label>
            <Input
              id="asset-name"
              className="col-span-3"
              placeholder="Gedung Kantor"
              value={formData.asset_name}
              onChange={(e) =>
                setFormData({ ...formData, asset_name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Kategori <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value: Asset["category"]) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="land">Tanah</SelectItem>
                <SelectItem value="building">Bangunan</SelectItem>
                <SelectItem value="vehicle">Kendaraan</SelectItem>
                <SelectItem value="equipment">Peralatan</SelectItem>
                <SelectItem value="inventory">Inventaris</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="acquisition-cost" className="text-right">
              Harga Perolehan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="acquisition-cost"
              type="number"
              className="col-span-3"
              placeholder="500000000"
              value={formData.acquisition_cost}
              onChange={(e) =>
                setFormData({ ...formData, acquisition_cost: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="acquisition-date" className="text-right">
              Tanggal Perolehan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="acquisition-date"
              type="date"
              className="col-span-3"
              value={formData.acquisition_date}
              onChange={(e) =>
                setFormData({ ...formData, acquisition_date: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="useful-life" className="text-right">
              Masa Manfaat (Bulan) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="useful-life"
              type="number"
              className="col-span-3"
              placeholder="240"
              value={formData.useful_life_months}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  useful_life_months: e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="residual-value" className="text-right">
              Nilai Residu
            </Label>
            <Input
              id="residual-value"
              type="number"
              className="col-span-3"
              placeholder="50000000"
              value={formData.residual_value}
              onChange={(e) =>
                setFormData({ ...formData, residual_value: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Lokasi <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              className="col-span-3"
              placeholder="Kantor Koperasi"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Catatan
            </Label>
            <Textarea
              id="notes"
              className="col-span-3"
              placeholder="Catatan tambahan (opsional)"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Menyimpan...
              </>
            ) : asset ? (
              "Perbarui Aset"
            ) : (
              "Tambah Aset"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =====================================================
// MODAL: Depreciation Schedule
// =====================================================
const DepreciationModal = ({
  isOpen,
  onClose,
  asset,
}: {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}) => {
  const [schedule, setSchedule] = useState<DepreciationSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!asset) return;

      try {
        setLoading(true);
        const data = await assetsService.getDepreciationSchedule(asset.id);

        console.log("📅 Schedule data received:", data);

        // Handle different response structures
        if (Array.isArray(data)) {
          // Direct array
          setSchedule(data.slice(0, 12));
        } else if (data && typeof data === "object" && "schedule" in data) {
          // Nested in 'schedule' property
          const scheduleData = (data as any).schedule;
          if (Array.isArray(scheduleData)) {
            setSchedule(scheduleData.slice(0, 12));
          } else {
            console.warn("Schedule property is not an array:", scheduleData);
            setSchedule([]);
          }
        } else {
          console.warn("Unexpected schedule data structure:", data);
          setSchedule([]);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        toast.error("Gagal memuat jadwal penyusutan");
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && asset) {
      fetchSchedule();
    }
  }, [isOpen, asset]);

  if (!asset) return null;

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Penyusutan - {asset.asset_name}</DialogTitle>
          <DialogDescription>
            Rincian perhitungan penyusutan aset
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Asset Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="font-medium text-gray-600">Kode Aset:</Label>
              <p className="text-lg font-semibold">{asset.asset_code}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-600">Kategori:</Label>
              <p className="text-lg">{asset.category_name}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-600">Lokasi:</Label>
              <p>{asset.location}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-600">
                Tanggal Perolehan:
              </Label>
              <p>{formatDate(asset.acquisition_date)}</p>
            </div>
          </div>

          {/* Financial Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <Label className="font-medium text-blue-600">
                Harga Perolehan:
              </Label>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(asset.acquisition_cost)}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Label className="font-medium text-green-600">
                Nilai Buku Saat Ini:
              </Label>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(asset.book_value)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Label className="font-medium text-purple-700">
                Masa Manfaat:
              </Label>
              <p className="text-xl font-bold text-purple-700">
                {asset.useful_life_months} bulan
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Label className="font-medium text-orange-700">
                Penyusutan/Bulan:
              </Label>
              <p className="text-lg font-bold text-orange-700">
                {formatCurrency(asset.depreciation_per_month)}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <Label className="font-medium text-red-700">
                Akm. Penyusutan:
              </Label>
              <p className="text-lg font-bold text-red-700">
                {formatCurrency(asset.accumulated_depreciation)}
              </p>
            </div>
          </div>

          {/* Depreciation Schedule */}
          <div className="border-t pt-4">
            <Label className="font-medium text-lg mb-3 block">
              Jadwal Penyusutan 12 Bulan Ke Depan:
            </Label>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : schedule.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {schedule.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100"
                  >
                    <div>
                      <span className="font-medium">Bulan ke-{item.month}</span>
                      <p className="text-xs text-gray-500">
                        {formatDate(item.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-600">
                        {formatCurrency(item.depreciation)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Nilai Buku: {formatCurrency(item.book_value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Tidak ada jadwal penyusutan
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function AssetManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<AssetSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [depreciationModal, setDepreciationModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Fetch assets and summary
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch assets
      const assetsData = await assetsService.getAll({
        category: selectedCategory === "all" ? undefined : selectedCategory,
      });
      setAssets(assetsData);

      // Fetch summary
      const summaryData = await assetsService.getSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data aset");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      building: Building,
      vehicle: Car,
      equipment: Monitor,
      inventory: Package,
      land: MapPin,
    };
    const Icon = icons[category as keyof typeof icons] || Package;
    return <Icon className="h-5 w-5" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      land: "bg-gray-100 text-gray-800",
      building: "bg-blue-100 text-blue-800",
      vehicle: "bg-green-100 text-green-800",
      equipment: "bg-purple-100 text-purple-800",
      inventory: "bg-orange-100 text-orange-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormModal(true);
  };

  const handleViewDepreciation = (asset: Asset) => {
    setSelectedAsset(asset);
    setDepreciationModal(true);
  };

  const handleDelete = async (asset: Asset) => {
    if (
      !confirm(`Apakah Anda yakin ingin menghapus aset "${asset.asset_name}"?`)
    ) {
      return;
    }

    try {
      await assetsService.delete(asset.id);
      toast.success("Aset berhasil dihapus");
      fetchData();
    } catch (error: any) {
      console.error("Error deleting asset:", error);
      toast.error(error.message || "Gagal menghapus aset");
    }
  };

  const handleCalculateAll = async () => {
    if (
      !confirm(
        "Hitung penyusutan untuk semua aset? Proses ini akan memperbarui nilai buku semua aset."
      )
    ) {
      return;
    }

    try {
      const result = await assetsService.calculateAllDepreciation();
      toast.success(
        `Penyusutan berhasil dihitung untuk ${result.assets_processed} aset`
      );
      fetchData();
    } catch (error: any) {
      console.error("Error calculating depreciation:", error);
      toast.error(error.message || "Gagal menghitung penyusutan");
    }
  };

  const handleDownloadReport = () => {
    const csvContent = `Laporan Aset Tetap\nTanggal: ${new Date().toLocaleDateString(
      "id-ID"
    )}\n\nKode,Nama,Kategori,Harga Perolehan,Nilai Buku,Akm Penyusutan,Lokasi\n${assets
      .map(
        (asset) =>
          `${asset.asset_code},${asset.asset_name},${asset.category_name},${asset.acquisition_cost},${asset.book_value},${asset.accumulated_depreciation},${asset.location}`
      )
      .join("\n")}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `laporan-aset-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter assets by search term
  const filteredAssets = assets.filter((asset) =>
    asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Aset</h1>
            <p className="text-gray-600 mt-1">
              Kelola aset tetap dan perhitungan penyusutan
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="bg-orange-50 hover:bg-orange-100"
              onClick={handleCalculateAll}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Hitung Penyusutan
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setSelectedAsset(null);
                setFormModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Aset
            </Button>
          </div>
        </div>

        {/* Asset Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Aset
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summary.total_assets}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Harga Perolehan
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(summary.total_acquisition_cost)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Nilai Buku
                    </p>
                    <p className="text-lg font-bold text-purple-600">
                      {formatCurrency(summary.total_book_value)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Akm. Penyusutan
                    </p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(summary.total_accumulated_depreciation)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Aset Aktif
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {summary.active_assets}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama aset..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="land">Tanah</SelectItem>
                    <SelectItem value="building">Bangunan</SelectItem>
                    <SelectItem value="vehicle">Kendaraan</SelectItem>
                    <SelectItem value="equipment">Peralatan</SelectItem>
                    <SelectItem value="inventory">Inventaris</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleDownloadReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Aset Tetap</CardTitle>
            <CardDescription>
              Menampilkan {filteredAssets.length} dari {assets.length} aset
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Memuat data...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Nama Aset
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Kategori
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Harga Perolehan
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Nilai Buku
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Akm. Penyusutan
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {getCategoryIcon(asset.category)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {asset.asset_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {asset.asset_code} •{" "}
                                {formatDate(asset.acquisition_date)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getCategoryColor(asset.category)}>
                            {asset.category_name}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(asset.acquisition_cost)}
                        </td>
                        <td className="py-3 px-4 font-medium text-green-600">
                          {formatCurrency(asset.book_value)}
                        </td>
                        <td className="py-3 px-4 font-medium text-red-600">
                          {formatCurrency(asset.accumulated_depreciation)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              asset.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {asset.status_name}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDepreciation(asset)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(asset)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(asset)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredAssets.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Belum ada data
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Belum ada aset yang terdaftar
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AssetFormModal
        isOpen={formModal}
        onClose={() => {
          setFormModal(false);
          setSelectedAsset(null);
        }}
        onSuccess={fetchData}
        asset={selectedAsset}
      />
      <DepreciationModal
        isOpen={depreciationModal}
        onClose={() => {
          setDepreciationModal(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
      />
    </ManagerLayout>
  );
}
