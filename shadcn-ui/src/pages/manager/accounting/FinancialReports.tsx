import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Download,
  Calendar,
  FileText,
  TrendingUp,
  BarChart3,
  PieChart,
  Eye
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'trial_balance' | 'custom';
  lastGenerated: string;
  status: 'ready' | 'generating' | 'error';
}

export default function FinancialReports() {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data
  const reports: Report[] = [
    {
      id: '1',
      name: 'Neraca',
      description: 'Laporan posisi keuangan koperasi',
      type: 'balance_sheet',
      lastGenerated: '2024-01-30',
      status: 'ready'
    },
    {
      id: '2',
      name: 'Laporan Laba Rugi',
      description: 'Laporan kinerja keuangan periode tertentu',
      type: 'income_statement',
      lastGenerated: '2024-01-30',
      status: 'ready'
    },
    {
      id: '3',
      name: 'Laporan Arus Kas',
      description: 'Laporan pergerakan kas masuk dan keluar',
      type: 'cash_flow',
      lastGenerated: '2024-01-29',
      status: 'ready'
    },
    {
      id: '4',
      name: 'Neraca Saldo',
      description: 'Laporan keseimbangan semua akun',
      type: 'trial_balance',
      lastGenerated: '2024-01-28',
      status: 'ready'
    },
    {
      id: '5',
      name: 'Laporan Pinjaman',
      description: 'Analisis portofolio pinjaman anggota',
      type: 'custom',
      lastGenerated: '2024-01-27',
      status: 'generating'
    }
  ];

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'balance_sheet':
        return <BarChart3 className="h-5 w-5" />;
      case 'income_statement':
        return <TrendingUp className="h-5 w-5" />;
      case 'cash_flow':
        return <PieChart className="h-5 w-5" />;
      case 'trial_balance':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ready: 'bg-green-100 text-green-800',
      generating: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      ready: 'Siap',
      generating: 'Sedang Dibuat',
      error: 'Error'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const handleGenerateReport = (reportId: string) => {
    console.log('Generating report:', reportId);
  };

  const handleViewReport = (reportId: string) => {
    console.log('Viewing report:', reportId);
  };

  const handleDownloadReport = (reportId: string, format: 'pdf' | 'excel') => {
    console.log('Downloading report:', reportId, 'as', format);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
            <p className="text-gray-600">Generate dan kelola laporan keuangan</p>
          </div>
          <Button className="w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            Buat Laporan Custom
          </Button>
        </div>

        {/* Report Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Parameter Laporan</CardTitle>
            <CardDescription>
              Atur periode untuk semua laporan keuangan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Selesai</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Semua Laporan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Neraca</CardTitle>
                  <CardDescription>Posisi keuangan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Generate
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Laba Rugi</CardTitle>
                  <CardDescription>Kinerja keuangan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Generate
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <PieChart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Arus Kas</CardTitle>
                  <CardDescription>Pergerakan kas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Generate
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Neraca Saldo</CardTitle>
                  <CardDescription>Keseimbangan akun</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Generate
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reports History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Laporan</CardTitle>
            <CardDescription>
              Semua laporan yang pernah dibuat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Laporan</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Terakhir Dibuat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getReportIcon(report.type)}
                          </div>
                          <span className="font-medium">{report.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(report.lastGenerated).toLocaleDateString('id-ID')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {report.status === 'ready' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewReport(report.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadReport(report.id, 'pdf')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateReport(report.id)}
                            disabled={report.status === 'generating'}
                          >
                            {report.status === 'generating' ? 'Generating...' : 'Generate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Template Laporan</CardTitle>
            <CardDescription>
              Template laporan yang tersedia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Laporan Bulanan</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Paket lengkap laporan keuangan bulanan
                </p>
                <Button variant="outline" className="w-full">
                  Generate Paket
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Laporan Tahunan</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Laporan komprehensif untuk tutup buku tahunan
                </p>
                <Button variant="outline" className="w-full">
                  Generate Paket
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Laporan RAT</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Laporan khusus untuk Rapat Anggota Tahunan
                </p>
                <Button variant="outline" className="w-full">
                  Generate Paket
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}