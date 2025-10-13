import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentData {
  amount: number;
  paymentType: 'regular' | 'partial' | 'full';
  paymentMethod: string;
  notes: string;
}

interface Loan {
  id: string;
  monthlyPayment: number;
  remainingBalance: number;
  nextPaymentDate: string;
  status: string;
}

interface LoanPaymentModalProps {
  loan: Loan | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payment: PaymentData) => void;
}

export function LoanPaymentModal({ loan, isOpen, onClose, onSubmit }: LoanPaymentModalProps) {
  const [formData, setFormData] = useState<PaymentData>({
    amount: 0,
    paymentType: 'regular',
    paymentMethod: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (loan && isOpen) {
      setFormData(prev => ({
        ...prev,
        amount: loan.monthlyPayment
      }));
    }
  }, [loan, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Jumlah pembayaran harus lebih dari 0';
    }

    if (formData.paymentType === 'partial' && formData.amount < 50000) {
      newErrors.amount = 'Pembayaran parsial minimal Rp 50.000';
    }

    if (formData.paymentType === 'full' && loan && formData.amount < loan.remainingBalance) {
      newErrors.amount = 'Jumlah pelunasan harus sama dengan sisa pinjaman';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Metode pembayaran harus dipilih';
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
      console.error('Error processing payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof PaymentData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePaymentTypeChange = (type: string) => {
    setFormData(prev => {
      let newAmount = prev.amount;
      if (type === 'regular' && loan) {
        newAmount = loan.monthlyPayment;
      } else if (type === 'full' && loan) {
        newAmount = loan.remainingBalance;
      } else if (type === 'partial') {
        newAmount = 0;
      }
      
      return {
        ...prev,
        paymentType: type as PaymentData['paymentType'],
        amount: newAmount
      };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateNewBalance = () => {
    if (!loan) return 0;
    return Math.max(0, loan.remainingBalance - formData.amount);
  };

  const isOverdue = () => {
    if (!loan) return false;
    const nextPayment = new Date(loan.nextPaymentDate);
    const today = new Date();
    return nextPayment < today && loan.status === 'active';
  };

  const getDaysOverdue = () => {
    if (!isOverdue() || !loan) return 0;
    const nextPayment = new Date(loan.nextPaymentDate);
    const today = new Date();
    return Math.ceil((today.getTime() - nextPayment.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateLateFee = () => {
    if (!isOverdue() || !loan) return 0;
    const daysOverdue = getDaysOverdue();
    const lateFeeRate = 0.001; // 0.1% per hari
    return Math.min(loan.monthlyPayment * lateFeeRate * daysOverdue, loan.monthlyPayment * 0.1);
  };

  const getTotalPayment = () => {
    return formData.amount + calculateLateFee();
  };

  const handleClose = () => {
    setFormData({
      amount: loan?.monthlyPayment || 0,
      paymentType: 'regular',
      paymentMethod: '',
      notes: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!loan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Bayar Cicilan Pinjaman</span>
          </DialogTitle>
          <DialogDescription>
            Lakukan pembayaran cicilan pinjaman Anda
          </DialogDescription>
        </DialogHeader>

        {/* Overdue Warning */}
        {isOverdue() && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700 font-medium">
                Pembayaran terlambat {getDaysOverdue()} hari
              </p>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Denda keterlambatan: {formatCurrency(calculateLateFee())}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Type */}
          <div className="space-y-2">
            <Label htmlFor="paymentType">Jenis Pembayaran *</Label>
            <Select value={formData.paymentType} onValueChange={handlePaymentTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Cicilan Rutin</SelectItem>
                <SelectItem value="partial">Pembayaran Sebagian</SelectItem>
                <SelectItem value="full">Pelunasan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Pembayaran *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="pl-10"
                disabled={formData.paymentType === 'regular' || formData.paymentType === 'full'}
              />
            </div>
            {formData.paymentType === 'regular' && (
              <p className="text-sm text-gray-600">
                Cicilan rutin bulanan: {formatCurrency(loan.monthlyPayment)}
              </p>
            )}
            {formData.paymentType === 'full' && (
              <p className="text-sm text-gray-600">
                Total pelunasan: {formatCurrency(loan.remainingBalance)}
              </p>
            )}
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Metode Pembayaran *</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tunai</SelectItem>
                <SelectItem value="transfer">Transfer Bank</SelectItem>
                <SelectItem value="debit">Kartu Debit</SelectItem>
                <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                <SelectItem value="auto_debit">Auto Debit</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-sm text-red-600">{errors.paymentMethod}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Catatan untuk pembayaran ini (opsional)"
              rows={3}
            />
          </div>

          {/* Payment Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Ringkasan Pembayaran</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Jumlah Pembayaran:</span>
                <span className="font-medium">{formatCurrency(formData.amount)}</span>
              </div>
              {isOverdue() && calculateLateFee() > 0 && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Denda Keterlambatan:</span>
                  <span className="font-medium text-red-600">{formatCurrency(calculateLateFee())}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="text-blue-700 font-medium">Total Pembayaran:</span>
                <span className="font-bold text-blue-900">{formatCurrency(getTotalPayment())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Sisa Pinjaman Setelah Bayar:</span>
                <span className="font-medium text-green-600">{formatCurrency(calculateNewBalance())}</span>
              </div>
            </div>
          </div>

          {/* Payment Type Info */}
          {formData.paymentType === 'full' && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-900">Pelunasan Pinjaman</h4>
              </div>
              <p className="text-sm text-green-700">
                Dengan pembayaran ini, pinjaman Anda akan lunas sepenuhnya. 
                Tidak ada lagi kewajiban pembayaran cicilan bulanan.
              </p>
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
                  <span>Memproses...</span>
                </div>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Bayar Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}