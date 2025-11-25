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
import { PiggyBank, DollarSign, User, Loader2 } from "lucide-react";
import { Saving } from "@/lib/api/savings.service";

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (savings) {
      setFormData({ ...savings });
    }
  }, [savings]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Jumlah simpanan harus lebih dari 0";
    }

    if (!formData.savings_type && !formData.saving_type) {
      newErrors.savings_type = "Jenis simpanan harus dipilih";
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
      // ✅ Backend requires ALL fields for PUT /savings/{id}
      // Parse all numeric fields properly
      const parsedAmount =
        typeof formData.amount === "string"
          ? parseFloat(formData.amount)
          : formData.amount || savings.amount;

      const originalAmount =
        typeof savings.amount === "string"
          ? parseFloat(savings.amount)
          : savings.amount;

      const parsedInterestPercentage =
        typeof savings.interest_percentage === "string"
          ? parseFloat(savings.interest_percentage)
          : savings.interest_percentage;

      const parsedFinalAmount =
        typeof savings.final_amount === "string"
          ? parseFloat(savings.final_amount)
          : savings.final_amount;

      // Prepare the update payload with ALL required fields
      const updatedSavings: Saving = {
        ...savings,
        // Update only the fields that changed
        savings_type: (formData.savings_type ||
          formData.saving_type ||
          savings.savings_type ||
          savings.saving_type) as
          | "principal"
          | "mandatory"
          | "voluntary"
          | "holiday",
        amount: parsedAmount,
        description:
          formData.description !== undefined
            ? formData.description
            : savings.description,
        // Keep all required fields from original savings
        user_id: savings.user_id,
        cash_account_id: savings.cash_account_id,
        transaction_date: savings.transaction_date,
        status: savings.status,
        interest_percentage: parsedInterestPercentage,
        final_amount: parsedFinalAmount,
        notes: savings.notes,
        created_at: savings.created_at,
        updated_at: savings.updated_at,
        deleted_at: savings.deleted_at,
        id: savings.id,
      };

      console.log("📤 Sending updated savings:", updatedSavings);
      console.log("📤 Amount type:", typeof updatedSavings.amount);
      console.log("📤 Amount value:", updatedSavings.amount);

      await onSave(updatedSavings);
      onClose();
    } catch (error: any) {
      console.error("❌ Error updating savings:", error);

      // Show validation errors if any
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

  const getSavingTypeName = (type: string) => {
    switch (type) {
      case "principal":
        return "Simpanan Pokok";
      case "mandatory":
        return "Simpanan Wajib";
      case "voluntary":
        return "Simpanan Sukarela";
      case "holiday":
        return "Simpanan Hari Raya";
      default:
        return type;
    }
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

  const currentSavingType =
    formData.savings_type ||
    formData.saving_type ||
    savings.savings_type ||
    savings.saving_type;
  const currentAmount = formData.amount || savings.amount;
  const userName = savings.user?.full_name || savings.user_name || "-";
  const userCode = savings.user?.employee_id || savings.user_code || "-";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5" />
            <span>Edit Simpanan</span>
          </DialogTitle>
          <DialogDescription>
            Ubah informasi simpanan {userName}
          </DialogDescription>
        </DialogHeader>

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

            {/* Savings Type */}
            <div className="space-y-2">
              <Label htmlFor="savingsType">Jenis Simpanan *</Label>
              <Select
                value={currentSavingType}
                onValueChange={(value: any) =>
                  handleInputChange("savings_type", value)
                }
              >
                <SelectTrigger
                  className={errors.savings_type ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Pilih jenis simpanan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="principal">Simpanan Pokok</SelectItem>
                  <SelectItem value="mandatory">Simpanan Wajib</SelectItem>
                  <SelectItem value="voluntary">Simpanan Sukarela</SelectItem>
                  <SelectItem value="holiday">Simpanan Hari Raya</SelectItem>
                </SelectContent>
              </Select>
              {errors.savings_type && (
                <p className="text-sm text-red-600">{errors.savings_type}</p>
              )}
              {currentSavingType === "principal" && (
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
              <Label htmlFor="amount">Jumlah Simpanan *</Label>
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
          {currentAmount && parseFloat(currentAmount.toString()) > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                Ringkasan Perubahan
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-700">Jenis:</span>
                  <span className="font-medium">
                    {getSavingTypeName(currentSavingType || "")}
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
              disabled={isSubmitting}
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
