import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar, Plus, Edit, Trash2, Lock, Unlock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AccountingPeriod {
  id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed' | 'locked';
  fiscal_year: string;
  description: string;
  created_at: string;
  closed_at?: string;
  closed_by?: string;
}

const mockPeriods: AccountingPeriod[] = [
  {
    id: '1',
    period_name: 'Januari 2024',
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    status: 'closed',
    fiscal_year: '2024',
    description: 'Periode akuntansi bulan Januari 2024',
    created_at: '2024-01-01T00:00:00Z',
    closed_at: '2024-02-01T10:00:00Z',
    closed_by: 'Manager',
  },
  {
    id: '2',
    period_name: 'Februari 2024',
    start_date: '2024-02-01',
    end_date: '2024-02-29',
    status: 'open',
    fiscal_year: '2024',
    description: 'Periode akuntansi bulan Februari 2024',
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '3',
    period_name: 'Maret 2024',
    start_date: '2024-03-01',
    end_date: '2024-03-31',
    status: 'open',
    fiscal_year: '2024',
    description: 'Periode akuntansi bulan Maret 2024',
    created_at: '2024-03-01T00:00:00Z',
  },
];

export default function PeriodManagement() {
  const [periods, setPeriods] = useState<AccountingPeriod[]>(mockPeriods);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<AccountingPeriod | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    period_name: '',
    start_date: '',
    end_date: '',
    fiscal_year: new Date().getFullYear().toString(),
    description: '',
  });

  const resetForm = () => {
    setFormData({
      period_name: '',
      start_date: '',
      end_date: '',
      fiscal_year: new Date().getFullYear().toString(),
      description: '',
    });
  };

  const getStatusBadge = (status: AccountingPeriod['status']) => {
    const variants = {
      open: 'bg-green-100 text-green-800',
      closed: 'bg-yellow-100 text-yellow-800',
      locked: 'bg-red-100 text-red-800',
    };

    const labels = {
      open: 'Terbuka',
      closed: 'Tertutup',
      locked: 'Terkunci',
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (period: AccountingPeriod) => {
    if (period.status === 'locked') {
      toast.error('Periode yang terkunci tidak dapat diedit');
      return;
    }

    setSelectedPeriod(period);
    setFormData({
      period_name: period.period_name,
      start_date: period.start_date,
      end_date: period.end_date,
      fiscal_year: period.fiscal_year,
      description: period.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmitAdd = () => {
    if (!formData.period_name || !formData.start_date || !formData.end_date) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    const newPeriod: AccountingPeriod = {
      id: Date.now().toString(),
      period_name: formData.period_name,
      start_date: formData.start_date,
      end_date: formData.end_date,
      fiscal_year: formData.fiscal_year,
      description: formData.description,
      status: 'open',
      created_at: new Date().toISOString(),
    };

    setPeriods([...periods, newPeriod]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Periode akuntansi berhasil ditambahkan');
  };

  const handleSubmitEdit = () => {
    if (!selectedPeriod) return;

    if (!formData.period_name || !formData.start_date || !formData.end_date) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    const updatedPeriod: AccountingPeriod = {
      ...selectedPeriod,
      period_name: formData.period_name,
      start_date: formData.start_date,
      end_date: formData.end_date,
      fiscal_year: formData.fiscal_year,
      description: formData.description,
    };

    setPeriods(periods.map(p => p.id === selectedPeriod.id ? updatedPeriod : p));
    setIsEditDialogOpen(false);
    setSelectedPeriod(null);
    resetForm();
    toast.success('Periode akuntansi berhasil diperbarui');
  };

  const handleClosePeriod = (period: AccountingPeriod) => {
    if (period.status !== 'open') {
      toast.error('Hanya periode terbuka yang dapat ditutup');
      return;
    }

    const updatedPeriod: AccountingPeriod = {
      ...period,
      status: 'closed',
      closed_at: new Date().toISOString(),
      closed_by: 'Manager', // In real app, get from auth context
    };

    setPeriods(periods.map(p => p.id === period.id ? updatedPeriod : p));
    toast.success('Periode berhasil ditutup');
  };

  const handleReopenPeriod = (period: AccountingPeriod) => {
    if (period.status !== 'closed') {
      toast.error('Hanya periode tertutup yang dapat dibuka kembali');
      return;
    }

    const updatedPeriod: AccountingPeriod = {
      ...period,
      status: 'open',
      closed_at: undefined,
      closed_by: undefined,
    };

    setPeriods(periods.map(p => p.id === period.id ? updatedPeriod : p));
    toast.success('Periode berhasil dibuka kembali');
  };

  const handleLockPeriod = (period: AccountingPeriod) => {
    if (period.status !== 'closed') {
      toast.error('Hanya periode tertutup yang dapat dikunci');
      return;
    }

    const updatedPeriod: AccountingPeriod = {
      ...period,
      status: 'locked',
    };

    setPeriods(periods.map(p => p.id === period.id ? updatedPeriod : p));
    toast.success('Periode berhasil dikunci');
  };

  const handleUnlockPeriod = (period: AccountingPeriod) => {
    if (period.status !== 'locked') {
      toast.error('Hanya periode terkunci yang dapat dibuka kuncinya');
      return;
    }

    const updatedPeriod: AccountingPeriod = {
      ...period,
      status: 'closed',
    };

    setPeriods(periods.map(p => p.id === period.id ? updatedPeriod : p));
    toast.success('Kunci periode berhasil dibuka');
  };

  const handleDelete = (period: AccountingPeriod) => {
    if (period.status === 'closed' || period.status === 'locked') {
      toast.error('Periode yang sudah ditutup atau dikunci tidak dapat dihapus');
      return;
    }

    setPeriods(periods.filter(p => p.id !== period.id));
    toast.success('Periode berhasil dihapus');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Periode Akuntansi</h1>
          <p className="text-muted-foreground">
            Kelola periode akuntansi dan kontrol akses transaksi
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Periode
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Periode Terbuka</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {periods.filter(p => p.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Dapat menerima transaksi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Periode Tertutup</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {periods.filter(p => p.status === 'closed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Siap untuk pelaporan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Periode Terkunci</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {periods.filter(p => p.status === 'locked').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tidak dapat diubah
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Periode Akuntansi</CardTitle>
          <CardDescription>
            Kelola periode akuntansi dan status aksesnya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Periode</TableHead>
                <TableHead>Tanggal Mulai</TableHead>
                <TableHead>Tanggal Selesai</TableHead>
                <TableHead>Tahun Fiskal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ditutup Oleh</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell className="font-medium">{period.period_name}</TableCell>
                  <TableCell>{new Date(period.start_date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{new Date(period.end_date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{period.fiscal_year}</TableCell>
                  <TableCell>{getStatusBadge(period.status)}</TableCell>
                  <TableCell>
                    {period.closed_by ? (
                      <div className="text-sm">
                        <div>{period.closed_by}</div>
                        <div className="text-muted-foreground">
                          {period.closed_at && new Date(period.closed_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(period)}
                        disabled={period.status === 'locked'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Close/Reopen Period */}
                      {period.status === 'open' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-orange-600">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tutup Periode</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menutup periode {period.period_name}? 
                                Setelah ditutup, tidak ada transaksi baru yang dapat dibuat untuk periode ini.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleClosePeriod(period)}>
                                Tutup Periode
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {period.status === 'closed' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleReopenPeriod(period)}
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Lock/Unlock Period */}
                      {period.status === 'closed' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Lock className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Kunci Periode</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin mengunci periode {period.period_name}? 
                                Periode yang dikunci tidak dapat diedit atau dibuka kembali tanpa otoritas khusus.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleLockPeriod(period)}>
                                Kunci Periode
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {period.status === 'locked' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-blue-600">
                              <Unlock className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Buka Kunci Periode</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin membuka kunci periode {period.period_name}? 
                                Periode akan kembali ke status tertutup.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleUnlockPeriod(period)}>
                                Buka Kunci
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {/* Delete Period */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            disabled={period.status === 'closed' || period.status === 'locked'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Periode</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus periode {period.period_name}? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(period)}>
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Period Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Periode Akuntansi</DialogTitle>
            <DialogDescription>
              Buat periode akuntansi baru
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="periodName" className="text-right">
                Nama Periode
              </Label>
              <Input
                id="periodName"
                value={formData.period_name}
                onChange={(e) => setFormData({ ...formData, period_name: e.target.value })}
                className="col-span-3"
                placeholder="Januari 2024"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Tanggal Mulai
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                Tanggal Selesai
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fiscalYear" className="text-right">
                Tahun Fiskal
              </Label>
              <Input
                id="fiscalYear"
                value={formData.fiscal_year}
                onChange={(e) => setFormData({ ...formData, fiscal_year: e.target.value })}
                className="col-span-3"
                placeholder="2024"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Deskripsi
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="Deskripsi periode..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitAdd}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Period Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Periode Akuntansi</DialogTitle>
            <DialogDescription>
              Perbarui informasi periode akuntansi
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editPeriodName" className="text-right">
                Nama Periode
              </Label>
              <Input
                id="editPeriodName"
                value={formData.period_name}
                onChange={(e) => setFormData({ ...formData, period_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editStartDate" className="text-right">
                Tanggal Mulai
              </Label>
              <Input
                id="editStartDate"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editEndDate" className="text-right">
                Tanggal Selesai
              </Label>
              <Input
                id="editEndDate"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editFiscalYear" className="text-right">
                Tahun Fiskal
              </Label>
              <Input
                id="editFiscalYear"
                value={formData.fiscal_year}
                onChange={(e) => setFormData({ ...formData, fiscal_year: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editDescription" className="text-right">
                Deskripsi
              </Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitEdit}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}