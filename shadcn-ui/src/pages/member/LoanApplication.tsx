import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { calculateLoan, formatCurrency, parseCurrency, formatCurrencyInput, LOAN_CONSTANTS } from '@/lib/loan-utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const loanApplicationSchema = z.object({
  amount: z.number()
    .min(LOAN_CONSTANTS.MIN_AMOUNT, `Minimal pinjaman ${formatCurrency(LOAN_CONSTANTS.MIN_AMOUNT)}`)
    .max(LOAN_CONSTANTS.MAX_AMOUNT, `Maksimal pinjaman ${formatCurrency(LOAN_CONSTANTS.MAX_AMOUNT)}`),
  tenor_months: z.number().min(6).max(36),
  purpose: z.string().min(20, 'Tujuan pinjaman minimal 20 karakter'),
});

type LoanApplicationForm = z.infer<typeof loanApplicationSchema>;

export default function LoanApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoanApplicationForm>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      tenor_months: 12,
    },
  });

  const watchedAmount = watch('amount') || 0;
  const watchedTenor = watch('tenor_months') || 12;

  // Calculate loan preview
  const loanCalculation = watchedAmount > 0 
    ? calculateLoan(watchedAmount, LOAN_CONSTANTS.DEFAULT_INTEREST_RATE, watchedTenor)
    : null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountInput(formatCurrencyInput(value));
    setValue('amount', parseCurrency(value));
  };

  const onSubmit = (data: LoanApplicationForm) => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Mock API call - replace with actual Supabase call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Pengajuan pinjaman berhasil dikirim!');
      navigate('/member/loan-history');
    } catch (error) {
      toast.error('Gagal mengirim pengajuan pinjaman');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <CreditCard className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Pengajuan Pinjaman</h1>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Pastikan data yang Anda masukkan sudah benar. Pengajuan yang sudah dikirim tidak dapat diubah.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Form Pengajuan</CardTitle>
            <CardDescription>
              Isi form di bawah ini untuk mengajukan pinjaman
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Nominal Pinjaman</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    Rp
                  </span>
                  <Input
                    id="amount"
                    type="text"
                    value={amountInput}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Minimal {formatCurrency(LOAN_CONSTANTS.MIN_AMOUNT)} - 
                  Maksimal {formatCurrency(LOAN_CONSTANTS.MAX_AMOUNT)}
                </p>
              </div>

              {/* Tenor Selection */}
              <div className="space-y-2">
                <Label htmlFor="tenor">Tenor/Termin</Label>
                <Select onValueChange={(value) => setValue('tenor_months', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tenor" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_CONSTANTS.TENOR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tenor_months && (
                  <p className="text-sm text-red-600">{errors.tenor_months.message}</p>
                )}
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Tujuan Pinjaman</Label>
                <Textarea
                  id="purpose"
                  {...register('purpose')}
                  placeholder="Jelaskan tujuan penggunaan pinjaman..."
                  rows={4}
                />
                {errors.purpose && (
                  <p className="text-sm text-red-600">{errors.purpose.message}</p>
                )}
                <p className="text-xs text-gray-500">Minimal 20 karakter</p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                <CreditCard className="h-4 w-4 mr-2" />
                Ajukan Pinjaman
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loan Calculation Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Preview Perhitungan
            </CardTitle>
            <CardDescription>
              Simulasi perhitungan pinjaman Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loanCalculation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Nominal Pinjaman</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(watchedAmount)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Tenor</p>
                    <p className="text-lg font-bold text-green-600">
                      {watchedTenor} Bulan
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bunga per bulan:</span>
                    <span className="font-medium">
                      {(LOAN_CONSTANTS.DEFAULT_INTEREST_RATE * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Angsuran per bulan:</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(loanCalculation.monthlyPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total bunga:</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(loanCalculation.totalInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Total yang harus dibayar:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(loanCalculation.totalPayment)}
                    </span>
                  </div>
                </div>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Perhitungan ini adalah simulasi. Bunga dan angsuran final akan ditentukan 
                    saat persetujuan pinjaman.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Masukkan nominal pinjaman untuk melihat simulasi</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Konfirmasi Pengajuan Pinjaman
            </DialogTitle>
            <DialogDescription>
              Pastikan data pengajuan Anda sudah benar sebelum mengirim.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Nominal Pinjaman:</span>
                <span className="font-bold">{formatCurrency(watchedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tenor:</span>
                <span className="font-bold">{watchedTenor} Bulan</span>
              </div>
              {loanCalculation && (
                <div className="flex justify-between">
                  <span>Angsuran per Bulan:</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(loanCalculation.monthlyPayment)}
                  </span>
                </div>
              )}
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Setelah dikirim, pengajuan tidak dapat diubah dan akan diproses oleh tim manager.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}