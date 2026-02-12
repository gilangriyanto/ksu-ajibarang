// components/modals/ProcessDeductionModal.tsx
import { useState, useEffect } from "react";
import { X, User, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { CreateSalaryDeductionData } from "../../lib/api/salary-deduction.service";

interface ProcessDeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSalaryDeductionData) => Promise<boolean>;
  loading?: boolean;
  members?: { id: number; full_name: string; employee_id: string }[];
}

const ProcessDeductionModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  members = [],
}: ProcessDeductionModalProps) => {
  const currentDate = new Date();
  const [formData, setFormData] = useState<CreateSalaryDeductionData>({
    user_id: 0,
    period_month: currentDate.getMonth() + 1,
    period_year: currentDate.getFullYear(),
    gross_salary: 0,
    savings_deduction: 0,
    other_deductions: 0,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      // Reset form saat modal ditutup
      setFormData({
        user_id: 0,
        period_month: currentDate.getMonth() + 1,
        period_year: currentDate.getFullYear(),
        gross_salary: 0,
        savings_deduction: 0,
        other_deductions: 0,
        notes: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_id) {
      newErrors.user_id = "Anggota harus dipilih";
    }
    if (
      !formData.period_month ||
      formData.period_month < 1 ||
      formData.period_month > 12
    ) {
      newErrors.period_month = "Bulan tidak valid";
    }
    if (!formData.period_year || formData.period_year < 2020) {
      newErrors.period_year = "Tahun tidak valid";
    }
    if (!formData.gross_salary || formData.gross_salary <= 0) {
      newErrors.gross_salary = "Gaji kotor harus lebih dari 0";
    }
    if (formData.savings_deduction < 0) {
      newErrors.savings_deduction = "Potongan simpanan tidak boleh negatif";
    }
    if (formData.other_deductions < 0) {
      newErrors.other_deductions = "Potongan lain tidak boleh negatif";
    }

    const totalDeductions =
      formData.savings_deduction + formData.other_deductions;
    if (totalDeductions > formData.gross_salary) {
      newErrors.total = "Total potongan tidak boleh melebihi gaji kotor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
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

  if (!isOpen) return null;

  const estimatedNet =
    formData.gross_salary -
    formData.savings_deduction -
    formData.other_deductions;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Proses Potongan Gaji
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Potongan pinjaman akan dihitung otomatis oleh sistem
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-500 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Informasi Penting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Sistem akan otomatis menghitung potongan pinjaman</li>
                <li>Cicilan pinjaman akan dibayar otomatis</li>
                <li>Saldo pinjaman akan diupdate</li>
              </ul>
            </div>
          </div>

          {/* Anggota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anggota <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={formData.user_id}
                onChange={(e) =>
                  setFormData({ ...formData, user_id: Number(e.target.value) })
                }
                disabled={loading}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value={0}>Pilih anggota</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name} - {member.employee_id}
                  </option>
                ))}
              </select>
            </div>
            {errors.user_id && (
              <p className="text-sm text-red-500 mt-1">{errors.user_id}</p>
            )}
          </div>

          {/* Periode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.period_month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    period_month: Number(e.target.value),
                  })
                }
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                {getMonthOptions().map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              {errors.period_month && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.period_month}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.period_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    period_year: Number(e.target.value),
                  })
                }
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                {getYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.period_year && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.period_year}
                </p>
              )}
            </div>
          </div>

          {/* Gaji Kotor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gaji Kotor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.gross_salary || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gross_salary: Number(e.target.value),
                  })
                }
                disabled={loading}
                placeholder="Masukkan gaji kotor"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            {errors.gross_salary && (
              <p className="text-sm text-red-500 mt-1">{errors.gross_salary}</p>
            )}
          </div>

          {/* Potongan Simpanan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potongan Simpanan <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.savings_deduction || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  savings_deduction: Number(e.target.value),
                })
              }
              disabled={loading}
              placeholder="Masukkan potongan simpanan"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            {errors.savings_deduction && (
              <p className="text-sm text-red-500 mt-1">
                {errors.savings_deduction}
              </p>
            )}
          </div>

          {/* Potongan Lain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potongan Lain-lain
            </label>
            <input
              type="number"
              value={formData.other_deductions || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  other_deductions: Number(e.target.value),
                })
              }
              disabled={loading}
              placeholder="Masukkan potongan lain-lain (opsional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            {errors.other_deductions && (
              <p className="text-sm text-red-500 mt-1">
                {errors.other_deductions}
              </p>
            )}
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={loading}
              rows={3}
              placeholder="Catatan tambahan (opsional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-gray-900 mb-3">
              Ringkasan (Estimasi):
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gaji Kotor:</span>
              <span className="font-medium">
                Rp {formData.gross_salary.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Potongan Simpanan:</span>
              <span className="font-medium">
                Rp {formData.savings_deduction.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Potongan Pinjaman:</span>
              <span className="font-medium text-blue-600">
                (Dihitung otomatis)
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Potongan Lain:</span>
              <span className="font-medium">
                Rp {formData.other_deductions.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">
                  Gaji Bersih (Min.):
                </span>
                <span className="font-bold text-green-600">
                  Rp {estimatedNet.toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                * Gaji bersih final akan dikurangi potongan pinjaman otomatis
              </p>
            </div>
          </div>

          {errors.total && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{errors.total}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Proses Potongan Gaji"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessDeductionModal;
