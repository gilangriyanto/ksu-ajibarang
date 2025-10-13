import React, { useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart3
} from 'lucide-react';

export default function IncomeStatement() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');
  const [comparisonPeriod, setComparisonPeriod] = useState('2023-12');

  // Mock data for income statement
  const incomeStatementData = {
    period: '2024-01',
    comparisonPeriod: '2023-12',
    revenue: [
      { code: '4-1001', name: 'Pendapatan Jasa Pinjaman', current: 45000000, previous: 42000000 },
      { code: '4-1002', name: 'Pendapatan Administrasi', current: 8000000, previous: 7500000 },
      { code: '4-1003', name: 'Pendapatan Denda', current: 2000000, previous: 1800000 },
      { code: '4-1004', name: 'Pendapatan Lain-lain', current: 3000000, previous: 2500000 }
    ],
    operatingExpenses: [
      { code: '5-1001', name: 'Beban Gaji dan Tunjangan', current: 25000000, previous: 24000000 },
      { code: '5-1002', name: 'Beban Operasional Kantor', current: 8000000, previous: 7500000 },
      { code: '5-1003', name: 'Beban Listrik dan Air', current: 3000000, previous: 2800000 },
      { code: '5-1004', name: 'Beban Komunikasi', current: 2000000, previous: 1900000 },
      { code: '5-1005', name: 'Beban Transportasi', current: 1500000, previous: 1400000 },
      { code: '5-1006', name: 'Beban Pemeliharaan', current: 2500000, previous: 2200000 }
    ],
    nonOperatingIncome: [
      { code: '4-2001', name: 'Pendapatan Bunga Bank', current: 1500000, previous: 1200000 },
      { code: '4-2002', name: 'Pendapatan Sewa', current: 2000000, previous: 2000000 }
    ],
    nonOperatingExpenses: [
      { code: '5-2001', name: 'Beban Penyusutan', current: 3125000, previous: 3125000 },
      { code: '5-2002', name: 'Beban Bunga', current: 500000, previous: 600000 },
      { code: '5-2003', name: 'Beban Pajak', current: 2000000, previous: 1800000 }
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

  const totalRevenue = calculateTotal(incomeStatementData.revenue);
  const totalOperatingExpenses = calculateTotal(incomeStatementData.operatingExpenses);
  const operatingIncome = totalRevenue - totalOperatingExpenses;

  const totalNonOperatingIncome = calculateTotal(incomeStatementData.nonOperatingIncome);
  const totalNonOperatingExpenses = calculateTotal(incomeStatementData.nonOperatingExpenses);
  const nonOperatingIncome = totalNonOperatingIncome - totalNonOperatingExpenses;

  const netIncome = operatingIncome + nonOperatingIncome;

  // Previous period calculations
  const previousTotalRevenue = calculatePreviousTotal(incomeStatementData.revenue);
  const previousTotalOperatingExpenses = calculatePreviousTotal(incomeStatementData.operatingExpenses);
  const previousOperatingIncome = previousTotalRevenue - previousTotalOperatingExpenses;

  const previousTotalNonOperatingIncome = calculatePreviousTotal(incomeStatementData.nonOperatingIncome);
  const previousTotalNonOperatingExpenses = calculatePreviousTotal(incomeStatementData.nonOperatingExpenses);
  const previousNonOperatingIncome = previousTotalNonOperatingIncome - previousTotalNonOperatingExpenses;

  const previousNetIncome = previousOperatingIncome + previousNonOperatingIncome;

  // Ratios and margins
  const grossMargin = (operatingIncome / totalRevenue) * 100;
  const netMargin = (netIncome / totalRevenue) * 100;
  const operatingExpenseRatio = (totalOperatingExpenses / totalRevenue) * 100;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laporan Laba Rugi</h1>
            <p className="text-gray-600 mt-1">Laporan kinerja keuangan koperasi</p>
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

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-gray-500">
                    {getVariance(totalRevenue, previousTotalRevenue).percentage.toFixed(1)}% vs periode lalu
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Laba Operasional</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(operatingIncome)}</p>
                  <p className="text-xs text-gray-500">
                    {getVariance(operatingIncome, previousOperatingIncome).percentage.toFixed(1)}% vs periode lalu
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Laba Bersih</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(netIncome)}</p>
                  <p className="text-xs text-gray-500">
                    {getVariance(netIncome, previousNetIncome).percentage.toFixed(1)}% vs periode lalu
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Percent className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Margin</p>
                  <p className="text-2xl font-bold text-orange-600">{netMargin.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">Margin laba bersih</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income Statement */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan Laba Rugi</CardTitle>
            <CardDescription>
              Periode: {selectedPeriod} vs {comparisonPeriod}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Revenue Section */}
              <div>
                <h4 className="font-semibold text-lg text-green-600 mb-4">PENDAPATAN</h4>
                <div className="space-y-2">
                  {incomeStatementData.revenue.map((item) => {
                    const variance = getVariance(item.current, item.previous);
                    return (
                      <div key={item.code} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <span className="text-sm text-gray-600">{item.code}</span>
                          <p className="font-medium">{item.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.current)}</p>
                          <p className={`text-xs ${variance.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {variance.amount >= 0 ? '+' : ''}{formatCurrency(variance.amount)} ({variance.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t-2 border-green-200 pt-3 mt-4">
                  <div className="flex justify-between items-center font-bold text-lg text-green-600">
                    <span>TOTAL PENDAPATAN</span>
                    <span>{formatCurrency(totalRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Operating Expenses Section */}
              <div>
                <h4 className="font-semibold text-lg text-red-600 mb-4">BEBAN OPERASIONAL</h4>
                <div className="space-y-2">
                  {incomeStatementData.operatingExpenses.map((item) => {
                    const variance = getVariance(item.current, item.previous);
                    return (
                      <div key={item.code} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <span className="text-sm text-gray-600">{item.code}</span>
                          <p className="font-medium">{item.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">({formatCurrency(item.current)})</p>
                          <p className={`text-xs ${variance.amount <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {variance.amount >= 0 ? '+' : ''}{formatCurrency(variance.amount)} ({variance.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t-2 border-red-200 pt-3 mt-4">
                  <div className="flex justify-between items-center font-bold text-lg text-red-600">
                    <span>TOTAL BEBAN OPERASIONAL</span>
                    <span>({formatCurrency(totalOperatingExpenses)})</span>
                  </div>
                </div>
              </div>

              {/* Operating Income */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center font-bold text-xl text-blue-600">
                  <span>LABA OPERASIONAL</span>
                  <span>{formatCurrency(operatingIncome)}</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Margin: {grossMargin.toFixed(1)}% | 
                  Variance: {getVariance(operatingIncome, previousOperatingIncome).percentage.toFixed(1)}%
                </p>
              </div>

              {/* Non-Operating Income */}
              <div>
                <h4 className="font-semibold text-lg text-purple-600 mb-4">PENDAPATAN NON-OPERASIONAL</h4>
                <div className="space-y-2">
                  {incomeStatementData.nonOperatingIncome.map((item) => {
                    const variance = getVariance(item.current, item.previous);
                    return (
                      <div key={item.code} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <span className="text-sm text-gray-600">{item.code}</span>
                          <p className="font-medium">{item.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.current)}</p>
                          <p className={`text-xs ${variance.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {variance.amount >= 0 ? '+' : ''}{formatCurrency(variance.amount)} ({variance.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Non-Operating Expenses */}
              <div>
                <h4 className="font-semibold text-lg text-orange-600 mb-4">BEBAN NON-OPERASIONAL</h4>
                <div className="space-y-2">
                  {incomeStatementData.nonOperatingExpenses.map((item) => {
                    const variance = getVariance(item.current, item.previous);
                    return (
                      <div key={item.code} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <span className="text-sm text-gray-600">{item.code}</span>
                          <p className="font-medium">{item.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">({formatCurrency(item.current)})</p>
                          <p className={`text-xs ${variance.amount <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {variance.amount >= 0 ? '+' : ''}{formatCurrency(variance.amount)} ({variance.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Net Income */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
                <div className="flex justify-between items-center font-bold text-2xl text-purple-600">
                  <span>LABA BERSIH (SHU)</span>
                  <span>{formatCurrency(netIncome)}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Net Margin:</p>
                    <p className="font-semibold text-purple-600">{netMargin.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Growth:</p>
                    <p className={`font-semibold ${getVariance(netIncome, previousNetIncome).amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getVariance(netIncome, previousNetIncome).percentage.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Variance:</p>
                    <p className={`font-semibold ${getVariance(netIncome, previousNetIncome).amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(getVariance(netIncome, previousNetIncome).amount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Analisis Keuangan</CardTitle>
            <CardDescription>Rasio dan metrik kinerja keuangan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Gross Profit Margin</p>
                <p className="text-3xl font-bold text-green-600">{grossMargin.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Laba Operasional / Total Pendapatan</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Operating Expense Ratio</p>
                <p className="text-3xl font-bold text-blue-600">{operatingExpenseRatio.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Beban Operasional / Total Pendapatan</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Net Profit Margin</p>
                <p className="text-3xl font-bold text-purple-600">{netMargin.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Laba Bersih / Total Pendapatan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  );
}