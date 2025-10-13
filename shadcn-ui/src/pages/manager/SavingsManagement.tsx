import React, { useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Eye,
  Download,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  FileText,
  CreditCard
} from 'lucide-react';

// Modal Components
const AddTransactionModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [transactionType, setTransactionType] = useState('deposit');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi Simpanan</DialogTitle>
          <DialogDescription>
            Masukkan detail transaksi simpanan baru
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-id" className="text-right">ID Anggota</Label>
            <Input id="member-id" className="col-span-3" placeholder="A001" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-name" className="text-right">Nama Anggota</Label>
            <Input id="member-name" className="col-span-3" placeholder="Ahmad Sutanto" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="transaction-type" className="text-right">Jenis Transaksi</Label>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deposit">Setoran</SelectItem>
                <SelectItem value="withdrawal">Penarikan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Jumlah</Label>
            <Input id="amount" type="number" className="col-span-3" placeholder="100000" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Keterangan</Label>
            <Textarea id="description" className="col-span-3" placeholder="Setoran rutin bulanan" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="transaction-date" className="text-right">Tanggal</Label>
            <Input id="transaction-date" type="date" className="col-span-3" />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onClose}>
            {transactionType === 'deposit' ? 'Tambah Setoran' : 'Tambah Penarikan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ViewAccountModal = ({ isOpen, onClose, account }: { isOpen: boolean; onClose: () => void; account: any }) => {
  if (!account) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Detail Rekening Simpanan</DialogTitle>
          <DialogDescription>
            Informasi lengkap rekening simpanan {account.memberName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">No. Rekening:</Label>
              <p className="text-lg font-mono">{account.accountNumber}</p>
            </div>
            <div>
              <Label className="font-medium">ID Anggota:</Label>
              <p>{account.memberId}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Nama Anggota:</Label>
              <p>{account.memberName}</p>
            </div>
            <div>
              <Label className="font-medium">Jenis Simpanan:</Label>
              <Badge className={account.type === 'mandatory' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                {account.type === 'mandatory' ? 'Wajib' : 'Sukarela'}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Saldo Saat Ini:</Label>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(account.balance)}
              </p>
            </div>
            <div>
              <Label className="font-medium">Status:</Label>
              <Badge className={account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {account.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Tanggal Pembukaan:</Label>
              <p>{new Date(account.openDate).toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <Label className="font-medium">Transaksi Terakhir:</Label>
              <p>{new Date(account.lastTransaction).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
          <div>
            <Label className="font-medium">Total Setoran:</Label>
            <p className="text-lg font-semibold text-blue-600">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(account.totalDeposits)}
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Cetak Mutasi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function SavingsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addTransactionModal, setAddTransactionModal] = useState(false);
  const [viewAccountModal, setViewAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Mock data for savings accounts
  const savingsAccounts = [
    {
      id: 1,
      accountNumber: '3001001001',
      memberId: 'A001',
      memberName: 'Ahmad Sutanto',
      type: 'mandatory',
      balance: 2500000,
      status: 'active',
      openDate: '2023-01-15',
      lastTransaction: '2024-01-10',
      totalDeposits: 3000000
    },
    {
      id: 2,
      accountNumber: '3001001002',
      memberId: 'A002',
      memberName: 'Siti Rahayu',
      type: 'voluntary',
      balance: 1800000,
      status: 'active',
      openDate: '2023-02-20',
      lastTransaction: '2024-01-08',
      totalDeposits: 2200000
    },
    {
      id: 3,
      accountNumber: '3001001003',
      memberId: 'A003',
      memberName: 'Budi Santoso',
      type: 'mandatory',
      balance: 500000,
      status: 'inactive',
      openDate: '2022-11-10',
      lastTransaction: '2023-12-15',
      totalDeposits: 800000
    },
    {
      id: 4,
      accountNumber: '3001001004',
      memberId: 'A004',
      memberName: 'Dewi Sartika',
      type: 'voluntary',
      balance: 3200000,
      status: 'active',
      openDate: '2024-01-05',
      lastTransaction: '2024-01-12',
      totalDeposits: 3500000
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTypeBadge = (type: string) => {
    return type === 'mandatory' ? (
      <Badge className="bg-blue-100 text-blue-800">Wajib</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800">Sukarela</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Aktif</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Tidak Aktif</Badge>
    );
  };

  const filteredAccounts = savingsAccounts.filter(account =>
    account.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountNumber.includes(searchTerm)
  );

  const handleViewAccount = (account: any) => {
    setSelectedAccount(account);
    setViewAccountModal(true);
  };

  const handleDownloadStatement = (account: any) => {
    // Mock download functionality
    const csvContent = `No. Rekening,Nama Anggota,Jenis,Saldo,Status,Tanggal Buka\n${account.accountNumber},"${account.memberName}",${account.type === 'mandatory' ? 'Wajib' : 'Sukarela'},${account.balance},${account.status === 'active' ? 'Aktif' : 'Tidak Aktif'},${new Date(account.openDate).toLocaleDateString('id-ID')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mutasi-${account.accountNumber}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics
  const totalBalance = savingsAccounts.reduce((sum, account) => sum + account.balance, 0);
  const activeAccounts = savingsAccounts.filter(account => account.status === 'active').length;
  const mandatoryAccounts = savingsAccounts.filter(account => account.type === 'mandatory').length;
  const voluntaryAccounts = savingsAccounts.filter(account => account.type === 'voluntary').length;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Simpanan</h1>
            <p className="text-gray-600 mt-1">Kelola simpanan anggota koperasi</p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setAddTransactionModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Transaksi
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Saldo</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalBalance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <PiggyBank className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rekening Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAccounts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Simpanan Wajib</p>
                  <p className="text-2xl font-bold text-gray-900">{mandatoryAccounts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Simpanan Sukarela</p>
                  <p className="text-2xl font-bold text-gray-900">{voluntaryAccounts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pencarian Rekening</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama anggota, ID, atau nomor rekening..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Savings Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Rekening Simpanan</CardTitle>
            <CardDescription>
              Menampilkan {filteredAccounts.length} dari {savingsAccounts.length} rekening
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">No. Rekening</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Anggota</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Jenis</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Saldo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Transaksi Terakhir</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => (
                      <tr key={account.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{account.accountNumber}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{account.memberName}</p>
                            <p className="text-sm text-gray-500">ID: {account.memberId}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getTypeBadge(account.type)}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(account.balance)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(account.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(account.lastTransaction).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewAccount(account)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadStatement(account)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        {searchTerm 
                          ? 'Tidak ada rekening yang sesuai dengan pencarian'
                          : 'Belum ada data rekening simpanan'
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddTransactionModal 
        isOpen={addTransactionModal} 
        onClose={() => setAddTransactionModal(false)}
      />
      <ViewAccountModal 
        isOpen={viewAccountModal} 
        onClose={() => setViewAccountModal(false)}
        account={selectedAccount}
      />
    </ManagerLayout>
  );
}