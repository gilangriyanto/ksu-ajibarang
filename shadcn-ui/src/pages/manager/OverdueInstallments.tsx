import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Search,
  RefreshCw,
  DollarSign,
  Calendar,
  User,
  FileText,
  Eye,
  CreditCard,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import useInstallments from "@/hooks/useInstallments";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import InstallmentDetailModal from "@/components/modals/InstallmentDetailModal";

// ✅ Use types from loans.service.ts
import type { Installment } from "@/lib/api/loans.service";

function OverdueInstallments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isManager = user?.role === "manager" || user?.role === "admin";

  const {
    overdueInstallments,
    loading,
    error,
    getOverdueInstallments,
    payInstallment,
  } = useInstallments();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstallment, setSelectedInstallment] =
    useState<Installment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await getOverdueInstallments();
    } catch (error) {
      console.error("Error loading overdue installments:", error);
    }
  };

  // Format currency
  const formatCurrency = (amount: number | string | undefined) => {
    if (!amount) return "Rp 0";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Calculate days overdue
  const calculateDaysOverdue = (dueDate: string | undefined) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Filter installments based on search
  const filteredInstallments = overdueInstallments.filter((inst) => {
    const query = searchQuery.toLowerCase();
    const loanNumber = inst.loan?.loan_number?.toLowerCase() || "";
    const userName = inst.loan?.user?.full_name?.toLowerCase() || "";
    const employeeId = inst.loan?.user?.employee_id?.toLowerCase() || "";
    const installmentNum = inst.installment_number?.toString() || "";

    return (
      loanNumber.includes(query) ||
      userName.includes(query) ||
      employeeId.includes(query) ||
      installmentNum.includes(query)
    );
  });

  // Calculate total overdue amount
  const totalOverdueAmount = overdueInstallments.reduce((sum, inst) => {
    const total =
      typeof inst.total_amount === "string"
        ? parseFloat(inst.total_amount)
        : inst.total_amount || 0;
    const lateFee =
      typeof inst.late_fee === "string"
        ? parseFloat(inst.late_fee)
        : inst.late_fee || 0;
    return sum + total + lateFee;
  }, 0);

  // Handle view detail
  const handleViewDetail = (installment: Installment) => {
    setSelectedInstallment(installment);
    setDetailModalOpen(true);
  };

  // Handle payment
  const handlePayment = async (
    installmentId: number,
    paymentMethod: string,
    notes: string
  ) => {
    try {
      setPaymentLoading(true);
      await payInstallment(
        installmentId,
        paymentMethod as "cash" | "transfer" | "service_allowance",
        notes
      );
      setDetailModalOpen(false);
      setSelectedInstallment(null);
      await loadData();
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/manager")}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Cicilan Terlambat
          </h1>
          <p className="text-gray-600 mt-2">
            Daftar cicilan yang melewati jatuh tempo pembayaran
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 px-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Tunggakan
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {overdueInstallments.length}
                </p>
              </div>
              <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 px-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Jumlah Tunggakan
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {formatCurrency(totalOverdueAmount)}
                </p>
              </div>
              <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 px-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Rata-rata Keterlambatan
                </p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {overdueInstallments.length > 0
                    ? Math.round(
                        overdueInstallments.reduce(
                          (sum, inst) =>
                            sum + calculateDaysOverdue(inst.due_date),
                          0
                        ) / overdueInstallments.length
                      )
                    : 0}{" "}
                  hari
                </p>
              </div>
              <div className="h-14 w-14 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Daftar Cicilan Terlambat
              </CardTitle>
              <CardDescription className="mt-2">
                Menampilkan {filteredInstallments.length} dari{" "}
                {overdueInstallments.length} cicilan terlambat
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari nomor pinjaman, nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-[300px]"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredInstallments.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {overdueInstallments.length === 0
                  ? "Tidak ada cicilan terlambat"
                  : "Tidak ada hasil pencarian"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No Pinjaman
                    </th>
                    {isManager && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Anggota
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cicilan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jatuh Tempo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keterlambatan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Denda
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInstallments.map((installment) => {
                    const daysOverdue = calculateDaysOverdue(
                      installment.due_date
                    );
                    return (
                      <tr key={installment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {installment.loan?.loan_number || "-"}
                            </span>
                          </div>
                        </td>
                        {isManager && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {installment.loan?.user?.full_name || "-"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {installment.loan?.user?.employee_id || "-"}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant="outline">
                            Cicilan #{installment.installment_number}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {formatDate(installment.due_date)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant="destructive">
                            {daysOverdue} hari
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(installment.total_amount)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-red-600">
                            {formatCurrency(installment.late_fee)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(installment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                          {!isManager && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedInstallment(installment);
                                setDetailModalOpen(true);
                              }}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Bayar
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedInstallment && (
        <InstallmentDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedInstallment(null);
          }}
          installment={selectedInstallment}
          onPayment={handlePayment}
        />
      )}
    </div>
  );
}

export default OverdueInstallments;
