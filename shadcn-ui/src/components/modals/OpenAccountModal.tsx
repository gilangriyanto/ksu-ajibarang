import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PiggyBank, DollarSign, User } from 'lucide-react';

interface NewAccount {
  accountType: string;
  initialDeposit: number;
  purpose: string;
  notes: string;
}

interface OpenAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (account: NewAccount) => void;
}

export function OpenAccountModal({ isOpen, onClose, onSubmit }: OpenAccountModalProps) {
  const [formData, setFormData] = useState<NewAccount>({
    accountType: '',
    initialDeposit: 0,
    purpose: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountType) {
      newErrors.accountType = 'Jenis simpanan harus dipilih';
    }

    if (!formData.initialDeposit || formData.initialDeposit <= 0) {
      newErrors.initialDeposit = 'Setoran awal harus lebih dari 0';
    }

    if (formData.accountType === 'pokok' && formData.initialDeposit < 100000) {
      newErrors.initialDeposit = 'Simpanan pokok minimal Rp 100.000';
    }

    if (formData.accountType === 'wajib' && formData.initialDeposit < 50000) {
      newErrors.initialDeposit = 'Simpanan wajib minimal Rp 50.000';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Tujuan simpanan harus diisi';
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error opening account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof NewAccount, value: string | number) => {
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

  const getMinimumDeposit = (type: string) => {
    switch (type) {
      case 'pokok': return 100000;
      case 'wajib': return 50000;
      case 'sukarela': return 25000;
      case 'hariRaya': return 50000;
      default: return 0;
    }
  };

  const handleClose = () => {
    setFormData({
      accountType: '',
      initialDeposit: 0,
      purpose: '',
      notes: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5" />
            <span>Buka Rekening Simpanan Baru</span>
          </DialogTitle>
          <DialogDescription>
            Buka rekening simpanan baru sesuai kebutuhan Anda
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="accountType">Jenis Simpanan *</Label>
            <Select value={formData.accountType} onValueChange={(value) => handleInputChange('accountType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis simpanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pokok">Simpanan Pokok</SelectItem>
                <SelectItem value="wajib">Simpanan Wajib</SelectItem>
                <SelectItem value="sukarela">Simpanan Sukarela</SelectItem>
                <SelectItem value="hariRaya">Simpanan Hari Raya</SelectItem>
              </SelectContent>
            </Select>
            {errors.accountType && (
              <p className="text-sm text-red-600">{errors.accountType}</p>
            )}
          </div>

          {/* Initial Deposit */}
          <div className="space-y-2">
            <Label htmlFor="initialDeposit">Setoran Awal *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="initialDeposit"
                type="number"
                value={formData.initialDeposit || ''}
                onChange={(e) => handleInputChange('initialDeposit', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="pl-10"
              />
            </div>
            {formData.accountType && (
              <p className="text-sm text-gray-600">
                Minimal: {formatCurrency(getMinimumDeposit(formData.accountType))}
              </p>
            )}
            {errors.initialDeposit && (
              <p className="text-sm text-red-600">{errors.initialDeposit}</p>
            )}
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Tujuan Simpanan *</Label>
            <Select value={formData.purpose} onValueChange={(value) => handleInputChange('purpose', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tujuan simpanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency">Dana Darurat</SelectItem>
                <SelectItem value="education">Pendidikan</SelectItem>
                <SelectItem value="business">Modal Usaha</SelectItem>
                <SelectItem value="retirement">Pensiun</SelectItem>
                <SelectItem value="investment">Investasi</SelectItem>
                <SelectItem value="other">Lainnya</SelectItem>
              </SelectContent>
            </Select>
            {errors.purpose && (
              <p className="text-sm text-red-600">{errors.purpose}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Catatan atau keterangan tambahan (opsional)"
              rows={3}
            />
          </div>

          {/* Account Type Info */}
          {formData.accountType && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Informasi Simpanan</h4>
              <div className="text-sm text-blue-700 space-y-1">
                {formData.accountType === 'pokok' && (
                  <>
                    <p>• Simpanan yang dibayar sekali saat menjadi anggota</p>
                    <p>• Tidak dapat ditarik selama menjadi anggota</p>
                    <p>• Minimal setoran: Rp 100.000</p>
                  </>
                )}
                {formData.accountType === 'wajib' && (
                  <>
                    <p>• Simpanan yang harus dibayar setiap bulan</p>
                    <p>• Dapat ditarik setelah keluar dari keanggotaan</p>
                    <p>• Minimal setoran: Rp 50.000/bulan</p>
                  </>
                )}
                {formData.accountType === 'sukarela' && (
                  <>
                    <p>• Simpanan yang dapat disetor kapan saja</p>
                    <p>• Dapat ditarik sewaktu-waktu</p>
                    <p>• Minimal setoran: Rp 25.000</p>
                  </>
                )}
                {formData.accountType === 'hariRaya' && (
                  <>
                    <p>• Simpanan khusus untuk hari raya</p>
                    <p>• Dapat ditarik menjelang hari raya</p>
                    <p>• Minimal setoran: Rp 50.000</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          {formData.initialDeposit > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Ringkasan Pembukaan Rekening</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-700">Jenis Simpanan:</span>
                  <span className="font-medium">
                    {formData.accountType === 'pokok' ? 'Simpanan Pokok' :
                     formData.accountType === 'wajib' ? 'Simpanan Wajib' :
                     formData.accountType === 'sukarela' ? 'Simpanan Sukarela' :
                     formData.accountType === 'hariRaya' ? 'Simpanan Hari Raya' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Setoran Awal:</span>
                  <span className="font-medium">{formatCurrency(formData.initialDeposit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Tujuan:</span>
                  <span className="font-medium">{formData.purpose}</span>
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
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Membuka Rekening...</span>
                </div>
              ) : (
                <>
                  <PiggyBank className="h-4 w-4 mr-2" />
                  Buka Rekening
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}