// components/modals/SavingTypeEditModal.tsx
// 🔧 FIXED: Send ALL required fields on PUT update
// Backend validates all fields even on partial update

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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PiggyBank,
  Loader2,
  AlertCircle,
  Info,
  DollarSign,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import savingsService, { SavingType } from "@/lib/api/savings.service";

interface SavingTypeEditModalProps {
  savingType: SavingType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SavingTypeEditModal({
  savingType,
  isOpen,
  onClose,
  onSuccess,
}: SavingTypeEditModalProps) {
  const [formData, setFormData] = useState<Partial<SavingType>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (savingType) {
      setFormData({ ...savingType });
    }
  }, [savingType]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Nama harus diisi";
    } else if (formData.name.length > 100) {
      newErrors.name = "Nama maksimal 100 karakter";
    }

    if (formData.has_interest) {
      if (
        formData.default_interest_rate !== undefined &&
        (formData.default_interest_rate < 0 ||
          formData.default_interest_rate > 100)
      ) {
        newErrors.default_interest_rate = "Bunga harus antara 0-100%";
      }
    }

    if (
      formData.minimum_amount &&
      formData.maximum_amount &&
      formData.minimum_amount >= formData.maximum_amount
    ) {
      newErrors.maximum_amount =
        "Jumlah maksimum harus lebih besar dari minimum";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !savingType) {
      toast.error("Periksa kembali form Anda");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ FIXED: Always send ALL required fields
      // Backend validates all fields on PUT even for partial update
      const payload: any = {
        code: savingType.code,
        name: formData.name?.trim() || savingType.name,
        description:
          formData.description?.trim() || savingType.description || "",
        is_mandatory: formData.is_mandatory ?? savingType.is_mandatory ?? false,
        is_withdrawable:
          formData.is_withdrawable ?? savingType.is_withdrawable ?? false,
        has_interest: formData.has_interest ?? savingType.has_interest ?? false,
        default_interest_rate:
          (formData.has_interest ?? savingType.has_interest)
            ? (formData.default_interest_rate ??
              savingType.default_interest_rate ??
              0)
            : 0,
        minimum_amount:
          formData.minimum_amount ?? savingType.minimum_amount ?? 0,
        maximum_amount:
          formData.maximum_amount ?? savingType.maximum_amount ?? 0,
        is_active: formData.is_active ?? savingType.is_active ?? true,
        display_order: formData.display_order ?? savingType.display_order ?? 0,
      };

      console.log("📤 Updating saving type:", savingType.id, payload);

      await savingsService.updateSavingType(savingType.id, payload);

      console.log("✅ Saving type updated successfully");
      toast.success("Jenis simpanan berhasil diperbarui");

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("❌ Error updating saving type:", error);

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
        toast.error(error.message || "Gagal memperbarui jenis simpanan");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!savingType) return null;

  const isDefaultType = [
    "PRINCIPAL",
    "MANDATORY",
    "VOLUNTARY",
    "HOLIDAY",
  ].includes(savingType.code);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5" />
            <span>Edit Jenis Simpanan</span>
          </DialogTitle>
          <DialogDescription>
            Perbarui informasi {savingType.name}
          </DialogDescription>
        </DialogHeader>

        {isDefaultType && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              Ini adalah jenis simpanan default. Kode tidak dapat diubah.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Informasi Dasar
            </h3>

            <div className="space-y-2">
              <Label>Kode</Label>
              <Input value={savingType.code} disabled className="bg-gray-100" />
              <p className="text-xs text-gray-500">
                Kode tidak dapat diubah setelah dibuat
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Nama <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Contoh: Simpanan Pendidikan"
                className={errors.name ? "border-red-500" : ""}
                maxLength={100}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Deskripsi singkat tentang jenis simpanan ini"
                rows={3}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700">Pengaturan</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="is_mandatory" className="cursor-pointer">
                    Simpanan Wajib
                  </Label>
                  <p className="text-xs text-gray-500">
                    Wajib dimiliki anggota
                  </p>
                </div>
                <Switch
                  id="is_mandatory"
                  checked={formData.is_mandatory || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_mandatory", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="is_withdrawable" className="cursor-pointer">
                    Dapat Ditarik
                  </Label>
                  <p className="text-xs text-gray-500">Bisa menarik dana</p>
                </div>
                <Switch
                  id="is_withdrawable"
                  checked={formData.is_withdrawable || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_withdrawable", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="has_interest" className="cursor-pointer">
                    Dapat Bunga
                  </Label>
                  <p className="text-xs text-gray-500">Mendapat bunga</p>
                </div>
                <Switch
                  id="has_interest"
                  checked={formData.has_interest || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("has_interest", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Status Aktif
                  </Label>
                  <p className="text-xs text-gray-500">Dapat digunakan</p>
                </div>
                <Switch
                  id="is_active"
                  checked={
                    formData.is_active !== undefined ? formData.is_active : true
                  }
                  onCheckedChange={(checked) =>
                    handleInputChange("is_active", checked)
                  }
                />
              </div>
            </div>

            {formData.has_interest && (
              <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
                <Label htmlFor="interest_rate" className="flex items-center">
                  <Percent className="h-4 w-4 mr-2 text-blue-600" />
                  Bunga Default (% per tahun)
                </Label>
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.default_interest_rate || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "default_interest_rate",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="Contoh: 5.5"
                  className={
                    errors.default_interest_rate ? "border-red-500" : ""
                  }
                />
                {errors.default_interest_rate && (
                  <p className="text-sm text-red-600">
                    {errors.default_interest_rate}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Limits */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Batasan Jumlah (Opsional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_amount">Jumlah Minimum</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="min_amount"
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.minimum_amount || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "minimum_amount",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    placeholder="0"
                    className={`pl-10 ${errors.minimum_amount ? "border-red-500" : ""}`}
                  />
                </div>
                {formData.minimum_amount && formData.minimum_amount > 0 && (
                  <p className="text-xs text-gray-600">
                    {formatCurrency(formData.minimum_amount)}
                  </p>
                )}
                {errors.minimum_amount && (
                  <p className="text-sm text-red-600">
                    {errors.minimum_amount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_amount">Jumlah Maksimum</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="max_amount"
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.maximum_amount || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "maximum_amount",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
                {formData.maximum_amount && formData.maximum_amount > 0 && (
                  <p className="text-xs text-gray-600">
                    {formatCurrency(formData.maximum_amount)}
                  </p>
                )}
                {errors.maximum_amount && (
                  <p className="text-sm text-red-600">
                    {errors.maximum_amount}
                  </p>
                )}
              </div>
            </div>

            <Alert className="bg-gray-50 border-gray-200">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Kosongkan (0) untuk tidak membatasi jumlah setoran
              </AlertDescription>
            </Alert>
          </div>

          {/* Display Order */}
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="display_order">Urutan Tampilan</Label>
            <Input
              id="display_order"
              type="number"
              min="0"
              value={formData.display_order || ""}
              onChange={(e) =>
                handleInputChange(
                  "display_order",
                  parseInt(e.target.value) || 0,
                )
              }
              placeholder="0"
            />
            <p className="text-xs text-gray-500">
              Angka lebih kecil tampil lebih dulu (0 = otomatis)
            </p>
          </div>

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

export default SavingTypeEditModal;
