import React, { useState } from "react";
import { KasLayout } from "@/components/layout/KasLayout";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Download,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LoanDetailModal } from "@/components/modals/LoanDetailModal"; // ← IMPORT INI

// Interface untuk data internal
interface LoanData {
  id: string;
  kas_id: number;
  memberId: string;
  memberName: string;
  amount: number;
  remaining: number;
  term: number;
  interestRate: number;
  status: "active" | "pending" | "completed" | "overdue";
  startDate: string;
  nextPayment: string;
  purpose: string;
}

// Interface untuk LoanDetailModal (dari modal component)
interface Loan {
  id: string;
  amount: number;
  purpose: string;
  term: number;
  monthlyPayment: number;
  remainingBalance: number;
  paidInstallments: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: string;
  collateral: string;
  nextPaymentDate: string;
}

// Modal Components
const AddLoanModal = ({
  isOpen,
  onClose,
  kasId,
}: {
  isOpen: boolean;
  onClose: () => void;
  kasId: number;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Tambah Pinjaman Baru - Kas {kasId}</DialogTitle>
          <DialogDescription>
            Buat pengajuan pinjaman baru untuk anggota koperasi
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-select" className="text-right">
              Anggota
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih anggota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A001">A001 - Ahmad Sutanto</SelectItem>
                <SelectItem value="A002">A002 - Siti Rahayu</SelectItem>
                <SelectItem value="A003">A003 - Budi Santoso</SelectItem>
                <SelectItem value="A004">A004 - Dewi Sartika</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loan-type" className="text-right">
              Jenis Pinjaman
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih jenis pinjaman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Modal Usaha</SelectItem>
                <SelectItem value="emergency">Pinjaman Darurat</SelectItem>
                <SelectItem value="education">Pinjaman Pendidikan</SelectItem>
                <SelectItem value="vehicle">Kendaraan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loan-amount" className="text-right">
              Jumlah Pinjaman
            </Label>
            <Input
              id="loan-amount"
              type="number"
              className="col-span-3"
              placeholder="5000000"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loan-term" className="text-right">
              Jangka Waktu
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih jangka waktu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Bulan</SelectItem>
                <SelectItem value="12">12 Bulan</SelectItem>
                <SelectItem value="24">24 Bulan</SelectItem>
                <SelectItem value="36">36 Bulan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="interest-rate" className="text-right">
              Suku Bunga (%)
            </Label>
            <Input
              id="interest-rate"
              type="number"
              className="col-span-3"
              placeholder="12"
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="purpose" className="text-right">
              Tujuan Pinjaman
            </Label>
            <Textarea
              id="purpose"
              className="col-span-3"
              placeholder="Jelaskan tujuan penggunaan pinjaman..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="collateral" className="text-right">
              Jaminan
            </Label>
            <Textarea
              id="collateral"
              className="col-span-3"
              placeholder="Deskripsi jaminan (opsional)..."
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={onClose}>Ajukan Pinjaman</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EditLoanModal = ({
  isOpen,
  onClose,
  loan,
}: {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
}) => {
  if (!loan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Pinjaman</DialogTitle>
          <DialogDescription>
            Ubah informasi pinjaman {loan.memberName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-amount" className="text-right">
              Jumlah Pinjaman
            </Label>
            <Input
              id="edit-amount"
              type="number"
              className="col-span-3"
              defaultValue={loan.amount}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-rate" className="text-right">
              Suku Bunga (%)
            </Label>
            <Input
              id="edit-rate"
              type="number"
              className="col-span-3"
              defaultValue={loan.interestRate}
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-status" className="text-right">
              Status
            </Label>
            <Select defaultValue={loan.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Lunas</SelectItem>
                <SelectItem value="overdue">Menunggak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-notes" className="text-right">
              Catatan
            </Label>
            <Textarea
              id="edit-notes"
              className="col-span-3"
              placeholder="Catatan tambahan..."
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={onClose}>Simpan Perubahan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function KasLoanManagement() {
  const { user } = useAuth();
  const kasId = user?.kas_id || 1;

  const [searchTerm, setSearchTerm] = useState("");
  const [addLoanModal, setAddLoanModal] = useState(false);
  const [viewLoanModal, setViewLoanModal] = useState(false);
  const [editLoanModal, setEditLoanModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanData | null>(null);
  const [selectedLoanDetail, setSelectedLoanDetail] = useState<Loan | null>(
    null
  ); // ← TAMBAH INI

  // Mock data - SEMUA PINJAMAN dari SEMUA KAS
  const allLoansData: LoanData[] = [
    // Kas 1
    {
      id: "L001",
      kas_id: 1,
      memberId: "A001",
      memberName: "Ahmad Sutanto",
      amount: 5000000,
      remaining: 3500000,
      term: 24,
      interestRate: 12,
      status: "active",
      startDate: "2023-06-15",
      nextPayment: "2024-02-15",
      purpose: "business",
    },
    {
      id: "L002",
      kas_id: 1,
      memberId: "A002",
      memberName: "Siti Rahayu",
      amount: 3000000,
      remaining: 1500000,
      term: 12,
      interestRate: 10,
      status: "active",
      startDate: "2023-08-20",
      nextPayment: "2024-02-20",
      purpose: "home_improvement",
    },
    // Kas 3
    {
      id: "L003",
      kas_id: 3,
      memberId: "A003",
      memberName: "Budi Santoso",
      amount: 2000000,
      remaining: 2000000,
      term: 6,
      interestRate: 0,
      status: "active",
      startDate: "2023-12-01",
      nextPayment: "2024-01-01",
      purpose: "emergency",
    },
    {
      id: "L004",
      kas_id: 3,
      memberId: "A004",
      memberName: "Dewi Sartika",
      amount: 3000000,
      remaining: 3000000,
      term: 12,
      interestRate: 0,
      status: "pending",
      startDate: "2024-01-10",
      nextPayment: "2024-02-10",
      purpose: "education",
    },
    // Kas 2
    {
      id: "L005",
      kas_id: 2,
      memberId: "A005",
      memberName: "Andi Wijaya",
      amount: 4000000,
      remaining: 4000000,
      term: 18,
      interestRate: 10,
      status: "pending",
      startDate: "2024-01-12",
      nextPayment: "2024-02-12",
      purpose: "vehicle",
    },
  ];

  // ✨ MAGIC FILTER - Hanya tampilkan data sesuai kas_id user
  const activeLoans = allLoansData.filter(
    (loan) => loan.kas_id === kasId && loan.status === "active"
  );
  const loanApplications = allLoansData.filter(
    (loan) => loan.kas_id === kasId && loan.status === "pending"
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", text: "Aktif" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      completed: { color: "bg-blue-100 text-blue-800", text: "Lunas" },
      overdue: { color: "bg-red-100 text-red-800", text: "Menunggak" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  // ✨ HELPER: Convert LoanData ke Loan untuk modal
  const convertToLoanDetail = (loanData: LoanData): Loan => {
    // Calculate monthly payment (simplified)
    const monthlyPayment = loanData.amount / loanData.term;

    // Calculate paid installments based on remaining
    const paidAmount = loanData.amount - loanData.remaining;
    const paidInstallments = Math.floor(paidAmount / monthlyPayment);

    // Calculate end date
    const startDate = new Date(loanData.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + loanData.term);

    return {
      id: loanData.id,
      amount: loanData.amount,
      purpose: loanData.purpose,
      term: loanData.term,
      monthlyPayment: monthlyPayment,
      remainingBalance: loanData.remaining,
      paidInstallments: paidInstallments,
      interestRate: loanData.interestRate,
      startDate: loanData.startDate,
      endDate: endDate.toISOString().split("T")[0],
      status: loanData.status,
      collateral: "certificate", // Mock - nanti dari database
      nextPaymentDate: loanData.nextPayment,
    };
  };

  const handleViewLoan = (loan: LoanData) => {
    const loanDetail = convertToLoanDetail(loan);
    setSelectedLoanDetail(loanDetail);
    setViewLoanModal(true);
  };

  const handleEditLoan = (loan: LoanData) => {
    setSelectedLoan(loan);
    setEditLoanModal(true);
  };

  const handleReviewApplication = (application: LoanData) => {
    toast.info(`Meninjau pengajuan pinjaman ${application.id}`);
  };

  const handleApproveApplication = (application: LoanData) => {
    toast.success(`Pinjaman ${application.id} disetujui!`);
  };

  const handleRejectApplication = (application: LoanData) => {
    toast.error(`Pinjaman ${application.id} ditolak`);
  };

  const handleMakePayment = (loan: Loan) => {
    toast.info(`Memproses pembayaran untuk pinjaman ${loan.id}`);
    setViewLoanModal(false);
    // TODO: Open payment modal
  };

  // Calculate statistics
  const totalActiveAmount = activeLoans.reduce(
    (sum, loan) => sum + loan.amount,
    0
  );
  const totalRemaining = activeLoans.reduce(
    (sum, loan) => sum + loan.remaining,
    0
  );
  const overdueLoans = activeLoans.filter(
    (loan) => loan.status === "overdue"
  ).length;
  const pendingApplications = loanApplications.length;

  return (
    <KasLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manajemen Pinjaman
            </h1>
            <p className="text-gray-600 mt-1">Kelola pinjaman Kas {kasId}</p>
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setAddLoanModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Pinjaman Baru
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Pinjaman Aktif
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalActiveAmount)}
                  </p>
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
                    Total Sisa Pinjaman
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
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Pinjaman Menunggak
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overdueLoans}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Pengajuan Pending
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingApplications}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Pinjaman Aktif</TabsTrigger>
            <TabsTrigger value="applications">Pengajuan Baru</TabsTrigger>
            <TabsTrigger value="history">Riwayat Pinjaman</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pencarian Pinjaman</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama anggota atau ID pinjaman..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Active Loans Table */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pinjaman Aktif</CardTitle>
                <CardDescription>
                  Menampilkan {activeLoans.length} pinjaman aktif di Kas {kasId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          ID Pinjaman
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Anggota
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Jumlah
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Sisa
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Jatuh Tempo
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLoans.map((loan) => (
                        <tr key={loan.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{loan.id}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {loan.memberName}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {loan.memberId}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatCurrency(loan.amount)}
                          </td>
                          <td className="py-3 px-4 font-medium text-red-600">
                            {formatCurrency(loan.remaining)}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(loan.status)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(loan.nextPayment).toLocaleDateString(
                              "id-ID"
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewLoan(loan)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditLoan(loan)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengajuan Pinjaman Baru</CardTitle>
                <CardDescription>
                  Menampilkan {loanApplications.length} pengajuan yang perlu
                  ditinjau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loanApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Tidak ada pengajuan pinjaman baru
                      </p>
                    </div>
                  ) : (
                    loanApplications.map((application) => (
                      <div
                        key={application.id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {application.memberName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  ID: {application.memberId} • {application.id}
                                </p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-blue-600">
                                  {formatCurrency(application.amount)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {application.term} bulan •{" "}
                                  {application.interestRate}%
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  {application.purpose}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Diajukan:{" "}
                                  {new Date(
                                    application.startDate
                                  ).toLocaleDateString("id-ID")}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleReviewApplication(application)
                              }
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                handleApproveApplication(application)
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleRejectApplication(application)
                              }
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Tolak
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History & Reports tabs - placeholder */}
          <TabsContent value="history">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  Riwayat pinjaman akan ditampilkan di sini
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  Laporan akan ditampilkan di sini
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddLoanModal
        isOpen={addLoanModal}
        onClose={() => setAddLoanModal(false)}
        kasId={kasId}
      />

      {/* ✨ GANTI dengan LoanDetailModal */}
      <LoanDetailModal
        loan={selectedLoanDetail}
        isOpen={viewLoanModal}
        onClose={() => {
          setViewLoanModal(false);
          setSelectedLoanDetail(null);
        }}
        onMakePayment={handleMakePayment}
      />

      <EditLoanModal
        isOpen={editLoanModal}
        onClose={() => setEditLoanModal(false)}
        loan={selectedLoan}
      />
    </KasLayout>
  );
}
