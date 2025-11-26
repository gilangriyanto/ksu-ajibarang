import React, { useState, useRef, useEffect } from "react";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  Eye,
  Download,
  DollarSign,
  Calculator,
  TrendingUp,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import {
  serviceAllowanceService,
  type ServiceAllowance,
} from "@/lib/api/serviceAllowance.service";
import { toast } from "sonner";

// =====================================================
// MODAL: Distribute Service Allowance
// =====================================================
const DistributeAllowanceModal = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [baseAmount, setBaseAmount] = useState("50000");
  const [savingsRate, setSavingsRate] = useState("1.0");
  const [loanRate, setLoanRate] = useState("10.0");
  const [loading, setLoading] = useState(false);

  const handleDistribute = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split("-").map(Number);

      await serviceAllowanceService.distribute({
        period_month: month,
        period_year: year,
        base_amount: parseFloat(baseAmount),
        savings_rate: parseFloat(savingsRate),
        loan_rate: parseFloat(loanRate),
      });

      toast.success("Berhasil mendistribusikan jasa pelayanan");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error distributing:", error);
      toast.error(error.message || "Gagal mendistribusikan jasa pelayanan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Distribusi Jasa Pelayanan</DialogTitle>
          <DialogDescription>
            Distribusikan jasa pelayanan ke semua anggota aktif
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="period" className="text-right">
              Periode
            </Label>
            <Input
              id="period"
              type="month"
              className="col-span-3"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="base-amount" className="text-right">
              Base Amount
            </Label>
            <Input
              id="base-amount"
              type="number"
              className="col-span-3"
              placeholder="50000"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="savings-rate" className="text-right">
              Savings Rate (%)
            </Label>
            <Input
              id="savings-rate"
              type="number"
              step="0.1"
              className="col-span-3"
              placeholder="1.0"
              value={savingsRate}
              onChange={(e) => setSavingsRate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loan-rate" className="text-right">
              Loan Rate (%)
            </Label>
            <Input
              id="loan-rate"
              type="number"
              step="0.1"
              className="col-span-3"
              placeholder="10.0"
              value={loanRate}
              onChange={(e) => setLoanRate(e.target.value)}
            />
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sistem akan otomatis menghitung bonus berdasarkan simpanan dan
              pinjaman masing-masing anggota
            </AlertDescription>
          </Alert>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleDistribute} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Mendistribusikan...
              </>
            ) : (
              "Distribusikan Sekarang"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =====================================================
// MODAL: View Detail
// =====================================================
const ViewAllowanceModal = ({
  isOpen,
  onClose,
  allowance,
}: {
  isOpen: boolean;
  onClose: () => void;
  allowance: ServiceAllowance | null;
}) => {
  if (!allowance) return null;

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const totalBonus =
    parseFloat(allowance.savings_bonus) + parseFloat(allowance.loan_bonus);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Detail Jasa Pelayanan</DialogTitle>
          <DialogDescription>
            Rincian jasa pelayanan untuk {allowance.user.full_name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Periode:</Label>
              <p className="text-lg">{allowance.period_display}</p>
            </div>
            <div>
              <Label className="font-medium">ID Anggota:</Label>
              <p>{allowance.user.employee_id}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Nama Anggota:</Label>
              <p>{allowance.user.full_name}</p>
            </div>
            <div>
              <Label className="font-medium">Status:</Label>
              <Badge
                className={
                  allowance.status === "paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {allowance.status_name}
              </Badge>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-3">Rincian Perhitungan:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Amount:</span>
                <span className="font-medium text-blue-600">
                  {formatCurrency(allowance.base_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bonus Simpanan:</span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(allowance.savings_bonus)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bonus Pinjaman:</span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(allowance.loan_bonus)}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Diterima:</span>
                <span className="text-blue-600">
                  {formatCurrency(allowance.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {allowance.notes && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium mb-2">Catatan:</h4>
              <p className="text-sm text-gray-700">{allowance.notes}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function PayrollManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [distributeModal, setDistributeModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedAllowance, setSelectedAllowance] =
    useState<ServiceAllowance | null>(null);
  const [allowances, setAllowances] = useState<ServiceAllowance[]>([]);
  const [loading, setLoading] = useState(false);

  const { getMemberById } = useMembers();

  // Fetch allowances
  const fetchAllowances = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split("-").map(Number);
      const data = await serviceAllowanceService.getAll({
        month,
        year,
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
    fetchAllowances();
  }, [selectedMonth]);

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

  const handleViewAllowance = (allowance: ServiceAllowance) => {
    setSelectedAllowance(allowance);
    setViewModal(true);
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await serviceAllowanceService.markAsPaid(id, "Pembayaran jasa pelayanan");
      toast.success("Status pembayaran berhasil diupdate");
      fetchAllowances();
    } catch (error: any) {
      console.error("Error marking as paid:", error);
      toast.error(error.message || "Gagal mengubah status pembayaran");
    }
  };

  const handleDownloadReport = (reportType: string) => {
    const currentDate = new Date().toISOString().split("T")[0];
    let csvContent = "";

    switch (reportType) {
      case "monthly":
        csvContent = `Laporan Jasa Pelayanan Bulanan\nPeriode: ${selectedMonth}\nTanggal: ${currentDate}\n\nID,Nama,Employee ID,Base Amount,Bonus Simpanan,Bonus Pinjaman,Total,Status\n`;
        filteredAllowances.forEach((allowance) => {
          csvContent += `${allowance.id},${allowance.user.full_name},${allowance.user.employee_id},${allowance.base_amount},${allowance.savings_bonus},${allowance.loan_bonus},${allowance.total_amount},${allowance.status}\n`;
        });
        break;
      case "summary":
        const totalBase = filteredAllowances.reduce(
          (sum, a) => sum + parseFloat(a.base_amount),
          0
        );
        const totalSavingsBonus = filteredAllowances.reduce(
          (sum, a) => sum + parseFloat(a.savings_bonus),
          0
        );
        const totalLoanBonus = filteredAllowances.reduce(
          (sum, a) => sum + parseFloat(a.loan_bonus),
          0
        );
        const totalAmount = filteredAllowances.reduce(
          (sum, a) => sum + parseFloat(a.total_amount),
          0
        );
        csvContent = `Ringkasan Jasa Pelayanan\nTanggal: ${currentDate}\n\nTotal Base Amount,${totalBase}\nTotal Bonus Simpanan,${totalSavingsBonus}\nTotal Bonus Pinjaman,${totalLoanBonus}\nTotal Dibayarkan,${totalAmount}\nJumlah Anggota,${filteredAllowances.length}`;
        break;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan-${reportType}-${currentDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter allowances by search term
  const filteredAllowances = allowances.filter((allowance) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      allowance.user.full_name.toLowerCase().includes(searchLower) ||
      allowance.user.employee_id.toLowerCase().includes(searchLower)
    );
  });

  // Calculate statistics
  const totalBase = filteredAllowances.reduce(
    (sum, a) => sum + parseFloat(a.base_amount),
    0
  );
  const totalBonus = filteredAllowances.reduce(
    (sum, a) => sum + parseFloat(a.savings_bonus) + parseFloat(a.loan_bonus),
    0
  );
  const totalAmount = filteredAllowances.reduce(
    (sum, a) => sum + parseFloat(a.total_amount),
    0
  );
  const paidCount = filteredAllowances.filter(
    (a) => a.status === "paid"
  ).length;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manajemen Jasa Pelayanan
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola jasa pelayanan anggota aktif
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setDistributeModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Distribusi Jasa Pelayanan
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Base Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalBase)}
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
                    Total Bonus
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalBonus)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calculator className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Diterima
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Sudah Dibayar
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {paidCount}/{filteredAllowances.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama anggota atau employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allowances Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Jasa Pelayanan</CardTitle>
            <CardDescription>
              Menampilkan {filteredAllowances.length} data jasa pelayanan untuk
              periode{" "}
              {new Date(selectedMonth).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Memuat data...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Anggota
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
                    {filteredAllowances.map((allowance) => {
                      const totalBonus =
                        parseFloat(allowance.savings_bonus) +
                        parseFloat(allowance.loan_bonus);

                      return (
                        <tr
                          key={allowance.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {allowance.user.full_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {allowance.user.employee_id}
                              </p>
                            </div>
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
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewAllowance(allowance)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {allowance.status === "pending" && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleMarkAsPaid(allowance.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredAllowances.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Calculator className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Belum ada data
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Belum ada data jasa pelayanan untuk periode ini
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan Jasa Pelayanan</CardTitle>
            <CardDescription>
              Unduh berbagai laporan jasa pelayanan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => handleDownloadReport("monthly")}
                disabled={filteredAllowances.length === 0}
              >
                <Download className="h-6 w-6" />
                <span>Laporan Bulanan</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => handleDownloadReport("summary")}
                disabled={filteredAllowances.length === 0}
              >
                <Download className="h-6 w-6" />
                <span>Ringkasan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <DistributeAllowanceModal
        isOpen={distributeModal}
        onClose={() => setDistributeModal(false)}
        onSuccess={fetchAllowances}
      />
      <ViewAllowanceModal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        allowance={selectedAllowance}
      />
    </ManagerLayout>
  );
}
