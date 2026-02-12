// components/modals/SavingsEditModal.tsx
// ✅ UPDATED VERSION: With Dynamic Saving Types from API
// ✅ BACKWARD COMPATIBLE: Works with both new and old formats

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
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Saving } from "@/lib/api/savings.service";
import savingsService, { SavingType } from "@/lib/api/savings.service";
import { toast } from "sonner";

interface SavingsEditModalProps {
  savings: Saving | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (savings: Saving) => void;
}

export function SavingsEditModal({
  savings,
  isOpen,
  onClose,
  onSave,
}: SavingsEditModalProps) {
  const [formData, setFormData] = useState<Partial<Saving>>({});
  const [savingTypes, setSavingTypes] = useState<SavingType[]>([]); // ✅ NEW
  const [loadingSavingTypes, setLoadingSavingTypes] = useState(false); // ✅ NEW
  const [useFallback, setUseFallback] = useState(false); // ✅ NEW
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Load saving types on mount
  useEffect(() => {
    if (isOpen) {
      loadSavingTypes();
    }
  }, [isOpen]);

  // ✅ Set form data when savings prop changes
  useEffect(() => {
    if (savings) {
      setFormData({ ...savings });
    }
  }, [savings]);

  /**
   * ✅ NEW: Load saving types from API
   */
  const loadSavingTypes = async () => {
    try {
      setLoadingSavingTypes(true);
      console.log("🔄 Loading saving types from API...");

      const response = await savingsService.getSavingTypes({ is_active: true });

      const typesData = response.data?.data || response.data || [];
      console.log(`✅ Loaded ${typesData.length} saving types`);

      setSavingTypes(typesData);
      setUseFallback(false);
    } catch (err: any) {
      console.error("❌ Error loading saving types:", err);
      console.warn("⚠️ Falling back to hardcoded saving types");
      setUseFallback(true);
    } finally {
      setLoadingSavingTypes(false);
    }
  };

  /**
   * ✅ FALLBACK: Hardcoded saving types
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

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Jumlah simpanan harus lebih dari 0";
    }

    // ✅ Validate saving type (either ID or enum)
    if (!useFallback) {
      if (!formData.saving_type_id) {
        newErrors.saving_type_id = "Jenis simpanan harus dipilih";
      }
    } else {
      if (!formData.savings_type) {
        newErrors.savings_type = "Jenis simpanan harus dipilih";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !savings) {
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Parse numeric fields
      const parsedAmount =
        typeof formData.amount === "string"
          ? parseFloat(formData.amount)
          : formData.amount || savings.amount;

      // ✅ Build update payload
      const updatedSavings: Saving = {
        ...savings,
        amount: parsedAmount,
        description:
          formData.description !== undefined
            ? formData.description
            : savings.description || savings.notes,
        // Keep required fields
        user_id: savings.user_id,
        cash_account_id: savings.cash_account_id,
        transaction_date: savings.transaction_date,
        status: savings.status,
        interest_percentage: savings.interest_percentage,
        final_amount: savings.final_amount,
        notes: savings.notes,
        created_at: savings.created_at,
        updated_at: savings.updated_at,
        deleted_at: savings.deleted_at,
        id: savings.id,
      };

      // ✅ Set saving type based on mode
      if (!useFallback) {
        // API mode: use saving_type_id
        updatedSavings.saving_type_id =
          formData.saving_type_id || savings.saving_type_id;
      } else {
        // Fallback mode: use savings_type enum
        updatedSavings.savings_type = (formData.savings_type ||
          savings.savings_type) as any;
      }

      console.log("📤 Sending updated savings:", updatedSavings);

      await onSave(updatedSavings);
      onClose();
    } catch (error: any) {
      console.error("❌ Error updating savings:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const formErrors: Record<string, string> = {};
        Object.keys(apiErrors).forEach((key) => {
          formErrors[key] = Array.isArray(apiErrors[key])
            ? apiErrors[key][0]
            : apiErrors[key];
        });
        setErrors(formErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Saving, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getSavingTypeName = (typeOrCode: string | number) => {
    // Try to find in API data first
    const apiType = savingTypes.find(
      (t) => t.id.toString() === typeOrCode.toString() || t.code === typeOrCode,
    );
    if (apiType) return apiType.name;

    // Fallback to hardcoded names
    const nameMap: Record<string, string> = {
      principal: "Simpanan Pokok",
      mandatory: "Simpanan Wajib",
      voluntary: "Simpanan Sukarela",
      holiday: "Simpanan Hari Raya",
    };
    return nameMap[typeOrCode.toString()] || typeOrCode.toString();
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  if (!savings) return null;

  // ✅ Get current values (from formData or savings)
  const currentAmount = formData.amount || savings.amount;
  const userName = savings.user?.full_name || savings.user_name || "-";
  const userCode = savings.user?.employee_id || savings.user_code || "-";

  // ✅ Get current saving type value
  let currentSavingTypeValue: string = "";
  if (!useFallback) {
    // API mode: use saving_type_id
    currentSavingTypeValue = (
      formData.saving_type_id ||
      savings.saving_type_id ||
      savings.saving_type?.id ||
      ""
    ).toString();
  } else {
    // Fallback mode: use savings_type enum
    currentSavingTypeValue =
      formData.savings_type ||
      savings.savings_type ||
      savings.saving_type?.code ||
      "";
  }

  // ✅ Get selected type for summary
  const selectedSavingType = !useFallback
    ? savingTypes.find((t) => t.id.toString() === currentSavingTypeValue)
    : fallbackSavingTypes.find((t) => t.id === currentSavingTypeValue);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5" />
            <span>Edit Simpanan</span>
          </DialogTitle>
          <DialogDescription>
            Ubah informasi simpanan {userName}
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Fallback Mode Alert */}
        {useFallback && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">
              Menggunakan daftar jenis simpanan default (mode kompatibilitas)
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member Info (Read Only) */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">
                Informasi Anggota
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kode Anggota</Label>
                <Input value={userCode} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Nama Anggota</Label>
                <Input value={userName} disabled className="bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Savings Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <PiggyBank className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">
                Detail Simpanan
              </h3>
            </div>

            {/* ✅ NEW: Dynamic Savings Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="savingsType">
                Jenis Simpanan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSavingTypeValue}
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
                    // ✅ API mode: Load from database
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
                    // ✅ Fallback mode: Use hardcoded enum
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
              {currentSavingTypeValue === "principal" && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>
                    Catatan: Setiap anggota hanya dapat memiliki 1 simpanan
                    pokok
                  </span>
                </p>
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
                  value={currentAmount?.toString() || ""}
                  onChange={(e) =>
                    handleInputChange("amount", parseFloat(e.target.value) || 0)
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
                value={formData.description?.toString() || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Keterangan tambahan"
                rows={3}
              />
            </div>
          </div>

          {/* Summary */}
          {currentAmount &&
            parseFloat(currentAmount.toString()) > 0 &&
            selectedSavingType && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  Ringkasan Perubahan
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Jenis:</span>
                    <span className="font-medium">
                      {selectedSavingType.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Jumlah:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(currentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Status:</span>
                    <span className="font-medium">
                      {savings.status === "approved"
                        ? "Disetujui"
                        : savings.status === "pending"
                          ? "Pending"
                          : "Ditolak"}
                    </span>
                  </div>
                </div>
              </div>
            )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loadingSavingTypes}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SavingsEditModal;
