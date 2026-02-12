// components/modals/SavingsAddModal.tsx
// ✅ UPDATED VERSION: With Dynamic Saving Types from API
// ✅ BACKWARD COMPATIBLE: Still works with old savings_type enum if API fails

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PiggyBank,
  DollarSign,
  Loader2,
  Info,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api/api-client";
import savingsService, { SavingType } from "@/lib/api/savings.service";

interface Member {
  id: number;
  full_name: string;
  employee_id: string;
  email: string;
}

interface NewSavings {
  user_id: number;
  cash_account_id: number;
  transaction_date: string;
  amount: number;
  description?: string;

  // ✅ NEW: Use saving_type_id (prefer this)
  saving_type_id?: number;

  // ✅ OLD: Fallback to savings_type if API fails
  savings_type?: string;
}

interface SavingsAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SavingsAddModal({
  isOpen,
  onClose,
  onSuccess,
}: SavingsAddModalProps) {
  const [formData, setFormData] = useState<NewSavings>({
    user_id: 0,
    cash_account_id: 1,
    transaction_date: new Date().toISOString().split("T")[0],
    amount: 0,
    description: "",
    saving_type_id: undefined,
    savings_type: undefined,
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [savingTypes, setSavingTypes] = useState<SavingType[]>([]); // ✅ NEW
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingSavingTypes, setLoadingSavingTypes] = useState(false); // ✅ NEW
  const [useFallback, setUseFallback] = useState(false); // ✅ NEW: Flag for fallback mode
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Load members and saving types on mount
  useEffect(() => {
    if (isOpen) {
      loadMembers();
      loadSavingTypes(); // ✅ NEW
    }
  }, [isOpen]);

  const loadMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await apiClient.get("/members", {
        params: { status: "active" },
      });
      console.log("📋 Members loaded:", response.data.data?.length || 0);
      setMembers(response.data.data || []);
    } catch (err: any) {
      console.error("❌ Error loading members:", err);
      toast.error("Gagal memuat data anggota");
    } finally {
      setLoadingMembers(false);
    }
  };

  /**
   * ✅ NEW: Load saving types from API
   */
  const loadSavingTypes = async () => {
    try {
      setLoadingSavingTypes(true);
      console.log("🔄 Loading saving types from API...");

      const response = await savingsService.getSavingTypes({ is_active: true });

      const typesData = response.data?.data || response.data || [];
      console.log(`✅ Loaded ${typesData.length} saving types:`, typesData);

      setSavingTypes(typesData);
      setUseFallback(false); // Success, use API data
    } catch (err: any) {
      console.error("❌ Error loading saving types:", err);
      console.warn("⚠️ Falling back to hardcoded saving types");

      // ✅ FALLBACK: Use hardcoded enum if API fails
      setUseFallback(true);
      toast.warning("Menggunakan daftar jenis simpanan default");
    } finally {
      setLoadingSavingTypes(false);
    }
  };

  /**
   * ✅ FALLBACK: Hardcoded saving types (for old system compatibility)
   */
  const fallbackSavingTypes = [
    {
      id: "principal",
      name: "Simpanan Pokok",
      code: "principal",
      description: "Setoran awal keanggotaan",
    },
    {
      id: "mandatory",
      name: "Simpanan Wajib",
      code: "mandatory",
      description: "Setoran bulanan wajib",
    },
    {
      id: "voluntary",
      name: "Simpanan Sukarela",
      code: "voluntary",
      description: "Setoran sukarela kapan saja",
    },
    {
      id: "holiday",
      name: "Simpanan Hari Raya",
      code: "holiday",
      description: "Setoran untuk hari raya",
    },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_id || formData.user_id === 0) {
      newErrors.user_id = "Anggota harus dipilih";
    }

    // ✅ NEW: Validate saving_type_id OR savings_type
    if (!useFallback) {
      // Using API: validate saving_type_id
      if (!formData.saving_type_id) {
        newErrors.saving_type_id = "Jenis simpanan harus dipilih";
      }
    } else {
      // Using fallback: validate savings_type
      if (!formData.savings_type) {
        newErrors.savings_type = "Jenis simpanan harus dipilih";
      }
    }

    if (!formData.cash_account_id) {
      newErrors.cash_account_id = "Kas harus dipilih";
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = "Tanggal transaksi harus diisi";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Jumlah simpanan harus lebih dari 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Periksa kembali form Anda");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Build payload based on mode (API or fallback)
      const payload: any = {
        user_id: formData.user_id,
        cash_account_id: formData.cash_account_id,
        transaction_date: formData.transaction_date,
        amount: formData.amount,
        description: formData.description || "",
      };

      if (!useFallback) {
        // ✅ NEW: Using API - send saving_type_id
        payload.saving_type_id = formData.saving_type_id;
        console.log("📤 Sending data with saving_type_id:", payload);
      } else {
        // ✅ OLD: Using fallback - send savings_type
        payload.savings_type = formData.savings_type;
        console.log("📤 Sending data with savings_type (fallback):", payload);
      }

      await savingsService.create(payload);

      console.log("✅ Savings created successfully");
      toast.success("Simpanan berhasil ditambahkan");

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("❌ Error adding savings:", error);
      console.error("❌ Error response:", error.response?.data);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const formErrors: Record<string, string> = {};
        Object.keys(apiErrors).forEach((key) => {
          formErrors[key] = Array.isArray(apiErrors[key])
            ? apiErrors[key][0]
            : apiErrors[key];
        });
        setErrors(formErrors);
        toast.error("Validasi gagal. Periksa kembali form Anda");
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Gagal menambahkan simpanan";
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof NewSavings,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getSavingTypeName = (typeOrCode: string) => {
    // Try to find in API data first
    const apiType = savingTypes.find(
      (t) => t.id.toString() === typeOrCode || t.code === typeOrCode,
    );
    if (apiType) return apiType.name;

    // Fallback to hardcoded names
    const nameMap: Record<string, string> = {
      principal: "Simpanan Pokok",
      mandatory: "Simpanan Wajib",
      voluntary: "Simpanan Sukarela",
      holiday: "Simpanan Hari Raya",
    };
    return nameMap[typeOrCode] || typeOrCode;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleClose = () => {
    setFormData({
      user_id: 0,
      cash_account_id: 1,
      transaction_date: new Date().toISOString().split("T")[0],
      amount: 0,
      description: "",
      saving_type_id: undefined,
      savings_type: undefined,
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const selectedMember = members.find((m) => m.id === formData.user_id);

  // ✅ Get selected saving type (from API or fallback)
  const selectedSavingType = !useFallback
    ? savingTypes.find((t) => t.id === formData.saving_type_id)
    : fallbackSavingTypes.find((t) => t.id === formData.savings_type);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5" />
            <span>Tambah Simpanan</span>
          </DialogTitle>
          <DialogDescription>
            Tambahkan simpanan baru untuk anggota
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Info Alert: Show which mode we're using */}
        {useFallback && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">
              Menggunakan daftar jenis simpanan default (mode kompatibilitas)
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member Selection */}
          <div className="space-y-2">
            <Label htmlFor="member">
              Pilih Anggota <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.user_id > 0 ? formData.user_id.toString() : ""}
              onValueChange={(value) =>
                handleInputChange("user_id", parseInt(value))
              }
              disabled={loadingMembers}
            >
              <SelectTrigger className={errors.user_id ? "border-red-500" : ""}>
                <SelectValue
                  placeholder={loadingMembers ? "Memuat..." : "Pilih anggota"}
                />
              </SelectTrigger>
              <SelectContent>
                {members.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">
                    Tidak ada anggota aktif
                  </div>
                ) : (
                  members.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.employee_id} - {member.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.user_id && (
              <p className="text-sm text-red-600">{errors.user_id}</p>
            )}
          </div>

          {/* ✅ NEW: Dynamic Savings Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="savingsType">
              Jenis Simpanan <span className="text-red-500">*</span>
            </Label>
            <Select
              value={
                !useFallback
                  ? formData.saving_type_id?.toString() || ""
                  : formData.savings_type || ""
              }
              onValueChange={(value) => {
                if (!useFallback) {
                  // API mode: set saving_type_id
                  handleInputChange("saving_type_id", parseInt(value));
                } else {
                  // Fallback mode: set savings_type
                  handleInputChange("savings_type", value);
                }
              }}
              disabled={loadingSavingTypes}
            >
              <SelectTrigger
                className={
                  errors.saving_type_id || errors.savings_type
                    ? "border-red-500"
                    : ""
                }
              >
                <SelectValue
                  placeholder={
                    loadingSavingTypes
                      ? "Memuat jenis simpanan..."
                      : "Pilih jenis simpanan"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!useFallback ? (
                  // ✅ NEW: Load from API
                  savingTypes.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      Tidak ada jenis simpanan tersedia
                    </div>
                  ) : (
                    savingTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{type.name}</span>
                          {type.description && (
                            <span className="text-xs text-gray-500">
                              {type.description}
                            </span>
                          )}
                          {type.is_mandatory && (
                            <span className="text-xs text-orange-600">
                              Wajib
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )
                ) : (
                  // ✅ OLD: Fallback to hardcoded enum
                  fallbackSavingTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.name}</span>
                        {type.description && (
                          <span className="text-xs text-gray-500">
                            {type.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {(errors.saving_type_id || errors.savings_type) && (
              <p className="text-sm text-red-600">
                {errors.saving_type_id || errors.savings_type}
              </p>
            )}
          </div>

          {/* Cash Account */}
          <div className="space-y-2">
            <Label htmlFor="cashAccount">
              Kas <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.cash_account_id.toString()}
              onValueChange={(value) =>
                handleInputChange("cash_account_id", parseInt(value))
              }
            >
              <SelectTrigger
                className={errors.cash_account_id ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Pilih kas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Kas 1 - Kas Utama</SelectItem>
                <SelectItem value="2">Kas 2 - Kas Barang</SelectItem>
                <SelectItem value="3">Kas 3 - Kas Khusus</SelectItem>
                <SelectItem value="4">Kas 4 - Kas Kantin</SelectItem>
              </SelectContent>
            </Select>
            {errors.cash_account_id && (
              <p className="text-sm text-red-600">{errors.cash_account_id}</p>
            )}
          </div>

          {/* Transaction Date */}
          <div className="space-y-2">
            <Label htmlFor="transactionDate">
              Tanggal Transaksi <span className="text-red-500">*</span>
            </Label>
            <Input
              id="transactionDate"
              type="date"
              value={formData.transaction_date}
              onChange={(e) =>
                handleInputChange("transaction_date", e.target.value)
              }
              max={new Date().toISOString().split("T")[0]}
              className={errors.transaction_date ? "border-red-500" : ""}
            />
            {errors.transaction_date && (
              <p className="text-sm text-red-600">{errors.transaction_date}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Jumlah Simpanan <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  handleInputChange("amount", parseInt(e.target.value) || 0)
                }
                placeholder="0"
                className={`pl-10 ${errors.amount ? "border-red-500" : ""}`}
                min="0"
                step="1000"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Keterangan</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Keterangan tambahan (opsional)"
              rows={3}
            />
          </div>

          {/* Summary */}
          {formData.amount > 0 && selectedMember && selectedSavingType && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                Ringkasan Simpanan
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-700">Anggota:</span>
                  <span className="font-medium">
                    {selectedMember.full_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Jenis:</span>
                  <span className="font-medium">{selectedSavingType.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Jumlah:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(formData.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Tanggal:</span>
                  <span className="font-medium">
                    {new Date(formData.transaction_date).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loadingMembers || loadingSavingTypes}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <PiggyBank className="h-4 w-4 mr-2" />
                  Tambah Simpanan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SavingsAddModal;
