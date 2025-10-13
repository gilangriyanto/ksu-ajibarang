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
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Download,
  BookOpen,
  FileText,
  Calculator,
  RefreshCw,
  RotateCcw,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// Mock data for journal entries
const journalEntries = [
  {
    id: 'JU001',
    date: '2024-01-15',
    type: 'general',
    reference: 'Pinjaman-001',
    description: 'Pencairan pinjaman Ahmad Sutanto',
    entries: [
      { account: '1-1101', accountName: 'Piutang Anggota', debit: 5000000, credit: 0 },
      { account: '1-1001', accountName: 'Kas', debit: 0, credit: 5000000 }
    ],
    totalDebit: 5000000,
    totalCredit: 5000000,
    status: 'posted',
    createdBy: 'System Auto',
    source: 'loan_disbursement'
  },
  {
    id: 'JU002',
    date: '2024-01-16',
    type: 'special',
    reference: 'Bayar-001',
    description: 'Pembayaran angsuran Ahmad Sutanto',
    entries: [
      { account: '1-1001', accountName: 'Kas', debit: 235000, credit: 0 },
      { account: '4-1001', accountName: 'Pendapatan Jasa', debit: 0, credit: 35000 },
      { account: '1-1101', accountName: 'Piutang Anggota', debit: 0, credit: 200000 }
    ],
    totalDebit: 235000,
    totalCredit: 235000,
    status: 'posted',
    createdBy: 'System Auto',
    source: 'loan_payment'
  },
  {
    id: 'JU003',
    date: '2024-01-17',
    type: 'general',
    reference: 'Simpan-001',
    description: 'Setoran simpanan Siti Rahayu',
    entries: [
      { account: '1-1001', accountName: 'Kas', debit: 250000, credit: 0 },
      { account: '2-2001', accountName: 'Simpanan Anggota', debit: 0, credit: 250000 }
    ],
    totalDebit: 250000,
    totalCredit: 250000,
    status: 'posted',
    createdBy: 'System Auto',
    source: 'savings_deposit'
  },
  {
    id: 'JP001',
    date: '2024-01-31',
    type: 'adjustment',
    reference: 'Penyesuaian-001',
    description: 'Penyusutan aset tetap bulan Januari',
    entries: [
      { account: '5-2001', accountName: 'Beban Penyusutan', debit: 3125000, credit: 0 },
      { account: '1-2002', accountName: 'Akm. Penyusutan Aset Tetap', debit: 0, credit: 3125000 }
    ],
    totalDebit: 3125000,
    totalCredit: 3125000,
    status: 'posted',
    createdBy: 'System Auto',
    source: 'depreciation'
  }
];

// Modal Components
const AddJournalModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [entries, setEntries] = useState([
    { account: '', accountName: '', debit: 0, credit: 0 },
    { account: '', accountName: '', debit: 0, credit: 0 }
  ]);

  const addEntry = () => {
    setEntries([...entries, { account: '', accountName: '', debit: 0, credit: 0 }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Tambah Jurnal Manual</DialogTitle>
          <DialogDescription>
            Buat jurnal entry manual untuk transaksi khusus.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="journal-date" className="text-right">Tanggal</Label>
            <Input id="journal-date" type="date" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="journal-ref" className="text-right">Referensi</Label>
            <Input id="journal-ref" className="col-span-3" placeholder="REF-001" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="journal-desc" className="text-right">Deskripsi</Label>
            <Textarea id="journal-desc" className="col-span-3" placeholder="Deskripsi transaksi..." />
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <Label className="font-medium">Jurnal Entries:</Label>
              <Button type="button" variant="outline" size="sm" onClick={addEntry}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Baris
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600">
                <div className="col-span-4">Akun</div>
                <div className="col-span-3">Debit</div>
                <div className="col-span-3">Kredit</div>
                <div className="col-span-2">Aksi</div>
              </div>
              
              {entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <Select>
                    <SelectTrigger className="col-span-4">
                      <SelectValue placeholder="Pilih akun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-1001">1-1001 - Kas</SelectItem>
                      <SelectItem value="1-1002">1-1002 - Bank BCA</SelectItem>
                      <SelectItem value="1-1101">1-1101 - Piutang Anggota</SelectItem>
                      <SelectItem value="2-2001">2-2001 - Simpanan Anggota</SelectItem>
                      <SelectItem value="4-1001">4-1001 - Pendapatan Jasa</SelectItem>
                      <SelectItem value="5-1001">5-1001 - Beban Operasional</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="col-span-3"
                    value={entry.debit || ''}
                    onChange={(e) => {
                      const newEntries = [...entries];
                      newEntries[index].debit = parseFloat(e.target.value) || 0;
                      setEntries(newEntries);
                    }}
                  />
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="col-span-3"
                    value={entry.credit || ''}
                    onChange={(e) => {
                      const newEntries = [...entries];
                      newEntries[index].credit = parseFloat(e.target.value) || 0;
                      setEntries(newEntries);
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="col-span-2"
                    onClick={() => removeEntry(index)}
                    disabled={entries.length <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">Total Debit: </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalDebit)}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total Kredit: </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalCredit)}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Selisih: </span>
                  <span className={`font-medium ${totalDebit === totalCredit ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(totalDebit - totalCredit))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onClose} disabled={totalDebit !== totalCredit}>
            Simpan Jurnal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ViewJournalModal = ({ isOpen, onClose, journal }: { isOpen: boolean; onClose: () => void; journal: any }) => {
  if (!journal) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Detail Jurnal - {journal.id}</DialogTitle>
          <DialogDescription>
            Rincian jurnal entry dan posting
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Tanggal:</Label>
              <p>{new Date(journal.date).toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <Label className="font-medium">Referensi:</Label>
              <p>{journal.reference}</p>
            </div>
          </div>
          <div>
            <Label className="font-medium">Deskripsi:</Label>
            <p>{journal.description}</p>
          </div>
          <div>
            <Label className="font-medium">Jurnal Entries:</Label>
            <div className="mt-2 border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm font-medium">Akun</th>
                    <th className="text-right py-2 px-3 text-sm font-medium">Debit</th>
                    <th className="text-right py-2 px-3 text-sm font-medium">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {journal.entries.map((entry: any, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="py-2 px-3">
                        <div>
                          <p className="font-medium">{entry.account}</p>
                          <p className="text-sm text-gray-600">{entry.accountName}</p>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        {entry.debit > 0 ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(entry.debit) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        {entry.credit > 0 ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(entry.credit) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td className="py-2 px-3 font-medium">Total</td>
                    <td className="py-2 px-3 text-right font-bold">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(journal.totalDebit)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(journal.totalCredit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Status:</Label>
              <Badge className={journal.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {journal.status === 'posted' ? 'Posted' : 'Draft'}
              </Badge>
            </div>
            <div>
              <Label className="font-medium">Dibuat oleh:</Label>
              <p>{journal.createdBy}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Accounting() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addJournalModal, setAddJournalModal] = useState(false);
  const [viewJournalModal, setViewJournalModal] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [selectedType, setSelectedType] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getJournalTypeLabel = (type: string) => {
    const types = {
      general: 'Jurnal Umum',
      special: 'Jurnal Khusus',
      adjustment: 'Jurnal Penyesuaian',
      closing: 'Jurnal Penutup',
      reversing: 'Jurnal Pembalik'
    };
    return types[type as keyof typeof types] || type;
  };

  const getJournalTypeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      special: 'bg-green-100 text-green-800',
      adjustment: 'bg-purple-100 text-purple-800',
      closing: 'bg-red-100 text-red-800',
      reversing: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSourceLabel = (source: string) => {
    const sources = {
      loan_disbursement: 'Pencairan Pinjaman',
      loan_payment: 'Pembayaran Pinjaman',
      savings_deposit: 'Setoran Simpanan',
      savings_withdrawal: 'Penarikan Simpanan',
      depreciation: 'Penyusutan Aset',
      manual: 'Manual Entry'
    };
    return sources[source as keyof typeof sources] || source;
  };

  const filteredJournals = journalEntries.filter(journal => {
    const matchesSearch = journal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         journal.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         journal.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || journal.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleViewJournal = (journal: any) => {
    setSelectedJournal(journal);
    setViewJournalModal(true);
  };

  const journalSummary = {
    totalEntries: journalEntries.length,
    totalDebit: journalEntries.reduce((sum, journal) => sum + journal.totalDebit, 0),
    totalCredit: journalEntries.reduce((sum, journal) => sum + journal.totalCredit, 0),
    autoGenerated: journalEntries.filter(j => j.createdBy === 'System Auto').length,
    manualEntries: journalEntries.filter(j => j.createdBy !== 'System Auto').length
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Akuntansi & Jurnal</h1>
            <p className="text-gray-600 mt-1">Kelola jurnal keuangan dan posting akuntansi</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setAddJournalModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Jurnal
          </Button>
        </div>

        {/* Journal Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jurnal</p>
                  <p className="text-2xl font-bold text-gray-900">{journalSummary.totalEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Debit</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(journalSummary.totalDebit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Kredit</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(journalSummary.totalCredit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <RefreshCw className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Auto Generated</p>
                  <p className="text-2xl font-bold text-purple-600">{journalSummary.autoGenerated}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Edit className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Manual Entry</p>
                  <p className="text-2xl font-bold text-orange-600">{journalSummary.manualEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different journal types */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Semua Jurnal</TabsTrigger>
            <TabsTrigger value="general">Jurnal Umum</TabsTrigger>
            <TabsTrigger value="special">Jurnal Khusus</TabsTrigger>
            <TabsTrigger value="adjustment">Jurnal Penyesuaian</TabsTrigger>
            <TabsTrigger value="closing">Jurnal Penutup</TabsTrigger>
            <TabsTrigger value="reversing">Jurnal Pembalik</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
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
                        placeholder="Cari referensi, deskripsi, atau ID jurnal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Jenis</SelectItem>
                        <SelectItem value="general">Jurnal Umum</SelectItem>
                        <SelectItem value="special">Jurnal Khusus</SelectItem>
                        <SelectItem value="adjustment">Jurnal Penyesuaian</SelectItem>
                        <SelectItem value="closing">Jurnal Penutup</SelectItem>
                        <SelectItem value="reversing">Jurnal Pembalik</SelectItem>
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

            {/* Journal Entries Table */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Jurnal</CardTitle>
                <CardDescription>
                  Menampilkan {filteredJournals.length} dari {journalEntries.length} jurnal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ID Jurnal</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Tanggal</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Jenis</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Referensi</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Deskripsi</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Debit</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Kredit</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJournals.map((journal) => (
                        <tr key={journal.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono font-medium">{journal.id}</td>
                          <td className="py-3 px-4">
                            {new Date(journal.date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getJournalTypeColor(journal.type)}>
                              {getJournalTypeLabel(journal.type)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-medium">{journal.reference}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{journal.description}</p>
                              <p className="text-sm text-gray-500">{getSourceLabel(journal.source)}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-green-600">
                            {formatCurrency(journal.totalDebit)}
                          </td>
                          <td className="py-3 px-4 font-medium text-red-600">
                            {formatCurrency(journal.totalCredit)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={journal.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {journal.status === 'posted' ? 'Posted' : 'Draft'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewJournal(journal)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {journal.createdBy !== 'System Auto' && (
                                <>
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tab contents would be similar but filtered by type */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Jurnal Umum</CardTitle>
                <CardDescription>Jurnal untuk transaksi umum dan manual entry</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Jurnal umum akan ditampilkan di sini...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="special">
            <Card>
              <CardHeader>
                <CardTitle>Jurnal Khusus</CardTitle>
                <CardDescription>Jurnal otomatis dari transaksi pinjaman dan simpanan</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Jurnal khusus akan ditampilkan di sini...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adjustment">
            <Card>
              <CardHeader>
                <CardTitle>Jurnal Penyesuaian</CardTitle>
                <CardDescription>Jurnal untuk penyesuaian akhir periode</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Jurnal penyesuaian akan ditampilkan di sini...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="closing">
            <Card>
              <CardHeader>
                <CardTitle>Jurnal Penutup</CardTitle>
                <CardDescription>Jurnal penutup untuk akhir periode akuntansi</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Jurnal penutup akan ditampilkan di sini...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reversing">
            <Card>
              <CardHeader>
                <CardTitle>Jurnal Pembalik</CardTitle>
                <CardDescription>Jurnal pembalik untuk awal periode berikutnya</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Jurnal pembalik akan ditampilkan di sini...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddJournalModal 
        isOpen={addJournalModal} 
        onClose={() => setAddJournalModal(false)}
      />
      <ViewJournalModal 
        isOpen={viewJournalModal} 
        onClose={() => setViewJournalModal(false)}
        journal={selectedJournal}
      />
    </ManagerLayout>
  );
}