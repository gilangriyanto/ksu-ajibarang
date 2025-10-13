import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id: string | null;
  parent_name?: string;
  level: number;
  is_active: boolean;
  created_at: string;
}

const mockAccounts: Account[] = [
  {
    id: '1',
    code: '1000',
    name: 'ASET',
    type: 'asset',
    parent_id: null,
    level: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    code: '1100',
    name: 'Kas dan Bank',
    type: 'asset',
    parent_id: '1',
    parent_name: 'ASET',
    level: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    code: '1101',
    name: 'Kas',
    type: 'asset',
    parent_id: '2',
    parent_name: 'Kas dan Bank',
    level: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'asset' as Account['type'],
    parent_id: 'none',
  });

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeLabel = (type: Account['type']) => {
    const labels = {
      asset: 'Aset',
      liability: 'Kewajiban',
      equity: 'Modal',
      revenue: 'Pendapatan',
      expense: 'Beban',
    };
    return labels[type];
  };

  const getTypeBadge = (type: Account['type']) => {
    const variants = {
      asset: 'bg-blue-100 text-blue-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-green-100 text-green-800',
      revenue: 'bg-purple-100 text-purple-800',
      expense: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge className={variants[type]}>
        {getTypeLabel(type)}
      </Badge>
    );
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'asset',
      parent_id: 'none',
    });
    setEditingAccount(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      parent_id: account.parent_id || 'none',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    const newAccount: Account = {
      id: editingAccount?.id || Date.now().toString(),
      code: formData.code,
      name: formData.name,
      type: formData.type,
      parent_id: formData.parent_id === 'none' ? null : formData.parent_id,
      parent_name: formData.parent_id !== 'none' 
        ? accounts.find(a => a.id === formData.parent_id)?.name 
        : undefined,
      level: formData.parent_id === 'none' ? 1 : 2,
      is_active: true,
      created_at: editingAccount?.created_at || new Date().toISOString(),
    };

    if (editingAccount) {
      setAccounts(accounts.map(a => a.id === editingAccount.id ? newAccount : a));
      toast.success('Akun berhasil diperbarui');
    } else {
      setAccounts([...accounts, newAccount]);
      toast.success('Akun berhasil ditambahkan');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (account: Account) => {
    setAccounts(accounts.filter(a => a.id !== account.id));
    toast.success('Akun berhasil dihapus');
  };

  const parentAccounts = accounts.filter(a => a.level === 1 || a.level === 2);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bagan Akun</h1>
          <p className="text-muted-foreground">
            Kelola struktur akun keuangan koperasi
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Akun
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Akun</CardTitle>
          <CardDescription>
            Struktur hierarki akun keuangan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari akun..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Akun</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono">{account.code}</TableCell>
                  <TableCell className="font-medium">
                    <span style={{ paddingLeft: `${(account.level - 1) * 20}px` }}>
                      {account.name}
                    </span>
                  </TableCell>
                  <TableCell>{getTypeBadge(account.type)}</TableCell>
                  <TableCell>{account.parent_name || '-'}</TableCell>
                  <TableCell>{account.level}</TableCell>
                  <TableCell>
                    <Badge className={account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {account.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleDelete(account)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Perbarui informasi akun' : 'Masukkan informasi akun baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Kode Akun
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="col-span-3"
                placeholder="1000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama Akun
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="Nama akun"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Jenis Akun
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: Account['type']) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih jenis akun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Aset</SelectItem>
                  <SelectItem value="liability">Kewajiban</SelectItem>
                  <SelectItem value="equity">Modal</SelectItem>
                  <SelectItem value="revenue">Pendapatan</SelectItem>
                  <SelectItem value="expense">Beban</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent" className="text-right">
                Parent Akun
              </Label>
              <Select
                value={formData.parent_id}
                onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih parent akun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada parent</SelectItem>
                  {parentAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit}>
              {editingAccount ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}