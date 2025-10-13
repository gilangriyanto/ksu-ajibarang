import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  balance: number;
  status: string;
  description: string;
}

export default function ChartOfAccounts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for accounts
  const [accounts] = useState<Account[]>([
    {
      id: '1',
      code: '1000',
      name: 'Kas',
      type: 'asset',
      category: 'current_asset',
      balance: 50000000,
      status: 'active',
      description: 'Kas di tangan dan bank'
    },
    {
      id: '2',
      code: '1100',
      name: 'Piutang Anggota',
      type: 'asset',
      category: 'current_asset',
      balance: 25000000,
      status: 'active',
      description: 'Piutang dari anggota koperasi'
    },
    {
      id: '3',
      code: '1200',
      name: 'Inventaris Kantor',
      type: 'asset',
      category: 'fixed_asset',
      balance: 75000000,
      status: 'active',
      description: 'Peralatan dan inventaris kantor'
    },
    {
      id: '4',
      code: '2000',
      name: 'Hutang Usaha',
      type: 'liability',
      category: 'current_liability',
      balance: 15000000,
      status: 'active',
      description: 'Hutang kepada supplier'
    },
    {
      id: '5',
      code: '3000',
      name: 'Modal Koperasi',
      type: 'equity',
      category: 'capital',
      balance: 100000000,
      status: 'active',
      description: 'Modal dasar koperasi'
    },
    {
      id: '6',
      code: '4000',
      name: 'Pendapatan Jasa',
      type: 'revenue',
      category: 'operating_revenue',
      balance: 30000000,
      status: 'active',
      description: 'Pendapatan dari jasa koperasi'
    },
    {
      id: '7',
      code: '5000',
      name: 'Beban Operasional',
      type: 'expense',
      category: 'operating_expense',
      balance: 20000000,
      status: 'active',
      description: 'Biaya operasional koperasi'
    }
  ]);

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'asset':
        return <Badge className="bg-blue-100 text-blue-800">Aset</Badge>;
      case 'liability':
        return <Badge className="bg-red-100 text-red-800">Kewajiban</Badge>;
      case 'equity':
        return <Badge className="bg-green-100 text-green-800">Modal</Badge>;
      case 'revenue':
        return <Badge className="bg-purple-100 text-purple-800">Pendapatan</Badge>;
      case 'expense':
        return <Badge className="bg-orange-100 text-orange-800">Beban</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Aktif</Badge>
    ) : (
      <Badge variant="secondary">Tidak Aktif</Badge>
    );
  };

  const handleViewAccount = (account: Account) => {
    toast.info(`Detail akun: ${account.name}`, {
      description: `${account.code} - ${formatCurrency(account.balance)}`
    });
  };

  const handleEditAccount = (account: Account) => {
    toast.info(`Edit akun: ${account.name}`, {
      description: 'Fitur edit akun akan segera tersedia'
    });
  };

  const handleDeleteAccount = (account: Account) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus akun ${account.name}?`)) {
      toast.success(`Akun ${account.name} berhasil dihapus`);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <BackButton to="/manager" />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
            <p className="text-gray-600">Kelola daftar akun keuangan koperasi</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Akun
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Daftar Akun</span>
                </CardTitle>
                <CardDescription>
                  Kelola chart of accounts untuk sistem akuntansi
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari akun..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="asset">Aset</SelectItem>
                    <SelectItem value="liability">Kewajiban</SelectItem>
                    <SelectItem value="equity">Modal</SelectItem>
                    <SelectItem value="revenue">Pendapatan</SelectItem>
                    <SelectItem value="expense">Beban</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Akun</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono font-medium">{account.code}</TableCell>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>{getTypeBadge(account.type)}</TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {formatCurrency(account.balance)}
                      </TableCell>
                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">{account.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAccount(account)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAccount(account)}
                            className="h-8 w-8 p-0 hover:bg-green-50"
                            title="Edit Akun"
                          >
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAccount(account)}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            title="Hapus Akun"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredAccounts.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada akun yang ditemukan</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}