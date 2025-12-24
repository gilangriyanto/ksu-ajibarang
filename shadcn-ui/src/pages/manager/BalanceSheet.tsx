import React, { useState } from "react";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Printer,
  Building,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useBalanceSheet } from "@/hooks/useBalanceSheet";
import { BalanceSheetItem } from "@/utils/balanceSheetTransformer";

export default function BalanceSheet() {
  // Get current date and set default periods
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");

  const [selectedPeriod, setSelectedPeriod] = useState(
    `${currentYear}-${currentMonth}-31`
  );
  const [comparisonPeriod, setComparisonPeriod] = useState(() => {
    const prevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const lastDay = new Date(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
      0
    ).getDate();
    return `${prevMonth.getFullYear()}-${String(
      prevMonth.getMonth() + 1
    ).padStart(2, "0")}-${lastDay}`;
  });

  // Use the custom hook
  const {
    balanceSheetData,
    isLoading,
    error,
    totalCurrentAssets,
    totalNonCurrentAssets,
    totalAssets,
    totalCurrentLiabilities,
    totalNonCurrentLiabilities,
    totalLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity,
    isBalanced,
    refetch,
  } = useBalanceSheet(selectedPeriod, comparisonPeriod);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getVariance = (current: number, previous: number) => {
    const variance = current - previous;
    const percentage = previous !== 0 ? (variance / previous) * 100 : 0;
    return { amount: variance, percentage };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert("Export PDF akan segera tersedia");
  };

  const renderAccountItem = (item: BalanceSheetItem) => {
    const variance = getVariance(item.current, item.previous);
    return (
      <div key={item.code} className="flex justify-between items-center py-1">
        <div>
          <span className="text-sm text-gray-600">{item.code}</span>
          <p className="font-medium">{item.name}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{formatCurrency(item.current)}</p>
          <p
            className={`text-xs ${
              variance.amount >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {variance.amount >= 0 ? "+" : ""}
            {formatCurrency(variance.amount)}
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data neraca...</p>
          </div>
        </div>
      </ManagerLayout>
    );
  }

  if (error) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Gagal Memuat Data
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button
                  onClick={() => refetch()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Neraca (Balance Sheet)
            </h1>
            <p className="text-gray-600 mt-1">
              Laporan posisi keuangan koperasi
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleExportPDF}
            >
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
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={`${currentYear}-01-31`}>
                      Januari {currentYear}
                    </SelectItem>
                    <SelectItem value={`${currentYear}-02-28`}>
                      Februari {currentYear}
                    </SelectItem>
                    <SelectItem value={`${currentYear}-03-31`}>
                      Maret {currentYear}
                    </SelectItem>
                    <SelectItem value={`${currentYear}-04-30`}>
                      April {currentYear}
                    </SelectItem>
                    <SelectItem value={`${currentYear}-05-31`}>
                      Mei {currentYear}
                    </SelectItem>
                    <SelectItem value={`${currentYear}-06-30`}>
                      Juni {currentYear}
                    </SelectItem>
                    <SelectItem value={`${currentYear}-07-31`}>
                      Juli {currentYear}
                    </SelectItem>
                    <SelectItem value={`${currentYear}-08-31`}>
                      Agustus {currentYear}
                    </SelectItem>
                    <SelectItem value={`${currentYear}-09-30`}>
                      September {currentYear}
                    </SelectItem>
                    <SelectItem value={`${currentYear}-10-31`}>
                      Oktober {currentYear}
                    </SelectItem>
                    <SelectItem value={`${currentYear}-11-30`}>
                      November {currentYear}
                    </SelectItem>
                    <SelectItem value={`${currentYear}-12-31`}>
                      Desember {currentYear}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Periode Pembanding
                </label>
                <Select
                  value={comparisonPeriod}
                  onValueChange={setComparisonPeriod}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={`${currentYear - 1}-12-31`}>
                      Desember {currentYear - 1}
                    </SelectItem>
                    <SelectItem value={`${currentYear - 1}-11-30`}>
                      November {currentYear - 1}
                    </SelectItem>
                    <SelectItem value={`${currentYear - 1}-10-31`}>
                      Oktober {currentYear - 1}
                    </SelectItem>
                    <SelectItem value={`${currentYear - 1}-09-30`}>
                      September {currentYear - 1}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Check */}
        <Card
          className={`border-2 ${
            isBalanced
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isBalanced ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <h3
                    className={`font-medium ${
                      isBalanced ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    Status Neraca: {isBalanced ? "Seimbang" : "Tidak Seimbang"}
                  </h3>
                  <p
                    className={`text-sm ${
                      isBalanced ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    Total Aktiva: {formatCurrency(totalAssets)} | Total Pasiva +
                    Modal: {formatCurrency(totalLiabilitiesAndEquity)}
                  </p>
                </div>
              </div>
              {!isBalanced && (
                <div className="text-right">
                  <p className="text-sm text-red-600">Selisih:</p>
                  <p className="font-bold text-red-600">
                    {formatCurrency(
                      Math.abs(totalAssets - totalLiabilitiesAndEquity)
                    )}
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
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Aktiva Lancar
                  </h4>
                  <div className="space-y-2">
                    {balanceSheetData?.assets.currentAssets.map(
                      renderAccountItem
                    )}
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
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Aktiva Tidak Lancar
                  </h4>
                  <div className="space-y-2">
                    {balanceSheetData?.assets.nonCurrentAssets.map(
                      renderAccountItem
                    )}
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
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Kewajiban Lancar
                  </h4>
                  <div className="space-y-2">
                    {balanceSheetData?.liabilities.currentLiabilities.map(
                      renderAccountItem
                    )}
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
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Kewajiban Jangka Panjang
                  </h4>
                  <div className="space-y-2">
                    {balanceSheetData?.liabilities.nonCurrentLiabilities.map(
                      renderAccountItem
                    )}
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
                    {balanceSheetData?.equity.map(renderAccountItem)}
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
                  {totalCurrentLiabilities > 0
                    ? (totalCurrentAssets / totalCurrentLiabilities).toFixed(2)
                    : "0.00"}
                </p>
                <p className="text-xs text-gray-500">
                  Aktiva Lancar / Kewajiban Lancar
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Debt to Equity Ratio</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalEquity > 0
                    ? (totalLiabilities / totalEquity).toFixed(2)
                    : "0.00"}
                </p>
                <p className="text-xs text-gray-500">
                  Total Kewajiban / Total Modal
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Equity Ratio</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalAssets > 0
                    ? ((totalEquity / totalAssets) * 100).toFixed(1)
                    : "0.0"}
                  %
                </p>
                <p className="text-xs text-gray-500">
                  Total Modal / Total Aktiva
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Debt Ratio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalAssets > 0
                    ? ((totalLiabilities / totalAssets) * 100).toFixed(1)
                    : "0.0"}
                  %
                </p>
                <p className="text-xs text-gray-500">
                  Total Kewajiban / Total Aktiva
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  );
}
