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
  TrendingUp,
  DollarSign,
  Percent,
  BarChart3,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useIncomeStatement } from "@/hooks/useIncomeStatement";
import {
  IncomeStatementItem,
  calculateVariance,
} from "@/utils/incomeStatementTransformer";
import {
  getPeriodDates,
  generatePeriodOptions,
  getPreviousPeriod,
  formatPeriodDisplay,
} from "@/utils/periodHelper";

export default function IncomeStatement() {
  // Generate period options
  const periodOptions = generatePeriodOptions(12);

  // Get current date and set default periods
  const currentDate = new Date();
  const currentPeriod = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
  const [comparisonPeriod, setComparisonPeriod] = useState(
    getPreviousPeriod(currentPeriod)
  );

  // Get date ranges for both periods
  const currentDates = getPeriodDates(selectedPeriod);
  const previousDates = getPeriodDates(comparisonPeriod);

  // Use the custom hook
  const { incomeStatementData, totals, isLoading, error, refetch } =
    useIncomeStatement(
      currentDates.startDate,
      currentDates.endDate,
      previousDates.startDate,
      previousDates.endDate
    );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert("Export PDF akan segera tersedia");
  };

  const renderIncomeStatementItem = (
    item: IncomeStatementItem,
    isExpense: boolean = false
  ) => {
    const variance = calculateVariance(item.current, item.previous);
    const showNegative = isExpense;

    return (
      <div
        key={item.code}
        className="flex justify-between items-center py-2 border-b border-gray-100"
      >
        <div>
          <span className="text-sm text-gray-600">{item.code}</span>
          <p className="font-medium">{item.name}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">
            {showNegative && item.current > 0 ? "(" : ""}
            {formatCurrency(item.current)}
            {showNegative && item.current > 0 ? ")" : ""}
          </p>
          <p
            className={`text-xs ${
              isExpense
                ? variance.amount <= 0
                  ? "text-green-600"
                  : "text-red-600"
                : variance.amount >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {variance.amount >= 0 ? "+" : ""}
            {formatCurrency(variance.amount)} ({variance.percentage.toFixed(1)}
            %)
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
            <p className="text-gray-600">Memuat data laporan laba rugi...</p>
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

  if (!incomeStatementData || !totals) {
    return null;
  }

  const { current, previous, ratios } = totals;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Laporan Laba Rugi
            </h1>
            <p className="text-gray-600 mt-1">
              Laporan kinerja keuangan koperasi
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
                    {periodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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
                    {periodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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
                  <p className="text-sm font-medium text-gray-600">
                    Total Pendapatan
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(current.totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {calculateVariance(
                      current.totalRevenue,
                      previous.totalRevenue
                    ).percentage.toFixed(1)}
                    % vs periode lalu
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
                  <p className="text-sm font-medium text-gray-600">
                    Laba Operasional
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(current.operatingIncome)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {calculateVariance(
                      current.operatingIncome,
                      previous.operatingIncome
                    ).percentage.toFixed(1)}
                    % vs periode lalu
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
                  <p className="text-sm font-medium text-gray-600">
                    Laba Bersih
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(current.netIncome)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {calculateVariance(
                      current.netIncome,
                      previous.netIncome
                    ).percentage.toFixed(1)}
                    % vs periode lalu
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
                  <p className="text-sm font-medium text-gray-600">
                    Net Margin
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {ratios.netMargin.toFixed(1)}%
                  </p>
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
              Periode: {formatPeriodDisplay(selectedPeriod)} vs{" "}
              {formatPeriodDisplay(comparisonPeriod)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Revenue Section */}
              <div>
                <h4 className="font-semibold text-lg text-green-600 mb-4">
                  PENDAPATAN
                </h4>
                <div className="space-y-2">
                  {incomeStatementData.revenue.length > 0 ? (
                    incomeStatementData.revenue.map((item) =>
                      renderIncomeStatementItem(item, false)
                    )
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Tidak ada data pendapatan
                    </p>
                  )}
                </div>
                <div className="border-t-2 border-green-200 pt-3 mt-4">
                  <div className="flex justify-between items-center font-bold text-lg text-green-600">
                    <span>TOTAL PENDAPATAN</span>
                    <span>{formatCurrency(current.totalRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Operating Expenses Section */}
              <div>
                <h4 className="font-semibold text-lg text-red-600 mb-4">
                  BEBAN OPERASIONAL
                </h4>
                <div className="space-y-2">
                  {incomeStatementData.operatingExpenses.length > 0 ? (
                    incomeStatementData.operatingExpenses.map((item) =>
                      renderIncomeStatementItem(item, true)
                    )
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Tidak ada data beban operasional
                    </p>
                  )}
                </div>
                <div className="border-t-2 border-red-200 pt-3 mt-4">
                  <div className="flex justify-between items-center font-bold text-lg text-red-600">
                    <span>TOTAL BEBAN OPERASIONAL</span>
                    <span>
                      ({formatCurrency(current.totalOperatingExpenses)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Operating Income */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center font-bold text-xl text-blue-600">
                  <span>LABA OPERASIONAL</span>
                  <span>{formatCurrency(current.operatingIncome)}</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Margin: {ratios.grossMargin.toFixed(1)}% | Variance:{" "}
                  {calculateVariance(
                    current.operatingIncome,
                    previous.operatingIncome
                  ).percentage.toFixed(1)}
                  %
                </p>
              </div>

              {/* Non-Operating Income */}
              {incomeStatementData.nonOperatingIncome.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-purple-600 mb-4">
                    PENDAPATAN NON-OPERASIONAL
                  </h4>
                  <div className="space-y-2">
                    {incomeStatementData.nonOperatingIncome.map((item) =>
                      renderIncomeStatementItem(item, false)
                    )}
                  </div>
                </div>
              )}

              {/* Non-Operating Expenses */}
              {incomeStatementData.nonOperatingExpenses.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-orange-600 mb-4">
                    BEBAN NON-OPERASIONAL
                  </h4>
                  <div className="space-y-2">
                    {incomeStatementData.nonOperatingExpenses.map((item) =>
                      renderIncomeStatementItem(item, true)
                    )}
                  </div>
                </div>
              )}

              {/* Net Income */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
                <div className="flex justify-between items-center font-bold text-2xl text-purple-600">
                  <span>LABA BERSIH (SHU)</span>
                  <span>{formatCurrency(current.netIncome)}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Net Margin:</p>
                    <p className="font-semibold text-purple-600">
                      {ratios.netMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Growth:</p>
                    <p
                      className={`font-semibold ${
                        calculateVariance(current.netIncome, previous.netIncome)
                          .amount >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {calculateVariance(
                        current.netIncome,
                        previous.netIncome
                      ).percentage.toFixed(1)}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Variance:</p>
                    <p
                      className={`font-semibold ${
                        calculateVariance(current.netIncome, previous.netIncome)
                          .amount >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(
                        calculateVariance(current.netIncome, previous.netIncome)
                          .amount
                      )}
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
                <p className="text-sm text-gray-600 mb-2">
                  Gross Profit Margin
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {ratios.grossMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Laba Operasional / Total Pendapatan
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Operating Expense Ratio
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {ratios.operatingExpenseRatio.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Beban Operasional / Total Pendapatan
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Net Profit Margin</p>
                <p className="text-3xl font-bold text-purple-600">
                  {ratios.netMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Laba Bersih / Total Pendapatan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  );
}
