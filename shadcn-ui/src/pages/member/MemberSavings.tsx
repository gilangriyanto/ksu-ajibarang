import React, { useState } from 'react';
import { MemberLayout } from '@/components/layout/MemberLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  PiggyBank, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Plus,
  Eye,
  ArrowUpRight,
  CheckCircle
} from 'lucide-react';

export default function MemberSavings() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositForm, setDepositForm] = useState({
    savingsType: '',
    amount: '',
    notes: ''
  });

  // Mock data - replace with actual API calls
  const savingsData = {
    totalBalance: 6000000,
    monthlyTarget: 250000,
    thisMonthDeposit: 180000,
    accounts: [
      {
        id: '1',
        type: 'Simpanan Wajib',
        balance: 1200000,
        interestRate: 6,
        status: 'active',
        lastDeposit: '2024-01-15',
        monthlyTarget: 100000
      },
      {
        id: '2',
        type: 'Simpanan Sukarela',
        balance: 2500000,
        interestRate: 8,
        status: 'active',
        lastDeposit: '2024-01-20',
        monthlyTarget: 0
      },
      {
        id: '3',
        type: 'Simpanan Pokok',
        balance: 500000,
        interestRate: 3,
        status: 'locked',
        lastDeposit: '2023-01-15',
        monthlyTarget: 0
      },
      {
        id: '4',
        type: 'Simpanan Hari Raya',
        balance: 1800000,
        interestRate: 7,
        status: 'active',
        lastDeposit: '2024-01-25',
        monthlyTarget: 150000
      }
    ],
    recentTransactions: [
      {
        id: '1',
        type: 'deposit',
        savingsType: 'Simpanan Hari Raya',
        amount: 150000,
        date: '2024-01-25',
        description: 'Setoran rutin bulanan'
      },
      {
        id: '2',
        type: 'deposit',
        savingsType: 'Simpanan Sukarela',
        amount: 500000,
        date: '2024-01-20',
        description: 'Setoran tambahan'
      },
      {
        id: '3',
        type: 'interest',
        savingsType: 'Simpanan Sukarela',
        amount: 15000,
        date: '2024-01-15',
        description: 'Bunga simpanan bulan Desember'
      },
      {
        id: '4',
        type: 'deposit',
        savingsType: 'Simpanan Wajib',
        amount: 100000,
        date: '2024-01-15',
        description: 'Setoran wajib bulanan'
      }
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'locked':
        return <Badge className="bg-gray-100 text-gray-800">Terkunci</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'interest':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle deposit submission
    console.log('Deposit form:', depositForm);
    alert('Setoran berhasil diproses!');
    setIsDepositModalOpen(false);
    setDepositForm({ savingsType: '', amount: '', notes: '' });
  };

  const savingsTypes = [
    { value: 'wajib', label: 'Simpanan Wajib' },
    { value: 'sukarela', label: 'Simpanan Sukarela' },
    { value: 'pokok', label: 'Simpanan Pokok' },
    { value: 'hari-raya', label: 'Simpanan Hari Raya' }
  ];

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Simpanan Saya</h1>
            <p className="text-gray-600 mt-1">Kelola dan pantau simpanan Anda</p>
          </div>
          <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Setor Simpanan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Setor Simpanan</DialogTitle>
                <DialogDescription>
                  Lakukan setoran ke rekening simpanan Anda
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="savingsType">Jenis Simpanan *</Label>
                  <Select 
                    value={depositForm.savingsType} 
                    onValueChange={(value) => setDepositForm({...depositForm, savingsType: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis simpanan" />
                    </SelectTrigger>
                    <SelectContent>
                      {savingsTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Nominal *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Masukkan nominal setoran"
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Deskripsi/Catatan</Label>
                  <Textarea
                    id="notes"
                    placeholder="Tambahkan catatan untuk setoran ini (opsional)"
                    value={depositForm.notes}
                    onChange={(e) => setDepositForm({...depositForm, notes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDepositModalOpen(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Konfirmasi Setoran
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <PiggyBank className="h-4 w-4 mr-2" />
                Total Simpanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(savingsData.totalBalance)}
              </div>
              <p className="text-xs text-gray-500 mt-1">4 jenis rekening</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Target Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(savingsData.monthlyTarget)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Semua jenis simpanan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Setoran Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(savingsData.thisMonthDeposit)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((savingsData.thisMonthDeposit / savingsData.monthlyTarget) * 100).toFixed(1)}% dari target
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Savings Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Rekening Simpanan</CardTitle>
            <CardDescription>Daftar semua rekening simpanan Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savingsData.accounts.map((account) => (
                <Card key={account.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{account.type}</h3>
                        <p className="text-xs text-gray-500">
                          Terakhir setor: {new Date(account.lastDeposit).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      {getStatusBadge(account.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Saldo:</span>
                        <span className="font-medium">{formatCurrency(account.balance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Bunga:</span>
                        <span className="text-sm font-medium text-green-600">{account.interestRate}% / tahun</span>
                      </div>
                      {account.monthlyTarget > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Target Bulanan:</span>
                          <span className="text-sm">{formatCurrency(account.monthlyTarget)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Detail
                      </Button>
                      {account.status === 'active' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            const typeMap: {[key: string]: string} = {
                              'Simpanan Wajib': 'wajib',
                              'Simpanan Sukarela': 'sukarela',
                              'Simpanan Pokok': 'pokok',
                              'Simpanan Hari Raya': 'hari-raya'
                            };
                            setDepositForm({
                              ...depositForm, 
                              savingsType: typeMap[account.type] || ''
                            });
                            setIsDepositModalOpen(true);
                          }}
                        >
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          Setor
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>Riwayat setoran dan bunga simpanan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savingsData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.savingsType}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.description} • {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      +{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.type === 'deposit' ? 'Setoran' : 'Bunga'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}