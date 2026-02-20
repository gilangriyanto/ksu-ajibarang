// pages/CashTransferManagement.tsx
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  CheckCheck,
  Ban,
} from "lucide-react";
import { ManagerLayout } from "../../components/layout/ManagerLayout";
import { useCashTransfers } from "../../hooks/useCashTransfers";
import CashTransferRequestModal from "../../components/modals/CashTransferRequestModal";
import CashTransferDetailModal from "../../components/modals/CashTransferDetailModal";
import CashTransferApprovalModal from "../../components/modals/CashTransferApprovalModal";
import CashTransferCancellationModal from "../../components/modals/CashTransferCancellationModal";
import cashTransferService from "../../lib/api/cash-transfer.service";

const CashTransferManagement = () => {
  const {
    transfers,
    currentTransfer,
    pagination,
    statistics,
    loading,
    fetchTransfers,
    fetchTransferById,
    createTransfer,
    approveTransfer,
    cancelTransfer,
    fetchStatistics,
  } = useCashTransfers();

  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<number | null>(
    null,
  );

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Load data on mount
  useEffect(() => {
    loadData();
    loadStatistics();
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadData();
  }, [statusFilter, currentPage, searchQuery]);

  const loadData = () => {
    fetchTransfers({
      page: currentPage,
      per_page: 10,
      ...(statusFilter ? { status: statusFilter as any } : {}),
      ...(searchQuery ? { search: searchQuery } : {}),
      sort_by: "created_at",
      sort_order: "desc",
    });
  };

  const loadStatistics = () => {
    const now = new Date();
    fetchStatistics(now.getFullYear(), now.getMonth() + 1);
  };

  const handleViewDetail = async (id: number) => {
    setSelectedTransferId(id);
    await fetchTransferById(id);
    setShowDetailModal(true);
  };

  const handleApprove = async (id: number) => {
    setSelectedTransferId(id);
    await fetchTransferById(id);
    setShowApprovalModal(true);
  };

  const handleCancel = async (id: number) => {
    setSelectedTransferId(id);
    await fetchTransferById(id);
    setShowCancellationModal(true);
  };

  const handleCreateSuccess = () => {
    loadData();
    loadStatistics();
  };

  const handleApprovalSuccess = async (id: number) => {
    const success = await approveTransfer(id);
    if (success) {
      loadData();
      loadStatistics();
    }
    return success;
  };

  const handleCancellationSuccess = async (id: number, reason: string) => {
    const success = await cancelTransfer(id, reason);
    if (success) {
      loadData();
      loadStatistics();
    }
    return success;
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Transfer Kas
          </h1>
          <p className="text-gray-600 mt-1">Kelola transfer antar kas</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transfer</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.total_count}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menunggu Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statistics.pending_count}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.completed_count}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dibatalkan</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statistics.cancelled_count}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan keterangan..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu Approval</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Buat Transfer
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dari Kas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ke Kas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nominal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dibuat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : transfers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Tidak ada data transfer
                    </td>
                  </tr>
                ) : (
                  transfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        #{transfer.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transfer.from_cash_account?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transfer.to_cash_account?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {cashTransferService.formatCurrency(transfer.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${cashTransferService.getStatusBadgeColor(
                            transfer.status,
                          )}`}
                        >
                          {cashTransferService.getStatusDisplayName(
                            transfer.status,
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {cashTransferService.formatDate(transfer.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(transfer.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {transfer.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(transfer.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Setujui"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancel(transfer.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Batalkan"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {(currentPage - 1) * pagination.itemsPerPage + 1} -{" "}
                {Math.min(
                  currentPage * pagination.itemsPerPage,
                  pagination.totalItems,
                )}{" "}
                dari {pagination.totalItems} data
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(pagination.totalPages, prev + 1),
                    )
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CashTransferRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={async (data) => {
          const success = await createTransfer(data);
          if (success) {
            handleCreateSuccess();
          }
          return success;
        }}
        loading={loading}
      />

      <CashTransferDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        transferId={selectedTransferId}
        transfer={currentTransfer}
        loading={loading}
      />

      <CashTransferApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        transfer={currentTransfer}
        onApprove={handleApprovalSuccess}
        loading={loading}
      />

      <CashTransferCancellationModal
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        transfer={currentTransfer}
        onCancel={handleCancellationSuccess}
        loading={loading}
      />
    </ManagerLayout>
  );
};

export default CashTransferManagement;
