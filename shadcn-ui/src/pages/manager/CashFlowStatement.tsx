// pages/manager/CashFlowStatement.tsx
// ✅ FIXED: Matches actual backend response structure:
//    data.cash_accounts[] → each has kas_masuk, kas_keluar, net_flow, breakdown[]
//    breakdown[] → { module, kas_masuk, kas_keluar, net }

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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  RefreshCw,
  DollarSign,
  Download,
  Printer,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import apiClient from "@/lib/api/api-client";

// =====================================================
// Types — matches actual backend response
// =====================================================
interface BreakdownItem {
  module: string;
  kas_masuk: number;
  kas_keluar: number;
  net: number;
}

interface CashAccount {
  account_code: string;
  account_name: string;
  kas_masuk: number;
  kas_keluar: number;
  net_flow: number;
  breakdown: BreakdownItem[];
}

interface CashFlowData {
  period: { start_date: string; end_date: string; label: string };
  cash_accounts: CashAccount[];
  // Summary (computed)
  total_kas_masuk: number;
  total_kas_keluar: number;
  total_net_flow: number;
}

// =====================================================
// Helpers
// =====================================================
const safe = (v: any): number => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return isNaN(n) ? 0 : n;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const getMonthName = (month: number) =>
  [
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
  ][month - 1];

const getModuleLabel = (module: string): string => {
  const labels: Record<string, string> = {
    installments: "Angsuran Pinjaman",
    savings: "Simpanan Anggota",
    salary_deductions: "Potongan Gaji",
    loans: "Pencairan Pinjaman",
    cash_transfers: "Transfer Kas",
    withdrawals: "Penarikan Simpanan",
    service_allowance: "Jasa Pelayanan",
    expenses: "Beban Operasional",
    gifts: "Hadiah / Gift",
    resignations: "Pengunduran Diri",
  };
  return (
    labels[module] ||
    module.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

const generatePeriodOptions = () => {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const value = `${year}-${String(month).padStart(2, "0")}`;
    options.push({ value, label: `${getMonthName(month)} ${year}` });
  }
  return options;
};

const getPeriodDates = (period: string) => {
  const [year, month] = period.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
  return { startDate, endDate };
};

// =====================================================
// Component
// =====================================================
export default function CashFlowStatement() {
  const periodOptions = generatePeriodOptions();
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0].value);
  const [data, setData] = useState<CashFlowData | null>(null);
  const [rawDebug, setRawDebug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const fetchCashFlow = useCallback(async () => {
    const { startDate, endDate } = getPeriodDates(selectedPeriod);
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/journals/cash-flow", {
        params: { start_date: startDate, end_date: endDate },
      });

      const raw = response.data;
      console.log("✅ Cash Flow RAW:", raw);
      setRawDebug(JSON.stringify(raw, null, 2));

      const d = raw?.data || raw;

      // Parse cash_accounts
      const cashAccounts: CashAccount[] = (d?.cash_accounts || []).map(
        (acc: any) => ({
          account_code: acc.account_code || "",
          account_name: acc.account_name || "",
          kas_masuk: safe(acc.kas_masuk),
          kas_keluar: safe(acc.kas_keluar),
          net_flow: safe(acc.net_flow),
          breakdown: (acc.breakdown || []).map((b: any) => ({
            module: b.module || "",
            kas_masuk: safe(b.kas_masuk),
            kas_keluar: safe(b.kas_keluar),
            net: safe(b.net),
          })),
        }),
      );

      // Calculate totals
      const total_kas_masuk = cashAccounts.reduce((s, a) => s + a.kas_masuk, 0);
      const total_kas_keluar = cashAccounts.reduce(
        (s, a) => s + a.kas_keluar,
        0,
      );
      const total_net_flow = cashAccounts.reduce((s, a) => s + a.net_flow, 0);

      setData({
        period: d?.period || {
          start_date: startDate,
          end_date: endDate,
          label: "",
        },
        cash_accounts: cashAccounts,
        total_kas_masuk,
        total_kas_keluar,
        total_net_flow,
      });
    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(
        err.response?.data?.message || err.message || "Gagal memuat data",
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchCashFlow();
  }, [fetchCashFlow]);

  // =====================================================
  // Export CSV
  // =====================================================
  const handleExport = () => {
    if (!data) return;
    const lines = [
      "LAPORAN ARUS KAS",
      `Periode: ${data.period.label || selectedPeriod}`,
      "",
      "Akun Kas,Kas Masuk,Kas Keluar,Arus Kas Bersih",
      ...data.cash_accounts.map(
        (a) => `${a.account_name},${a.kas_masuk},${a.kas_keluar},${a.net_flow}`,
      ),
      "",
      ...data.cash_accounts.flatMap((a) => [
        "",
        `Detail: ${a.account_name}`,
        "Modul,Kas Masuk,Kas Keluar,Net",
        ...a.breakdown.map(
          (b) =>
            `${getModuleLabel(b.module)},${b.kas_masuk},${b.kas_keluar},${b.net}`,
        ),
      ]),
      "",
      `TOTAL,${data.total_kas_masuk},${data.total_kas_keluar},${data.total_net_flow}`,
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arus_kas_${selectedPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =====================================================
  // Render
  // =====================================================
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-gray-400" />;
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Laporan Arus Kas</h1>
            <p className="text-gray-600">
              Cash Flow Statement — Pergerakan kas koperasi
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={fetchCashFlow}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleExport} disabled={!data}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Period Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-xs">
                <Label>Periode</Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs text-gray-400"
              >
                {showDebug ? "Hide" : "Show"} Debug
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug */}
        {showDebug && rawDebug && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Raw API Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                {rawDebug}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Content */}
        {data && !isLoading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Kas Masuk</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(data.total_kas_masuk)}
                      </p>
                    </div>
                    <ArrowDownLeft className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Kas Keluar</p>
                      <p className="text-xl font-bold text-red-600">
                        {formatCurrency(data.total_kas_keluar)}
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Arus Kas Bersih</p>
                      <p
                        className={`text-xl font-bold ${data.total_net_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(data.total_net_flow)}
                      </p>
                    </div>
                    {getTrendIcon(data.total_net_flow)}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">Jumlah Akun Kas</p>
                      <p className="text-xl font-bold text-blue-700">
                        {data.cash_accounts.length}
                      </p>
                    </div>
                    <Wallet className="h-5 w-5 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cash Flow per Account */}
            <Card className="print:shadow-none">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">LAPORAN ARUS KAS</CardTitle>
                <CardDescription className="text-base">
                  Periode:{" "}
                  {data.period.label ||
                    `${data.period.start_date} s/d ${data.period.end_date}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {data.cash_accounts.map((account, idx) => (
                    <div key={idx}>
                      {/* Account Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center">
                          <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                          {account.account_name}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {account.account_code}
                          </Badge>
                        </h3>
                        <span
                          className={`text-lg font-bold font-mono ${account.net_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(account.net_flow)}
                        </span>
                      </div>

                      {/* Summary Row */}
                      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <span className="text-gray-500">Kas Masuk</span>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(account.kas_masuk)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Kas Keluar</span>
                          <p className="font-semibold text-red-600">
                            {formatCurrency(account.kas_keluar)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Arus Bersih</span>
                          <p
                            className={`font-semibold ${account.net_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(account.net_flow)}
                          </p>
                        </div>
                      </div>

                      {/* Breakdown per Module */}
                      {account.breakdown && account.breakdown.length > 0 && (
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium text-gray-500 mb-2">
                            Rincian per Modul:
                          </p>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-gray-500 border-b">
                                <th className="text-left py-2">Modul</th>
                                <th className="text-right py-2">Kas Masuk</th>
                                <th className="text-right py-2">Kas Keluar</th>
                                <th className="text-right py-2">Net</th>
                              </tr>
                            </thead>
                            <tbody>
                              {account.breakdown.map((b, bIdx) => (
                                <tr
                                  key={bIdx}
                                  className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                  <td className="py-2 text-gray-700">
                                    {getModuleLabel(b.module)}
                                  </td>
                                  <td className="py-2 text-right font-mono text-green-600">
                                    {b.kas_masuk > 0
                                      ? formatCurrency(b.kas_masuk)
                                      : "-"}
                                  </td>
                                  <td className="py-2 text-right font-mono text-red-600">
                                    {b.kas_keluar > 0
                                      ? formatCurrency(b.kas_keluar)
                                      : "-"}
                                  </td>
                                  <td
                                    className={`py-2 text-right font-mono font-medium ${b.net >= 0 ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {formatCurrency(b.net)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {account.breakdown?.length === 0 && (
                        <p className="ml-4 text-sm text-gray-400 italic">
                          Tidak ada rincian breakdown
                        </p>
                      )}

                      {idx < data.cash_accounts.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}

                  {/* Grand Total */}
                  <Separator className="my-4" />
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-blue-600">Total Kas Masuk</p>
                        <p className="text-xl font-bold text-green-600 font-mono">
                          {formatCurrency(data.total_kas_masuk)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">
                          Total Kas Keluar
                        </p>
                        <p className="text-xl font-bold text-red-600 font-mono">
                          {formatCurrency(data.total_kas_keluar)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">Arus Kas Bersih</p>
                        <p
                          className={`text-xl font-bold font-mono ${data.total_net_flow >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(data.total_net_flow)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty */}
        {!data && !isLoading && !error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Pilih periode untuk melihat laporan arus kas</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ManagerLayout>
  );
}
