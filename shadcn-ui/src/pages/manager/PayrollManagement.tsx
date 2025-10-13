import React, { useState, useRef, useEffect } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Eye,
  Download,
  DollarSign,
  Calculator,
  TrendingDown,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { useServiceFees } from '@/hooks/useServiceFees';
import { useLoans } from '@/hooks/useLoans';

// Modal Components
const AddPayrollModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedMember, setSelectedMember] = useState('');
  const [serviceFee, setServiceFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  
  const { fetchActiveMembers } = useMembers();
  const { addServiceFee } = useServiceFees();

  // Load active members when modal opens
  useEffect(() => {
    if (isOpen) {
      loadActiveMembers();
    }
  }, [isOpen]);

  const loadActiveMembers = async () => {
    try {
      setLoadingMembers(true);
      const members = await fetchActiveMembers();
      setActiveMembers(members);
    } catch (error) {
      console.error('Error loading active members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMember || !serviceFee) return;

    try {
      setLoading(true);
      await addServiceFee({
        member_id: selectedMember,
        period: selectedMonth,
        gross_amount: parseInt(serviceFee),
      });
      
      setSelectedMember('');
      setServiceFee('');
      onClose();
    } catch (error) {
      console.error('Error adding service fee:', error);
      alert('Gagal menambahkan jasa pelayanan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Input Jasa Pelayanan</DialogTitle>
          <DialogDescription>
            Masukkan nominal jasa pelayanan untuk anggota aktif
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="period" className="text-right">Periode</Label>
            <Input 
              id="period" 
              type="month"
              className="col-span-3" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-select" className="text-right">Anggota</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember} disabled={loadingMembers}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={loadingMembers ? "Memuat anggota..." : "Pilih anggota aktif"} />
              </SelectTrigger>
              <SelectContent>
                {loadingMembers ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2">Memuat...</span>
                  </div>
                ) : activeMembers.length > 0 ? (
                  activeMembers.map(member => (
                    <SelectItem key={member.member_id} value={member.member_id}>
                      {member.member_id} - {member.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">
                    Tidak ada anggota aktif
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="service-fee" className="text-right">Jasa Pelayanan</Label>
            <Input 
              id="service-fee" 
              type="number" 
              className="col-span-3" 
              placeholder="2500000"
              value={serviceFee}
              onChange={(e) => setServiceFee(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Angsuran Otomatis</Label>
            <div className="col-span-3">
              <p className="text-sm text-gray-600">Sistem akan otomatis menghitung pemotongan angsuran pinjaman</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
          <Button onClick={handleSave} disabled={loading || !selectedMember || !serviceFee || loadingMembers}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Menyimpan...
              </>
            ) : (
              'Simpan Jasa Pelayanan'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ExcelImportModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{ successful: number; failed: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { importServiceFees } = useServiceFees();
  const { fetchActiveMembers } = useMembers();

  // Load active members when modal opens for validation
  useEffect(() => {
    if (isOpen) {
      loadActiveMembers();
    }
  }, [isOpen]);

  const loadActiveMembers = async () => {
    try {
      const members = await fetchActiveMembers();
      setActiveMembers(members);
    } catch (error) {
      console.error('Error loading active members:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResults(null);
    }
  };

  const handleDownloadTemplate = () => {
    // Use active members for template
    const templateData = [
      ['ID Anggota', 'Nama Anggota', 'Jasa Pelayanan', 'Periode'],
      ...activeMembers.slice(0, 4).map(member => [
        member.member_id,
        member.name,
        '2500000',
        '2024-01'
      ])
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template-jasa-pelayanan.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    
    try {
      // Parse CSV file (simplified - in production, use a proper CSV parser)
      const text = await selectedFile.text();
      const lines = text.split('\n').slice(1); // Skip header
      const validMemberIds = activeMembers.map(m => m.member_id);
      
      const importData = lines
        .filter(line => line.trim())
        .map(line => {
          const [member_id, , gross_amount, period] = line.split(',');
          return {
            member_id: member_id.trim(),
            period: period.trim(),
            gross_amount: parseInt(gross_amount.trim()),
          };
        })
        .filter(data => {
          // Only include active members
          return validMemberIds.includes(data.member_id);
        });

      if (importData.length === 0) {
        alert('Tidak ada data anggota aktif yang valid dalam file');
        setIsProcessing(false);
        return;
      }

      const results = await importServiceFees(importData);
      setImportResults(results);
      
      if (results.failed === 0) {
        setTimeout(() => {
          onClose();
          resetModal();
        }, 2000);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Gagal mengimpor data');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImportResults(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Import Jasa Pelayanan dari Excel</DialogTitle>
          <DialogDescription>
            Upload file Excel untuk input jasa pelayanan secara massal (hanya anggota aktif)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Active Members Info */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Tersedia {activeMembers.length} anggota aktif untuk jasa pelayanan
            </AlertDescription>
          </Alert>

          {/* Template Download Section */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center space-x-2 mb-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Template Excel</h4>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Unduh template Excel dengan data anggota aktif terkini
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadTemplate}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              disabled={activeMembers.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Unduh Template
            </Button>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="excel-file">Pilih File Excel</Label>
              <Input
                ref={fileInputRef}
                id="excel-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format yang didukung: .xlsx, .xls, .csv (hanya anggota aktif akan diproses)
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <FileSpreadsheet className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
          </div>

          {/* Import Results */}
          {importResults && (
            <Alert className={importResults.failed === 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center space-x-2">
                {importResults.failed === 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={importResults.failed === 0 ? "text-green-800" : "text-red-800"}>
                  {importResults.failed === 0 ? (
                    `Berhasil mengimpor ${importResults.successful} data jasa pelayanan`
                  ) : (
                    `${importResults.successful} berhasil, ${importResults.failed} gagal`
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            {importResults?.failed === 0 ? 'Selesai' : 'Batal'}
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!selectedFile || isProcessing || activeMembers.length === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Memproses...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ViewPayrollModal = ({ isOpen, onClose, payroll }: { isOpen: boolean; onClose: () => void; payroll: any }) => {
  const { getLoansByMember, getTotalRemainingLoan } = useLoans();
  const { getMemberById } = useMembers();
  
  if (!payroll) return null;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const member = getMemberById(payroll.member_id);
  const memberLoans = getLoansByMember(payroll.member_id);
  const remainingLoan = getTotalRemainingLoan(payroll.member_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Detail Jasa Pelayanan</DialogTitle>
          <DialogDescription>
            Rincian jasa pelayanan dan pemotongan {member?.name || payroll.member_id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Periode:</Label>
              <p className="text-lg">{payroll.period}</p>
            </div>
            <div>
              <Label className="font-medium">ID Anggota:</Label>
              <p>{payroll.member_id}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Nama Anggota:</Label>
              <p>{member?.name || 'Tidak ditemukan'}</p>
            </div>
            <div>
              <Label className="font-medium">Status Anggota:</Label>
              <Badge className={member?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {member?.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Status Pembayaran:</Label>
              <Badge className={payroll.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {payroll.status === 'paid' ? 'Sudah Dibayar' : 'Belum Dibayar'}
              </Badge>
            </div>
            <div>
              <Label className="font-medium">Sisa Pinjaman:</Label>
              <p className="text-orange-600 font-medium">
                {remainingLoan > 0 ? formatCurrency(remainingLoan) : 'Tidak ada'}
              </p>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-3">Rincian Perhitungan:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Jasa Pelayanan Bruto:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(payroll.gross_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pemotongan Angsuran:</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(payroll.loan_deduction)}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Yang Diterima:</span>
                <span className="text-blue-600">
                  {formatCurrency(payroll.net_amount)}
                </span>
              </div>
            </div>
          </div>
          
          {memberLoans.length > 0 && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium mb-2">Detail Pinjaman Aktif:</h4>
              <div className="space-y-2">
                {memberLoans.map((loan) => (
                  <div key={loan.loan_id} className="flex justify-between text-sm">
                    <span>{loan.loan_id} - {loan.loan_type}</span>
                    <span className="font-medium">{formatCurrency(loan.monthly_payment)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function PayrollManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [addPayrollModal, setAddPayrollModal] = useState(false);
  const [excelImportModal, setExcelImportModal] = useState(false);
  const [viewPayrollModal, setViewPayrollModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const { members, getMemberById } = useMembers();
  const { serviceFees, markAsPaid, getServiceFeesByPeriod } = useServiceFees();
  const { getTotalRemainingLoan } = useLoans();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    return status === 'paid' ? (
      <Badge className="bg-green-100 text-green-800">Sudah Dibayar</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Belum Dibayar</Badge>
    );
  };

  const handleViewPayroll = (payroll: any) => {
    setSelectedPayroll(payroll);
    setViewPayrollModal(true);
  };

  const handleMarkAsPaid = async (payrollId: string) => {
    try {
      await markAsPaid(payrollId);
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Gagal mengubah status pembayaran');
    }
  };

  const handleDownloadReport = (reportType: string) => {
    let csvContent = '';
    const currentDate = new Date().toISOString().split('T')[0];
    const periodData = getServiceFeesByPeriod(selectedMonth);
    
    switch (reportType) {
      case 'monthly':
        csvContent = `Laporan Jasa Pelayanan Bulanan\nPeriode: ${selectedMonth}\nTanggal: ${currentDate}\n\nID,Anggota,Jasa Pelayanan,Potongan,Sisa Angsuran,Status\n`;
        periodData.forEach(payroll => {
          const member = getMemberById(payroll.member_id);
          const remainingLoan = getTotalRemainingLoan(payroll.member_id);
          csvContent += `${payroll.fee_id},${member?.name || payroll.member_id},${payroll.gross_amount},${payroll.loan_deduction},${remainingLoan},${payroll.status}\n`;
        });
        break;
      case 'summary':
        const totalServiceFee = periodData.reduce((sum, payroll) => sum + payroll.gross_amount, 0);
        const totalDeduction = periodData.reduce((sum, payroll) => sum + payroll.loan_deduction, 0);
        const totalNet = periodData.reduce((sum, payroll) => sum + payroll.net_amount, 0);
        csvContent = `Ringkasan Jasa Pelayanan\nTanggal: ${currentDate}\n\nTotal Jasa Pelayanan,${totalServiceFee}\nTotal Potongan,${totalDeduction}\nTotal Netto,${totalNet}\nJumlah Anggota,${periodData.length}`;
        break;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan-${reportType}-${currentDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayroll = getServiceFeesByPeriod(selectedMonth).filter(payroll => {
    const member = getMemberById(payroll.member_id);
    return (
      (member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       payroll.member_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Calculate statistics
  const totalServiceFee = filteredPayroll.reduce((sum, payroll) => sum + payroll.gross_amount, 0);
  const totalDeduction = filteredPayroll.reduce((sum, payroll) => sum + payroll.loan_deduction, 0);
  const totalNet = filteredPayroll.reduce((sum, payroll) => sum + payroll.net_amount, 0);
  const paidCount = filteredPayroll.filter(payroll => payroll.status === 'paid').length;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Jasa Pelayanan</h1>
            <p className="text-gray-600 mt-1">Kelola jasa pelayanan dan potongan angsuran anggota aktif</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={() => setExcelImportModal(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setAddPayrollModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Input Manual
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jasa Pelayanan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalServiceFee)}
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
                  <p className="text-sm font-medium text-gray-600">Total Potongan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalDeduction)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calculator className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Netto</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalNet)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sudah Dibayar</p>
                  <p className="text-2xl font-bold text-gray-900">{paidCount}/{filteredPayroll.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama anggota atau ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Jasa Pelayanan</CardTitle>
            <CardDescription>
              Menampilkan {filteredPayroll.length} data jasa pelayanan untuk periode {new Date(selectedMonth).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Anggota</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Jasa Pelayanan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Potongan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Sisa Angsuran</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayroll.map((payroll) => {
                    const member = getMemberById(payroll.member_id);
                    const remainingLoan = getTotalRemainingLoan(payroll.member_id);
                    
                    return (
                      <tr key={payroll.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{payroll.fee_id}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{member?.name || 'Tidak ditemukan'}</p>
                            <p className="text-sm text-gray-500">
                              ID: {payroll.member_id}
                              {member?.status !== 'active' && (
                                <Badge className="ml-2 bg-red-100 text-red-800 text-xs">Tidak Aktif</Badge>
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-green-600">
                          {formatCurrency(payroll.gross_amount)}
                        </td>
                        <td className="py-3 px-4 font-medium text-red-600">
                          {formatCurrency(payroll.loan_deduction)}
                        </td>
                        <td className="py-3 px-4 font-medium text-orange-600">
                          {remainingLoan > 0 ? formatCurrency(remainingLoan) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(payroll.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewPayroll(payroll)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {payroll.status === 'pending' && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleMarkAsPaid(payroll.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredPayroll.length === 0 && (
                <div className="text-center py-8">
                  <Calculator className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada data</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Belum ada data jasa pelayanan untuk periode ini
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan Jasa Pelayanan</CardTitle>
            <CardDescription>
              Unduh berbagai laporan jasa pelayanan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => handleDownloadReport('monthly')}
              >
                <Download className="h-6 w-6" />
                <span>Laporan Bulanan</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => handleDownloadReport('summary')}
              >
                <Download className="h-6 w-6" />
                <span>Ringkasan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddPayrollModal 
        isOpen={addPayrollModal} 
        onClose={() => setAddPayrollModal(false)}
      />
      <ExcelImportModal 
        isOpen={excelImportModal} 
        onClose={() => setExcelImportModal(false)}
      />
      <ViewPayrollModal 
        isOpen={viewPayrollModal} 
        onClose={() => setViewPayrollModal(false)}
        payroll={selectedPayroll}
      />
    </ManagerLayout>
  );
}