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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Search,
  RefreshCw,
  DollarSign,
  Calendar,
  User,
  FileText,
  Eye,
  AlertCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import useInstallments from "@/hooks/useInstallments";
import { useAuth } from "@/contexts/AuthContext";
import InstallmentDetailModal from "@/components/modals/InstallmentDetailModal";

// ✅ Use types from loans.service.ts
import type { Installment } from "@/lib/api/loans.service";

function UpcomingInstallments() {
  const { user } = useAuth();
  const isManager = user?.role === "manager" || user?.role === "admin";

  const { upcomingInstallments, loading, error, getUpcomingInstallments } =
    useInstallments();

  const [searchQuery, setSearchQuery] = useState("");
  const [daysFilter, setDaysFilter] = useState("7");
  const [selectedInstallment, setSelectedInstallment] =
    useState<Installment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Load data on mount and when filter changes
  useEffect(() => {
    loadData();
  }, [daysFilter]);

  const loadData = async () => {
    try {
      await getUpcomingInstallments(parseInt(daysFilter));
    } catch (error) {
      console.error("Error loading upcoming installments:", error);
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

  // Calculate days until due
  const calculateDaysUntilDue = (dueDate: string | undefined) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  // Get urgency badge
  const getUrgencyBadge = (daysUntilDue: number) => {
    if (daysUntilDue === 0) {
      return <Badge variant="destructive">Jatuh tempo hari ini</Badge>;
    } else if (daysUntilDue === 1) {
      return <Badge className="bg-orange-500">Besok</Badge>;
    } else if (daysUntilDue <= 3) {
      return <Badge className="bg-yellow-500">{daysUntilDue} hari lagi</Badge>;
    } else {
      return <Badge variant="secondary">{daysUntilDue} hari lagi</Badge>;
    }
  };

  // Filter installments based on search
  const filteredInstallments = upcomingInstallments.filter((inst) => {
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

  // Sort by due date (nearest first)
  const sortedInstallments = [...filteredInstallments].sort((a, b) => {
    const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
    const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;
    return dateA - dateB;
  });

  // Calculate total upcoming amount
  const totalUpcomingAmount = upcomingInstallments.reduce((sum, inst) => {
    const amount =
      typeof inst.total_amount === "string"
        ? parseFloat(inst.total_amount)
        : inst.total_amount || 0;
    return sum + amount;
  }, 0);

  // Group by urgency
  const urgentInstallments = sortedInstallments.filter(
    (inst) => calculateDaysUntilDue(inst.due_date) <= 3
  );

  // Handle view detail
  const handleViewDetail = (installment: Installment) => {
    setSelectedInstallment(installment);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cicilan Mendatang</h1>
        <p className="text-gray-600 mt-2">
          Daftar cicilan yang akan jatuh tempo dalam {daysFilter} hari ke depan
        </p>
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Cicilan
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {upcomingInstallments.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(totalUpcomingAmount)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Mendesak (≤3 hari)
                </p>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {urgentInstallments.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Installments Alert */}
      {urgentInstallments.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ada {urgentInstallments.length} cicilan yang akan jatuh tempo dalam
            3 hari ke depan. Pastikan untuk segera melakukan pembayaran.
          </AlertDescription>
        </Alert>
      )}

      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Daftar Cicilan Mendatang
              </CardTitle>
              <CardDescription className="mt-2">
                Menampilkan {sortedInstallments.length} dari{" "}
                {upcomingInstallments.length} cicilan mendatang
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={daysFilter} onValueChange={setDaysFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter hari" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 hari</SelectItem>
                  <SelectItem value="14">14 hari</SelectItem>
                  <SelectItem value="30">30 hari</SelectItem>
                  <SelectItem value="60">60 hari</SelectItem>
                </SelectContent>
              </Select>
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
          ) : sortedInstallments.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {upcomingInstallments.length === 0
                  ? "Tidak ada cicilan mendatang"
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
                      Countdown
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedInstallments.map((installment) => {
                    const daysUntilDue = calculateDaysUntilDue(
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
                          {getUrgencyBadge(daysUntilDue)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(installment.total_amount)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              installment.status === "pending"
                                ? "secondary"
                                : installment.status === "paid"
                                ? "default"
                                : "outline"
                            }
                          >
                            {installment.status === "pending"
                              ? "Belum Bayar"
                              : installment.status === "paid"
                              ? "Lunas"
                              : installment.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(installment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
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
        />
      )}
    </div>
  );
}

export default UpcomingInstallments;
