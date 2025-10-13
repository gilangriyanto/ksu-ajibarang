import React, { useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Download,
  Building,
  Car,
  Monitor,
  Package,
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react';

// Modal Components
const AddAssetModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Tambah Aset Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi aset tetap baru.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="asset-name" className="text-right">Nama Aset</Label>
            <Input id="asset-name" className="col-span-3" placeholder="Gedung Kantor" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="asset-category" className="text-right">Kategori</Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="building">Bangunan</SelectItem>
                <SelectItem value="vehicle">Kendaraan</SelectItem>
                <SelectItem value="equipment">Peralatan</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="technology">Teknologi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="purchase-price" className="text-right">Harga Perolehan</Label>
            <Input id="purchase-price" type="number" className="col-span-3" placeholder="500000000" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="purchase-date" className="text-right">Tanggal Perolehan</Label>
            <Input id="purchase-date" type="date" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="useful-life" className="text-right">Masa Manfaat (Tahun)</Label>
            <Input id="useful-life" type="number" className="col-span-3" placeholder="20" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="depreciation-method" className="text-right">Metode Penyusutan</Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih metode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight-line">Garis Lurus</SelectItem>
                <SelectItem value="declining-balance">Saldo Menurun</SelectItem>
                <SelectItem value="sum-of-years">Jumlah Angka Tahun</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onClose}>Tambah Aset</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DepreciationModal = ({ isOpen, onClose, asset }: { isOpen: boolean; onClose: () => void; asset: any }) => {
  if (!asset) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Detail Penyusutan - {asset.name}</DialogTitle>
          <DialogDescription>
            Rincian perhitungan penyusutan aset
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Harga Perolehan:</Label>
              <p className="text-lg font-semibold text-blue-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(asset.purchasePrice)}
              </p>
            </div>
            <div>
              <Label className="font-medium">Nilai Buku Saat Ini:</Label>
              <p className="text-lg font-semibold text-green-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(asset.bookValue)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="font-medium">Masa Manfaat:</Label>
              <p>{asset.usefulLife} tahun</p>
            </div>
            <div>
              <Label className="font-medium">Penyusutan/Tahun:</Label>
              <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(asset.annualDepreciation)}</p>
            </div>
            <div>
              <Label className="font-medium">Penyusutan/Bulan:</Label>
              <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(asset.monthlyDepreciation)}</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <Label className="font-medium">Jadwal Penyusutan 5 Tahun Ke Depan:</Label>
            <div className="mt-2 space-y-2">
              {[2024, 2025, 2026, 2027, 2028].map(year => (
                <div key={year} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Tahun {year}</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(asset.annualDepreciation)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function AssetManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addAssetModal, setAddAssetModal] = useState(false);
  const [depreciationModal, setDepreciationModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - Fixed Assets
  const assets = [
    {
      id: '1',
      name: 'Gedung Kantor Pusat',
      category: 'building',
      purchasePrice: 500000000,
      purchaseDate: '2020-01-15',
      usefulLife: 20,
      bookValue: 450000000,
      accumulatedDepreciation: 50000000,
      annualDepreciation: 25000000,
      monthlyDepreciation: 2083333,
      depreciationMethod: 'straight-line',
      status: 'active'
    },
    {
      id: '2',
      name: 'Mobil Operasional Toyota Avanza',
      category: 'vehicle',
      purchasePrice: 200000000,
      purchaseDate: '2022-03-10',
      usefulLife: 8,
      bookValue: 150000000,
      accumulatedDepreciation: 50000000,
      annualDepreciation: 25000000,
      monthlyDepreciation: 2083333,
      depreciationMethod: 'straight-line',
      status: 'active'
    },
    {
      id: '3',
      name: 'Komputer Server HP ProLiant',
      category: 'technology',
      purchasePrice: 50000000,
      purchaseDate: '2023-06-01',
      usefulLife: 5,
      bookValue: 40000000,
      accumulatedDepreciation: 10000000,
      annualDepreciation: 10000000,
      monthlyDepreciation: 833333,
      depreciationMethod: 'straight-line',
      status: 'active'
    },
    {
      id: '4',
      name: 'Meja Kursi Kantor Set',
      category: 'furniture',
      purchasePrice: 25000000,
      purchaseDate: '2021-09-15',
      usefulLife: 10,
      bookValue: 18750000,
      accumulatedDepreciation: 6250000,
      annualDepreciation: 2500000,
      monthlyDepreciation: 208333,
      depreciationMethod: 'straight-line',
      status: 'active'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      building: Building,
      vehicle: Car,
      technology: Monitor,
      furniture: Package,
      equipment: Package
    };
    const Icon = icons[category as keyof typeof icons] || Package;
    return <Icon className="h-5 w-5" />;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      building: 'Bangunan',
      vehicle: 'Kendaraan',
      technology: 'Teknologi',
      furniture: 'Furniture',
      equipment: 'Peralatan'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      building: 'bg-blue-100 text-blue-800',
      vehicle: 'bg-green-100 text-green-800',
      technology: 'bg-purple-100 text-purple-800',
      furniture: 'bg-orange-100 text-orange-800',
      equipment: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const assetSummary = {
    totalAssets: assets.length,
    totalValue: assets.reduce((sum, asset) => sum + asset.purchasePrice, 0),
    totalBookValue: assets.reduce((sum, asset) => sum + asset.bookValue, 0),
    totalDepreciation: assets.reduce((sum, asset) => sum + asset.accumulatedDepreciation, 0),
    monthlyDepreciation: assets.reduce((sum, asset) => sum + asset.monthlyDepreciation, 0)
  };

  const handleViewDepreciation = (asset: any) => {
    setSelectedAsset(asset);
    setDepreciationModal(true);
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Aset</h1>
            <p className="text-gray-600 mt-1">Kelola aset tetap dan perhitungan penyusutan</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setAddAssetModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Aset
          </Button>
        </div>

        {/* Asset Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Aset</p>
                  <p className="text-2xl font-bold text-gray-900">{assetSummary.totalAssets}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Harga Perolehan</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(assetSummary.totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Nilai Buku</p>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(assetSummary.totalBookValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Akm. Penyusutan</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(assetSummary.totalDepreciation)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Penyusutan/Bulan</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(assetSummary.monthlyDepreciation)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="building">Bangunan</SelectItem>
                    <SelectItem value="vehicle">Kendaraan</SelectItem>
                    <SelectItem value="technology">Teknologi</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="equipment">Peralatan</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nama Aset</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Kategori</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Harga Perolehan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nilai Buku</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Akm. Penyusutan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Penyusutan/Bulan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
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
                            <p className="font-medium text-gray-900">{asset.name}</p>
                            <p className="text-sm text-gray-500">
                              Perolehan: {new Date(asset.purchaseDate).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getCategoryColor(asset.category)}>
                          {getCategoryLabel(asset.category)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(asset.purchasePrice)}
                      </td>
                      <td className="py-3 px-4 font-medium text-green-600">
                        {formatCurrency(asset.bookValue)}
                      </td>
                      <td className="py-3 px-4 font-medium text-red-600">
                        {formatCurrency(asset.accumulatedDepreciation)}
                      </td>
                      <td className="py-3 px-4 font-medium text-orange-600">
                        {formatCurrency(asset.monthlyDepreciation)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={asset.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {asset.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
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
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
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

      {/* Modals */}
      <AddAssetModal 
        isOpen={addAssetModal} 
        onClose={() => setAddAssetModal(false)}
      />
      <DepreciationModal 
        isOpen={depreciationModal} 
        onClose={() => setDepreciationModal(false)}
        asset={selectedAsset}
      />
    </ManagerLayout>
  );
}