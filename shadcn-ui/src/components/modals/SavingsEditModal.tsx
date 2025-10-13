import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PiggyBank, DollarSign, User } from 'lucide-react';

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

interface SavingsEditModalProps {
  savings: SavingsRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (savings: SavingsRecord) => void;
}

export function SavingsEditModal({ savings, isOpen, onClose, onSave }: SavingsEditModalProps) {
  const [formData, setFormData] = useState<Partial<SavingsRecord>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (savings) {
      setFormData({ ...savings });
    }
  }, [savings]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Jumlah simpanan harus lebih dari 0';
    }

    if (!formData.savingsType) {
      newErrors.savingsType = 'Jenis simpanan harus dipilih';
    }

    if (!formData.status) {
      newErrors.status = 'Status harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !savings) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSavings: SavingsRecord = {
        ...savings,
        ...formData as SavingsRecord,
      };
      
      onSave(updatedSavings);
      onClose();
    } catch (error) {
      console.error('Error updating savings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SavingsRecord, value: string | number) => {
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

  if (!savings) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5" />
            <span>Edit Simpanan</span>
          </DialogTitle>
          <DialogDescription>
            Ubah informasi simpanan {savings.memberName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member Info (Read Only) */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Informasi Anggota</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nomor Anggota</Label>
                <Input value={formData.memberNumber || ''} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Nama Anggota</Label>
                <Input value={formData.memberName || ''} disabled className="bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Savings Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <PiggyBank className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Detail Simpanan</h3>
            </div>

            {/* Savings Type */}
            <div className="space-y-2">
              <Label htmlFor="savingsType">Jenis Simpanan *</Label>
              <Select value={formData.savingsType} onValueChange={(value) => handleInputChange('savingsType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis simpanan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wajib">Simpanan Wajib</SelectItem>
                  <SelectItem value="sukarela">Simpanan Sukarela</SelectItem>
                  <SelectItem value="pokok">Simpanan Pokok</SelectItem>
                  <SelectItem value="hariRaya">Simpanan Hari Raya</SelectItem>
                </SelectContent>
              </Select>
              {errors.savingsType && (
                <p className="text-sm text-red-600">{errors.savingsType}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Setoran Terakhir *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => handleInputChange('amount', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* Balance */}
              <div className="space-y-2">
                <Label htmlFor="balance">Total Saldo</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="balance"
                    type="number"
                    value={formData.balance || ''}
                    onChange={(e) => handleInputChange('balance', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Keterangan</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Keterangan tambahan"
                rows={3}
              />
            </div>
          </div>

          {/* Summary */}
          {(formData.amount || 0) > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Ringkasan Perubahan</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-700">Setoran Terakhir:</span>
                  <span className="font-medium">{formatCurrency(formData.amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Saldo:</span>
                  <span className="font-medium">{formatCurrency(formData.balance || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Status:</span>
                  <span className="font-medium">{formData.status === 'active' ? 'Aktif' : 'Tidak Aktif'}</span>
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