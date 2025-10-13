import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PiggyBank, Plus, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';
import { savingsService, SavingsAccount, CreateTransactionData, SavingsTransaction } from '@/lib/api/savings';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function SavingsDeposit() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const [formData, setFormData] = useState<CreateTransactionData>({
    account_id: '',
    type: 'deposit',
    amount: 0,
    description: '',
  });

  const loadAccounts = async () => {
    try {
      const data = await savingsService.getSavingsAccountsByMember(user?.id || '1');
      setAccounts(data);
      if (data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(data[0].id);
        setFormData(prev => ({ ...prev, account_id: data[0].id }));
      }
    } catch (error) {
      toast.error('Gagal memuat rekening simpanan');
    }
  };

  const loadTransactions = async () => {
    if (!selectedAccountId) return;
    
    try {
      const data = await savingsService.getTransactions(selectedAccountId);
      setTransactions(data.slice(0, 10)); // Show last 10 transactions
    } catch (error) {
      toast.error('Gagal memuat riwayat transaksi');
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      loadTransactions();
      setFormData(prev => ({ ...prev, account_id: selectedAccountId }));
    }
  }, [selectedAccountId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const getAccountTypeBadge = (type: SavingsAccount['account_type']) => {
    const variants = {
      mandatory: 'bg-blue-100 text-blue-800',
      voluntary: 'bg-green-100 text-green-800',
      special: 'bg-purple-100 text-purple-800',
    };

    const labels = {
      mandatory: 'Wajib',
      voluntary: 'Sukarela',
      special: 'Khusus',
    };

    return (
      <Badge className={variants[type]}>
        {labels[type]}
      </Badge>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    if (formData.amount < 50000) {
      toast.error('Jumlah setoran minimal Rp 50.000');
      return;
    }

    setLoading(true);
    try {
      await savingsService.createTransaction(formData);
      toast.success('Setoran berhasil dicatat');
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        amount: 0,
        description: '',
      }));
      
      // Reload data
      loadAccounts();
      loadTransactions();
    } catch (error) {
      toast.error('Gagal mencatat setoran');
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Setoran Simpanan</h1>
          <p className="text-muted-foreground">
            Lakukan setoran ke rekening simpanan Anda
          </p>
        </div>
        <Button variant="outline" onClick={loadAccounts}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Deposit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Form Setoran Simpanan
              </CardTitle>
              <CardDescription>
                Pilih rekening dan masukkan jumlah setoran
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="account">Rekening Simpanan *</Label>
                    <Select
                      value={selectedAccountId}
                      onValueChange={setSelectedAccountId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih rekening simpanan" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_number} - {account.account_type === 'mandatory' ? 'Wajib' : account.account_type === 'voluntary' ? 'Sukarela' : 'Khusus'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Jumlah Setoran *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Masukkan jumlah setoran"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      min="50000"
                      step="10000"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimal setoran Rp 50.000
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Keterangan *</Label>
                    <Textarea
                      id="description"
                      placeholder="Masukkan keterangan setoran..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Contoh: Setoran rutin bulan Januari, Setoran tambahan, dll.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading || !selectedAccountId} className="flex-1">
                    {loading ? 'Memproses...' : 'Proses Setoran'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData(prev => ({ ...prev, amount: 0, description: '' }))}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Info & Recent Transactions */}
        <div className="space-y-6">
          {/* Selected Account Info */}
          {selectedAccount && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PiggyBank className="mr-2 h-5 w-5" />
                  Info Rekening
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">No. Rekening:</span>
                    <span className="font-medium">{selectedAccount.account_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Jenis:</span>
                    {getAccountTypeBadge(selectedAccount.account_type)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Saldo Saat Ini:</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatCurrency(selectedAccount.balance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Setoran Bulanan:</span>
                    <span className="font-medium">{formatCurrency(selectedAccount.monthly_deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Transaksi Terakhir:</span>
                    <span className="font-medium">
                      {new Date(selectedAccount.last_transaction).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deposit Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Info Setoran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Setoran akan langsung menambah saldo</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Mendapat bunga sesuai jenis simpanan</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Riwayat transaksi tersimpan otomatis</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Info:</strong> Setoran akan diproses secara real-time dan 
              saldo akan langsung terupdate di sistem.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>
              10 transaksi terakhir pada rekening yang dipilih
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Saldo Setelah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Badge className={transaction.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {transaction.type === 'deposit' ? 'Setoran' : 'Penarikan'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.balance_after)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}