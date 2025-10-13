import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanData?: {
    id: string;
    purpose: string;
    amount: number;
    remaining: number;
    monthlyPayment: number;
    nextPayment: string;
  };
}

export function PaymentModal({ isOpen, onClose, loanData }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(loanData?.monthlyPayment.toString() || '');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success message and close modal
    alert('Pembayaran berhasil diproses!');
    setIsProcessing(false);
    onClose();
  };

  const paymentMethods = [
    { value: 'transfer', label: 'Transfer Bank' },
    { value: 'ewallet', label: 'E-Wallet' },
    { value: 'debit', label: 'Kartu Debit' },
    { value: 'cash', label: 'Tunai di Kantor' }
  ];

  if (!loanData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span>Pembayaran Cicilan</span>
          </DialogTitle>
          <DialogDescription>
            Lakukan pembayaran cicilan pinjaman Anda dengan mudah dan aman
          </DialogDescription>
        </DialogHeader>

        {/* Loan Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tujuan Pinjaman:</span>
                <span className="font-medium">{loanData.purpose}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sisa Pinjaman:</span>
                <span className="font-medium text-red-600">{formatCurrency(loanData.remaining)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cicilan Bulanan:</span>
                <span className="font-medium text-blue-600">{formatCurrency(loanData.monthlyPayment)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Jatuh Tempo:</span>
                <Badge variant="outline" className="text-orange-600">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(loanData.nextPayment).toLocaleDateString('id-ID')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Metode Pembayaran *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode pembayaran" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="paymentAmount">Jumlah Pembayaran *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="paymentAmount"
                type="number"
                placeholder="Masukkan jumlah pembayaran"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount(loanData.monthlyPayment.toString())}
              >
                Cicilan Normal
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount((loanData.monthlyPayment * 2).toString())}
              >
                Bayar 2x Cicilan
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan catatan untuk pembayaran ini..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Payment Instructions */}
          {paymentMethod && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">Petunjuk Pembayaran:</p>
                    {paymentMethod === 'transfer' && (
                      <p className="text-yellow-700">
                        Transfer ke rekening: Bank BCA 1234567890 a.n. Koperasi Rumah Sakit
                      </p>
                    )}
                    {paymentMethod === 'ewallet' && (
                      <p className="text-yellow-700">
                        Scan QR Code yang akan muncul setelah konfirmasi pembayaran
                      </p>
                    )}
                    {paymentMethod === 'debit' && (
                      <p className="text-yellow-700">
                        Siapkan kartu debit Anda untuk proses pembayaran
                      </p>
                    )}
                    {paymentMethod === 'cash' && (
                      <p className="text-yellow-700">
                        Datang ke kantor koperasi dengan membawa bukti pembayaran ini
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isProcessing || !paymentMethod || !paymentAmount}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Bayar Sekarang
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}