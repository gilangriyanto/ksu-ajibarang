// components/modals/ResignationRequestModal.tsx
// 🔧 UPDATED: Sesuai Postman Collection Member Resignation (UPDATED)
// ✅ Member submit TANPA user_id (otomatis dari JWT)
// ✅ resignation_date OPSIONAL (default = hari ini)
// ✅ Max H+90 hari ke depan
// ✅ Reason minimal 10 karakter

import { useState, useEffect } from "react";
import { X, AlertTriangle, Calendar, FileText, Info } from "lucide-react";
import resignationService from "@/lib/api/resignation.service";
import { toast } from "sonner";

interface ResignationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ResignationRequestModal = ({
  isOpen,
  onClose,
  onSuccess,
}: ResignationRequestModalProps) => {
  const today = resignationService.getTodayDate();
  const maxDate = resignationService.getMaxResignationDate();

  const [resignationDate, setResignationDate] = useState(today);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form saat modal dibuka
      setResignationDate(today);
      setReason("");
      setErrors({});
    }
  }, [isOpen, today]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate reason - minimal 10 karakter
    if (!reason || reason.trim().length < 10) {
      newErrors.reason = "Alasan pengunduran diri minimal 10 karakter";
    }

    // Validate date jika diisi
    if (resignationDate) {
      const selectedDate = new Date(resignationDate + "T00:00:00");
      const todayDate = new Date(today + "T00:00:00");
      const maxDateObj = new Date(maxDate + "T00:00:00");

      if (selectedDate < todayDate) {
        newErrors.resignation_date = "Tanggal tidak boleh di masa lalu";
      }

      if (selectedDate > maxDateObj) {
        newErrors.resignation_date =
          "Tanggal maksimal 90 hari ke depan dari hari ini";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // ✅ UPDATED: Member submit tanpa user_id
      // Hanya kirim reason + optional resignation_date
      await resignationService.memberSubmitResignation(
        reason.trim(),
        resignationDate !== today ? resignationDate : undefined, // Jika hari ini, tidak perlu kirim (backend default)
      );

      toast.success("Pengajuan pengunduran diri berhasil dikirim");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error submitting resignation:", error);
      toast.error(error.message || "Gagal mengajukan pengunduran diri");
    } finally {
      setLoading(false);
    }
  };

  // Hitung selisih hari
  const getDaysDifference = (): number => {
    if (!resignationDate) return 0;
    const selected = new Date(resignationDate + "T00:00:00");
    const todayObj = new Date(today + "T00:00:00");
    return Math.round(
      (selected.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const daysDiff = getDaysDifference();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pengajuan Pengunduran Diri
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Isi form untuk mengajukan pengunduran diri dari koperasi
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
          {/* Warning Alert */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Perhatian Penting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Proses pengunduran diri tidak dapat dibatalkan setelah
                  disetujui
                </li>
                <li>Semua simpanan akan dikembalikan sesuai ketentuan</li>
                <li>Pinjaman aktif harus dilunasi terlebih dahulu</li>
                <li>Status keanggotaan akan berubah menjadi non-aktif</li>
              </ul>
            </div>
          </div>

          {/* Reason - PRIMARY FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alasan Pengunduran Diri <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errors.reason) {
                    setErrors((prev) => ({ ...prev, reason: "" }));
                  }
                }}
                disabled={loading}
                rows={4}
                placeholder="Jelaskan alasan pengunduran diri Anda (minimal 10 karakter)..."
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none ${
                  errors.reason ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.reason && (
              <p className="text-sm text-red-500 mt-1">{errors.reason}</p>
            )}
            <p
              className={`text-xs mt-1 ${
                reason.trim().length >= 10 ? "text-green-600" : "text-gray-500"
              }`}
            >
              {reason.trim().length}/10 karakter (minimal 10)
            </p>
          </div>

          {/* Resignation Date - OPSIONAL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Pengunduran Diri{" "}
              <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={resignationDate}
                onChange={(e) => {
                  setResignationDate(e.target.value);
                  if (errors.resignation_date) {
                    setErrors((prev) => ({ ...prev, resignation_date: "" }));
                  }
                }}
                disabled={loading}
                min={today}
                max={maxDate}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                  errors.resignation_date ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.resignation_date && (
              <p className="text-sm text-red-500 mt-1">
                {errors.resignation_date}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Kosongkan untuk resign hari ini. Maksimal 90 hari ke depan.
            </p>
          </div>

          {/* Display Selected Date Info */}
          {resignationDate && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Tanggal yang dipilih:
              </p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(resignationDate + "T00:00:00").toLocaleDateString(
                  "id-ID",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </p>
              {daysDiff === 0 ? (
                <p className="text-sm text-blue-600 mt-2 font-medium">
                  ✓ Resign hari ini — Proses akan segera dimulai
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-2">
                  H+{daysDiff} dari hari ini — Proses akan dimulai pada tanggal
                  tersebut
                </p>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Informasi:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Pengajuan akan direview oleh admin/manager</li>
                <li>Anda akan mendapat notifikasi setelah diproses</li>
                <li>Hanya boleh memiliki 1 pengajuan aktif</li>
              </ul>
            </div>
          </div>

          {/* Confirmation Checklist */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="font-medium text-yellow-900 mb-3">
              Dengan mengajukan pengunduran diri, saya memahami bahwa:
            </p>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>Semua pinjaman aktif harus dilunasi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>Simpanan akan dikembalikan sesuai ketentuan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>Status keanggotaan akan berubah menjadi non-aktif</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>Proses ini tidak dapat dibatalkan setelah disetujui</span>
              </li>
            </ul>
          </div>

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
              disabled={loading || reason.trim().length < 10}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Ajukan Pengunduran Diri"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResignationRequestModal;
