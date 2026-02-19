// pages/manager/IncomeStatement.tsx
// ✅ REWRITTEN: Directly calls BOTH endpoints:
//    GET /journals/income-statement?start_date=...&end_date=...&compare=true
//    GET /journals/balance-sheet?as_of_date=...
// ✅ No service layer — direct apiClient for full control
// ✅ Handles ANY response structure with extensive fallbacks

import React, { useState, useEffect, useCallback } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart3,
  Loader2,
  RefreshCw,
  AlertCircle,
  Building,
  CreditCard,
  Wallet,
} from "lucide-react";
import apiClient from "@/lib/api/api-client";

// =====================================================
// Types
// =====================================================
interface AccountItem {
  account_id?: number;
  code: string;
  name: string;
  amount: number;
}

interface IncomeStatementData {
  revenue: AccountItem[];
  expenses: AccountItem[];
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  summary?: {
    total_revenue: number;
    total_expenses: number;
    net_income: number;
    operating_margin?: number;
    is_profit?: boolean;
  };
  comparison?: {
    revenue: AccountItem[];
    expenses: AccountItem[];
    total_revenue: number;
    total_expenses: number;
    net_income: number;
    summary?: any;
  };
  variance?: {
    revenue_change?: number;
    revenue_change_percentage?: number;
    expenses_change?: number;
    expenses_change_percentage?: number;
    net_income_change?: number;
    net_income_change_percentage?: number;
    trend?: string;
  };
}

interface BalanceSheetCategory {
  accounts: AccountItem[];
  total: number;
}

interface BalanceSheetData {
  assets: BalanceSheetCategory | AccountItem[];
  liabilities: BalanceSheetCategory | AccountItem[];
  equity: BalanceSheetCategory | AccountItem[];
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  is_balanced?: boolean;
}

// =====================================================
// Helpers
// =====================================================
const safe = (val: any, fallback = 0): number => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

function generatePeriodOptions(count = 12) {
  const options: Array<{ value: string; label: string }> = [];
  const now = new Date();
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
    });
  }
  return options;
}

function getPeriodDates(period: string) {
  const [year, month] = period.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { startDate, endDate };
}

function formatPeriodDisplay(period: string) {
  const [year, month] = period.split("-").map(Number);
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${monthNames[month - 1]} ${year}`;
}

// Extract accounts array from various response shapes
function extractAccounts(data: any): AccountItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.accounts)) return data.accounts;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

// =====================================================
// Main Component
// =====================================================
export default function IncomeStatement() {
  const periodOptions = generatePeriodOptions(12);
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
  const [incomeData, setIncomeData] = useState<IncomeStatementData | null>(
    null,
  );
  const [balanceData, setBalanceData] = useState<BalanceSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawDebug, setRawDebug] = useState<string>("");

  // =====================================================
  // Fetch BOTH endpoints
  // =====================================================
  const fetchData = useCallback(async () => {
    const { startDate, endDate } = getPeriodDates(selectedPeriod);

    setIsLoading(true);
    setError(null);
    setRawDebug("");

    try {
      console.log("📤 Fetching income statement & balance sheet...");
      console.log("   start_date:", startDate, "end_date:", endDate);

      // ✅ Call BOTH endpoints in parallel
      const [incomeRes, balanceRes] = await Promise.allSettled([
        apiClient.get("/journals/income-statement", {
          params: { start_date: startDate, end_date: endDate, compare: "true" },
        }),
        apiClient.get("/journals/balance-sheet", {
          params: { as_of_date: endDate },
        }),
      ]);

      // =====================================================
      // Parse Income Statement
      // =====================================================
      if (incomeRes.status === "fulfilled") {
        const raw = incomeRes.value.data;
        console.log(
          "✅ Income Statement RAW response:",
          JSON.stringify(raw, null, 2),
        );

        // Handle: { success: true, data: { revenue: [...], expenses: [...], ... } }
        // OR:     { revenue: [...], expenses: [...], ... }
        // OR:     { data: { revenue: [...], ... } }
        const d = raw?.data || raw;

        const revenue = extractAccounts(d?.revenue);
        const expenses = extractAccounts(d?.expenses);
        const totalRevenue = safe(
          d?.total_revenue || d?.summary?.total_revenue,
        );
        const totalExpenses = safe(
          d?.total_expenses || d?.summary?.total_expenses,
        );
        const netIncome = safe(d?.net_income || d?.summary?.net_income);

        // If totals are 0, calculate from items
        const calcRevenue =
          totalRevenue ||
          revenue.reduce((sum, item) => sum + safe(item.amount), 0);
        const calcExpenses =
          totalExpenses ||
          expenses.reduce((sum, item) => sum + safe(item.amount), 0);
        const calcNetIncome = netIncome || calcRevenue - calcExpenses;

        // Comparison data
        let comparison = null;
        if (d?.comparison) {
          const compData = d.comparison?.data || d.comparison;
          const compRevenue = extractAccounts(compData?.revenue);
          const compExpenses = extractAccounts(compData?.expenses);
          const compTotalRev =
            safe(compData?.total_revenue || compData?.summary?.total_revenue) ||
            compRevenue.reduce((s, i) => s + safe(i.amount), 0);
          const compTotalExp =
            safe(
              compData?.total_expenses || compData?.summary?.total_expenses,
            ) || compExpenses.reduce((s, i) => s + safe(i.amount), 0);

          comparison = {
            revenue: compRevenue,
            expenses: compExpenses,
            total_revenue: compTotalRev,
            total_expenses: compTotalExp,
            net_income:
              safe(compData?.net_income || compData?.summary?.net_income) ||
              compTotalRev - compTotalExp,
            summary: compData?.summary,
          };
        }

        setIncomeData({
          revenue,
          expenses,
          total_revenue: calcRevenue,
          total_expenses: calcExpenses,
          net_income: calcNetIncome,
          summary: d?.summary || {
            total_revenue: calcRevenue,
            total_expenses: calcExpenses,
            net_income: calcNetIncome,
            operating_margin:
              calcRevenue > 0
                ? ((calcRevenue - calcExpenses) / calcRevenue) * 100
                : 0,
            is_profit: calcNetIncome >= 0,
          },
          comparison,
          variance: d?.variance,
        });

        setRawDebug(JSON.stringify(raw, null, 2).slice(0, 2000));
      } else {
        console.error("❌ Income statement failed:", incomeRes.reason);
        setError(
          `Income Statement error: ${incomeRes.reason?.message || "Unknown error"}`,
        );
      }

      // =====================================================
      // Parse Balance Sheet
      // =====================================================
      if (balanceRes.status === "fulfilled") {
        const raw = balanceRes.value.data;
        console.log(
          "✅ Balance Sheet RAW response:",
          JSON.stringify(raw, null, 2),
        );

        const d = raw?.data || raw;

        setBalanceData({
          assets: d?.assets || [],
          liabilities: d?.liabilities || [],
          equity: d?.equity || [],
          total_assets: safe(d?.total_assets),
          total_liabilities: safe(d?.total_liabilities),
          total_equity: safe(d?.total_equity),
          is_balanced: d?.is_balanced,
        });
      } else {
        console.warn(
          "⚠️ Balance sheet failed (non-critical):",
          balanceRes.reason,
        );
      }
    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err.message || "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =====================================================
  // Derived values
  // =====================================================
  const totalRevenue = safe(incomeData?.total_revenue);
  const totalExpenses = safe(incomeData?.total_expenses);
  const netIncome = safe(incomeData?.net_income);
  const isProfit = netIncome >= 0;

  const netMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
  const grossMargin =
    totalRevenue > 0
      ? ((totalRevenue - totalExpenses) / totalRevenue) * 100
      : 0;
  const expenseRatio =
    totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

  // Comparison
  const comp = incomeData?.comparison;
  const prevRevenue = safe(comp?.total_revenue);
  const prevExpenses = safe(comp?.total_expenses);
  const prevNetIncome = safe(comp?.net_income);

  const variance = (current: number, previous: number) => {
    const diff = current - previous;
    const pct =
      previous !== 0
        ? (diff / Math.abs(previous)) * 100
        : current !== 0
          ? 100
          : 0;
    return { diff, pct };
  };

  // Balance sheet totals
  const totalAssets = safe(balanceData?.total_assets);
  const totalLiabilities = safe(balanceData?.total_liabilities);
  const totalEquity = safe(balanceData?.total_equity);

  // =====================================================
  // Loading
  // =====================================================
  if (isLoading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">
              Memuat laporan laba rugi & neraca...
            </p>
          </div>
        </div>
      </ManagerLayout>
    );
  }

  // =====================================================
  // Error
  // =====================================================
  if (error && !incomeData) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Gagal Memuat Data
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchData}>
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

  // =====================================================
  // Render
  // =====================================================
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
            <Button variant="outline" onClick={() => window.print()}>
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
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Periode
                </label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={fetchData}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
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
                    {formatCurrency(totalRevenue)}
                  </p>
                  {comp && (
                    <p
                      className={`text-xs ${variance(totalRevenue, prevRevenue).diff >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {variance(totalRevenue, prevRevenue).pct.toFixed(1)}% vs
                      periode lalu
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Beban
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </p>
                  {comp && (
                    <p
                      className={`text-xs ${variance(totalExpenses, prevExpenses).diff <= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {variance(totalExpenses, prevExpenses).pct.toFixed(1)}% vs
                      periode lalu
                    </p>
                  )}
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
                    Laba Bersih (SHU)
                  </p>
                  <p
                    className={`text-2xl font-bold ${isProfit ? "text-purple-600" : "text-red-600"}`}
                  >
                    {formatCurrency(netIncome)}
                  </p>
                  {comp && (
                    <p
                      className={`text-xs ${variance(netIncome, prevNetIncome).diff >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {variance(netIncome, prevNetIncome).pct.toFixed(1)}% vs
                      periode lalu
                    </p>
                  )}
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
                    {netMargin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Margin laba bersih</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ==================== INCOME STATEMENT DETAIL ==================== */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan Laba Rugi</CardTitle>
            <CardDescription>
              Periode: {formatPeriodDisplay(selectedPeriod)}
              {comp ? " (dengan perbandingan periode sebelumnya)" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Revenue */}
              <div>
                <h4 className="font-semibold text-lg text-green-600 mb-4">
                  PENDAPATAN
                </h4>
                <div className="space-y-2">
                  {(incomeData?.revenue || []).length > 0 ? (
                    incomeData!.revenue.map((item, idx) => {
                      const prev = comp?.revenue?.find(
                        (r) => r.code === item.code,
                      );
                      const v = variance(safe(item.amount), safe(prev?.amount));
                      return (
                        <div
                          key={item.code || idx}
                          className="flex justify-between items-center py-2 border-b border-gray-100"
                        >
                          <div>
                            <span className="text-sm text-gray-600">
                              {item.code}
                            </span>
                            <p className="font-medium">{item.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(safe(item.amount))}
                            </p>
                            {comp && prev && (
                              <p
                                className={`text-xs ${v.diff >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {v.diff >= 0 ? "+" : ""}
                                {formatCurrency(v.diff)} ({v.pct.toFixed(1)}%)
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm py-2">
                      Tidak ada data pendapatan untuk periode ini
                    </p>
                  )}
                </div>
                <div className="border-t-2 border-green-200 pt-3 mt-4">
                  <div className="flex justify-between items-center font-bold text-lg text-green-600">
                    <span>TOTAL PENDAPATAN</span>
                    <span>{formatCurrency(totalRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div>
                <h4 className="font-semibold text-lg text-red-600 mb-4">
                  BEBAN OPERASIONAL
                </h4>
                <div className="space-y-2">
                  {(incomeData?.expenses || []).length > 0 ? (
                    incomeData!.expenses.map((item, idx) => {
                      const prev = comp?.expenses?.find(
                        (e) => e.code === item.code,
                      );
                      const v = variance(safe(item.amount), safe(prev?.amount));
                      return (
                        <div
                          key={item.code || idx}
                          className="flex justify-between items-center py-2 border-b border-gray-100"
                        >
                          <div>
                            <span className="text-sm text-gray-600">
                              {item.code}
                            </span>
                            <p className="font-medium">{item.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ({formatCurrency(safe(item.amount))})
                            </p>
                            {comp && prev && (
                              <p
                                className={`text-xs ${v.diff <= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {v.diff >= 0 ? "+" : ""}
                                {formatCurrency(v.diff)} ({v.pct.toFixed(1)}%)
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm py-2">
                      Tidak ada data beban untuk periode ini
                    </p>
                  )}
                </div>
                <div className="border-t-2 border-red-200 pt-3 mt-4">
                  <div className="flex justify-between items-center font-bold text-lg text-red-600">
                    <span>TOTAL BEBAN OPERASIONAL</span>
                    <span>({formatCurrency(totalExpenses)})</span>
                  </div>
                </div>
              </div>

              {/* Net Income */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
                <div
                  className={`flex justify-between items-center font-bold text-2xl ${isProfit ? "text-purple-600" : "text-red-600"}`}
                >
                  <span>LABA BERSIH (SHU)</span>
                  <span>{formatCurrency(netIncome)}</span>
                </div>
                {comp && (
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Net Margin:</p>
                      <p className="font-semibold text-purple-600">
                        {netMargin.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Growth:</p>
                      <p
                        className={`font-semibold ${variance(netIncome, prevNetIncome).diff >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {variance(netIncome, prevNetIncome).pct.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Variance:</p>
                      <p
                        className={`font-semibold ${variance(netIncome, prevNetIncome).diff >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(
                          variance(netIncome, prevNetIncome).diff,
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trend from API */}
              {incomeData?.variance && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    incomeData.variance.trend === "improving"
                      ? "bg-green-50 text-green-700"
                      : incomeData.variance.trend === "declining"
                        ? "bg-red-50 text-red-700"
                        : "bg-gray-50 text-gray-700"
                  }`}
                >
                  {incomeData.variance.trend === "improving" ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    Trend:{" "}
                    {incomeData.variance.trend === "improving"
                      ? "Membaik"
                      : incomeData.variance.trend === "declining"
                        ? "Menurun"
                        : "Stabil"}
                    {" — "}Perubahan laba:{" "}
                    {formatCurrency(
                      safe(incomeData.variance.net_income_change),
                    )}{" "}
                    (
                    {safe(
                      incomeData.variance.net_income_change_percentage,
                    ).toFixed(1)}
                    %)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ==================== BALANCE SHEET (NERACA) ==================== */}
        {balanceData && (
          <Card>
            <CardHeader>
              <CardTitle>Neraca (Balance Sheet)</CardTitle>
              <CardDescription>
                Posisi keuangan per {getPeriodDates(selectedPeriod).endDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Aset</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(totalAssets)}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <CreditCard className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Kewajiban</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(totalLiabilities)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Wallet className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Ekuitas</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(totalEquity)}
                  </p>
                </div>
              </div>

              {/* Balance check */}
              {balanceData.is_balanced !== undefined && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${
                    balanceData.is_balanced
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {balanceData.is_balanced
                    ? "✅ Neraca seimbang (Aset = Kewajiban + Ekuitas)"
                    : `⚠️ Neraca belum seimbang — Aset: ${formatCurrency(totalAssets)}, Kewajiban + Ekuitas: ${formatCurrency(totalLiabilities + totalEquity)}`}
                </div>
              )}

              {/* Assets Detail */}
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-blue-600">ASET</h4>
                {extractAccounts(balanceData.assets).map((item, idx) => (
                  <div
                    key={item.code || idx}
                    className="flex justify-between py-2 border-b border-gray-100"
                  >
                    <div>
                      <span className="text-sm text-gray-500">{item.code}</span>
                      <p className="font-medium">{item.name}</p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(safe(item.amount))}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-blue-600 border-t-2 pt-2">
                  <span>TOTAL ASET</span>
                  <span>{formatCurrency(totalAssets)}</span>
                </div>
              </div>

              {/* Liabilities Detail */}
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-red-600">KEWAJIBAN</h4>
                {extractAccounts(balanceData.liabilities).map((item, idx) => (
                  <div
                    key={item.code || idx}
                    className="flex justify-between py-2 border-b border-gray-100"
                  >
                    <div>
                      <span className="text-sm text-gray-500">{item.code}</span>
                      <p className="font-medium">{item.name}</p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(safe(item.amount))}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-red-600 border-t-2 pt-2">
                  <span>TOTAL KEWAJIBAN</span>
                  <span>{formatCurrency(totalLiabilities)}</span>
                </div>
              </div>

              {/* Equity Detail */}
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-green-600">EKUITAS</h4>
                {extractAccounts(balanceData.equity).map((item, idx) => (
                  <div
                    key={item.code || idx}
                    className="flex justify-between py-2 border-b border-gray-100"
                  >
                    <div>
                      <span className="text-sm text-gray-500">{item.code}</span>
                      <p className="font-medium">{item.name}</p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(safe(item.amount))}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-green-600 border-t-2 pt-2">
                  <span>TOTAL EKUITAS</span>
                  <span>{formatCurrency(totalEquity)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== FINANCIAL ANALYSIS ==================== */}
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
                  {grossMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  (Pendapatan - Beban) / Pendapatan
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Operating Expense Ratio
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {expenseRatio.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Beban / Total Pendapatan
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Net Profit Margin</p>
                <p className="text-3xl font-bold text-purple-600">
                  {netMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Laba Bersih / Total Pendapatan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ==================== DEBUG: Raw Response (dev only) ==================== */}
        {rawDebug && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                🔍 Debug: Raw API Response (Income Statement)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-64">
                {rawDebug}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </ManagerLayout>
  );
}
