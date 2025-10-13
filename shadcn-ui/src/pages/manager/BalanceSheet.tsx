import React, { useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download,
  Printer,
  Calendar,
  Building,
  CreditCard,
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function BalanceSheet() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');
  const [comparisonPeriod, setComparisonPeriod] = useState('2023-12');

  // Mock data for balance sheet
  const balanceSheetData = {
    period: '2024-01-31',
    comparisonPeriod: '2023-12-31',
    assets: {
      currentAssets: [
        { code: '1-1001', name: 'Kas', current: 50000000, previous: 45000000 },
        { code: '1-1002', name: 'Bank BCA', current: 125000000, previous: 110000000 },
        { code: '1-1003', name: 'Bank Mandiri', current: 75000000, previous: 80000000 },
        { code: '1-1101', name: 'Piutang Anggota', current: 85000000, previous: 90000000 },
        { code: '1-1201', name: 'Persediaan ATK', current: 5000000, previous: 4500000 }
      ],
      nonCurrentAssets: [
        { code: '1-2001', name: 'Gedung Kantor', current: 500000000, previous: 500000000 },
        { code: '1-2002', name: 'Akm. Penyusutan Gedung', current: -50000000, previous: -47000000 },
        { code: '1-2101', name: 'Kendaraan', current: 200000000, previous: 200000000 },
        { code: '1-2102', name: 'Akm. Penyusutan Kendaraan', current: -50000000, previous: -45000000 },
        { code: '1-2201', name: 'Peralatan Kantor', current: 75000000, previous: 75000000 },
        { code: '1-2202', name: 'Akm. Penyusutan Peralatan', current: -15000000, previous: -12000000 }
      ]
    },
    liabilities: {
      currentLiabilities: [
        { code: '2-1001', name: 'Utang Usaha', current: 25000000, previous: 30000000 },
        { code: '2-1002', name: 'Utang Gaji', current: 15000000, previous: 12000000 },
        { code: '2-1003', name: 'Utang Pajak', current: 8000000, previous: 10000000 }
      ],
      nonCurrentLiabilities: [
        { code: '2-2001', name: 'Simpanan Wajib Anggota', current: 150000000, previous: 140000000 },
        { code: '2-2002', name: 'Simpanan Sukarela Anggota', current: 200000000, previous: 180000000 },
        { code: '2-2003', name: 'Simpanan Berjangka', current: 100000000, previous: 95000000 }
      ]
    },
    equity: [
      { code: '3-1001', name: 'Modal Dasar Koperasi', current: 200000000, previous: 200000000 },
      { code: '3-1002', name: 'Cadangan Umum', current: 50000000, previous: 45000000 },
      { code: '3-1003', name: 'Cadangan Khusus', current: 25000000, previous: 20000000 },
      { code: '3-1004', name: 'SHU Tahun Berjalan', current: 35000000, previous: 28000000 }
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.current, 0);
  };

  const calculatePreviousTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.previous, 0);
  };

  const getVariance = (current: number, previous: number) => {
    const variance = current - previous;
    const percentage = previous !== 0 ? (variance / previous) * 100 : 0;
    return { amount: variance, percentage };
  };

  const totalCurrentAssets = calculateTotal(balanceSheetData.assets.currentAssets);
  const totalNonCurrentAssets = calculateTotal(balanceSheetData.assets.nonCurrentAssets);
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const totalCurrentLiabilities = calculateTotal(balanceSheetData.liabilities.currentLiabilities);
  const totalNonCurrentLiabilities = calculateTotal(balanceSheetData.liabilities.nonCurrentLiabilities);
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

  const totalEquity = calculateTotal(balanceSheetData.equity);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const isBalanced = totalAssets === totalLiabilitiesAndEquity;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Neraca (Balance Sheet)</h1>
            <p className="text-gray-600 mt-1">Laporan posisi keuangan koperasi</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Periode Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Periode Utama
                </label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-01">Januari 2024</SelectItem>
                    <SelectItem value="2023-12">Desember 2023</SelectItem>
                    <SelectItem value="2023-11">November 2023</SelectItem>
                    <SelectItem value="2023-10">Oktober 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Periode Pembanding
                </label>
                <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-12">Desember 2023</SelectItem>
                    <SelectItem value="2023-11">November 2023</SelectItem>
                    <SelectItem value="2023-10">Oktober 2023</SelectItem>
                    <SelectItem value="2023-09">September 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Check */}
        <Card className={`border-2 ${isBalanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isBalanced ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <h3 className={`font-medium ${isBalanced ? 'text-green-800' : 'text-red-800'}`}>
                    Status Neraca: {isBalanced ? 'Seimbang' : 'Tidak Seimbang'}
                  </h3>
                  <p className={`text-sm ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                    Total Aktiva: {formatCurrency(totalAssets)} | 
                    Total Pasiva + Modal: {formatCurrency(totalLiabilitiesAndEquity)}
                  </p>
                </div>
              </div>
              {!isBalanced && (
                <div className="text-right">
                  <p className="text-sm text-red-600">Selisih:</p>
                  <p className="font-bold text-red-600">
                    {formatCurrency(Math.abs(totalAssets - totalLiabilitiesAndEquity))}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Balance Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-600" />
                AKTIVA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Assets */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Aktiva Lancar</h4>
                  <div className="space-y-2">
                    {balanceSheetData.assets.currentAssets.map((asset) => {
                      const variance = getVariance(asset.current, asset.previous);
                      return (
                        <div key={asset.code} className="flex justify-between items-center py-1">
                          <div>
                            <span className="text-sm text-gray-600">{asset.code}</span>
                            <p className="font-medium">{asset.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(asset.current)}</p>
                            <p className={`text-xs ${variance.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {variance.amount >= 0 ? '+' : ''}{formatCurrency(variance.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Aktiva Lancar</span>
                      <span>{formatCurrency(totalCurrentAssets)}</span>
                    </div>
                  </div>
                </div>

                {/* Non-Current Assets */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Aktiva Tidak Lancar</h4>
                  <div className="space-y-2">
                    {balanceSheetData.assets.nonCurrentAssets.map((asset) => {
                      const variance = getVariance(asset.current, asset.previous);
                      return (
                        <div key={asset.code} className="flex justify-between items-center py-1">
                          <div>
                            <span className="text-sm text-gray-600">{asset.code}</span>
                            <p className="font-medium">{asset.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(asset.current)}</p>
                            <p className={`text-xs ${variance.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {variance.amount >= 0 ? '+' : ''}{formatCurrency(variance.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Aktiva Tidak Lancar</span>
                      <span>{formatCurrency(totalNonCurrentAssets)}</span>
                    </div>
                  </div>
                </div>

                {/* Total Assets */}
                <div className="border-t-2 border-gray-300 pt-3">
                  <div className="flex justify-between items-center font-bold text-lg text-blue-600">
                    <span>TOTAL AKTIVA</span>
                    <span>{formatCurrency(totalAssets)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liabilities and Equity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-red-600" />
                PASIVA & MODAL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Liabilities */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Kewajiban Lancar</h4>
                  <div className="space-y-2">
                    {balanceSheetData.liabilities.currentLiabilities.map((liability) => {
                      const variance = getVariance(liability.current, liability.previous);
                      return (
                        <div key={liability.code} className="flex justify-between items-center py-1">
                          <div>
                            <span className="text-sm text-gray-600">{liability.code}</span>
                            <p className="font-medium">{liability.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(liability.current)}</p>
                            <p className={`text-xs ${variance.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {variance.amount >= 0 ? '+' : ''}{formatCurrency(variance.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Kewajiban Lancar</span>
                      <span>{formatCurrency(totalCurrentLiabilities)}</span>
                    </div>
                  </div>
                </div>

                {/* Non-Current Liabilities */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Kewajiban Jangka Panjang</h4>
                  <div className="space-y-2">
                    {balanceSheetData.liabilities.nonCurrentLiabilities.map((liability) => {
                      const variance = getVariance(liability.current, liability.previous);
                      return (
                        <div key={liability.code} className="flex justify-between items-center py-1">
                          <div>
                            <span className="text-sm text-gray-600">{liability.code}</span>
                            <p className="font-medium">{liability.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(liability.current)}</p>
                            <p className={`text-xs ${variance.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {variance.amount >= 0 ? '+' : ''}{formatCurrency(variance.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Kewajiban Jangka Panjang</span>
                      <span>{formatCurrency(totalNonCurrentLiabilities)}</span>
                    </div>
                  </div>
                </div>

                {/* Equity */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Modal</h4>
                  <div className="space-y-2">
                    {balanceSheetData.equity.map((equity) => {
                      const variance = getVariance(equity.current, equity.previous);
                      return (
                        <div key={equity.code} className="flex justify-between items-center py-1">
                          <div>
                            <span className="text-sm text-gray-600">{equity.code}</span>
                            <p className="font-medium">{equity.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(equity.current)}</p>
                            <p className={`text-xs ${variance.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {variance.amount >= 0 ? '+' : ''}{formatCurrency(variance.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Modal</span>
                      <span>{formatCurrency(totalEquity)}</span>
                    </div>
                  </div>
                </div>

                {/* Total Liabilities and Equity */}
                <div className="border-t-2 border-gray-300 pt-3">
                  <div className="flex justify-between items-center font-bold text-lg text-red-600">
                    <span>TOTAL PASIVA & MODAL</span>
                    <span>{formatCurrency(totalLiabilitiesAndEquity)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Ratios */}
        <Card>
          <CardHeader>
            <CardTitle>Rasio Keuangan</CardTitle>
            <CardDescription>Analisis rasio berdasarkan neraca</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Current Ratio</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(totalCurrentAssets / totalCurrentLiabilities).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Aktiva Lancar / Kewajiban Lancar</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Debt to Equity Ratio</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(totalLiabilities / totalEquity).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Total Kewajiban / Total Modal</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Equity Ratio</p>
                <p className="text-2xl font-bold text-green-600">
                  {((totalEquity / totalAssets) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Total Modal / Total Aktiva</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Asset Growth</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((totalAssets - 950000000) / 950000000 * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Pertumbuhan dari periode sebelumnya</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  );
}