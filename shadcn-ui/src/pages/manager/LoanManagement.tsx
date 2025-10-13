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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit,
  Download,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from 'lucide-react';

// Modal Components
const AddLoanModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Tambah Pinjaman Baru</DialogTitle>
          <DialogDescription>
            Buat pengajuan pinjaman baru untuk anggota koperasi
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-select" className="text-right">Anggota</Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih anggota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A001">A001 - Ahmad Sutanto</SelectItem>
                <SelectItem value="A002">A002 - Siti Rahayu</SelectItem>
                <SelectItem value="A003">A003 - Budi Santoso</SelectItem>
                <SelectItem value="A004">A004 - Dewi Sartika</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loan-type" className="text-right">Jenis Pinjaman</Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih jenis pinjaman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Pinjaman Reguler</SelectItem>
                <SelectItem value="emergency">Pinjaman Darurat</SelectItem>
                <SelectItem value="investment">Pinjaman Investasi</SelectItem>
                <SelectItem value="education">Pinjaman Pendidikan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loan-amount" className="text-right">Jumlah Pinjaman</Label>
            <Input 
              id="loan-amount" 
              type="number" 
              className="col-span-3" 
              placeholder="5000000" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loan-term" className="text-right">Jangka Waktu</Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih jangka waktu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Bulan</SelectItem>
                <SelectItem value="12">12 Bulan</SelectItem>
                <SelectItem value="24">24 Bulan</SelectItem>
                <SelectItem value="36">36 Bulan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="interest-rate" className="text-right">Suku Bunga (%)</Label>
            <Input 
              id="interest-rate" 
              type="number" 
              className="col-span-3" 
              placeholder="12" 
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="purpose" className="text-right">Tujuan Pinjaman</Label>
            <Textarea 
              id="purpose" 
              className="col-span-3" 
              placeholder="Jelaskan tujuan penggunaan pinjaman..." 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="collateral" className="text-right">Jaminan</Label>
            <Textarea 
              id="collateral" 
              className="col-span-3" 
              placeholder="Deskripsi jaminan (opsional)..." 
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onClose}>Ajukan Pinjaman</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ViewLoanModal = ({ isOpen, onClose, loan }: { isOpen: boolean; onClose: () => void; loan: any }) => {
  if (!loan) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Detail Pinjaman</DialogTitle>
          <DialogDescription>
            Informasi lengkap pinjaman {loan.memberName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">ID Pinjaman:</Label>
              <p className="text-lg font-mono">{loan.id}</p>
            </div>
            <div>
              <Label className="font-medium">Nama Anggota:</Label>
              <p>{loan.memberName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Jumlah Pinjaman:</Label>
              <p className="text-xl font-bold text-blue-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(loan.amount)}
              </p>
            </div>
            <div>
              <Label className="font-medium">Sisa Pinjaman:</Label>
              <p className="text-xl font-bold text-red-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(loan.remaining)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Jangka Waktu:</Label>
              <p>{loan.term} bulan</p>
            </div>
            <div>
              <Label className="font-medium">Suku Bunga:</Label>
              <p>{loan.interestRate}% per tahun</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Status:</Label>
              <Badge className={loan.status === 'active' ? 'bg-green-100 text-green-800' : loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                {loan.status === 'active' ? 'Aktif' : loan.status === 'pending' ? 'Pending' : 'Lunas'}
              </Badge>
            </div>
            <div>
              <Label className="font-medium">Tanggal Mulai:</Label>
              <p>{new Date(loan.startDate).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
          <div>
            <Label className="font-medium">Tujuan Pinjaman:</Label>
            <p className="text-sm text-gray-600 mt-1">{loan.purpose || 'Modal usaha dan kebutuhan pribadi'}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Cetak Detail
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EditLoanModal = ({ isOpen, onClose, loan }: { isOpen: boolean; onClose: () => void; loan: any }) => {
  if (!loan) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Pinjaman</DialogTitle>
          <DialogDescription>
            Ubah informasi pinjaman {loan.memberName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-amount" className="text-right">Jumlah Pinjaman</Label>
            <Input 
              id="edit-amount" 
              type="number" 
              className="col-span-3" 
              defaultValue={loan.amount}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-rate" className="text-right">Suku Bunga (%)</Label>
            <Input 
              id="edit-rate" 
              type="number" 
              className="col-span-3" 
              defaultValue={loan.interestRate}
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-status" className="text-right">Status</Label>
            <Select defaultValue={loan.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Lunas</SelectItem>
                <SelectItem value="overdue">Menunggak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-notes" className="text-right">Catatan</Label>
            <Textarea 
              id="edit-notes" 
              className="col-span-3" 
              placeholder="Catatan tambahan..."
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onClose}>Simpan Perubahan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function LoanManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addLoanModal, setAddLoanModal] = useState(false);
  const [viewLoanModal, setViewLoanModal] = useState(false);
  const [editLoanModal, setEditLoanModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Mock data
  const activeLoans = [
    {
      id: 'L001',
      memberId: 'A001',
      memberName: 'Ahmad Sutanto',
      amount: 5000000,
      remaining: 3500000,
      term: 24,
      interestRate: 12,
      status: 'active',
      startDate: '2023-06-15',
      nextPayment: '2024-02-15',
      purpose: 'Modal usaha warung'
    },
    {
      id: 'L002',
      memberId: 'A002',
      memberName: 'Siti Rahayu',
      amount: 3000000,
      remaining: 1500000,
      term: 12,
      interestRate: 10,
      status: 'active',
      startDate: '2023-08-20',
      nextPayment: '2024-02-20',
      purpose: 'Renovasi rumah'
    },
    {
      id: 'L003',
      memberId: 'A003',
      memberName: 'Budi Santoso',
      amount: 2000000,
      remaining: 2000000,
      term: 6,
      interestRate: 15,
      status: 'overdue',
      startDate: '2023-12-01',
      nextPayment: '2024-01-01',
      purpose: 'Kebutuhan darurat'
    }
  ];

  const loanApplications = [
    {
      id: 'LA001',
      memberId: 'A004',
      memberName: 'Dewi Sartika',
      amount: 4000000,
      term: 18,
      interestRate: 11,
      status: 'pending',
      applicationDate: '2024-01-10',
      purpose: 'Modal usaha online'
    },
    {
      id: 'LA002',
      memberId: 'A005',
      memberName: 'Andi Wijaya',
      amount: 6000000,
      term: 36,
      interestRate: 12,
      status: 'pending',
      applicationDate: '2024-01-12',
      purpose: 'Pembelian kendaraan'
    }
  ];

  const loanHistory = [
    {
      id: 'LH001',
      memberId: 'A006',
      memberName: 'Rina Sari',
      amount: 2500000,
      term: 12,
      status: 'completed',
      startDate: '2022-01-15',
      endDate: '2023-01-15'
    },
    {
      id: 'LH002',
      memberId: 'A007',
      memberName: 'Joko Widodo',
      amount: 1500000,
      term: 6,
      status: 'completed',
      startDate: '2023-03-10',
      endDate: '2023-09-10'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Aktif' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Lunas' },
      overdue: { color: 'bg-red-100 text-red-800', text: 'Menunggak' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const handleViewLoan = (loan: any) => {
    setSelectedLoan(loan);
    setViewLoanModal(true);
  };

  const handleEditLoan = (loan: any) => {
    setSelectedLoan(loan);
    setEditLoanModal(true);
  };

  const handleReviewApplication = (application: any) => {
    alert(`Meninjau pengajuan pinjaman ${application.id} dari ${application.memberName}`);
  };

  const handleApproveApplication = (application: any) => {
    alert(`Menyetujui pengajuan pinjaman ${application.id} dari ${application.memberName}`);
  };

  const handleRejectApplication = (application: any) => {
    alert(`Menolak pengajuan pinjaman ${application.id} dari ${application.memberName}`);
  };

  const handleDownloadHistory = (loan: any) => {
    const csvContent = `Riwayat Pinjaman,${loan.id}\nNama Anggota,${loan.memberName}\nJumlah Pinjaman,${formatCurrency(loan.amount)}\nStatus,${loan.status}\nTanggal Mulai,${new Date(loan.startDate).toLocaleDateString('id-ID')}\nTanggal Selesai,${loan.endDate ? new Date(loan.endDate).toLocaleDateString('id-ID') : 'Belum selesai'}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `riwayat-pinjaman-${loan.id}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = (reportType: string) => {
    const reports = {
      'active': 'Laporan Pinjaman Aktif',
      'payment': 'Laporan Pembayaran',
      'overdue': 'Laporan Tunggakan',
      'annual': 'Laporan Tahunan'
    };
    
    const reportName = reports[reportType as keyof typeof reports];
    alert(`Mengunduh ${reportName}...`);
    
    // Mock CSV content based on report type
    let csvContent = '';
    if (reportType === 'active') {
      csvContent = `Laporan Pinjaman Aktif\nID,Nama Anggota,Jumlah,Sisa,Status\n${activeLoans.map(loan => `${loan.id},${loan.memberName},${loan.amount},${loan.remaining},${loan.status}`).join('\n')}`;
    } else if (reportType === 'overdue') {
      const overdueLoans = activeLoans.filter(loan => loan.status === 'overdue');
      csvContent = `Laporan Tunggakan\nID,Nama Anggota,Jumlah,Sisa,Tanggal Jatuh Tempo\n${overdueLoans.map(loan => `${loan.id},${loan.memberName},${loan.amount},${loan.remaining},${loan.nextPayment}`).join('\n')}`;
    } else {
      csvContent = `${reportName}\nGenerated on: ${new Date().toLocaleDateString('id-ID')}\nTotal Active Loans: ${activeLoans.length}\nTotal Amount: ${formatCurrency(activeLoans.reduce((sum, loan) => sum + loan.amount, 0))}`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics
  const totalActiveAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalRemaining = activeLoans.reduce((sum, loan) => sum + loan.remaining, 0);
  const overdueLoans = activeLoans.filter(loan => loan.status === 'overdue').length;
  const pendingApplications = loanApplications.length;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Pinjaman</h1>
            <p className="text-gray-600 mt-1">Kelola pinjaman anggota koperasi</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setAddLoanModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Pinjaman Baru
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pinjaman Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalActiveAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sisa Pinjaman</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pinjaman Menunggak</p>
                  <p className="text-2xl font-bold text-gray-900">{overdueLoans}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pengajuan Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Pinjaman Aktif</TabsTrigger>
            <TabsTrigger value="applications">Pengajuan Baru</TabsTrigger>
            <TabsTrigger value="history">Riwayat Pinjaman</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pencarian Pinjaman</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama anggota atau ID pinjaman..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Active Loans Table */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pinjaman Aktif</CardTitle>
                <CardDescription>
                  Menampilkan {activeLoans.length} pinjaman aktif
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ID Pinjaman</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Anggota</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Jumlah</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Sisa</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Jatuh Tempo</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLoans.map((loan) => (
                        <tr key={loan.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{loan.id}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{loan.memberName}</p>
                              <p className="text-sm text-gray-500">ID: {loan.memberId}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatCurrency(loan.amount)}
                          </td>
                          <td className="py-3 px-4 font-medium text-red-600">
                            {formatCurrency(loan.remaining)}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(loan.status)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(loan.nextPayment).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewLoan(loan)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditLoan(loan)}
                              >
                                <Edit className="w-4 h-4" />
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
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengajuan Pinjaman Baru</CardTitle>
                <CardDescription>
                  Menampilkan {loanApplications.length} pengajuan yang perlu ditinjau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loanApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-medium text-gray-900">{application.memberName}</h3>
                              <p className="text-sm text-gray-500">ID: {application.memberId} • {application.id}</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-blue-600">
                                {formatCurrency(application.amount)}
                              </p>
                              <p className="text-sm text-gray-500">{application.term} bulan • {application.interestRate}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">{application.purpose}</p>
                              <p className="text-xs text-gray-500">
                                Diajukan: {new Date(application.applicationDate).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReviewApplication(application)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveApplication(application)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Setujui
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRejectApplication(application)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Tolak
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pinjaman</CardTitle>
                <CardDescription>
                  Menampilkan {loanHistory.length} pinjaman yang telah selesai
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ID Pinjaman</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Anggota</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Jumlah</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Jangka Waktu</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Periode</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanHistory.map((loan) => (
                        <tr key={loan.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{loan.id}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{loan.memberName}</p>
                              <p className="text-sm text-gray-500">ID: {loan.memberId}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatCurrency(loan.amount)}
                          </td>
                          <td className="py-3 px-4">{loan.term} bulan</td>
                          <td className="py-3 px-4">
                            {getStatusBadge(loan.status)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(loan.startDate).toLocaleDateString('id-ID')} - {new Date(loan.endDate).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadHistory(loan)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Laporan Pinjaman</CardTitle>
                <CardDescription>
                  Unduh berbagai laporan pinjaman
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => handleDownloadReport('active')}
                  >
                    <Download className="h-6 w-6" />
                    <span>Laporan Pinjaman Aktif</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => handleDownloadReport('payment')}
                  >
                    <Download className="h-6 w-6" />
                    <span>Laporan Pembayaran</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => handleDownloadReport('overdue')}
                  >
                    <Download className="h-6 w-6" />
                    <span>Laporan Tunggakan</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => handleDownloadReport('annual')}
                  >
                    <Download className="h-6 w-6" />
                    <span>Laporan Tahunan</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddLoanModal 
        isOpen={addLoanModal} 
        onClose={() => setAddLoanModal(false)}
      />
      <ViewLoanModal 
        isOpen={viewLoanModal} 
        onClose={() => setViewLoanModal(false)}
        loan={selectedLoan}
      />
      <EditLoanModal 
        isOpen={editLoanModal} 
        onClose={() => setEditLoanModal(false)}
        loan={selectedLoan}
      />
    </ManagerLayout>
  );
}