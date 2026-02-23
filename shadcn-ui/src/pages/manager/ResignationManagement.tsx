import React, { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserX,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  DollarSign,
} from "lucide-react";
import { ResignationDetailModal } from "@/components/modals/ResignationDetailModal";
import { ResignationApprovalModal } from "@/components/modals/ResignationApprovalModal";
import { ResignationRejectionModal } from "@/components/modals/ResignationRejectionModal";
import {
  useResignations,
  useResignationStatistics,
} from "@/hooks/useResignations";
import resignationService, { Resignation } from "@/lib/api/resignation.service";
import { WithdrawalProcessModal } from "@/components/modals/WithdrawalProcessModal";
import cashAccountsService from "@/lib/api/cash-accounts.service";

export default function ResignationManagement() {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal states
  const [selectedResignation, setSelectedResignation] =
    useState<Resignation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [selectedForWithdrawal, setSelectedForWithdrawal] =
    useState<Resignation | null>(null);
  const [cashAccounts, setCashAccounts] = useState([]);

  // ✅ UPDATED: Filter via API params
  const { resignations, loading, error, refetch } = useResignations({
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    search: searchTerm || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  });

  const { statistics, loading: statsLoading } = useResignationStatistics();

  // Load cash accounts for withdrawal
  useEffect(() => {
    async function loadCashAccounts() {
      try {
        const response = await cashAccountsService.getAll({ all: true });
        const accounts = response.data || response;
        setCashAccounts(Array.isArray(accounts) ? accounts : []);
      } catch (error) {
        console.error("Error loading cash accounts:", error);
      }
    }
    loadCashAccounts();
  }, []);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Refetch when debounced search changes
  useEffect(() => {
    refetch();
  }, [debouncedSearch, statusFilter, startDate, endDate]);

  const handleViewDetail = (resignation: Resignation) => {
    setSelectedResignation(resignation);
    setIsDetailModalOpen(true);
  };

  const handleApprove = (resignation: Resignation) => {
    setSelectedResignation(resignation);
    setIsApprovalModalOpen(true);
  };

  const handleReject = (resignation: Resignation) => {
    setSelectedResignation(resignation);
    setIsRejectionModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const formatCurrency = (amount: number) =>
    resignationService.formatCurrency(amount);
  const formatDate = (dateString: string) =>
    resignationService.formatDate(dateString);

  const getStatusBadge = (status: string) => {
    const color = resignationService.getStatusBadgeColor(status);
    const name = resignationService.getStatusDisplayName(status);
    return <Badge className={color}>{name}</Badge>;
  };

  // Statistics
  const totalResignations =
    statistics?.total_resignations || resignations.length;
  const pendingCount =
    statistics?.pending ||
    resignations.filter((r) => r.status === "pending").length;
  const approvedCount =
    statistics?.approved ||
    resignations.filter((r) => r.status === "approved").length;
  const rejectedCount =
    statistics?.rejected ||
    resignations.filter((r) => r.status === "rejected").length;

  if (loading && resignations.length === 0) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Memuat data...</span>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserX className="h-8 w-8 mr-3 text-red-600" />
              Manajemen Pengunduran Diri
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola pengajuan pengunduran diri anggota
            </p>
          </div>
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Pengajuan
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalResignations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Menunggu</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Disetujui</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {approvedCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ditolak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rejectedCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ UPDATED: Search and Filter via API */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama anggota atau ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                Reset Filter
              </Button>

              {/* Date Range */}
              <div className="md:col-span-2 flex gap-2 items-center">
                <div className="flex-1">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Dari tanggal"
                  />
                </div>
                <span className="text-gray-400">—</span>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="Sampai tanggal"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resignations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengajuan</CardTitle>
            <CardDescription>
              Menampilkan {resignations.length} pengajuan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Anggota
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Tanggal
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Pengembalian
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
                  {resignations.length > 0 ? (
                    resignations.map((resignation) => (
                      <tr
                        key={resignation.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-mono">
                          #{resignation.id}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">
                              {resignation.user?.full_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {resignation.user?.employee_id}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p className="flex items-center text-gray-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(resignation.request_date || resignation.created_at)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Efektif:{" "}
                              {formatDate(resignation.resignation_date)}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {resignation.withdrawal ? (
                            <div>
                              <span className="font-medium text-green-600 block">
                                {formatCurrency(Number(resignation.withdrawal.total_withdrawal))}
                              </span>
                              <span className="text-xs text-gray-500">
                                Cair: {formatDate(resignation.withdrawal.withdrawal_date)}
                              </span>
                            </div>
                          ) : resignation.return_amount !== undefined ? (
                            <span className="font-medium text-green-600">
                              {formatCurrency(resignation.return_amount)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(resignation.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetail(resignation)}
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {resignation.status === "approved" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedForWithdrawal(resignation);
                                  setIsWithdrawalModalOpen(true);
                                }}
                                className="text-blue-600"
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Pencairan
                              </Button>
                            )}
                            {resignation.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleApprove(resignation)}
                                  title="Setujui"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleReject(resignation)}
                                  title="Tolak"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-500"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Memuat data...
                          </div>
                        ) : (
                          "Tidak ada pengajuan yang ditemukan"
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ResignationDetailModal
        resignation={selectedResignation}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedResignation(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        showActions={selectedResignation?.status === "pending"}
      />
      <ResignationApprovalModal
        resignation={selectedResignation}
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setSelectedResignation(null);
        }}
        onSuccess={refetch}
      />
      <ResignationRejectionModal
        resignation={selectedResignation}
        isOpen={isRejectionModalOpen}
        onClose={() => {
          setIsRejectionModalOpen(false);
          setSelectedResignation(null);
        }}
        onSuccess={refetch}
      />
      <WithdrawalProcessModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onSuccess={() => refetch()}
        resignation={selectedForWithdrawal}
        cashAccounts={cashAccounts}
      />
    </ManagerLayout>
  );
}
