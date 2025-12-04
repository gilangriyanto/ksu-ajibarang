import React, { useState, useEffect } from "react";
import { MemberLayout } from "@/components/layout/MemberLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Calculator,
  Calendar,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import serviceAllowanceService from "@/lib/api/serviceAllowance.service";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Import types separately
import type {
  ServiceAllowance,
  MemberHistory,
} from "@/lib/api/serviceAllowance.service";

export default function PayrollView() {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [history, setHistory] = useState<MemberHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch member's history
  const fetchHistory = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await serviceAllowanceService.getMemberHistory(
        user.id,
        parseInt(selectedYear)
      );
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Gagal memuat data jasa pelayanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user?.id, selectedYear]);

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStatusBadge = (status: string) => {
    return status === "processed" ? (
      <Badge className="bg-green-100 text-green-800">Sudah Diproses</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    );
  };

  const handleDownloadSlip = (allowance: any) => {
    const csvContent = `Slip Jasa Pelayanan\nPeriode: ${
      allowance.period
    }\nNama: ${history?.user.full_name}\nEmployee ID: ${
      history?.user.employee_id
    }\n\nRincian:\nJumlah Diterima dari RS,${formatCurrency(
      allowance.received_amount
    )}\nCicilan Dibayar,${formatCurrency(
      allowance.installment_paid
    )}\nSisa untuk Member,${formatCurrency(
      allowance.remaining_amount
    )}\n\nStatus: ${
      allowance.status_name
    }\nTanggal: ${new Date().toLocaleDateString("id-ID")}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `slip-jasa-pelayanan-${allowance.period.replace(/ /g, "-")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get available years (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 3 }, (_, i) => currentYear - i);

  // Get current month's allowance if exists
  const currentMonth = new Date().getMonth() + 1;
  const currentAllowance = history?.allowances.find((a) => {
    const monthMatch = a.period.includes(
      new Date(currentYear, currentMonth - 1).toLocaleString("id-ID", {
        month: "long",
      })
    );
    return monthMatch;
  });

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Jasa Pelayanan Saya
            </h1>
            <p className="text-gray-600 mt-1">
              Lihat rincian jasa pelayanan yang telah diterima
            </p>
          </div>
          <div className="w-32">
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : history && history.allowances.length > 0 ? (
          <>
            {/* Year Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Diterima ({selectedYear})
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(history.total_received)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Sisa untuk Saya
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(history.total_remaining)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Month Detail (if exists) */}
            {currentAllowance && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">
                    Jasa Pelayanan Bulan Ini
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    {currentAllowance.period}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Diterima dari RS
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(currentAllowance.received_amount)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Cicilan Dibayar
                        </p>
                        <p className="text-xl font-bold text-orange-600">
                          {formatCurrency(currentAllowance.installment_paid)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Sisa untuk Saya
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(currentAllowance.remaining_amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Status:</span>
                        {getStatusBadge(currentAllowance.status)}
                      </div>
                      <Button
                        onClick={() => handleDownloadSlip(currentAllowance)}
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Unduh Slip
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History Table */}
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Jasa Pelayanan</CardTitle>
                <CardDescription>
                  Menampilkan {history.allowances.length} periode di tahun{" "}
                  {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Periode
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Diterima
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Cicilan Dibayar
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Sisa
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.allowances.map((allowance) => (
                        <tr
                          key={allowance.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">{allowance.period}</td>
                          <td className="py-3 px-4 font-medium text-blue-600">
                            {formatCurrency(allowance.received_amount)}
                          </td>
                          <td className="py-3 px-4 font-medium text-orange-600">
                            {formatCurrency(allowance.installment_paid)}
                          </td>
                          <td className="py-3 px-4 font-medium text-green-600">
                            {formatCurrency(allowance.remaining_amount)}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(allowance.status)}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadSlip(allowance)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-900 font-medium mb-1">
                      Informasi Penting
                    </p>
                    <p className="text-sm text-amber-800">
                      Jasa pelayanan yang Anda terima sudah otomatis dipotong
                      untuk membayar cicilan pinjaman yang jatuh tempo. Sisa
                      setelah pemotongan akan dikembalikan kepada Anda.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Belum ada data
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Anda belum memiliki riwayat jasa pelayanan untuk tahun{" "}
                {selectedYear}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MemberLayout>
  );
}
