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
import { Search, Edit, Trash2, Plus, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  entry_number: string;
  date: string;
  description: string;
  reference: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'reversed';
  created_at: string;
  details: JournalDetail[];
}

interface JournalDetail {
  id: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  description: string;
}

const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    entry_number: 'JE-2024-001',
    date: '2024-01-28',
    description: 'Setoran Simpanan Anggota',
    reference: 'DEP-001',
    total_debit: 5000000,
    total_credit: 5000000,
    status: 'posted',
    created_at: '2024-01-28T10:00:00Z',
    details: [
      {
        id: '1a',
        account_code: '1-1100',
        account_name: 'Kas',
        debit: 5000000,
        credit: 0,
        description: 'Penerimaan setoran simpanan',
      },
      {
        id: '1b',
        account_code: '3-1200',
        account_name: 'Simpanan Pokok',
        debit: 0,
        credit: 5000000,
        description: 'Simpanan pokok anggota',
      },
    ],
  },
  {
    id: '2',
    entry_number: 'JE-2024-002',
    date: '2024-01-27',
    description: 'Pencairan Pinjaman',
    reference: 'LOAN-001',
    total_debit: 25000000,
    total_credit: 25000000,
    status: 'posted',
    created_at: '2024-01-27T14:30:00Z',
    details: [
      {
        id: '2a',
        account_code: '1-1300',
        account_name: 'Piutang Anggota',
        debit: 25000000,
        credit: 0,
        description: 'Piutang pinjaman anggota',
      },
      {
        id: '2b',
        account_code: '1-1100',
        account_name: 'Kas',
        debit: 0,
        credit: 25000000,
        description: 'Pencairan pinjaman',
      },
    ],
  },
  {
    id: '3',
    entry_number: 'JE-2024-003',
    date: '2024-01-26',
    description: 'Jurnal Penyesuaian - Beban Operasional',
    reference: 'ADJ-001',
    total_debit: 2500000,
    total_credit: 2500000,
    status: 'draft',
    created_at: '2024-01-26T16:45:00Z',
    details: [
      {
        id: '3a',
        account_code: '5-1000',
        account_name: 'Beban Operasional',
        debit: 2500000,
        credit: 0,
        description: 'Beban listrik dan air',
      },
      {
        id: '3b',
        account_code: '2-1000',
        account_name: 'Utang Usaha',
        debit: 0,
        credit: 2500000,
        description: 'Utang tagihan listrik dan air',
      },
    ],
  },
];

export default function JournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    description: '',
    reference: '',
    date: '',
    details: [] as JournalDetail[],
  });

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.entry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const getStatusBadge = (status: JournalEntry['status']) => {
    const variants = {
      draft: 'bg-yellow-100 text-yellow-800',
      posted: 'bg-green-100 text-green-800',
      reversed: 'bg-red-100 text-red-800',
    };

    const labels = {
      draft: 'Draft',
      posted: 'Posted',
      reversed: 'Reversed',
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const handleView = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (entry: JournalEntry) => {
    if (entry.status === 'posted') {
      toast.error('Jurnal yang sudah di-posting tidak dapat diedit');
      return;
    }

    setSelectedEntry(entry);
    setEditForm({
      description: entry.description,
      reference: entry.reference,
      date: entry.date,
      details: [...entry.details],
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedEntry) return;

    const totalDebit = editForm.details.reduce((sum, detail) => sum + detail.debit, 0);
    const totalCredit = editForm.details.reduce((sum, detail) => sum + detail.credit, 0);

    if (totalDebit !== totalCredit) {
      toast.error('Total debit dan credit harus seimbang');
      return;
    }

    const updatedEntry: JournalEntry = {
      ...selectedEntry,
      description: editForm.description,
      reference: editForm.reference,
      date: editForm.date,
      total_debit: totalDebit,
      total_credit: totalCredit,
      details: editForm.details,
    };

    setEntries(entries.map(e => e.id === selectedEntry.id ? updatedEntry : e));
    setIsEditDialogOpen(false);
    setSelectedEntry(null);
    toast.success('Jurnal berhasil diperbarui');
  };

  const handlePost = (entry: JournalEntry) => {
    if (entry.status !== 'draft') {
      toast.error('Hanya jurnal draft yang dapat di-posting');
      return;
    }

    setEntries(entries.map(e => 
      e.id === entry.id ? { ...e, status: 'posted' as const } : e
    ));
    toast.success('Jurnal berhasil di-posting');
  };

  const handleReverse = (entry: JournalEntry) => {
    if (entry.status !== 'posted') {
      toast.error('Hanya jurnal yang sudah di-posting yang dapat di-reverse');
      return;
    }

    setEntries(entries.map(e => 
      e.id === entry.id ? { ...e, status: 'reversed' as const } : e
    ));
    toast.success('Jurnal berhasil di-reverse');
  };

  const handleDelete = (entry: JournalEntry) => {
    if (entry.status === 'posted') {
      toast.error('Jurnal yang sudah di-posting tidak dapat dihapus');
      return;
    }

    setEntries(entries.filter(e => e.id !== entry.id));
    toast.success('Jurnal berhasil dihapus');
  };

  const updateDetailField = (index: number, field: keyof JournalDetail, value: string | number) => {
    const newDetails = [...editForm.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setEditForm({ ...editForm, details: newDetails });
  };

  const addDetailRow = () => {
    const newDetail: JournalDetail = {
      id: Date.now().toString(),
      account_code: '',
      account_name: '',
      debit: 0,
      credit: 0,
      description: '',
    };
    setEditForm({ ...editForm, details: [...editForm.details, newDetail] });
  };

  const removeDetailRow = (index: number) => {
    const newDetails = editForm.details.filter((_, i) => i !== index);
    setEditForm({ ...editForm, details: newDetails });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jurnal Entries</h1>
          <p className="text-muted-foreground">
            Kelola dan pantau semua jurnal transaksi
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Jurnal Entries</CardTitle>
          <CardDescription>
            Semua jurnal transaksi yang telah dibuat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari jurnal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="reversed">Reversed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Jurnal</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Referensi</TableHead>
                <TableHead>Total Debit</TableHead>
                <TableHead>Total Credit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono">{entry.entry_number}</TableCell>
                  <TableCell>{new Date(entry.date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="font-mono">{entry.reference}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(entry.total_debit)}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(entry.total_credit)}</TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(entry)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(entry)}
                        disabled={entry.status === 'posted'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {entry.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePost(entry)}
                          className="text-green-600"
                        >
                          Post
                        </Button>
                      )}
                      {entry.status === 'posted' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReverse(entry)}
                          className="text-orange-600"
                        >
                          Reverse
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            disabled={entry.status === 'posted'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Jurnal</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus jurnal {entry.entry_number}? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(entry)}>
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Jurnal Entry</DialogTitle>
            <DialogDescription>
              {selectedEntry?.entry_number} - {selectedEntry?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tanggal</Label>
                  <p className="text-sm">{new Date(selectedEntry.date).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Referensi</Label>
                  <p className="text-sm">{selectedEntry.reference}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedEntry.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Dibuat</Label>
                  <p className="text-sm">{new Date(selectedEntry.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Detail Transaksi</Label>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Akun</TableHead>
                      <TableHead>Nama Akun</TableHead>
                      <TableHead>Debit</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEntry.details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell className="font-mono">{detail.account_code}</TableCell>
                        <TableCell>{detail.account_name}</TableCell>
                        <TableCell className="font-mono">
                          {detail.debit > 0 ? formatCurrency(detail.debit) : '-'}
                        </TableCell>
                        <TableCell className="font-mono">
                          {detail.credit > 0 ? formatCurrency(detail.credit) : '-'}
                        </TableCell>
                        <TableCell>{detail.description}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell className="font-mono">{formatCurrency(selectedEntry.total_debit)}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(selectedEntry.total_credit)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Edit Jurnal Entry</DialogTitle>
            <DialogDescription>
              Perbarui informasi jurnal entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="editDate">Tanggal</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editReference">Referensi</Label>
                <Input
                  id="editReference"
                  value={editForm.reference}
                  onChange={(e) => setEditForm({ ...editForm, reference: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editDescription">Deskripsi</Label>
                <Input
                  id="editDescription"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm font-medium">Detail Transaksi</Label>
                <Button size="sm" onClick={addDetailRow}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Baris
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Akun</TableHead>
                    <TableHead>Nama Akun</TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editForm.details.map((detail, index) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        <Input
                          value={detail.account_code}
                          onChange={(e) => updateDetailField(index, 'account_code', e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={detail.account_name}
                          onChange={(e) => updateDetailField(index, 'account_name', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={detail.debit}
                          onChange={(e) => updateDetailField(index, 'debit', parseFloat(e.target.value) || 0)}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={detail.credit}
                          onChange={(e) => updateDetailField(index, 'credit', parseFloat(e.target.value) || 0)}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={detail.description}
                          onChange={(e) => updateDetailField(index, 'description', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDetailRow(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell>
                      {formatCurrency(editForm.details.reduce((sum, d) => sum + d.debit, 0))}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(editForm.details.reduce((sum, d) => sum + d.credit, 0))}
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}