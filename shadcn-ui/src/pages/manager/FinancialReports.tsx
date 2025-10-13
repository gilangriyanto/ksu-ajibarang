import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
  Users,
  CreditCard,
  PiggyBank,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { FinancialSummary } from '@/types/financial-reports';
import { generateFinancialSummary } from '@/lib/financial-reports';

interface Period {
  id: string;
  year: number;
  month: number;
  status: 'open' | 'closed';
}

const mockPeriods: Period[] = [
  { id: '1', year: 2024, month: 1, status: 'closed' },
  { id: '2', year: 2024, month: 2, status: 'open' },
];

export default function FinancialReports() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2');
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const loadFinancialSummary = async () => {
    try {
      const data = generateFinancialSummary(selectedPeriod);
      setFinancialSummary(data);
    } catch (error) {
      console.error('Error loading financial summary:', error);
    }
  };

  useEffect(() => {
    loadFinancialSummary();
  }, [selectedPeriod]);

  const selectedPeriodData = mockPeriods.find(p => p.id === selectedPeriod);

  const reportCards = [
    {
      title: 'Neraca',
      description: 'Balance Sheet - Posisi keuangan koperasi',
      icon: Building,
      href: '/manager/accounting/balance-sheet',
      color: 'bg-blue-500',
    },
    {
      title: 'Laporan Laba Rugi',
      description: 'Income Statement - Kinerja keuangan periode',
      icon: TrendingUp,
      href: '/manager/accounting/income-statement',
      color: 'bg-green-500',
    },
    {
      title: 'Laporan Arus Kas',
      description: 'Cash Flow Statement - Pergerakan kas',
      icon: DollarSign,
      href: '/manager/accounting/cash-flow',
      color: 'bg-purple-500',
    },
    {
      title: 'Neraca Saldo',
      description: 'Trial Balance - Saldo semua akun',
      icon: BarChart3,
      href: '/manager/accounting/trial-balance',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-gray-600">Dashboard laporan keuangan koperasi</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All Reports
        </Button>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Pilih Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="period">Periode Akuntansi</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  {mockPeriods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {getMonthName(period.month)} {period.year}
                      {period.status === 'open' && (
                        <Badge variant="outline" className="ml-2">Open</Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      {financialSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialSummary.total_assets)}</div>
              <p className="text-xs text-muted-foreground">
                Posisi keuangan koperasi
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laba Bersih</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.net_income)}</div>
              <p className="text-xs text-muted-foreground">
                Periode {financialSummary.period_name}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posisi Kas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialSummary.cash_position)}</div>
              <p className="text-xs text-muted-foreground">
                Kas dan setara kas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Simpanan Anggota</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialSummary.member_savings)}</div>
              <p className="text-xs text-muted-foreground">
                Total simpanan anggota
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {reportCards.map((report, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${report.color}`}>
                  <report.icon className="h-6 w-6 text-white" />
                </div>
                <span>{report.title}</span>
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={report.href}>
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Lihat Laporan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Financial Ratios */}
      {financialSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Rasio Keuangan Utama</CardTitle>
            <CardDescription>
              Analisis cepat kinerja keuangan periode {financialSummary.period_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {((financialSummary.total_equity / financialSummary.total_assets) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-blue-700 font-medium">Rasio Ekuitas</div>
                <div className="text-xs text-gray-600">Equity to Assets</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {((financialSummary.net_income / financialSummary.total_revenue) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-green-700 font-medium">Margin Laba</div>
                <div className="text-xs text-gray-600">Net Profit Margin</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {((financialSummary.cash_position / financialSummary.total_assets) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-purple-700 font-medium">Rasio Kas</div>
                <div className="text-xs text-gray-600">Cash to Assets</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {((financialSummary.outstanding_loans / financialSummary.member_savings) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-orange-700 font-medium">Loan to Deposit</div>
                <div className="text-xs text-gray-600">Pinjaman vs Simpanan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terkini</CardTitle>
          <CardDescription>
            Ringkasan aktivitas laporan keuangan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="flex-1">
                <div className="font-medium">Neraca telah di-generate</div>
                <div className="text-sm text-gray-600">2 jam yang lalu</div>
              </div>
              <Badge variant="outline">Completed</Badge>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="flex-1">
                <div className="font-medium">Laporan Laba Rugi diperbarui</div>
                <div className="text-sm text-gray-600">5 jam yang lalu</div>
              </div>
              <Badge variant="outline">Updated</Badge>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-orange-500" />
              <div className="flex-1">
                <div className="font-medium">Neraca Saldo diverifikasi</div>
                <div className="text-sm text-gray-600">1 hari yang lalu</div>
              </div>
              <Badge variant="outline">Verified</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}