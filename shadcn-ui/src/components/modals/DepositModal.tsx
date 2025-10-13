import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, CreditCard, PiggyBank } from 'lucide-react';

interface DepositData {
  accountId: string;
  amount: number;
  paymentMethod: string;
  notes: string;
}

interface SavingsAccount {
  id: string;
  type: string;
  balance: number;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deposit: DepositData) => void;
  accounts: SavingsAccount[];
}

export function DepositModal({ isOpen, onClose, onSubmit, accounts }: DepositModalProps) {
  const [formData, setFormData] = useState<DepositData>({
    accountId: '',
    amount: 0,
    paymentMethod: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountId) {
      newErrors.accountId = 'Rekening tujuan harus dipilih';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Jumlah setoran harus lebih dari 0';
    }

    if (formData.amount < 10000) {
      newErrors.amount = 'Minimal setoran Rp 10.000';
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
      console.error('Error processing deposit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof DepositData, value: string | number) => {
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

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'pokok': return 'Simpanan Pokok';
      case 'wajib': return 'Simpanan Wajib';
      case 'sukarela': return 'Simpanan Sukarela';
      case 'hariRaya': return 'Simpanan Hari Raya';
      default: return type;
    }
  };

  const selectedAccount = accounts.find(acc => acc.id === formData.accountId);

  const handleClose = () => {
    setFormData({
      accountId: '',
      amount: 0,
      paymentMethod: '',
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
            <DollarSign className="h-5 w-5" />
            <span>Setor Simpanan</span>
          </DialogTitle>
          <DialogDescription>
            Lakukan setoran ke rekening simpanan Anda
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="accountId">Rekening Tujuan *</Label>
            <Select value={formData.accountId} onValueChange={(value) => handleInputChange('accountId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih rekening simpanan" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {getAccountTypeName(account.type)} - {formatCurrency(account.balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-sm text-red-600">{errors.accountId}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Setoran *</Label>
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
            <p className="text-sm text-gray-600">Minimal setoran: Rp 10.000</p>
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
              placeholder="Catatan untuk setoran ini (opsional)"
              rows={3}
            />
          </div>

          {/* Account Info */}
          {selectedAccount && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Informasi Rekening</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div className="flex justify-between">
                  <span>Jenis Simpanan:</span>
                  <span className="font-medium">{getAccountTypeName(selectedAccount.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Saldo Saat Ini:</span>
                  <span className="font-medium">{formatCurrency(selectedAccount.balance)}</span>
                </div>
                {formData.amount > 0 && (
                  <div className="flex justify-between border-t pt-1 mt-2">
                    <span>Saldo Setelah Setoran:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(selectedAccount.balance + formData.amount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction Summary */}
          {formData.amount > 0 && formData.paymentMethod && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Ringkasan Transaksi</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-700">Jumlah Setoran:</span>
                  <span className="font-medium">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Metode Pembayaran:</span>
                  <span className="font-medium">
                    {formData.paymentMethod === 'cash' ? 'Tunai' :
                     formData.paymentMethod === 'transfer' ? 'Transfer Bank' :
                     formData.paymentMethod === 'debit' ? 'Kartu Debit' :
                     formData.paymentMethod === 'mobile_banking' ? 'Mobile Banking' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Biaya Admin:</span>
                  <span className="font-medium">Gratis</span>
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
                  <span>Memproses...</span>
                </div>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Setor Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}