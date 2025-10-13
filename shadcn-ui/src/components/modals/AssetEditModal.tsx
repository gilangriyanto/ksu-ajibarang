import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Package, DollarSign, Calendar } from 'lucide-react';

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

interface AssetEditModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Asset) => void;
}

export function AssetEditModal({ asset, isOpen, onClose, onSave }: AssetEditModalProps) {
  const [formData, setFormData] = useState<Partial<Asset>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData({ ...asset });
    }
  }, [asset]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nama aset harus diisi';
    }

    if (!formData.currentValue || formData.currentValue <= 0) {
      newErrors.currentValue = 'Nilai saat ini harus lebih dari 0';
    }

    if (!formData.condition) {
      newErrors.condition = 'Kondisi harus dipilih';
    }

    if (!formData.status) {
      newErrors.status = 'Status harus dipilih';
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Lokasi harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !asset) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedAsset: Asset = {
        ...asset,
        ...formData as Asset,
      };
      
      onSave(updatedAsset);
      onClose();
    } catch (error) {
      console.error('Error updating asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Asset, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Edit Aset</span>
          </DialogTitle>
          <DialogDescription>
            Ubah informasi aset {asset.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information (Some Read Only) */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kode Aset</Label>
                <Input value={formData.code || ''} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input 
                  value={
                    formData.category === 'building' ? 'Bangunan' :
                    formData.category === 'vehicle' ? 'Kendaraan' :
                    formData.category === 'equipment' ? 'Peralatan' :
                    formData.category === 'furniture' ? 'Furniture' :
                    formData.category || ''
                  } 
                  disabled 
                  className="bg-gray-50" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Aset *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nama aset"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi *</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Lokasi aset"
              />
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga Pembelian</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={formatCurrency(formData.purchasePrice || 0)}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
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

            <div className="space-y-2">
              <Label>Tanggal Pembelian</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={formData.purchaseDate || ''}
                  disabled
                  className="pl-10 bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Status & Condition */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Pensiun</SelectItem>
                    <SelectItem value="sold">Dijual</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Deskripsi aset"
              rows={3}
            />
          </div>

          {/* Summary */}
          {(formData.currentValue || 0) > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Ringkasan Perubahan</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-700">Nilai Saat Ini:</span>
                  <span className="font-medium">{formatCurrency(formData.currentValue || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Kondisi:</span>
                  <span className="font-medium">
                    {formData.condition === 'excellent' ? 'Sangat Baik' :
                     formData.condition === 'good' ? 'Baik' :
                     formData.condition === 'fair' ? 'Cukup' :
                     formData.condition === 'poor' ? 'Buruk' : formData.condition}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Status:</span>
                  <span className="font-medium">
                    {formData.status === 'active' ? 'Aktif' :
                     formData.status === 'maintenance' ? 'Maintenance' :
                     formData.status === 'retired' ? 'Pensiun' :
                     formData.status === 'sold' ? 'Dijual' : formData.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menyimpan...</span>
                </div>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}