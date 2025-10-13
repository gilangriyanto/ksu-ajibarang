import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DollarSign, 
  Upload, 
  Download, 
  Calculator,
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { ServiceFeeInputModal } from '@/components/manager/ServiceFeeInputModal';
import { toast } from '@/hooks/use-toast';

interface ServiceFeeRecord {
  id: string;
  memberNumber: string;
  memberName: string;
  serviceFee: number;
  monthlyInstallment: number;
  remainingInstallment: number;
  status: 'paid' | 'partial' | 'insufficient';
  month: string;
  year: number;
}

interface ServiceFeeData {
  memberNumber: string;
  memberName: string;
  serviceFee: number;
  month: string;
  year: number;
}

export default function ServiceFeeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data for service fee records
  const [serviceFeeRecords, setServiceFeeRecords] = useState<ServiceFeeRecord[]>([
    {
      id: '1',
      memberNumber: 'M001',
      memberName: 'Dr. Ahmad Santoso',
      serviceFee: 3500000,
      monthlyInstallment: 2354425,
      remainingInstallment: 0,
      status: 'paid',
      month: 'Januari',
      year: 2024
    },
    {
      id: '2',
      memberNumber: 'M002',
      memberName: 'Siti Nurhaliza',
      serviceFee: 2800000,
      monthlyInstallment: 0,
      remainingInstallment: 0,
      status: 'paid',
      month: 'Januari',
      year: 2024
    },
    {
      id: '3',
      memberNumber: 'M003',
      memberName: 'Budi Prasetyo',
      serviceFee: 1500000,
      monthlyInstallment: 2000000,
      remainingInstallment: 500000,
      status: 'partial',
      month: 'Januari',
      year: 2024
    },
    {
      id: '4',
      memberNumber: 'M004',
      memberName: 'Dr. Sarah Wijaya',
      serviceFee: 4200000,
      monthlyInstallment: 1750000,
      remainingInstallment: 0,
      status: 'paid',
      month: 'Januari',
      year: 2024
    },
    {
      id: '5',
      memberNumber: 'M005',
      memberName: 'Andi Kurniawan',
      serviceFee: 800000,
      monthlyInstallment: 1200000,
      remainingInstallment: 400000,
      status: 'insufficient',
      month: 'Januari',
      year: 2024
    }
  ]);

  const filteredRecords = serviceFeeRecords.filter(record =>
    record.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.memberNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Lunas</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Sebagian</Badge>;
      case 'insufficient':
        return <Badge className="bg-red-100 text-red-800">Kurang</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'insufficient':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const calculateDeduction = (serviceFee: number, installment: number) => {
    if (installment === 0) return { deducted: 0, remaining: 0, status: 'paid' };
    
    if (serviceFee >= installment) {
      return { deducted: installment, remaining: 0, status: 'paid' };
    } else {
      return { 
        deducted: serviceFee, 
        remaining: installment - serviceFee, 
        status: serviceFee > 0 ? 'partial' : 'insufficient' 
      };
    }
  };

  const handleServiceFeeSubmit = (data: ServiceFeeData) => {
    // Mock monthly installment data
    const mockInstallments: Record<string, number> = {
      'M001': 2354425,
      'M002': 0,
      'M003': 2000000,
      'M004': 1750000,
      'M005': 1200000,
      'M006': 1800000,
      'M007': 2200000
    };

    const monthlyInstallment = mockInstallments[data.memberNumber] || 0;
    const calculation = calculateDeduction(data.serviceFee, monthlyInstallment);

    const newRecord: ServiceFeeRecord = {
      id: Date.now().toString(),
      memberNumber: data.memberNumber,
      memberName: data.memberName,
      serviceFee: data.serviceFee,
      monthlyInstallment: monthlyInstallment,
      remainingInstallment: calculation.remaining,
      status: calculation.status as 'paid' | 'partial' | 'insufficient',
      month: data.month,
      year: data.year
    };

    setServiceFeeRecords(prev => [newRecord, ...prev]);
    
    toast({
      title: "Data berhasil disimpan",
      description: `Jasa pelayanan ${data.memberName}: ${formatCurrency(data.serviceFee)} - Status: ${calculation.status === 'paid' ? 'Lunas' : calculation.status === 'partial' ? 'Sebagian' : 'Kurang'}`,
    });
  };

  const totalServiceFee = filteredRecords.reduce((sum, record) => sum + record.serviceFee, 0);
  const totalInstallments = filteredRecords.reduce((sum, record) => sum + record.monthlyInstallment, 0);
  const totalRemaining = filteredRecords.reduce((sum, record) => sum + record.remainingInstallment, 0);
  const paidCount = filteredRecords.filter(r => r.status === 'paid').length;

  return (
    <Layout>
      <div className="space-y-6">
        <BackButton to="/manager" />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Jasa Pelayanan</h1>
            <p className="text-gray-600">Kelola pemotongan angsuran dari jasa pelayanan</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Template Excel
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Excel
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Input Manual
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Jasa Pelayanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalServiceFee)}</div>
              <p className="text-xs text-gray-500">Bulan ini</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Angsuran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalInstallments)}</div>
              <p className="text-xs text-gray-500">Yang harus dipotong</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sisa Angsuran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalRemaining)}</div>
              <p className="text-xs text-gray-500">Belum terpotong</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Angsuran Lunas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidCount}</div>
              <p className="text-xs text-gray-500">dari {filteredRecords.length} anggota</p>
            </CardContent>
          </Card>
        </div>

        {/* Calculation Schema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Skema Perhitungan Pemotongan</span>
            </CardTitle>
            <CardDescription>
              Aturan otomatis pemotongan angsuran dari jasa pelayanan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Jasa Pelayanan ≥ Angsuran</h4>
                </div>
                <p className="text-sm text-green-700">
                  Angsuran dipotong penuh dari jasa pelayanan. Status: <strong>LUNAS</strong>
                </p>
                <div className="mt-2 text-xs text-green-600">
                  Contoh: Jasa Rp 3.500.000 - Angsuran Rp 2.354.425 = Sisa Rp 1.145.575
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Jasa Pelayanan &lt; Angsuran</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Jasa pelayanan dipotong semua, sisa angsuran ditampilkan. Status: <strong>SEBAGIAN</strong>
                </p>
                <div className="mt-2 text-xs text-yellow-600">
                  Contoh: Jasa Rp 1.500.000 - Angsuran Rp 2.000.000 = Sisa Rp 500.000
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-red-50">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium text-red-800">Jasa Pelayanan = 0</h4>
                </div>
                <p className="text-sm text-red-700">
                  Tidak ada pemotongan, angsuran penuh menjadi tunggakan. Status: <strong>KURANG</strong>
                </p>
                <div className="mt-2 text-xs text-red-600">
                  Contoh: Jasa Rp 0 - Angsuran Rp 1.200.000 = Sisa Rp 1.200.000
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Data Bulan Ini</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pemotongan Jasa Pelayanan - Januari 2024</CardTitle>
                    <CardDescription>
                      Status pemotongan angsuran dari jasa pelayanan bulan ini
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cari anggota..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Anggota</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Jasa Pelayanan</TableHead>
                        <TableHead>Angsuran</TableHead>
                        <TableHead>Dipotong</TableHead>
                        <TableHead>Sisa Angsuran</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => {
                        const calculation = calculateDeduction(record.serviceFee, record.monthlyInstallment);
                        return (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.memberNumber}</TableCell>
                            <TableCell>{record.memberName}</TableCell>
                            <TableCell className="font-medium text-blue-600">
                              {formatCurrency(record.serviceFee)}
                            </TableCell>
                            <TableCell className="font-medium text-orange-600">
                              {record.monthlyInstallment > 0 ? formatCurrency(record.monthlyInstallment) : '-'}
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              {calculation.deducted > 0 ? formatCurrency(calculation.deducted) : '-'}
                            </TableCell>
                            <TableCell className="font-medium text-red-600">
                              {calculation.remaining > 0 ? formatCurrency(calculation.remaining) : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(record.status)}
                                {getStatusBadge(record.status)}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pemotongan</CardTitle>
                <CardDescription>
                  Histori pemotongan jasa pelayanan bulan-bulan sebelumnya
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Riwayat akan ditampilkan setelah ada data bulan sebelumnya</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Service Fee Input Modal */}
        <ServiceFeeInputModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSubmit={handleServiceFeeSubmit}
        />
      </div>
    </Layout>
  );
}