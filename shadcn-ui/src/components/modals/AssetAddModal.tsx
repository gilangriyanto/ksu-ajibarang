import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Package, DollarSign, Calendar, Building } from 'lucide-react';

interface NewAsset {
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

interface AssetAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: NewAsset) => void;
}

export function AssetAddModal({ isOpen, onClose, onAdd }: AssetAddModalProps) {
  const [formData, setFormData] = useState<NewAsset>({
    name: '',
    category: '',
    code: '',
    purchaseDate: '',
    purchasePrice: 0,
    currentValue: 0,
    condition: '',
    location: '',
    status: 'active',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama aset harus diisi';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori harus dipilih';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Kode aset harus diisi';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Tanggal pembelian harus diisi';
    }

    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Harga pembelian harus lebih dari 0';
    }

    if (!formData.currentValue || formData.currentValue <= 0) {
      newErrors.currentValue = 'Nilai saat ini harus lebih dari 0';
    }

    if (!formData.condition) {
      newErrors.condition = 'Kondisi harus dipilih';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Lokasi harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAdd(formData);
      handleClose();
    } catch (error) {
      console.error('Error adding asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof NewAsset, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateAssetCode = (category: string) => {
    const prefix = {
      building: 'BLD',
      vehicle: 'VHC',
      equipment: 'EQP',
      furniture: 'FUR'
    }[category] || 'AST';
    
    const timestamp = Date.now().toString().slice(-4);
    return `AST-${prefix}-${timestamp}`;
  };

  const handleCategoryChange = (category: string) => {
    handleInputChange('category', category);
    if (!formData.code) {
      handleInputChange('code', generateAssetCode(category));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: '',
      code: '',
      purchaseDate: '',
      purchasePrice: 0,
      currentValue: 0,
      condition: '',
      location: '',
      status: 'active',
      description: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Tambah Aset</span>
          </DialogTitle>
          <DialogDescription>
            Tambahkan aset baru ke dalam sistem
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Building className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Informasi Dasar</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Aset *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Contoh: Komputer Desktop HP"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="building">Bangunan</SelectItem>
                    <SelectItem value="vehicle">Kendaraan</SelectItem>
                    <SelectItem value="equipment">Peralatan</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Kode Aset *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="AST-EQP-001"
                />
                {errors.code && (
                  <p className="text-sm text-red-600">{errors.code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Contoh: Ruang Administrasi"
                />
                {errors.location && (
                  <p className="text-sm text-red-600">{errors.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Informasi Keuangan</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Tanggal Pembelian *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.purchaseDate && (
                  <p className="text-sm text-red-600">{errors.purchaseDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Kondisi *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kondisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Sangat Baik</SelectItem>
                    <SelectItem value="good">Baik</SelectItem>
                    <SelectItem value="fair">Cukup</SelectItem>
                    <SelectItem value="poor">Buruk</SelectItem>
                  </SelectContent>
                </Select>
                {errors.condition && (
                  <p className="text-sm text-red-600">{errors.condition}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Harga Pembelian *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={formData.purchasePrice || ''}
                    onChange={(e) => handleInputChange('purchasePrice', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
                {errors.purchasePrice && (
                  <p className="text-sm text-red-600">{errors.purchasePrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentValue">Nilai Saat Ini *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentValue"
                    type="number"
                    value={formData.currentValue || ''}
                    onChange={(e) => handleInputChange('currentValue', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
                {errors.currentValue && (
                  <p className="text-sm text-red-600">{errors.currentValue}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Deskripsi detail aset (opsional)"
              rows={3}
            />
          </div>

          {/* Summary */}
          {formData.purchasePrice > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Ringkasan Aset</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-700">Nama:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Kategori:</span>
                  <span className="font-medium">{formData.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Harga Beli:</span>
                  <span className="font-medium">{formatCurrency(formData.purchasePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Nilai Saat Ini:</span>
                  <span className="font-medium">{formatCurrency(formData.currentValue)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menyimpan...</span>
                </div>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Tambah Aset
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}