import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Eye,
  Download,
  DollarSign,
  Calculator,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  Upload,
} from "lucide-react";
import memberService from "@/lib/api/member.service";
import serviceAllowanceService from "@/lib/api/serviceAllowance.service";
import { toast } from "sonner";
import { ImportExcelModal } from "@/components/modals/ImportExcelModal";

// Import types separately
import type {
  ServiceAllowance,
  PreviewCalculation,
} from "@/lib/api/serviceAllowance.service";

// =====================================================
// MODAL: Input Service Allowance (KEEP SAME)
// =====================================================
const InputAllowanceModal = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [receivedAmount, setReceivedAmount] = useState("500000");
  const [notes, setNotes] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [preview, setPreview] = useState<PreviewCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await memberService.getMembers({
          all: true,
          status: "active",
        });
        setMembers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching members:", error);
        toast.error("Gagal memuat data anggota");
      }
    };

    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const handlePreview = async () => {
    if (!selectedMember || !receivedAmount) {
      toast.error("Pilih anggota dan masukkan jumlah yang diterima");
      return;
    }

    try {
      setLoading(true);
      const [year, month] = selectedMonth.split("-").map(Number);

      const previewData = await serviceAllowanceService.previewCalculation({
        user_id: parseInt(selectedMember),
        period_month: month,
        period_year: year,
        received_amount: parseFloat(receivedAmount),
      });

      setPreview(previewData);
      setShowPreview(true);
    } catch (error: any) {
      console.error("Error preview:", error);
      toast.error(error.message || "Gagal membuat preview");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMember || !receivedAmount) {
      toast.error("Lengkapi semua data");
      return;
    }

    try {
      setLoading(true);
      const [year, month] = selectedMonth.split("-").map(Number);

      const result = await serviceAllowanceService.create({
        user_id: parseInt(selectedMember),
        period_month: month,
        period_year: year,
        received_amount: parseFloat(receivedAmount),
        notes: notes || undefined,
      });

      toast.success(
        result.summary.message || "Jasa pelayanan berhasil diproses"
      );
      onSuccess();
      onClose();

      setSelectedMember("");
      setReceivedAmount("500000");
      setNotes("");
      setPreview(null);
      setShowPreview(false);
    } catch (error: any) {
      console.error("Error submitting:", error);
      toast.error(error.message || "Gagal memproses jasa pelayanan");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Input Jasa Pelayanan</DialogTitle>
          <DialogDescription>
            Masukkan data jasa pelayanan untuk anggota
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member" className="text-right">
              Anggota <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih anggota" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.full_name} ({member.employee_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="period" className="text-right">
              Periode <span className="text-red-500">*</span>
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
            <Label htmlFor="received-amount" className="text-right">
              Jumlah Diterima <span className="text-red-500">*</span>
            </Label>
            <Input
              id="received-amount"
              type="number"
              className="col-span-3"
              placeholder="500000"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Catatan
            </Label>
            <Textarea
              id="notes"
              className="col-span-3"
              placeholder="Catatan tambahan (opsional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={loading || !selectedMember || !receivedAmount}
            >
              <Info className="h-4 w-4 mr-2" />
              Preview Perhitungan
            </Button>
          </div>

          {showPreview && preview && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-blue-900">
                    {preview.member.full_name} - {preview.period}
                  </p>
                  <div className="text-sm space-y-1">
                    <p>
                      Jumlah diterima: {formatCurrency(preview.received_amount)}
                    </p>
                    <p>
                      Cicilan yang jatuh tempo:{" "}
                      {formatCurrency(
                        preview.calculation.total_installments_due
                      )}
                    </p>
                    <p>
                      Akan dibayar dari jasa:{" "}
                      {formatCurrency(
                        preview.calculation.will_be_paid_from_allowance
                      )}
                    </p>
                    <p className="font-medium">
                      {preview.calculation.scenario === "sufficient" ? (
                        <span className="text-green-600">
                          Sisa untuk member:{" "}
                          {formatCurrency(
                            preview.calculation.remaining_for_member
                          )}
                        </span>
                      ) : (
                        <span className="text-orange-600">
                          Member harus bayar:{" "}
                          {formatCurrency(preview.calculation.member_must_pay)}
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm italic text-blue-700 mt-2">
                    {preview.calculation.message}
                  </p>
                  {preview.installments.length > 0 && (
                    <div className="mt-3 text-xs">
                      <p className="font-medium mb-1">
                        Cicilan yang akan dibayar:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {preview.installments.map((inst) => (
                          <li key={inst.id}>
                            {inst.loan_number} - Cicilan #
                            {inst.installment_number}:{" "}
                            {formatCurrency(inst.amount)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sistem akan otomatis memotong cicilan pinjaman yang jatuh tempo
              dari jasa pelayanan yang diterima
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedMember}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Memproses...
              </>
            ) : (
              "Proses Sekarang"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =====================================================
// MODAL: View Detail (KEEP SAME)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Detail Jasa Pelayanan</DialogTitle>
          <DialogDescription>
            Rincian jasa pelayanan untuk {allowance.user?.full_name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Periode:</Label>
              <p className="text-lg">
                {new Date(
                  allowance.period_year,
                  allowance.period_month - 1
                ).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <div>
              <Label className="font-medium">ID Anggota:</Label>
              <p>{allowance.user?.employee_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Nama Anggota:</Label>
              <p>{allowance.user?.full_name}</p>
            </div>
            <div>
              <Label className="font-medium">Status:</Label>
              <Badge
                className={
                  allowance.status === "processed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {allowance.status === "processed"
                  ? "Sudah Diproses"
                  : "Pending"}
              </Badge>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-3">Rincian:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Jumlah Diterima dari RS:</span>
                <span className="font-medium text-blue-600">
                  {formatCurrency(allowance.received_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Digunakan untuk Cicilan:</span>
                <span className="font-medium text-orange-600">
                  -{formatCurrency(allowance.installment_paid)}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Sisa untuk Member:</span>
                <span className="text-green-600">
                  {formatCurrency(allowance.remaining_amount)}
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
// MAIN COMPONENT - WITH IMPORT EXCEL
// =====================================================
export default function PayrollManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [inputModal, setInputModal] = useState(false);
  const [importModal, setImportModal] = useState(false); // ✅ NEW
  const [viewModal, setViewModal] = useState(false);
  const [selectedAllowance, setSelectedAllowance] =
    useState<ServiceAllowance | null>(null);
  const [allowances, setAllowances] = useState<ServiceAllowance[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split("-").map(Number);

      const allowanceData = await serviceAllowanceService.getAll({
        month,
        year,
      });
      setAllowances(allowanceData);

      try {
        const summaryData = await serviceAllowanceService.getPeriodSummary(
          month,
          year
        );
        setSummary(summaryData);
      } catch (summaryError) {
        console.log("No summary data for this period");
        setSummary(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    return status === "processed" ? (
      <Badge className="bg-green-100 text-green-800">Sudah Diproses</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    );
  };

  const handleViewAllowance = (allowance: ServiceAllowance) => {
    setSelectedAllowance(allowance);
    setViewModal(true);
  };

  const handleDownloadReport = (reportType: string) => {
    const currentDate = new Date().toISOString().split("T")[0];
    let csvContent = "";

    switch (reportType) {
      case "monthly":
        csvContent = `Laporan Jasa Pelayanan Bulanan\nPeriode: ${selectedMonth}\nTanggal: ${currentDate}\n\nID,Nama,Employee ID,Jumlah Diterima,Cicilan Dibayar,Sisa untuk Member,Status\n`;
        filteredAllowances.forEach((allowance) => {
          csvContent += `${allowance.id},${allowance.user?.full_name},${allowance.user?.employee_id},${allowance.received_amount},${allowance.installment_paid},${allowance.remaining_amount},${allowance.status}\n`;
        });
        break;
      case "summary":
        const totalReceived = filteredAllowances.reduce(
          (sum, a) => sum + parseFloat(a.received_amount),
          0
        );
        const totalInstallment = filteredAllowances.reduce(
          (sum, a) => sum + parseFloat(a.installment_paid),
          0
        );
        const totalRemaining = filteredAllowances.reduce(
          (sum, a) => sum + parseFloat(a.remaining_amount),
          0
        );
        csvContent = `Ringkasan Jasa Pelayanan\nTanggal: ${currentDate}\n\nTotal Diterima dari RS,${totalReceived}\nTotal Cicilan Dibayar,${totalInstallment}\nTotal Sisa untuk Member,${totalRemaining}\nJumlah Anggota,${filteredAllowances.length}`;
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

  const filteredAllowances = allowances.filter((allowance) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      allowance.user?.full_name.toLowerCase().includes(searchLower) ||
      allowance.user?.employee_id.toLowerCase().includes(searchLower)
    );
  });

  const totalReceived = filteredAllowances.reduce(
    (sum, a) => sum + parseFloat(a.received_amount),
    0
  );
  const totalInstallment = filteredAllowances.reduce(
    (sum, a) => sum + parseFloat(a.installment_paid),
    0
  );
  const totalRemaining = filteredAllowances.reduce(
    (sum, a) => sum + parseFloat(a.remaining_amount),
    0
  );
  const processedCount = filteredAllowances.filter(
    (a) => a.status === "processed"
  ).length;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header - WITH IMPORT BUTTON */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manajemen Jasa Pelayanan
            </h1>
            <p className="text-gray-600 mt-1">Kelola jasa pelayanan anggota</p>
          </div>
          <div className="flex space-x-2">
            {/* ✅ NEW: Import Excel Button */}
            <Button variant="outline" onClick={() => setImportModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setInputModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Input Manual
            </Button>
          </div>
        </div>

        {/* Statistics Cards (KEEP SAME) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Diterima
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalReceived)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Cicilan Dibayar
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalInstallment)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calculator className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Sisa untuk Member
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Sudah Diproses
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {processedCount}/{filteredAllowances.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters (KEEP SAME) */}
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

        {/* Allowances Table (KEEP SAME) */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Jasa Pelayanan</CardTitle>
            <CardDescription>
              Menampilkan {filteredAllowances.length} data untuk periode{" "}
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
                    {filteredAllowances.map((allowance) => (
                      <tr
                        key={allowance.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {allowance.user?.full_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {allowance.user?.employee_id}
                            </p>
                          </div>
                        </td>
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
                            onClick={() => handleViewAllowance(allowance)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
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

        {/* Reports Section (KEEP SAME) */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan</CardTitle>
            <CardDescription>Unduh laporan jasa pelayanan</CardDescription>
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
      <InputAllowanceModal
        isOpen={inputModal}
        onClose={() => setInputModal(false)}
        onSuccess={fetchData}
      />

      {/* ✅ NEW: Import Excel Modal */}
      <ImportExcelModal
        isOpen={importModal}
        onClose={() => setImportModal(false)}
        onSuccess={fetchData}
      />

      <ViewAllowanceModal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        allowance={selectedAllowance}
      />
    </ManagerLayout>
  );
}
