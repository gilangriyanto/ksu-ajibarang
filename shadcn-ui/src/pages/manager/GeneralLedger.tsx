import React, { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import {
  Card,
  CardContent,
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
import { Input } from "@/components/ui/input";
import {
  Download,
  Printer,
  BookOpen,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useGeneralLedger } from "@/hooks/useGeneralLedger";
import chartOfAccountsService, { ChartOfAccount } from "@/lib/api/chartOfAccounts.service";

export default function GeneralLedger() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");

  const [startDate, setStartDate] = useState(`${currentYear}-${currentMonth}-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-${currentMonth}-31`);
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);

  // Fetch chart of accounts for the filter
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await chartOfAccountsService.getAll({ all: true });
        setAccounts(data);
      } catch (error) {
        console.error("Gagal memuat daftar akun:", error);
      }
    };
    fetchAccounts();
  }, []);

  const { data, isLoading, error, refetch } = useGeneralLedger(
    startDate,
    endDate,
    selectedAccount === "all" ? undefined : parseInt(selectedAccount)
  );

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    alert("Export PDF akan segera tersedia");
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Buku Besar (General Ledger)
            </h1>
            <p className="text-gray-600 mt-1">
              Laporan rincian transaksi per akun
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

        {/* Filter Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tanggal Mulai
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tanggal Akhir
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Pilih Akun
                </label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Akun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Akun</SelectItem>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.code} - {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* State Management */}
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat data buku besar...</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex items-center justify-center p-12">
            <Card className="max-w-md w-full">
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
        )}

        {/* Ledger Content */}
        {!isLoading && !error && data && data.length > 0 ? (
          <div className="space-y-6">
            {data.map((ledger) => (
              <Card key={ledger.account.id}>
                <CardHeader className="bg-gray-50 border-b border-gray-100 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center text-blue-800">
                      <BookOpen className="w-5 h-5 mr-2" />
                      {ledger.account.code} - {ledger.account.name}
                    </CardTitle>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Saldo Akhir:</p>
                      <p className={`font-bold text-lg ${ledger.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(ledger.balance)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white border-b sticky top-0">
                        <tr>
                          <th className="py-3 px-4 text-left font-medium text-gray-500 whitespace-nowrap">
                            Tanggal
                          </th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500 whitespace-nowrap">
                            No. Jurnal
                          </th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500">
                            Deskripsi
                          </th>
                          <th className="py-3 px-4 text-right font-medium text-gray-500 whitespace-nowrap">
                            Debit
                          </th>
                          <th className="py-3 px-4 text-right font-medium text-gray-500 whitespace-nowrap">
                            Kredit
                          </th>
                          <th className="py-3 px-4 text-right font-medium text-gray-500 whitespace-nowrap">
                            Saldo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ledger.transactions.map((trx, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4 whitespace-nowrap">
                              {formatDate(trx.date)}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-blue-600 font-medium">
                              {trx.journal_number}
                            </td>
                            <td className="py-3 px-4 text-gray-700 min-w-[200px]">
                              {trx.description}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900">
                              {parseFloat(trx.debit) > 0 ? formatCurrency(trx.debit) : "-"}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900">
                              {parseFloat(trx.credit) > 0 ? formatCurrency(trx.credit) : "-"}
                            </td>
                            <td className={`py-3 px-4 text-right font-medium ${trx.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(trx.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-bold border-t">
                        <tr>
                          <td colSpan={3} className="py-3 px-4 text-right text-gray-600">
                            Total Mutasi
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-gray-900">
                            {formatCurrency(ledger.total_debit)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-gray-900">
                            {formatCurrency(ledger.total_credit)}
                          </td>
                          <td className="py-3 px-4 text-right"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !isLoading && !error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Data Tidak Ditemukan
              </h3>
              <p>
                Tidak ada transaksi buku besar untuk filter yang dipilih
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </ManagerLayout>
  );
}
