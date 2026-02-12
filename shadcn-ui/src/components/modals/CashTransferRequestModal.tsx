// components/modals/CashTransferRequestModal.tsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CreateCashTransferData } from "../../lib/api/cash-transfer.service";

interface CashTransferRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCashTransferData) => Promise<boolean>;
  loading?: boolean;
}

const CashTransferRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: CashTransferRequestModalProps) => {
  const [formData, setFormData] = useState<CreateCashTransferData>({
    from_cash_account_id: 0,
    to_cash_account_id: 0,
    amount: 0,
    transfer_date: new Date().toISOString().split("T")[0],
    purpose: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      // Reset form saat modal ditutup
      setFormData({
        from_cash_account_id: 0,
        to_cash_account_id: 0,
        amount: 0,
        transfer_date: new Date().toISOString().split("T")[0],
        purpose: "",
        notes: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const kasOptions = [
    { id: 1, name: "Kas 1 - Besar Operasional & Pembiayaan Umum" },
    { id: 2, name: "Kas 2 - Pembiayaan Barang & Logistik" },
    { id: 3, name: "Kas 3 - Sebrakan (Tanpa Bunga)" },
    { id: 4, name: "Kas 4 - Kantin" },
    { id: 5, name: "Kas 5 - Bank" },
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.from_cash_account_id) {
      newErrors.from_cash_account_id = "Kas sumber harus dipilih";
    }
    if (!formData.to_cash_account_id) {
      newErrors.to_cash_account_id = "Kas tujuan harus dipilih";
    }
    if (formData.from_cash_account_id === formData.to_cash_account_id) {
      newErrors.to_cash_account_id =
        "Kas tujuan harus berbeda dengan kas sumber";
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Nominal harus lebih dari 0";
    }
    if (!formData.transfer_date) {
      newErrors.transfer_date = "Tanggal transfer harus diisi";
    }
    if (!formData.purpose || formData.purpose.trim() === "") {
      newErrors.purpose = "Tujuan transfer harus diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Buat Transfer Kas
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Kas Sumber */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dari Kas <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.from_cash_account_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  from_cash_account_id: Number(e.target.value),
                })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">-- Pilih Kas Sumber --</option>
              {kasOptions.map((kas) => (
                <option key={kas.id} value={kas.id}>
                  {kas.name}
                </option>
              ))}
            </select>
            {errors.from_cash_account_id && (
              <p className="text-sm text-red-500 mt-1">
                {errors.from_cash_account_id}
              </p>
            )}
          </div>

          {/* Kas Tujuan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ke Kas <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.to_cash_account_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  to_cash_account_id: Number(e.target.value),
                })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">-- Pilih Kas Tujuan --</option>
              {kasOptions
                .filter((kas) => kas.id !== formData.from_cash_account_id)
                .map((kas) => (
                  <option key={kas.id} value={kas.id}>
                    {kas.name}
                  </option>
                ))}
            </select>
            {errors.to_cash_account_id && (
              <p className="text-sm text-red-500 mt-1">
                {errors.to_cash_account_id}
              </p>
            )}
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nominal <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData({ ...formData, amount: Number(e.target.value) })
              }
              disabled={loading}
              placeholder="Masukkan nominal transfer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Tanggal Transfer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Transfer <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.transfer_date}
              onChange={(e) =>
                setFormData({ ...formData, transfer_date: e.target.value })
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            {errors.transfer_date && (
              <p className="text-sm text-red-500 mt-1">
                {errors.transfer_date}
              </p>
            )}
          </div>

          {/* Tujuan Transfer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tujuan Transfer <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) =>
                setFormData({ ...formData, purpose: e.target.value })
              }
              disabled={loading}
              rows={3}
              placeholder="Masukkan tujuan transfer (contoh: Transfer untuk operasional cabang)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
            />
            {errors.purpose && (
              <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>
            )}
          </div>

          {/* Catatan (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan <span className="text-gray-400 text-xs">(Opsional)</span>
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={loading}
              rows={2}
              placeholder="Catatan tambahan (opsional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Buat Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashTransferRequestModal;
