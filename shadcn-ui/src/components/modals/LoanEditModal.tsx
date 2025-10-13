import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, DollarSign, Calendar, User, FileText } from 'lucide-react';

interface Loan {
  id: string;
  memberNumber: string;
  memberName: string;
  amount: number;
  purpose: string;
  interestRate: number;
  termMonths: number;
  remainingAmount: number;
  monthlyPayment: number;
  status: string;
  approvalDate: string;
  nextPaymentDate: string;
}

interface LoanEditModalProps {
  loan: Loan | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Loan) => void;
}

export function LoanEditModal({ loan, isOpen, onClose, onSave }: LoanEditModalProps) {
  const [formData, setFormData] = useState<Partial<Loan>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loan) {
      setFormData({ ...loan });
    }
  }, [loan]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Jumlah pinjaman harus lebih dari 0';
    }

    if (!formData.purpose?.trim()) {
      newErrors.purpose = 'Tujuan pinjaman harus diisi';
    }

    if (!formData.interestRate || formData.interestRate <= 0) {
      newErrors.interestRate = 'Suku bunga harus lebih dari 0';
    }

    if (!formData.termMonths || formData.termMonths <= 0) {
      newErrors.termMonths = 'Jangka waktu harus lebih dari 0';
    }

    if (!formData.status) {
      newErrors.status = 'Status harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !loan) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recalculate monthly payment if amount, rate, or term changed
      const monthlyRate = (formData.interestRate || 0) / 100 / 12;
      const newMonthlyPayment = (formData.amount || 0) * 
        (monthlyRate * Math.pow(1 + monthlyRate, formData.termMonths || 0)) / 
        (Math.pow(1 + monthlyRate, formData.termMonths || 0) - 1);

      const updatedLoan: Loan = {
        ...loan,
        ...formData as Loan,
        monthlyPayment: newMonthlyPayment
      };
      
      onSave(updatedLoan);
      onClose();
    } catch (error) {
      console.error('Error updating loan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Loan, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateMonthlyPayment = () => {
    if (formData.amount && formData.interestRate && formData.termMonths) {
      const monthlyRate = formData.interestRate / 100 / 12;
      const payment = formData.amount * (monthlyRate * Math.pow(1 + monthlyRate, formData.termMonths)) / 
                     (Math.pow(1 + monthlyRate, formData.termMonths) - 1);
      return payment;
    }
    return 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!loan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Edit Pinjaman</span>
          </DialogTitle>
          <DialogDescription>
            Ubah informasi pinjaman {loan.memberName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Loan Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Detail Pinjaman</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
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
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <Label htmlFor="interestRate">Suku Bunga (% per tahun) *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={formData.interestRate || ''}
                  onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                  placeholder="12"
                />
                {errors.interestRate && (
                  <p className="text-sm text-red-600">{errors.interestRate}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Term */}
              <div className="space-y-2">
                <Label htmlFor="termMonths">Jangka Waktu (bulan) *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="termMonths"
                    type="number"
                    value={formData.termMonths || ''}
                    onChange={(e) => handleInputChange('termMonths', parseInt(e.target.value) || 0)}
                    placeholder="12"
                    className="pl-10"
                  />
                </div>
                {errors.termMonths && (
                  <p className="text-sm text-red-600">{errors.termMonths}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu Persetujuan</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status}</p>
                )}
              </div>
            </div>

            {/* Remaining Amount */}
            <div className="space-y-2">
              <Label htmlFor="remainingAmount">Sisa Pinjaman</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="remainingAmount"
                  type="number"
                  value={formData.remainingAmount || ''}
                  onChange={(e) => handleInputChange('remainingAmount', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Tujuan Pinjaman *</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="purpose"
                  value={formData.purpose || ''}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  placeholder="Jelaskan tujuan penggunaan pinjaman"
                  rows={3}
                  className="pl-10"
                />
              </div>
              {errors.purpose && (
                <p className="text-sm text-red-600">{errors.purpose}</p>
              )}
            </div>
          </div>

          {/* Calculation Summary */}
          {(formData.amount || 0) > 0 && (formData.interestRate || 0) > 0 && (formData.termMonths || 0) > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Ringkasan Perhitungan</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Jumlah Pinjaman:</span>
                  <p className="font-medium">{formatCurrency(formData.amount || 0)}</p>
                </div>
                <div>
                  <span className="text-blue-700">Angsuran per Bulan:</span>
                  <p className="font-medium">{formatCurrency(calculateMonthlyPayment())}</p>
                </div>
                <div>
                  <span className="text-blue-700">Total Pembayaran:</span>
                  <p className="font-medium">{formatCurrency(calculateMonthlyPayment() * (formData.termMonths || 0))}</p>
                </div>
                <div>
                  <span className="text-blue-700">Total Bunga:</span>
                  <p className="font-medium">{formatCurrency((calculateMonthlyPayment() * (formData.termMonths || 0)) - (formData.amount || 0))}</p>
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