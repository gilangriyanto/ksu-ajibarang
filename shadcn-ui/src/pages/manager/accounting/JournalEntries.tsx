import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Filter,
  Download,
  Calendar,
  DollarSign,
  BookOpen,
  Settings,
  TrendingUp,
  RefreshCw,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  type: 'general' | 'special' | 'adjustment' | 'closing' | 'reversing';
  source: 'manual' | 'savings' | 'loan' | 'payment' | 'system';
  entries: {
    account: string;
    accountName: string;
    debit: number;
    credit: number;
  }[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'reversed';
  createdBy: string;
  createdAt: string;
}

export default function JournalEntries() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Mock data for journal entries - automatically generated from transactions
  const [journalEntries] = useState<JournalEntry[]>([
    // Savings Transaction Entries
    {
      id: 'JE001',
      date: '2024-01-28',
      reference: 'SAV-001',
      description: 'Setoran Simpanan Wajib - Dr. Ahmad Santoso',
      type: 'general',
      source: 'savings',
      entries: [
        { account: '1000', accountName: 'Kas', debit: 100000, credit: 0 },
        { account: '2100', accountName: 'Simpanan Anggota', debit: 0, credit: 100000 }
      ],
      totalDebit: 100000,
      totalCredit: 100000,
      status: 'posted',
      createdBy: 'System',
      createdAt: '2024-01-28 10:30:00'
    },
    {
      id: 'JE002',
      date: '2024-01-25',
      reference: 'SAV-002',
      description: 'Setoran Simpanan Sukarela - Dr. Ahmad Santoso',
      type: 'general',
      source: 'savings',
      entries: [
        { account: '1000', accountName: 'Kas', debit: 500000, credit: 0 },
        { account: '2101', accountName: 'Simpanan Sukarela', debit: 0, credit: 500000 }
      ],
      totalDebit: 500000,
      totalCredit: 500000,
      status: 'posted',
      createdBy: 'System',
      createdAt: '2024-01-25 14:15:00'
    },
    // Loan Transaction Entries
    {
      id: 'JE003',
      date: '2024-01-20',
      reference: 'LOAN-001',
      description: 'Pencairan Pinjaman - Budi Prasetyo',
      type: 'general',
      source: 'loan',
      entries: [
        { account: '1100', accountName: 'Piutang Anggota', debit: 2000000, credit: 0 },
        { account: '1000', accountName: 'Kas', debit: 0, credit: 2000000 }
      ],
      totalDebit: 2000000,
      totalCredit: 2000000,
      status: 'posted',
      createdBy: 'System',
      createdAt: '2024-01-20 09:45:00'
    },
    // Payment Transaction Entries
    {
      id: 'JE004',
      date: '2024-01-15',
      reference: 'PAY-001',
      description: 'Pembayaran Angsuran - Dr. Ahmad Santoso',
      type: 'general',
      source: 'payment',
      entries: [
        { account: '1000', accountName: 'Kas', debit: 235442, credit: 0 },
        { account: '1100', accountName: 'Piutang Anggota', debit: 0, credit: 200000 },
        { account: '4100', accountName: 'Pendapatan Bunga', debit: 0, credit: 35442 }
      ],
      totalDebit: 235442,
      totalCredit: 235442,
      status: 'posted',
      createdBy: 'System',
      createdAt: '2024-01-15 11:20:00'
    },
    // Special Journal Entries
    {
      id: 'JE005',
      date: '2024-01-31',
      reference: 'SJ-001',
      description: 'Jurnal Khusus - Akrual Bunga Pinjaman',
      type: 'special',
      source: 'system',
      entries: [
        { account: '1110', accountName: 'Bunga Pinjaman yang Masih Harus Diterima', debit: 150000, credit: 0 },
        { account: '4100', accountName: 'Pendapatan Bunga', debit: 0, credit: 150000 }
      ],
      totalDebit: 150000,
      totalCredit: 150000,
      status: 'posted',
      createdBy: 'System',
      createdAt: '2024-01-31 23:59:00'
    },
    // Adjustment Journal Entries
    {
      id: 'JE006',
      date: '2024-01-31',
      reference: 'AJ-001',
      description: 'Jurnal Penyesuaian - Penyusutan Aset Tetap',
      type: 'adjustment',
      source: 'system',
      entries: [
        { account: '5200', accountName: 'Beban Penyusutan', debit: 500000, credit: 0 },
        { account: '1300', accountName: 'Akumulasi Penyusutan', debit: 0, credit: 500000 }
      ],
      totalDebit: 500000,
      totalCredit: 500000,
      status: 'posted',
      createdBy: 'System',
      createdAt: '2024-01-31 23:58:00'
    },
    // Closing Journal Entries
    {
      id: 'JE007',
      date: '2024-01-31',
      reference: 'CJ-001',
      description: 'Jurnal Penutup - Penutupan Akun Pendapatan',
      type: 'closing',
      source: 'system',
      entries: [
        { account: '4100', accountName: 'Pendapatan Bunga', debit: 185442, credit: 0 },
        { account: '3900', accountName: 'Ikhtisar Laba Rugi', debit: 0, credit: 185442 }
      ],
      totalDebit: 185442,
      totalCredit: 185442,
      status: 'posted',
      createdBy: 'System',
      createdAt: '2024-01-31 23:57:00'
    },
    // Reversing Journal Entries
    {
      id: 'JE008',
      date: '2024-02-01',
      reference: 'RJ-001',
      description: 'Jurnal Pembalik - Pembalikan Akrual Bunga',
      type: 'reversing',
      source: 'system',
      entries: [
        { account: '4100', accountName: 'Pendapatan Bunga', debit: 150000, credit: 0 },
        { account: '1110', accountName: 'Bunga Pinjaman yang Masih Harus Diterima', debit: 0, credit: 150000 }
      ],
      totalDebit: 150000,
      totalCredit: 150000,
      status: 'posted',
      createdBy: 'System',
      createdAt: '2024-02-01 00:01:00'
    }
  ]);

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    const matchesSource = sourceFilter === 'all' || entry.source === sourceFilter;
    const matchesDate = !dateFilter || entry.date.includes(dateFilter);
    return matchesSearch && matchesType && matchesSource && matchesDate;
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
      case 'general':
        return <Badge className="bg-blue-100 text-blue-800">Jurnal Umum</Badge>;
      case 'special':
        return <Badge className="bg-green-100 text-green-800">Jurnal Khusus</Badge>;
      case 'adjustment':
        return <Badge className="bg-yellow-100 text-yellow-800">Jurnal Penyesuaian</Badge>;
      case 'closing':
        return <Badge className="bg-purple-100 text-purple-800">Jurnal Penutup</Badge>;
      case 'reversing':
        return <Badge className="bg-orange-100 text-orange-800">Jurnal Pembalik</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'manual':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Manual</Badge>;
      case 'savings':
        return <Badge variant="outline" className="text-green-600 border-green-600">Simpanan</Badge>;
      case 'loan':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Pinjaman</Badge>;
      case 'payment':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">Pembayaran</Badge>;
      case 'system':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Sistem</Badge>;
      default:
        return <Badge variant="outline">{source}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="text-gray-600">Draft</Badge>;
      case 'posted':
        return <Badge className="bg-green-100 text-green-800">Posted</Badge>;
      case 'reversed':
        return <Badge className="bg-red-100 text-red-800">Reversed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Calculate statistics
  const totalEntries = journalEntries.length;
  const totalDebit = journalEntries.reduce((sum, entry) => sum + entry.totalDebit, 0);
  const totalCredit = journalEntries.reduce((sum, entry) => sum + entry.totalCredit, 0);
  const autoEntries = journalEntries.filter(e => e.source !== 'manual').length;
  const manualEntries = journalEntries.filter(e => e.source === 'manual').length;

  const handleViewEntry = (entry: JournalEntry) => {
    toast.info(`Detail jurnal: ${entry.reference}`, {
      description: `${entry.description} - ${formatCurrency(entry.totalDebit)}`
    });
  };

  const handleGenerateAutoEntries = () => {
    toast.success('Jurnal otomatis berhasil dibuat', {
      description: 'Jurnal penyesuaian, penutup, dan pembalik telah dibuat untuk periode ini'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <BackButton to="/manager" />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistem Jurnal</h1>
            <p className="text-gray-600">Kelola semua jenis jurnal akuntansi dengan otomatisasi</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleGenerateAutoEntries}>
              <Zap className="h-4 w-4 mr-2" />
              Generate Auto Jurnal
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Jurnal Manual
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Jurnal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalEntries}</div>
              <p className="text-xs text-gray-500">Entries</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Debit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalDebit)}</div>
              <p className="text-xs text-gray-500">Sisi debit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Kredit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalCredit)}</div>
              <p className="text-xs text-gray-500">Sisi kredit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Jurnal Otomatis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{autoEntries}</div>
              <p className="text-xs text-gray-500">System generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Jurnal Manual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{manualEntries}</div>
              <p className="text-xs text-gray-500">Manual entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Semua Jurnal</TabsTrigger>
            <TabsTrigger value="general">Jurnal Umum</TabsTrigger>
            <TabsTrigger value="special">Jurnal Khusus</TabsTrigger>
            <TabsTrigger value="adjustment">Jurnal Penyesuaian</TabsTrigger>
            <TabsTrigger value="closing">Jurnal Penutup</TabsTrigger>
            <TabsTrigger value="reversing">Jurnal Pembalik</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Daftar Jurnal</span>
                    </CardTitle>
                    <CardDescription>
                      Semua jurnal yang dibuat secara otomatis dan manual
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cari jurnal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
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
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Sumber</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="savings">Simpanan</SelectItem>
                        <SelectItem value="loan">Pinjaman</SelectItem>
                        <SelectItem value="payment">Pembayaran</SelectItem>
                        <SelectItem value="system">Sistem</SelectItem>
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
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Referensi</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Sumber</TableHead>
                        <TableHead>Debit</TableHead>
                        <TableHead>Kredit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {new Date(entry.date).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{entry.description}</div>
                              <div className="text-sm text-gray-500">
                                {entry.entries.length} akun terlibat
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(entry.type)}</TableCell>
                          <TableCell>{getSourceBadge(entry.source)}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(entry.totalDebit)}
                          </TableCell>
                          <TableCell className="font-medium text-blue-600">
                            {formatCurrency(entry.totalCredit)}
                          </TableCell>
                          <TableCell>{getStatusBadge(entry.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewEntry(entry)}
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                                title="Lihat Detail"
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredEntries.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Tidak ada jurnal yang ditemukan</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Individual Journal Type Tabs */}
          {['general', 'special', 'adjustment', 'closing', 'reversing'].map((type) => (
            <TabsContent key={type} value={type}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>
                      {type === 'general' ? 'Jurnal Umum' :
                       type === 'special' ? 'Jurnal Khusus' :
                       type === 'adjustment' ? 'Jurnal Penyesuaian' :
                       type === 'closing' ? 'Jurnal Penutup' :
                       'Jurnal Pembalik'}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {type === 'general' ? 'Jurnal untuk transaksi harian seperti simpanan dan pinjaman' :
                     type === 'special' ? 'Jurnal untuk transaksi khusus dan akrual' :
                     type === 'adjustment' ? 'Jurnal penyesuaian untuk akhir periode' :
                     type === 'closing' ? 'Jurnal penutup untuk menutup akun nominal' :
                     'Jurnal pembalik untuk membalik akrual periode sebelumnya'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      {getTypeBadge(type)}
                      <span className="text-2xl font-bold text-blue-600">
                        {journalEntries.filter(e => e.type === type).length}
                      </span>
                    </div>
                    <p className="text-gray-500">
                      {type === 'general' ? 'Jurnal dibuat otomatis saat transaksi simpanan dan pinjaman' :
                       type === 'special' ? 'Jurnal dibuat untuk transaksi khusus dan akrual bulanan' :
                       type === 'adjustment' ? 'Jurnal dibuat otomatis di akhir periode untuk penyesuaian' :
                       type === 'closing' ? 'Jurnal dibuat otomatis untuk menutup akun pendapatan dan beban' :
                       'Jurnal dibuat otomatis untuk membalik akrual periode sebelumnya'}
                    </p>
                    {type !== 'general' && (
                      <Button 
                        className="mt-4" 
                        variant="outline"
                        onClick={handleGenerateAutoEntries}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate {type === 'special' ? 'Jurnal Khusus' :
                                 type === 'adjustment' ? 'Jurnal Penyesuaian' :
                                 type === 'closing' ? 'Jurnal Penutup' :
                                 'Jurnal Pembalik'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Automation Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Zap className="h-5 w-5" />
              <span>Otomatisasi Jurnal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Jurnal Otomatis:</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• <strong>Simpanan:</strong> Debit Kas, Kredit Simpanan Anggota</li>
                  <li>• <strong>Pinjaman:</strong> Debit Piutang, Kredit Kas</li>
                  <li>• <strong>Angsuran:</strong> Debit Kas, Kredit Piutang & Pendapatan Bunga</li>
                  <li>• <strong>Penyesuaian:</strong> Akrual, penyusutan, dan koreksi</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Siklus Akuntansi:</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• <strong>Jurnal Khusus:</strong> Dibuat bulanan untuk akrual</li>
                  <li>• <strong>Jurnal Penyesuaian:</strong> Dibuat akhir periode</li>
                  <li>• <strong>Jurnal Penutup:</strong> Menutup akun nominal</li>
                  <li>• <strong>Jurnal Pembalik:</strong> Membalik akrual periode baru</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}