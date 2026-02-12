// pages/manager/SalaryDeductionManagement.tsx
// 🔧 FIXED: Fetch members dari API untuk dropdown di modal
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Users,
  Eye,
  Download,
  TrendingUp,
  DollarSign,
  Calculator,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSalaryDeductions } from "../../hooks/useSalaryDeductions";
import salaryDeductionService from "../../lib/api/salary-deduction.service";
import apiClient from "../../lib/api/api-client";
import ProcessDeductionModal from "../../components/modals/ProcessDeductionModal";
import BatchProcessModal from "../../components/modals/BatchProcessModal";
import DeductionDetailModal from "../../components/modals/DeductionDetailModal";

interface Member {
  id: number;
  full_name: string;
  employee_id: string;
}

const SalaryDeductionManagement = () => {
  const currentDate = new Date();
  const {
    deductions,
    currentDeduction,
    statistics,
    pagination,
    loading,
    error,
    fetchDeductions,
    fetchDeductionById,
    processDeduction,
    batchProcess,
    fetchStatistics,
  } = useSalaryDeductions();

  // Modal states
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    period_year: currentDate.getFullYear(),
    period_month: currentDate.getMonth() + 1,
    status: "all",
    search: "",
    page: 1,
  });

  // Members data
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // ✅ FIXED: Fetch members dari API
  useEffect(() => {
    const fetchMembers = async () => {
      setMembersLoading(true);
      try {
        // Coba fetch semua members aktif
        const response = await apiClient.get("/members", {
          params: { status: "active", per_page: 999 },
        });

        console.log("✅ Members response:", response.data);

        // Handle berbagai format response
        let membersList: Member[] = [];

        if (response.data?.data?.data) {
          // Paginated: { data: { data: [...] } }
          membersList = response.data.data.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          // Simple: { data: [...] }
          membersList = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Direct array
          membersList = response.data;
        }

        // Map ke format yang dibutuhkan modal
        const formattedMembers = membersList.map((m: any) => ({
          id: m.id || m.user_id,
          full_name:
            m.full_name ||
            m.name ||
            `${m.first_name || ""} ${m.last_name || ""}`.trim(),
          employee_id: m.employee_id || m.member_number || m.nip || "-",
        }));

        console.log("✅ Formatted members:", formattedMembers.length, "items");
        setMembers(formattedMembers);
      } catch (err: any) {
        console.error("❌ Error fetching members:", err);

        // Fallback: coba endpoint /users
        try {
          const fallbackResponse = await apiClient.get("/users", {
            params: { role: "member", per_page: 999 },
          });

          console.log("✅ Users fallback response:", fallbackResponse.data);

          let usersList: any[] = [];
          if (fallbackResponse.data?.data?.data) {
            usersList = fallbackResponse.data.data.data;
          } else if (
            fallbackResponse.data?.data &&
            Array.isArray(fallbackResponse.data.data)
          ) {
            usersList = fallbackResponse.data.data;
          } else if (Array.isArray(fallbackResponse.data)) {
            usersList = fallbackResponse.data;
          }

          const formattedUsers = usersList.map((u: any) => ({
            id: u.id,
            full_name:
              u.full_name ||
              u.name ||
              `${u.first_name || ""} ${u.last_name || ""}`.trim(),
            employee_id: u.employee_id || u.member_number || u.nip || "-",
          }));

          console.log("✅ Fallback users:", formattedUsers.length, "items");
          setMembers(formattedUsers);
        } catch (fallbackErr) {
          console.error("❌ Fallback also failed:", fallbackErr);
        }
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Fetch data on mount and when filters change
  useEffect(() => {
    const params: any = {
      period_year: filters.period_year,
      period_month: filters.period_month,
      page: filters.page,
    };

    if (filters.status !== "all") {
      params.status = filters.status;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    fetchDeductions(params);
    fetchStatistics(filters.period_year, filters.period_month);
  }, [filters]);

  const handleViewDetail = async (id: number) => {
    await fetchDeductionById(id);
    setShowDetailModal(true);
  };

  const handleProcessSuccess = async () => {
    const params: any = {
      period_year: filters.period_year,
      period_month: filters.period_month,
      page: filters.page,
    };

    if (filters.status !== "all") {
      params.status = filters.status;
    }

    await fetchDeductions(params);
    await fetchStatistics(filters.period_year, filters.period_month);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const getMonthOptions = () => {
    const months = [
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
    ];
    return months.map((name, index) => ({ value: index + 1, label: name }));
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Potongan Gaji
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola potongan gaji bulanan untuk semua anggota
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowProcessModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Proses Single</span>
          </button>
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Proses Batch</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Anggota</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.total_members_processed || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Gaji Kotor</p>
                <p className="text-xl font-bold text-gray-900">
                  {salaryDeductionService.formatCurrency(
                    statistics.total_gross_salary || 0,
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Potongan</p>
                <p className="text-xl font-bold text-red-600">
                  {salaryDeductionService.formatCurrency(
                    statistics.total_deductions || 0,
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Calculator className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Gaji Bersih</p>
                <p className="text-xl font-bold text-green-600">
                  {salaryDeductionService.formatCurrency(
                    statistics.total_net_salary || 0,
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun
            </label>
            <select
              value={filters.period_year}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  period_year: Number(e.target.value),
                  page: 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulan
            </label>
            <select
              value={filters.period_month}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  period_month: Number(e.target.value),
                  page: 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getMonthOptions().map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value, page: 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Proses</option>
              <option value="processed">Sudah Diproses</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, page: 1 })
                }
                placeholder="Cari nama/NIP..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anggota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Periode
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gaji Kotor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Potongan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gaji Bersih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : deductions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">
                        Tidak ada data potongan gaji
                      </p>
                      <p className="text-sm mt-1">
                        Mulai dengan memproses potongan gaji anggota
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                deductions.map((deduction) => (
                  <tr
                    key={deduction.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{deduction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {deduction.user?.full_name || "-"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {deduction.user?.employee_id || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {salaryDeductionService.getPeriodDisplay(
                        deduction.period_year,
                        deduction.period_month,
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {salaryDeductionService.formatCurrency(
                        deduction.gross_salary,
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                      {salaryDeductionService.formatCurrency(
                        deduction.total_deductions,
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-bold">
                      {salaryDeductionService.formatCurrency(
                        deduction.net_salary,
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${salaryDeductionService.getStatusBadgeColor(
                          deduction.status,
                        )}`}
                      >
                        {salaryDeductionService.getStatusDisplayName(
                          deduction.status,
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewDetail(deduction.id)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Menampilkan {deductions.length} dari {pagination.totalItems} data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <span className="px-4 py-2 text-sm text-gray-700">
                Hal {pagination.currentPage} dari {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProcessDeductionModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        onSubmit={async (data) => {
          const success = await processDeduction(data);
          if (success) {
            await handleProcessSuccess();
          }
          return success;
        }}
        loading={loading}
        members={members}
      />

      <BatchProcessModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        onSubmit={async (data) => {
          const success = await batchProcess(data);
          if (success) {
            await handleProcessSuccess();
          }
          return success;
        }}
        loading={loading}
        members={members}
      />

      <DeductionDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        deduction={currentDeduction}
        loading={loading}
      />
    </div>
  );
};

export default SalaryDeductionManagement;
