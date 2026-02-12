// components/modals/BatchProcessModal.tsx
import { useState, useEffect } from "react";
import { X, Upload, Users, AlertCircle, Trash2, Plus } from "lucide-react";
import {
  BatchProcessData,
  BatchMemberData,
} from "../../lib/api/salary-deduction.service";

interface BatchProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BatchProcessData) => Promise<boolean>;
  loading?: boolean;
  members?: { id: number; full_name: string; employee_id: string }[];
}

const BatchProcessModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  members = [],
}: BatchProcessModalProps) => {
  const currentDate = new Date();
  const [period, setPeriod] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });
  const [batchMembers, setBatchMembers] = useState<BatchMemberData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      // Reset form
      setPeriod({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });
      setBatchMembers([]);
      setErrors({});
    }
  }, [isOpen]);

  const addMember = () => {
    setBatchMembers([
      ...batchMembers,
      {
        user_id: 0,
        gross_salary: 0,
        savings_deduction: 0,
        other_deductions: 0,
      },
    ]);
  };

  const removeMember = (index: number) => {
    setBatchMembers(batchMembers.filter((_, i) => i !== index));
  };

  const updateMember = (
    index: number,
    field: keyof BatchMemberData,
    value: number,
  ) => {
    const updated = [...batchMembers];
    updated[index] = { ...updated[index], [field]: value };
    setBatchMembers(updated);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (batchMembers.length === 0) {
      newErrors.members = "Minimal harus ada 1 anggota";
    }

    batchMembers.forEach((member, index) => {
      if (!member.user_id) {
        newErrors[`member_${index}_user`] = "Anggota harus dipilih";
      }
      if (!member.gross_salary || member.gross_salary <= 0) {
        newErrors[`member_${index}_salary`] = "Gaji kotor harus lebih dari 0";
      }
      if (member.savings_deduction < 0) {
        newErrors[`member_${index}_savings`] = "Tidak boleh negatif";
      }
      if (member.other_deductions < 0) {
        newErrors[`member_${index}_other`] = "Tidak boleh negatif";
      }
    });

    // Check duplicate user_id
    const userIds = batchMembers.map((m) => m.user_id).filter((id) => id > 0);
    const duplicates = userIds.filter(
      (id, index) => userIds.indexOf(id) !== index,
    );
    if (duplicates.length > 0) {
      newErrors.duplicates = "Ada anggota yang duplikat";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data: BatchProcessData = {
      period_month: period.month,
      period_year: period.year,
      members: batchMembers,
    };

    const success = await onSubmit(data);
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

  const getTotalSummary = () => {
    return batchMembers.reduce(
      (acc, member) => ({
        gross: acc.gross + member.gross_salary,
        savings: acc.savings + member.savings_deduction,
        other: acc.other + member.other_deductions,
        count: acc.count + 1,
      }),
      { gross: 0, savings: 0, other: 0, count: 0 },
    );
  };

  if (!isOpen) return null;

  const summary = getTotalSummary();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Proses Batch Potongan Gaji
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Proses potongan gaji untuk multiple anggota sekaligus
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
              <p className="font-medium mb-1">Cara Kerja Batch Process:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Sistem akan memproses semua anggota satu per satu</li>
                <li>
                  Potongan pinjaman dihitung otomatis untuk setiap anggota
                </li>
                <li>Jika ada yang gagal, tidak akan mempengaruhi yang lain</li>
                <li>Anda akan melihat summary sukses/gagal di akhir</li>
              </ul>
            </div>
          </div>

          {/* Period Selection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Periode</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulan <span className="text-red-500">*</span>
                </label>
                <select
                  value={period.month}
                  onChange={(e) =>
                    setPeriod({ ...period, month: Number(e.target.value) })
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun <span className="text-red-500">*</span>
                </label>
                <select
                  value={period.year}
                  onChange={(e) =>
                    setPeriod({ ...period, year: Number(e.target.value) })
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
              </div>
            </div>
          </div>

          {/* Members List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">
                Daftar Anggota ({batchMembers.length})
              </h3>
              <button
                type="button"
                onClick={addMember}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                <Plus className="w-4 h-4" />
                Tambah Anggota
              </button>
            </div>

            {errors.members && (
              <p className="text-sm text-red-500 mb-3">{errors.members}</p>
            )}

            {errors.duplicates && (
              <p className="text-sm text-red-500 mb-3">{errors.duplicates}</p>
            )}

            {batchMembers.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Belum ada anggota</p>
                <p className="text-sm text-gray-500">
                  Klik tombol "Tambah Anggota" untuk mulai
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {batchMembers.map((member, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        Anggota #{index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Member Selection */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Anggota <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={member.user_id}
                          onChange={(e) =>
                            updateMember(
                              index,
                              "user_id",
                              Number(e.target.value),
                            )
                          }
                          disabled={loading}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        >
                          <option value={0}>Pilih</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.full_name}
                            </option>
                          ))}
                        </select>
                        {errors[`member_${index}_user`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`member_${index}_user`]}
                          </p>
                        )}
                      </div>

                      {/* Gross Salary */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Gaji Kotor <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={member.gross_salary || ""}
                          onChange={(e) =>
                            updateMember(
                              index,
                              "gross_salary",
                              Number(e.target.value),
                            )
                          }
                          disabled={loading}
                          placeholder="0"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        {errors[`member_${index}_salary`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`member_${index}_salary`]}
                          </p>
                        )}
                      </div>

                      {/* Savings Deduction */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Pot. Simpanan
                        </label>
                        <input
                          type="number"
                          value={member.savings_deduction || ""}
                          onChange={(e) =>
                            updateMember(
                              index,
                              "savings_deduction",
                              Number(e.target.value),
                            )
                          }
                          disabled={loading}
                          placeholder="0"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        {errors[`member_${index}_savings`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`member_${index}_savings`]}
                          </p>
                        )}
                      </div>

                      {/* Other Deductions */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Pot. Lain
                        </label>
                        <input
                          type="number"
                          value={member.other_deductions || ""}
                          onChange={(e) =>
                            updateMember(
                              index,
                              "other_deductions",
                              Number(e.target.value),
                            )
                          }
                          disabled={loading}
                          placeholder="0"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        {errors[`member_${index}_other`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`member_${index}_other`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {batchMembers.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-3">
                Total Summary:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-green-700">Jumlah Anggota</p>
                  <p className="text-lg font-bold text-green-900">
                    {summary.count}
                  </p>
                </div>
                <div>
                  <p className="text-green-700">Total Gaji Kotor</p>
                  <p className="text-lg font-bold text-green-900">
                    Rp {summary.gross.toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-green-700">Total Pot. Simpanan</p>
                  <p className="text-lg font-bold text-green-900">
                    Rp {summary.savings.toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-green-700">Total Pot. Lain</p>
                  <p className="text-lg font-bold text-green-900">
                    Rp {summary.other.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-3">
                * Potongan pinjaman akan dihitung otomatis oleh sistem
              </p>
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
              disabled={loading || batchMembers.length === 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Memproses..."
                : `Proses ${batchMembers.length} Anggota`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchProcessModal;
