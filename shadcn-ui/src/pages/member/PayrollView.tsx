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
} from "lucide-react";
import {
  serviceAllowanceService,
  type ServiceAllowance,
} from "@/lib/api/serviceAllowance.service";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function PayrollView() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [allowances, setAllowances] = useState<ServiceAllowance[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch member's allowances
  const fetchMyAllowances = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await serviceAllowanceService.getAll({
        user_id: user.id,
      });
      setAllowances(data);
    } catch (error) {
      console.error("Error fetching allowances:", error);
      toast.error("Gagal memuat data jasa pelayanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAllowances();
  }, [user?.id]);

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStatusBadge = (status: string) => {
    return status === "paid" ? (
      <Badge className="bg-green-100 text-green-800">Sudah Dibayar</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Belum Dibayar</Badge>
    );
  };

  const handleDownloadSlip = (allowance: ServiceAllowance) => {
    const totalBonus =
      parseFloat(allowance.savings_bonus) + parseFloat(allowance.loan_bonus);

    const csvContent = `Slip Jasa Pelayanan\nPeriode: ${
      allowance.period_display
    }\nNama: ${allowance.user.full_name}\nEmployee ID: ${
      allowance.user.employee_id
    }\n\nRincian:\nBase Amount,${formatCurrency(
      allowance.base_amount
    )}\nBonus Simpanan,${formatCurrency(
      allowance.savings_bonus
    )}\nBonus Pinjaman,${formatCurrency(
      allowance.loan_bonus
    )}\nTotal Bonus,${formatCurrency(
      totalBonus
    )}\nTotal Diterima,${formatCurrency(allowance.total_amount)}\n\nStatus: ${
      allowance.status_name
    }\nTanggal: ${new Date().toLocaleDateString("id-ID")}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `slip-jasa-pelayanan-${allowance.period_year}-${allowance.period_month}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get current month's allowance
  const [year, month] = selectedMonth.split("-").map(Number);
  const currentAllowance = allowances.find(
    (a) => a.period_month === month && a.period_year === year
  );

  // Get last 6 allowances for history
  const sortedAllowances = [...allowances].sort((a, b) => {
    const dateA = new Date(a.period_year, a.period_month - 1);
    const dateB = new Date(b.period_year, b.period_month - 1);
    return dateB.getTime() - dateA.getTime();
  });
  const historyAllowances = sortedAllowances.slice(0, 6);

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
              Lihat rincian jasa pelayanan dan bonus
            </p>
          </div>
          <div className="w-48">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : currentAllowance ? (
          <>
            {/* Current Month Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Base Amount
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(currentAllowance.base_amount)}
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
                        Bonus Simpanan
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(currentAllowance.savings_bonus)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Bonus Pinjaman
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(currentAllowance.loan_bonus)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calculator className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Diterima
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(currentAllowance.total_amount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Month Detail */}
            <Card>
              <CardHeader>
                <CardTitle>Rincian Jasa Pelayanan</CardTitle>
                <CardDescription>
                  Periode: {currentAllowance.period_display}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-700">
                      Base Amount
                    </span>
                    <span className="font-bold text-blue-700 text-lg">
                      {formatCurrency(currentAllowance.base_amount)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-gray-700">Bonus:</p>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-green-700">Bonus Simpanan</span>
                      <span className="font-medium text-green-700">
                        +{formatCurrency(currentAllowance.savings_bonus)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-green-700">Bonus Pinjaman</span>
                      <span className="font-medium text-green-700">
                        +{formatCurrency(currentAllowance.loan_bonus)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <span className="font-bold text-purple-700">
                      Total Diterima
                    </span>
                    <span className="font-bold text-purple-700 text-xl">
                      {formatCurrency(currentAllowance.total_amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(currentAllowance.status)}
                    </div>
                    <Button
                      onClick={() => handleDownloadSlip(currentAllowance)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Unduh Slip
                    </Button>
                  </div>

                  {currentAllowance.notes && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Catatan:
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentAllowance.notes}
                      </p>
                    </div>
                  )}
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
                Belum ada data jasa pelayanan untuk periode{" "}
                {new Date(selectedMonth).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </CardContent>
          </Card>
        )}

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Jasa Pelayanan</CardTitle>
            <CardDescription>
              Menampilkan {historyAllowances.length} periode terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : historyAllowances.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Periode
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Base Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Total Bonus
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Total Diterima
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
                    {historyAllowances.map((allowance) => {
                      const totalBonus =
                        parseFloat(allowance.savings_bonus) +
                        parseFloat(allowance.loan_bonus);

                      return (
                        <tr
                          key={allowance.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            {allowance.period_display}
                          </td>
                          <td className="py-3 px-4 font-medium text-blue-600">
                            {formatCurrency(allowance.base_amount)}
                          </td>
                          <td className="py-3 px-4 font-medium text-green-600">
                            {formatCurrency(totalBonus)}
                          </td>
                          <td className="py-3 px-4 font-medium text-purple-600">
                            {formatCurrency(allowance.total_amount)}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Belum ada riwayat
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Anda belum memiliki riwayat jasa pelayanan
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}
