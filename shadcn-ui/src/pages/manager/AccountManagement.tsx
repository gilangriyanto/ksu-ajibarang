import React, { useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Download,
  Building,
  CreditCard,
  Wallet,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// Modal Components
const AddAccountModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Tambah Akun Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi akun baru untuk chart of accounts.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account-code" className="text-right">Kode Akun</Label>
            <Input id="account-code" className="col-span-3" placeholder="1-1001" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account-name" className="text-right">Nama Akun</Label>
            <Input id="account-name" className="col-span-3" placeholder="Kas" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account-type" className="text-right">Jenis Akun</Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih jenis akun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Aktiva</SelectItem>
                <SelectItem value="liability">Pasiva</SelectItem>
                <SelectItem value="equity">Modal</SelectItem>
                <SelectItem value="revenue">Pendapatan</SelectItem>
                <SelectItem value="expense">Beban</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account-category" className="text-right">Kategori</Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Lancar</SelectItem>
                <SelectItem value="non-current">Tidak Lancar</SelectItem>
                <SelectItem value="operating">Operasional</SelectItem>
                <SelectItem value="non-operating">Non-Operasional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="initial-balance" className="text-right">Saldo Awal</Label>
            <Input id="initial-balance" type="number" className="col-span-3" placeholder="0" />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onClose}>Tambah Akun</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function AccountManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addAccountModal, setAddAccountModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - Chart of Accounts
  const accounts = [
    {
      id: '1',
      code: '1-1001',
      name: 'Kas',
      type: 'asset',
      category: 'current',
      balance: 50000000,
      status: 'active'
    },
    {
      id: '2',
      code: '1-1002',
      name: 'Bank BCA',
      type: 'asset',
      category: 'current',
      balance: 125000000,
      status: 'active'
    },
    {
      id: '3',
      code: '1-1101',
      name: 'Piutang Anggota',
      type: 'asset',
      category: 'current',
      balance: 85000000,
      status: 'active'
    },
    {
      id: '4',
      code: '1-2001',
      name: 'Gedung Kantor',
      type: 'asset',
      category: 'non-current',
      balance: 500000000,
      status: 'active'
    },
    {
      id: '5',
      code: '2-1001',
      name: 'Utang Usaha',
      type: 'liability',
      category: 'current',
      balance: 25000000,
      status: 'active'
    },
    {
      id: '6',
      code: '3-1001',
      name: 'Modal Koperasi',
      type: 'equity',
      category: 'current',
      balance: 200000000,
      status: 'active'
    },
    {
      id: '7',
      code: '4-1001',
      name: 'Pendapatan Jasa',
      type: 'revenue',
      category: 'operating',
      balance: 45000000,
      status: 'active'
    },
    {
      id: '8',
      code: '5-1001',
      name: 'Beban Operasional',
      type: 'expense',
      category: 'operating',
      balance: 15000000,
      status: 'active'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAccountTypeLabel = (type: string) => {
    const types = {
      asset: 'Aktiva',
      liability: 'Pasiva',
      equity: 'Modal',
      revenue: 'Pendapatan',
      expense: 'Beban'
    };
    return types[type as keyof typeof types] || type;
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      asset: 'bg-blue-100 text-blue-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-green-100 text-green-800',
      revenue: 'bg-purple-100 text-purple-800',
      expense: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || account.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const accountSummary = {
    totalAssets: accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0),
    totalLiabilities: accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0),
    totalEquity: accounts.filter(a => a.type === 'equity').reduce((sum, a) => sum + a.balance, 0),
    totalRevenue: accounts.filter(a => a.type === 'revenue').reduce((sum, a) => sum + a.balance, 0),
    totalExpense: accounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.balance, 0)
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Akun</h1>
            <p className="text-gray-600 mt-1">Kelola chart of accounts dan struktur akuntansi</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setAddAccountModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Akun
          </Button>
        </div>

        {/* Account Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Aktiva</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(accountSummary.totalAssets)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pasiva</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(accountSummary.totalLiabilities)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wallet className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Modal</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(accountSummary.totalEquity)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendapatan</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(accountSummary.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Beban</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(accountSummary.totalExpense)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari kode atau nama akun..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="asset">Aktiva</SelectItem>
                    <SelectItem value="liability">Pasiva</SelectItem>
                    <SelectItem value="equity">Modal</SelectItem>
                    <SelectItem value="revenue">Pendapatan</SelectItem>
                    <SelectItem value="expense">Beban</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Chart of Accounts</CardTitle>
            <CardDescription>
              Menampilkan {filteredAccounts.length} dari {accounts.length} akun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Kode Akun</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nama Akun</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Jenis</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Kategori</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Saldo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono font-medium">{account.code}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{account.name}</td>
                      <td className="py-3 px-4">
                        <Badge className={getAccountTypeColor(account.type)}>
                          {getAccountTypeLabel(account.type)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 capitalize">{account.category}</td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(account.balance)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {account.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Balance Check */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-800">Keseimbangan Neraca</h3>
                <p className="text-sm text-blue-700">
                  Aktiva: {formatCurrency(accountSummary.totalAssets)} | 
                  Pasiva + Modal: {formatCurrency(accountSummary.totalLiabilities + accountSummary.totalEquity)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">Selisih:</p>
                <p className={`font-bold ${
                  accountSummary.totalAssets === (accountSummary.totalLiabilities + accountSummary.totalEquity) 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(accountSummary.totalAssets - (accountSummary.totalLiabilities + accountSummary.totalEquity))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddAccountModal 
        isOpen={addAccountModal} 
        onClose={() => setAddAccountModal(false)}
      />
    </ManagerLayout>
  );
}