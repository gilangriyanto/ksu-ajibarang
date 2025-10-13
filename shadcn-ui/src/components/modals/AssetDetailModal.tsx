import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  Building,
  Car,
  Monitor,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  Edit,
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  category: string;
  code: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  condition: string;
  location: string;
  status: string;
  description: string;
}

interface AssetDetailModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (asset: Asset) => void;
}

export function AssetDetailModal({ asset, isOpen, onClose, onEdit }: AssetDetailModalProps) {
  if (!asset) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'building':
        return <Badge className="bg-blue-100 text-blue-800">Bangunan</Badge>;
      case 'vehicle':
        return <Badge className="bg-green-100 text-green-800">Kendaraan</Badge>;
      case 'equipment':
        return <Badge className="bg-purple-100 text-purple-800">Peralatan</Badge>;
      case 'furniture':
        return <Badge className="bg-orange-100 text-orange-800">Furniture</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">Sangat Baik</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">Baik</Badge>;
      case 'fair':
        return <Badge className="bg-yellow-100 text-yellow-800">Cukup</Badge>;
      case 'poor':
        return <Badge className="bg-red-100 text-red-800">Buruk</Badge>;
      default:
        return <Badge variant="secondary">{condition}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case 'retired':
        return <Badge className="bg-gray-100 text-gray-800">Pensiun</Badge>;
      case 'sold':
        return <Badge className="bg-red-100 text-red-800">Dijual</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'building':
        return <Building className="h-6 w-6 text-blue-600" />;
      case 'vehicle':
        return <Car className="h-6 w-6 text-green-600" />;
      case 'equipment':
        return <Monitor className="h-6 w-6 text-purple-600" />;
      case 'furniture':
        return <Package className="h-6 w-6 text-orange-600" />;
      default:
        return <Package className="h-6 w-6 text-gray-600" />;
    }
  };

  const calculateDepreciation = () => {
    const depreciation = asset.purchasePrice - asset.currentValue;
    const depreciationPercentage = ((depreciation / asset.purchasePrice) * 100);
    return { amount: depreciation, percentage: depreciationPercentage };
  };

  const depreciation = calculateDepreciation();
  const assetAge = Math.floor((new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                {getCategoryIcon(asset.category)}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Detail Aset</DialogTitle>
                <DialogDescription className="flex items-center space-x-2">
                  <span>{asset.code} - {asset.name}</span>
                  {getCategoryBadge(asset.category)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(asset)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Informasi Dasar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Package className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nama Aset</p>
                  <p className="font-medium">{asset.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Kode Aset</p>
                  <p className="font-medium font-mono">{asset.code}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Kategori</p>
                  <div className="mt-1">{getCategoryBadge(asset.category)}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Lokasi</p>
                  <p className="font-medium">{asset.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Condition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Status & Kondisi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(asset.status)}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Package className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Kondisi</p>
                  <div className="mt-1">{getConditionBadge(asset.condition)}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Tanggal Pembelian</p>
                  <p className="font-medium">
                    {new Date(asset.purchaseDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Usia Aset</p>
                  <p className="font-medium">{assetAge} tahun</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Harga Pembelian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(asset.purchasePrice)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Nilai awal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Nilai Saat Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(asset.currentValue)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Market value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingDown className="h-4 w-4 mr-2" />
                Depresiasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(depreciation.amount)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {depreciation.percentage.toFixed(1)}% dari nilai awal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Depresiasi/Tahun
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {assetAge > 0 ? formatCurrency(depreciation.amount / assetAge) : formatCurrency(0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Rata-rata per tahun</p>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {asset.description && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Deskripsi</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{asset.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Asset Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Ringkasan Aset</span>
            </CardTitle>
            <CardDescription>
              Informasi lengkap tentang aset ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Kategori</p>
                <div className="mt-1">{getCategoryBadge(asset.category)}</div>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Kondisi</p>
                <div className="mt-1">{getConditionBadge(asset.condition)}</div>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Status</p>
                <div className="mt-1">{getStatusBadge(asset.status)}</div>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Usia</p>
                <p className="font-medium text-purple-600 mt-1">{assetAge} tahun</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}