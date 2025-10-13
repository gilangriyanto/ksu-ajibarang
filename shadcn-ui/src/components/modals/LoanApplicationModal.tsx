import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Calendar, FileText, CreditCard } from 'lucide-react';

interface LoanApplication {
  amount: number;
  purpose: string;
  term: number;
  collateral: string;
  monthlyIncome: number;
  notes: string;
}

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (application: LoanApplication) => void;
}

export function LoanApplicationModal({ isOpen, onClose, onSubmit }: LoanApplicationModalProps) {
  const [formData, setFormData] = useState<LoanApplication>({
    amount: 0,
    purpose: '',
    term: 12,
    collateral: '',
    monthlyIncome: 0,
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Jumlah pinjaman harus lebih dari 0';
    }

    if (formData.amount < 500000) {
      newErrors.amount = 'Minimal pinjaman Rp 500.000';
    }

    if (formData.amount > 100000000) {
      newErrors.amount = 'Maksimal pinjaman Rp 100.000.000';
    }

    if (!formData.purpose) {
      newErrors.purpose = 'Tujuan pinjaman harus dipilih';
    }

    if (!formData.term || formData.term < 6) {
      newErrors.term = 'Jangka waktu minimal 6 bulan';
    }

    if (!formData.collateral) {
      newErrors.collateral = 'Jaminan harus dipilih';
    }

    if (!formData.monthlyIncome || formData.monthlyIncome <= 0) {
      newErrors.monthlyIncome = 'Penghasilan bulanan harus diisi';
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting loan application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LoanApplication, value: string | number) => {
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

  const calculateMonthlyPayment = () => {
    if (formData.amount && formData.term) {
      const interestRate = 0.12 / 12; // 12% per tahun
      const principal = formData.amount;
      const months = formData.term;
      
      const monthlyPayment = (principal * interestRate * Math.pow(1 + interestRate, months)) / 
                            (Math.pow(1 + interestRate, months) - 1);
      
      return monthlyPayment;
    }
    return 0;
  };

  const calculateTotalPayment = () => {
    return calculateMonthlyPayment() * formData.term;
  };

  const handleClose = () => {
    setFormData({
      amount: 0,
      purpose: '',
      term: 12,
      collateral: '',
      monthlyIncome: 0,
      notes: ''
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
            <CreditCard className="h-5 w-5" />
            <span>Ajukan Pinjaman Baru</span>
          </DialogTitle>
          <DialogDescription>
            Lengkapi formulir untuk mengajukan pinjaman baru
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Loan Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Pinjaman *</Label>
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
            <p className="text-sm text-gray-600">
              Minimal: Rp 500.000 | Maksimal: Rp 100.000.000
            </p>
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Purpose and Term */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Tujuan Pinjaman *</Label>
              <Select value={formData.purpose} onValueChange={(value) => handleInputChange('purpose', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tujuan pinjaman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Modal Usaha</SelectItem>
                  <SelectItem value="education">Pendidikan</SelectItem>
                  <SelectItem value="health">Kesehatan</SelectItem>
                  <SelectItem value="home_improvement">Renovasi Rumah</SelectItem>
                  <SelectItem value="vehicle">Kendaraan</SelectItem>
                  <SelectItem value="emergency">Kebutuhan Darurat</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {errors.purpose && (
                <p className="text-sm text-red-600">{errors.purpose}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Jangka Waktu (Bulan) *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="term"
                  type="number"
                  value={formData.term || ''}
                  onChange={(e) => handleInputChange('term', parseInt(e.target.value) || 0)}
                  placeholder="12"
                  className="pl-10"
                  min="6"
                  max="60"
                />
              </div>
              <p className="text-sm text-gray-600">6 - 60 bulan</p>
              {errors.term && (
                <p className="text-sm text-red-600">{errors.term}</p>
              )}
            </div>
          </div>

          {/* Collateral */}
          <div className="space-y-2">
            <Label htmlFor="collateral">Jaminan *</Label>
            <Select value={formData.collateral} onValueChange={(value) => handleInputChange('collateral', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis jaminan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Simpanan di Koperasi</SelectItem>
                <SelectItem value="certificate">Sertifikat Tanah/Rumah</SelectItem>
                <SelectItem value="vehicle">BPKB Kendaraan</SelectItem>
                <SelectItem value="salary">Slip Gaji</SelectItem>
                <SelectItem value="business">Surat Izin Usaha</SelectItem>
                <SelectItem value="guarantor">Penjamin Personal</SelectItem>
              </SelectContent>
            </Select>
            {errors.collateral && (
              <p className="text-sm text-red-600">{errors.collateral}</p>
            )}
          </div>

          {/* Monthly Income */}
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">Penghasilan Bulanan *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="monthlyIncome"
                type="number"
                value={formData.monthlyIncome || ''}
                onChange={(e) => handleInputChange('monthlyIncome', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="pl-10"
              />
            </div>
            {errors.monthlyIncome && (
              <p className="text-sm text-red-600">{errors.monthlyIncome}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Informasi tambahan yang mendukung pengajuan pinjaman"
              rows={3}
            />
          </div>

          {/* Loan Calculation */}
          {formData.amount > 0 && formData.term > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Simulasi Pinjaman</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Jumlah Pinjaman:</span>
                    <span className="font-medium">{formatCurrency(formData.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Jangka Waktu:</span>
                    <span className="font-medium">{formData.term} bulan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Suku Bunga:</span>
                    <span className="font-medium">12% per tahun</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Angsuran per Bulan:</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(calculateMonthlyPayment())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Pembayaran:</span>
                    <span className="font-medium">{formatCurrency(calculateTotalPayment())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Bunga:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(calculateTotalPayment() - formData.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Eligibility Check */}
          {formData.monthlyIncome > 0 && formData.amount > 0 && (
            <div className={`p-4 rounded-lg ${
              (calculateMonthlyPayment() / formData.monthlyIncome) <= 0.3 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <h4 className={`font-medium mb-2 ${
                (calculateMonthlyPayment() / formData.monthlyIncome) <= 0.3 
                  ? 'text-green-900' 
                  : 'text-yellow-900'
              }`}>
                Analisis Kemampuan Bayar
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Rasio Angsuran terhadap Penghasilan:</span>
                  <span className="font-medium">
                    {((calculateMonthlyPayment() / formData.monthlyIncome) * 100).toFixed(1)}%
                  </span>
                </div>
                <p className={`text-xs ${
                  (calculateMonthlyPayment() / formData.monthlyIncome) <= 0.3 
                    ? 'text-green-700' 
                    : 'text-yellow-700'
                }`}>
                  {(calculateMonthlyPayment() / formData.monthlyIncome) <= 0.3 
                    ? '✓ Rasio angsuran baik (≤30% dari penghasilan)'
                    : '⚠ Rasio angsuran tinggi (>30% dari penghasilan)'}
                </p>
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
                  <span>Mengajukan...</span>
                </div>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Ajukan Pinjaman
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}