import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockLoans } from '@/lib/supabase';

const loanApplicationSchema = z.object({
  amount: z.number().min(1000000, 'Minimal pinjaman Rp 1.000.000').max(100000000, 'Maksimal pinjaman Rp 100.000.000'),
  tenor_months: z.number().min(6, 'Minimal tenor 6 bulan').max(60, 'Maksimal tenor 60 bulan'),
  purpose: z.string().min(10, 'Jelaskan tujuan pinjaman minimal 10 karakter'),
});

type LoanApplicationForm = z.infer<typeof loanApplicationSchema>;

export default function LoanModule() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoanApplicationForm>({
    resolver: zodResolver(loanApplicationSchema),
  });

  const memberLoans = mockLoans.filter(loan => loan.member_id === user?.id);

  const onSubmit = async (data: LoanApplicationForm) => {
    // Mock submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitSuccess(true);
    setShowForm(false);
    reset();
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Ditolak</Badge>;
      case 'active':
        return <Badge variant="default"><CreditCard className="h-3 w-3 mr-1" />Aktif</Badge>;
      case 'completed':
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Selesai</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {submitSuccess && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Pengajuan pinjaman berhasil dikirim! Menunggu persetujuan dari manager.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="active">Pinjaman Aktif</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
          </TabsList>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajukan Pinjaman
          </Button>
        </div>

        <TabsContent value="active">
          <div className="grid gap-4">
            {memberLoans.filter(loan => loan.status === 'active').length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">Tidak ada pinjaman aktif</p>
                </CardContent>
              </Card>
            ) : (
              memberLoans.filter(loan => loan.status === 'active').map((loan) => (
                <Card key={loan.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Pinjaman #{loan.id}</CardTitle>
                        <CardDescription>{loan.purpose}</CardDescription>
                      </div>
                      {getStatusBadge(loan.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Jumlah Pinjaman</p>
                        <p className="font-semibold">{formatCurrency(loan.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sisa Hutang</p>
                        <p className="font-semibold text-red-600">{formatCurrency(loan.remaining_balance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Angsuran/Bulan</p>
                        <p className="font-semibold">{formatCurrency(loan.monthly_payment)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tenor</p>
                        <p className="font-semibold">{loan.tenor_months} bulan</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-4">
            {memberLoans.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">Belum ada riwayat pinjaman</p>
                </CardContent>
              </Card>
            ) : (
              memberLoans.map((loan) => (
                <Card key={loan.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Pinjaman #{loan.id}</CardTitle>
                        <CardDescription>{loan.purpose}</CardDescription>
                      </div>
                      {getStatusBadge(loan.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Jumlah</p>
                        <p className="font-semibold">{formatCurrency(loan.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tenor</p>
                        <p className="font-semibold">{loan.tenor_months} bulan</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tanggal Pengajuan</p>
                        <p className="font-semibold">{new Date(loan.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Loan Application Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Pengajuan Pinjaman</CardTitle>
              <CardDescription>
                Isi form berikut untuk mengajukan pinjaman
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah Pinjaman (Rp)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="50000000"
                    {...register('amount', { valueAsNumber: true })}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenor_months">Tenor (Bulan)</Label>
                  <Input
                    id="tenor_months"
                    type="number"
                    placeholder="24"
                    {...register('tenor_months', { valueAsNumber: true })}
                  />
                  {errors.tenor_months && (
                    <p className="text-sm text-red-600">{errors.tenor_months.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Tujuan Pinjaman</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Jelaskan tujuan penggunaan pinjaman..."
                    {...register('purpose')}
                  />
                  {errors.purpose && (
                    <p className="text-sm text-red-600">{errors.purpose.message}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? 'Mengirim...' : 'Ajukan'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}