import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PiggyBank, Info, CheckCircle, TrendingUp } from 'lucide-react';
import { formatCurrency, parseCurrency, formatCurrencyInput } from '@/lib/loan-utils';
import { SAVINGS_CONSTANTS, SavingsForm } from '@/types/savings';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const savingsSchema = z.object({
  transaction_date: z.string().min(1, 'Tanggal harus diisi'),
  type: z.enum(['pokok', 'wajib', 'sukarela']),
  amount: z.number().min(1000, 'Minimal setoran Rp 1.000'),
  description: z.string().optional(),
}).refine((data) => {
  if (data.type === 'pokok' && data.amount !== SAVINGS_CONSTANTS.SIMPANAN_POKOK) {
    return false;
  }
  if (data.type === 'wajib' && data.amount < SAVINGS_CONSTANTS.MIN_SIMPANAN_WAJIB) {
    return false;
  }
  return true;
}, {
  message: 'Nominal tidak sesuai dengan ketentuan',
  path: ['amount'],
});

// Mock current savings balance
const mockSavingsBalance = {
  simpanan_pokok: 100000,
  simpanan_wajib: 600000,
  simpanan_sukarela: 2500000,
  total: 3200000,
};

export default function SavingsModule() {
  const { user } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<'pokok' | 'wajib' | 'sukarela'>('wajib');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SavingsForm>({
    resolver: zodResolver(savingsSchema),
    defaultValues: {
      transaction_date: new Date().toISOString().split('T')[0],
      type: 'wajib',
    },
  });

  const watchedAmount = watch('amount') || 0;
  const watchedType = watch('type');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountInput(formatCurrencyInput(value));
    setValue('amount', parseCurrency(value));
  };

  const handleTypeChange = (type: 'pokok' | 'wajib' | 'sukarela') => {
    setSelectedType(type);
    setValue('type', type);
    
    // Auto-fill amount for simpanan pokok
    if (type === 'pokok') {
      setValue('amount', SAVINGS_CONSTANTS.SIMPANAN_POKOK);
      setAmountInput(formatCurrencyInput(SAVINGS_CONSTANTS.SIMPANAN_POKOK.toString()));
    } else {
      setValue('amount', 0);
      setAmountInput('');
    }
  };

  const onSubmit = (data: SavingsForm) => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Mock API call - replace with actual Supabase call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Setoran simpanan berhasil dicatat!');
      reset();
      setAmountInput('');
    } catch (error) {
      toast.error('Gagal mencatat setoran simpanan');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const getTypeInfo = (type: string) => {
    const typeData = SAVINGS_CONSTANTS.SAVINGS_TYPES.find(t => t.value === type);
    return typeData?.description || '';
  };

  const canDepositPokok = mockSavingsBalance.simpanan_pokok === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <PiggyBank className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Setoran Simpanan</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Saldo Simpanan Saat Ini
            </CardTitle>
            <CardDescription>
              Total simpanan Anda per hari ini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Simpanan Pokok</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(mockSavingsBalance.simpanan_pokok)}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Simpanan Wajib</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(mockSavingsBalance.simpanan_wajib)}
                </p>
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Simpanan Sukarela</p>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(mockSavingsBalance.simpanan_sukarela)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-lg border-2 border-dashed">
              <p className="text-sm text-gray-600">Total Keseluruhan</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(mockSavingsBalance.total)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Form Setoran</CardTitle>
            <CardDescription>
              Pilih jenis simpanan dan masukkan nominal setoran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Date Input */}
              <div className="space-y-2">
                <Label htmlFor="transaction_date">Tanggal Setor</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  {...register('transaction_date')}
                />
                {errors.transaction_date && (
                  <p className="text-sm text-red-600">{errors.transaction_date.message}</p>
                )}
              </div>

              {/* Savings Type Tabs */}
              <div className="space-y-2">
                <Label>Jenis Simpanan</Label>
                <Tabs value={selectedType} onValueChange={handleTypeChange}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pokok" disabled={!canDepositPokok}>Pokok</TabsTrigger>
                    <TabsTrigger value="wajib">Wajib</TabsTrigger>
                    <TabsTrigger value="sukarela">Sukarela</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="pokok" className="space-y-3">
                    <Alert className="border-blue-200 bg-blue-50">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Simpanan Pokok:</strong> Rp 100.000 (sekali saat bergabung)
                      </AlertDescription>
                    </Alert>
                    {!canDepositPokok && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertDescription className="text-yellow-800">
                          Anda sudah melakukan setoran simpanan pokok
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="wajib" className="space-y-3">
                    <Alert className="border-green-200 bg-green-50">
                      <Info className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Simpanan Wajib:</strong> Minimal Rp 50.000 per bulan
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  
                  <TabsContent value="sukarela" className="space-y-3">
                    <Alert className="border-purple-200 bg-purple-50">
                      <Info className="h-4 w-4 text-purple-600" />
                      <AlertDescription className="text-purple-800">
                        <strong>Simpanan Sukarela:</strong> Bebas sesuai kemampuan Anda
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Nominal Setoran</Label>
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
                    disabled={selectedType === 'pokok'}
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  {getTypeInfo(selectedType)}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Keterangan (Opsional)</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Tambahkan keterangan jika diperlukan..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={!canDepositPokok && selectedType === 'pokok'}
              >
                <PiggyBank className="h-4 w-4 mr-2" />
                Setor Simpanan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SAVINGS_CONSTANTS.SAVINGS_TYPES.map((type) => (
          <Card key={type.value} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{type.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Konfirmasi Setoran Simpanan
            </DialogTitle>
            <DialogDescription>
              Pastikan data setoran Anda sudah benar sebelum menyimpan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Jenis Simpanan:</span>
                <span className="font-bold capitalize">{watchedType}</span>
              </div>
              <div className="flex justify-between">
                <span>Nominal:</span>
                <span className="font-bold text-blue-600">{formatCurrency(watchedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span className="font-bold">
                  {new Date(watch('transaction_date')).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Konfirmasi Setoran'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}