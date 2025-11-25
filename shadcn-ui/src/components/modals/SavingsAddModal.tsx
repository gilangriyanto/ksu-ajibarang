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
import { PiggyBank, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api/api-client";
import savingsService from "@/lib/api/savings.service";

interface Member {
  id: number;
  full_name: string;
  employee_id: string;
  email: string;
}

interface NewSavings {
  user_id: number;
  savings_type: string;
  cash_account_id: number;
  transaction_date: string;
  amount: number;
  description?: string;
}

interface SavingsAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // ✅ Changed from onAdd
}

export function SavingsAddModal({
  isOpen,
  onClose,
  onSuccess,
}: SavingsAddModalProps) {
  const [formData, setFormData] = useState<NewSavings>({
    user_id: 0,
    savings_type: "mandatory",
    cash_account_id: 1,
    transaction_date: new Date().toISOString().split("T")[0],
    amount: 0,
    description: "",
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load members on mount
  useEffect(() => {
    if (isOpen) {
      loadMembers();
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_id || formData.user_id === 0) {
      newErrors.user_id = "Anggota harus dipilih";
    }

    if (!formData.savings_type) {
      newErrors.savings_type = "Jenis simpanan harus dipilih";
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
      // ✅ Prepare payload with all required fields
      const payload = {
        user_id: formData.user_id,
        savings_type: formData.savings_type,
        cash_account_id: formData.cash_account_id,
        transaction_date: formData.transaction_date,
        amount: formData.amount,
        description: formData.description || "",
      };

      console.log("📤 Sending data to API:", payload);

      // ✅ Direct API call from modal
      await savingsService.create(payload);

      console.log("✅ Savings created successfully");

      toast.success("Simpanan berhasil ditambahkan");

      // ✅ Call onSuccess to refresh parent data
      onSuccess();

      // Close and reset
      handleClose();
    } catch (error: any) {
      console.error("❌ Error adding savings:", error);
      console.error("❌ Error response:", error.response?.data);

      // Handle validation errors from API
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        console.error("❌ Validation errors:", apiErrors);

        // Convert array errors to string for display
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
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
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
      savings_type: "mandatory",
      cash_account_id: 1,
      transaction_date: new Date().toISOString().split("T")[0],
      amount: 0,
      description: "",
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const selectedMember = members.find((m) => m.id === formData.user_id);

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

          {/* Savings Type */}
          <div className="space-y-2">
            <Label htmlFor="savingsType">
              Jenis Simpanan <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.savings_type}
              onValueChange={(value) =>
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
          {formData.amount > 0 && selectedMember && (
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
                  <span className="font-medium">
                    {getSavingTypeName(formData.savings_type)}
                  </span>
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
                      }
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
              disabled={isSubmitting || loadingMembers}
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
