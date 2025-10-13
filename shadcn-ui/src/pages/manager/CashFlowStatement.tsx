import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { CashFlowData } from '@/types/financial-reports';
import { generateMockCashFlow } from '@/lib/financial-reports';

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

export default function CashFlowStatement() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2');
  const [cashFlowData, setCashFlowData] = useState<CashFlowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const loadCashFlow = async () => {
    setIsLoading(true);
    try {
      const data = generateMockCashFlow(selectedPeriod);
      setCashFlowData(data);
    } catch (error) {
      console.error('Error loading cash flow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCashFlow();
  }, [selectedPeriod]);

  const selectedPeriodData = mockPeriods.find(p => p.id === selectedPeriod);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!cashFlowData) return;
    
    const csvContent = `
Laporan Arus Kas
Periode: ${cashFlowData.period_name}
Generated: ${new Date(cashFlowData.generated_at).toLocaleDateString('id-ID')}

AKTIVITAS OPERASI:
Kas dari Anggota,${cashFlowData.operating_activities.cash_from_members}
Kas dari Pinjaman,${cashFlowData.operating_activities.cash_from_loans}
Kas untuk Beban,${cashFlowData.operating_activities.cash_paid_expenses}
Arus Kas Bersih dari Aktivitas Operasi,${cashFlowData.operating_activities.net_operating_cash}

AKTIVITAS INVESTASI:
Pembelian Peralatan,${cashFlowData.investing_activities.equipment_purchases}
Penjualan Aset,${cashFlowData.investing_activities.asset_sales}
Arus Kas Bersih dari Aktivitas Investasi,${cashFlowData.investing_activities.net_investing_cash}

AKTIVITAS PENDANAAN:
Kontribusi Anggota,${cashFlowData.financing_activities.member_contributions}
Pembayaran Pinjaman,${cashFlowData.financing_activities.loan_repayments}
Arus Kas Bersih dari Aktivitas Pendanaan,${cashFlowData.financing_activities.net_financing_cash}

Arus Kas Bersih,${cashFlowData.net_cash_flow}
Kas Awal Periode,${cashFlowData.beginning_cash}
Kas Akhir Periode,${cashFlowData.ending_cash}
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arus_kas_${cashFlowData.period_name.replace(' ', '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderCashFlowItem = (label: string, amount: number, isSubtotal = false) => {
    const isPositive = amount >= 0;
    return (
      <div className={`flex justify-between ${isSubtotal ? 'font-semibold text-lg' : ''}`}>
        <span className={isSubtotal ? '' : 'ml-4'}>{label}</span>
        <span className={`font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '' : '('}
          {formatCurrency(Math.abs(amount))}
          {isPositive ? '' : ')'}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Arus Kas</h1>
          <p className="text-gray-600">Cash Flow Statement - Laporan pergerakan kas koperasi</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadCashFlow} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleExport} disabled={!cashFlowData}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
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

      {/* Cash Flow Statement */}
      {cashFlowData && (
        <div className="print:shadow-none">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">LAPORAN ARUS KAS</CardTitle>
              <CardTitle className="text-xl">KOPERASI RUMAH SAKIT SEJAHTERA</CardTitle>
              <CardDescription className="text-lg">
                Untuk Periode {cashFlowData.period_name}
              </CardDescription>
              <p className="text-sm text-gray-500">
                Generated on {new Date(cashFlowData.generated_at).toLocaleDateString('id-ID')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* AKTIVITAS OPERASI */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
                    ARUS KAS DARI AKTIVITAS OPERASI
                  </h3>
                  <div className="space-y-2">
                    {renderCashFlowItem('Kas diterima dari anggota', cashFlowData.operating_activities.cash_from_members)}
                    {renderCashFlowItem('Kas dari pembayaran pinjaman', cashFlowData.operating_activities.cash_from_loans)}
                    {renderCashFlowItem('Kas dibayar untuk beban', cashFlowData.operating_activities.cash_paid_expenses)}
                    <Separator />
                    {renderCashFlowItem('Arus kas bersih dari aktivitas operasi', cashFlowData.operating_activities.net_operating_cash, true)}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* AKTIVITAS INVESTASI */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <ArrowDownCircle className="mr-2 h-5 w-5 text-purple-600" />
                    ARUS KAS DARI AKTIVITAS INVESTASI
                  </h3>
                  <div className="space-y-2">
                    {renderCashFlowItem('Pembelian peralatan', cashFlowData.investing_activities.equipment_purchases)}
                    {renderCashFlowItem('Penjualan aset', cashFlowData.investing_activities.asset_sales)}
                    <Separator />
                    {renderCashFlowItem('Arus kas bersih dari aktivitas investasi', cashFlowData.investing_activities.net_investing_cash, true)}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* AKTIVITAS PENDANAAN */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <ArrowUpCircle className="mr-2 h-5 w-5 text-green-600" />
                    ARUS KAS DARI AKTIVITAS PENDANAAN
                  </h3>
                  <div className="space-y-2">
                    {renderCashFlowItem('Kontribusi dari anggota', cashFlowData.financing_activities.member_contributions)}
                    {renderCashFlowItem('Pembayaran kembali pinjaman', cashFlowData.financing_activities.loan_repayments)}
                    <Separator />
                    {renderCashFlowItem('Arus kas bersih dari aktivitas pendanaan', cashFlowData.financing_activities.net_financing_cash, true)}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* NET CASH FLOW */}
                <div className="space-y-3">
                  {renderCashFlowItem('Kenaikan (penurunan) bersih kas', cashFlowData.net_cash_flow, true)}
                  {renderCashFlowItem('Kas pada awal periode', cashFlowData.beginning_cash)}
                  <Separator />
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center text-xl font-bold text-blue-700">
                      <span>KAS PADA AKHIR PERIODE</span>
                      <span className="font-mono">{formatCurrency(cashFlowData.ending_cash)}</span>
                    </div>
                  </div>
                </div>

                {/* Cash Flow Analysis */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Analisis Arus Kas:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-white rounded border">
                      <div className="font-semibold text-blue-600">Operasi</div>
                      <div className={`font-mono ${cashFlowData.operating_activities.net_operating_cash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(cashFlowData.operating_activities.net_operating_cash)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white rounded border">
                      <div className="font-semibold text-purple-600">Investasi</div>
                      <div className={`font-mono ${cashFlowData.investing_activities.net_investing_cash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(cashFlowData.investing_activities.net_investing_cash)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white rounded border">
                      <div className="font-semibold text-green-600">Pendanaan</div>
                      <div className={`font-mono ${cashFlowData.financing_activities.net_financing_cash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(cashFlowData.financing_activities.net_financing_cash)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}