// components/modals/SavingTypeAddModal.tsx
// 🆕 NEW FEATURE: Create custom saving types (Admin only)

import React, { useState } from "react";
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
import { PiggyBank, Loader2, Info, DollarSign, Percent } from "lucide-react";
import { toast } from "sonner";
import savingsService from "@/lib/api/savings.service";

interface SavingTypeAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SavingTypeAddModal({
  isOpen,
  onClose,
  onSuccess,
}: SavingTypeAddModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    is_mandatory: false,
    is_withdrawable: true,
    has_interest: false,
    default_interest_rate: 0,
    minimum_amount: 0,
    maximum_amount: 0,
    is_active: true,
    display_order: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Code validation
    if (!formData.code.trim()) {
      newErrors.code = "Kode harus diisi";
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = "Kode hanya boleh huruf kapital, angka, dan underscore";
    } else if (formData.code.length > 50) {
      newErrors.code = "Kode maksimal 50 karakter";
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi";
    } else if (formData.name.length > 100) {
      newErrors.name = "Nama maksimal 100 karakter";
    }

    // Interest rate validation
    if (formData.has_interest) {
      if (formData.default_interest_rate <= 0) {
        newErrors.default_interest_rate =
          "Bunga harus lebih dari 0% jika aktif";
      } else if (formData.default_interest_rate > 100) {
        newErrors.default_interest_rate = "Bunga maksimal 100%";
      }
    }

    // Min/Max amount validation
    if (
      formData.minimum_amount > 0 &&
      formData.maximum_amount > 0 &&
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

    if (!validateForm()) {
      toast.error("Periksa kembali form Anda");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build payload
      const payload: any = {
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        is_mandatory: formData.is_mandatory,
        is_withdrawable: formData.is_withdrawable,
        has_interest: formData.has_interest,
        is_active: formData.is_active,
      };

      // Optional fields
      if (formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      if (formData.has_interest && formData.default_interest_rate > 0) {
        payload.default_interest_rate = formData.default_interest_rate;
      }

      if (formData.minimum_amount > 0) {
        payload.minimum_amount = formData.minimum_amount;
      }

      if (formData.maximum_amount > 0) {
        payload.maximum_amount = formData.maximum_amount;
      }

      if (formData.display_order > 0) {
        payload.display_order = formData.display_order;
      }

      console.log("📤 Creating saving type:", payload);

      await savingsService.createSavingType(payload);

      console.log("✅ Saving type created successfully");
      toast.success("Jenis simpanan berhasil dibuat");

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("❌ Error creating saving type:", error);

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
        toast.error(error.message || "Gagal membuat jenis simpanan");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      is_mandatory: false,
      is_withdrawable: true,
      has_interest: false,
      default_interest_rate: 0,
      minimum_amount: 0,
      maximum_amount: 0,
      is_active: true,
      display_order: 0,
    });
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5" />
            <span>Tambah Jenis Simpanan</span>
          </DialogTitle>
          <DialogDescription>
            Buat jenis simpanan baru untuk anggota koperasi
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Informasi Dasar
            </h3>

            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Kode <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  handleInputChange("code", e.target.value.toUpperCase())
                }
                placeholder="Contoh: PENDIDIKAN, UMROH"
                className={errors.code ? "border-red-500" : ""}
                maxLength={50}
              />
              <p className="text-xs text-gray-500">
                Huruf kapital, angka, dan underscore saja
              </p>
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Contoh: Simpanan Pendidikan"
                className={errors.name ? "border-red-500" : ""}
                maxLength={100}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
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
              {/* Is Mandatory */}
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
                  checked={formData.is_mandatory}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_mandatory", checked)
                  }
                />
              </div>

              {/* Is Withdrawable */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="is_withdrawable" className="cursor-pointer">
                    Dapat Ditarik
                  </Label>
                  <p className="text-xs text-gray-500">Bisa menarik dana</p>
                </div>
                <Switch
                  id="is_withdrawable"
                  checked={formData.is_withdrawable}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_withdrawable", checked)
                  }
                />
              </div>

              {/* Has Interest */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="has_interest" className="cursor-pointer">
                    Dapat Bunga
                  </Label>
                  <p className="text-xs text-gray-500">Mendapat bunga</p>
                </div>
                <Switch
                  id="has_interest"
                  checked={formData.has_interest}
                  onCheckedChange={(checked) =>
                    handleInputChange("has_interest", checked)
                  }
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Status Aktif
                  </Label>
                  <p className="text-xs text-gray-500">Dapat digunakan</p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_active", checked)
                  }
                />
              </div>
            </div>

            {/* Interest Rate - Conditional */}
            {formData.has_interest && (
              <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
                <Label htmlFor="interest_rate" className="flex items-center">
                  <Percent className="h-4 w-4 mr-2 text-blue-600" />
                  Bunga Default (% per tahun)
                  <span className="text-red-500 ml-1">*</span>
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
                <p className="text-xs text-blue-700">
                  💡 Bunga ini akan digunakan saat membuat simpanan baru
                </p>
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
              {/* Minimum Amount */}
              <div className="space-y-2">
                <Label htmlFor="minimum_amount">Jumlah Minimum</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="minimum_amount"
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
                {formData.minimum_amount > 0 && (
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

              {/* Maximum Amount */}
              <div className="space-y-2">
                <Label htmlFor="maximum_amount">Jumlah Maksimum</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="maximum_amount"
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
                    className={`pl-10 ${errors.maximum_amount ? "border-red-500" : ""}`}
                  />
                </div>
                {formData.maximum_amount > 0 && (
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

          {/* Summary */}
          {formData.name && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-700">Kode:</span>
                  <span className="font-medium">{formData.code || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Nama:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Wajib:</span>
                  <span
                    className={`font-medium ${formData.is_mandatory ? "text-red-600" : "text-gray-600"}`}
                  >
                    {formData.is_mandatory ? "Ya" : "Tidak"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Dapat Ditarik:</span>
                  <span
                    className={`font-medium ${formData.is_withdrawable ? "text-green-600" : "text-orange-600"}`}
                  >
                    {formData.is_withdrawable ? "Ya" : "Tidak"}
                  </span>
                </div>
                {formData.has_interest && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Bunga:</span>
                    <span className="font-medium text-green-600">
                      {formData.default_interest_rate}% per tahun
                    </span>
                  </div>
                )}
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
              disabled={isSubmitting}
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
                  Buat Jenis Simpanan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SavingTypeAddModal;
