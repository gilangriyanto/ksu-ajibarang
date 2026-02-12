// components/modals/DeductionDetailModal.tsx
import {
  X,
  User,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
} from "lucide-react";
import { SalaryDeduction } from "../../lib/api/salary-deduction.service";
import salaryDeductionService from "../../lib/api/salary-deduction.service";

interface DeductionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deduction: SalaryDeduction | null;
  loading?: boolean;
}

const DeductionDetailModal = ({
  isOpen,
  onClose,
  deduction,
  loading = false,
}: DeductionDetailModalProps) => {
  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Memuat detail...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!deduction) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Data tidak ditemukan</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Detail Potongan Gaji
            </h2>
            <p className="text-sm text-gray-500">
              {salaryDeductionService.getPeriodDisplay(
                deduction.period_year,
                deduction.period_month,
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">ID Potongan</p>
              <p className="text-lg font-semibold">#{deduction.id}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${salaryDeductionService.getStatusBadgeColor(
                deduction.status,
              )}`}
            >
              {salaryDeductionService.getStatusDisplayName(deduction.status)}
            </span>
          </div>

          {/* Member Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-700">Anggota</p>
            </div>
            <p className="font-medium">{deduction.user?.full_name || "-"}</p>
            <p className="text-sm text-gray-600">
              {deduction.user?.employee_id || "-"}
            </p>
          </div>

          {/* Salary Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              Rincian Gaji
            </h3>

            {/* Gross Salary */}
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="font-medium text-gray-900">Gaji Kotor</span>
              <span className="font-bold text-blue-600">
                {salaryDeductionService.formatCurrency(deduction.gross_salary)}
              </span>
            </div>

            {/* Deductions */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Potongan:</p>

              <div className="flex justify-between items-center pl-4">
                <span className="text-gray-600">Simpanan</span>
                <span className="font-medium text-gray-900">
                  {salaryDeductionService.formatCurrency(
                    deduction.savings_deduction,
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center pl-4">
                <span className="text-gray-600">Pinjaman</span>
                <span className="font-medium text-gray-900">
                  {salaryDeductionService.formatCurrency(
                    deduction.loan_deductions,
                  )}
                </span>
              </div>

              {deduction.other_deductions > 0 && (
                <div className="flex justify-between items-center pl-4">
                  <span className="text-gray-600">Lain-lain</span>
                  <span className="font-medium text-gray-900">
                    {salaryDeductionService.formatCurrency(
                      deduction.other_deductions,
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pl-4 pt-2 border-t">
                <span className="font-medium text-gray-900">
                  Total Potongan
                </span>
                <span className="font-bold text-red-600">
                  {salaryDeductionService.formatCurrency(
                    deduction.total_deductions,
                  )}
                </span>
              </div>
            </div>

            {/* Net Salary */}
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <span className="font-bold text-gray-900">Gaji Bersih</span>
              <span className="font-bold text-xl text-green-600">
                {salaryDeductionService.formatCurrency(deduction.net_salary)}
              </span>
            </div>
          </div>

          {/* Loan Details */}
          {deduction.deduction_details &&
            deduction.deduction_details.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 border-b pb-2">
                  Detail Potongan Pinjaman ({deduction.deduction_details.length}
                  )
                </h3>
                <div className="space-y-2">
                  {deduction.deduction_details.map((detail, index) => (
                    <div
                      key={detail.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          Pinjaman #{detail.loan?.loan_number || detail.loan_id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Cicilan ke-{detail.installment_number}
                        </p>
                      </div>
                      <span className="font-medium text-gray-900">
                        {salaryDeductionService.formatCurrency(
                          detail.installment_amount,
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Notes */}
          {deduction.notes && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700">Catatan</p>
              </div>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {deduction.notes}
              </p>
            </div>
          )}

          {/* Processed Info */}
          {deduction.status === "processed" && deduction.processed_at && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-900">
                  Informasi Pemrosesan
                </p>
              </div>
              <p className="text-sm text-green-800">
                Diproses oleh: {deduction.processed_by?.full_name || "-"}
              </p>
              <p className="text-sm text-green-800">
                Tanggal:{" "}
                {salaryDeductionService.formatDate(deduction.processed_at)}
              </p>
            </div>
          )}

          {/* Created Info */}
          <div className="text-sm text-gray-500 border-t pt-4">
            <p>
              Dibuat pada:{" "}
              {salaryDeductionService.formatDate(deduction.created_at)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeductionDetailModal;
