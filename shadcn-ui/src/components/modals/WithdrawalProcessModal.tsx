// components/modals/WithdrawalProcessModal.tsx
// 💰 Process Withdrawal - Dynamic form based on payment method
// ✅ FINAL FIX: Hooks called before null check

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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  DollarSign,
  Banknote,
  CreditCard,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import withdrawalService, {
  CreateWithdrawalData,
} from "@/lib/api/withdrawal.service";

interface Resignation {
  id: number;
  user?: {
    full_name: string;
    employee_id: string;
  };
  return_amount?: number;
  total_savings?: number;
  total_loans?: number;
}

interface WithdrawalProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resignation: Resignation | null;
  cashAccounts: Array<{ id: number; name: string; account_number: string }>;
}

export function WithdrawalProcessModal({
  isOpen,
  onClose,
  onSuccess,
  resignation,
  cashAccounts,
}: WithdrawalProcessModalProps) {
  // ✅ HOOKS MUST BE CALLED FIRST (before any conditional returns)
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "transfer" | "check"
  >("cash");
  const [formData, setFormData] = useState<any>({
    cash_account_id: "",
    notes: "",
    // Transfer fields
    bank_name: "",
    account_number: "",
    account_holder_name: "",
    transfer_reference: "",
    // Check fields
    check_number: "",
    check_date: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && cashAccounts.length > 0) {
      // Reset form
      setPaymentMethod("cash");
      setFormData({
        cash_account_id: cashAccounts[0].id,
        notes: "",
        bank_name: "",
        account_number: "",
        account_holder_name: "",
        transfer_reference: "",
        check_number: "",
        check_date: "",
      });
      setErrors({});
    }
  }, [isOpen, cashAccounts]);

  // ✅ NOW we can do null check AFTER hooks
  if (!resignation) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Data Tidak Tersedia</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Data resignation tidak ditemukan.</p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Common validation
    if (!formData.cash_account_id) {
      newErrors.cash_account_id = "Akun kas harus dipilih";
    }

    // Payment method specific validation
    if (paymentMethod === "transfer") {
      if (!formData.bank_name?.trim()) {
        newErrors.bank_name = "Nama bank harus diisi";
      }
      if (!formData.account_number?.trim()) {
        newErrors.account_number = "Nomor rekening harus diisi";
      }
      if (!formData.account_holder_name?.trim()) {
        newErrors.account_holder_name = "Nama pemegang rekening harus diisi";
      }
    } else if (paymentMethod === "check") {
      if (!formData.check_number?.trim()) {
        newErrors.check_number = "Nomor cek harus diisi";
      }
      if (!formData.check_date) {
        newErrors.check_date = "Tanggal cek harus diisi";
      }
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
      // Build request data based on payment method
      let requestData: CreateWithdrawalData;

      if (paymentMethod === "cash") {
        requestData = {
          cash_account_id: Number(formData.cash_account_id),
          payment_method: "cash",
          notes: formData.notes?.trim() || undefined,
        };
      } else if (paymentMethod === "transfer") {
        requestData = {
          cash_account_id: Number(formData.cash_account_id),
          payment_method: "transfer",
          bank_name: formData.bank_name.trim(),
          account_number: formData.account_number.trim(),
          account_holder_name: formData.account_holder_name.trim(),
          transfer_reference: formData.transfer_reference?.trim() || undefined,
          notes: formData.notes?.trim() || undefined,
        };
      } else {
        // check
        requestData = {
          cash_account_id: Number(formData.cash_account_id),
          payment_method: "check",
          check_number: formData.check_number.trim(),
          check_date: formData.check_date,
          notes: formData.notes?.trim() || undefined,
        };
      }

      console.log("🚀 Processing withdrawal:", requestData);

      await withdrawalService.processWithdrawal(resignation.id, requestData);

      toast.success("Pencairan dana berhasil diproses");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("❌ Error processing withdrawal:", error);

      let errorMessage = "Gagal memproses pencairan dana";

      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return msgArray.join(", ");
            })
            .join("\n");
          errorMessage = errorMessages;
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const PaymentMethodIcon = {
    cash: Banknote,
    transfer: CreditCard,
    check: FileCheck,
  };

  const Icon = PaymentMethodIcon[paymentMethod];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Proses Pencairan Dana</DialogTitle>
          <DialogDescription>
            Proses pencairan dana simpanan untuk{" "}
            {resignation.user?.full_name || "Anggota"}
          </DialogDescription>
        </DialogHeader>

        {/* Settlement Amount */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">
              Jumlah Pencairan
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Simpanan:</span>
              <span className="font-medium">
                {formatCurrency(resignation.total_savings || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Pinjaman:</span>
              <span className="font-medium text-red-600">
                {formatCurrency(resignation.total_loans || 0)}
              </span>
            </div>
            <div className="border-t border-blue-300 pt-2 mt-2"></div>
            <div className="flex justify-between">
              <span className="text-gray-900 font-bold text-base">
                Jumlah Pencairan:
              </span>
              <span className="font-bold text-blue-600 text-lg">
                {formatCurrency(resignation.return_amount || 0)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label>
              Metode Pembayaran <span className="text-red-500">*</span>
            </Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: any) => setPaymentMethod(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    <span>Tunai</span>
                  </div>
                </SelectItem>
                <SelectItem value="transfer">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Transfer Bank</span>
                  </div>
                </SelectItem>
                <SelectItem value="check">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    <span>Cek</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cash Account */}
          <div className="space-y-2">
            <Label htmlFor="cash_account_id">
              Akun Kas <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.cash_account_id.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, cash_account_id: value })
              }
            >
              <SelectTrigger
                className={errors.cash_account_id ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Pilih akun kas" />
              </SelectTrigger>
              <SelectContent>
                {cashAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name} - {account.account_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cash_account_id && (
              <p className="text-sm text-red-600">{errors.cash_account_id}</p>
            )}
          </div>

          {/* DYNAMIC FIELDS BASED ON PAYMENT METHOD */}

          {paymentMethod === "transfer" && (
            <>
              {/* Bank Name */}
              <div className="space-y-2">
                <Label htmlFor="bank_name">
                  Nama Bank <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_name: e.target.value })
                  }
                  placeholder="Contoh: BCA, BNI, Mandiri"
                  className={errors.bank_name ? "border-red-500" : ""}
                />
                {errors.bank_name && (
                  <p className="text-sm text-red-600">{errors.bank_name}</p>
                )}
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <Label htmlFor="account_number">
                  Nomor Rekening <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) =>
                    setFormData({ ...formData, account_number: e.target.value })
                  }
                  placeholder="Contoh: 1234567890"
                  className={errors.account_number ? "border-red-500" : ""}
                />
                {errors.account_number && (
                  <p className="text-sm text-red-600">
                    {errors.account_number}
                  </p>
                )}
              </div>

              {/* Account Holder Name */}
              <div className="space-y-2">
                <Label htmlFor="account_holder_name">
                  Nama Pemegang Rekening <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      account_holder_name: e.target.value,
                    })
                  }
                  placeholder="Nama sesuai rekening bank"
                  className={errors.account_holder_name ? "border-red-500" : ""}
                />
                {errors.account_holder_name && (
                  <p className="text-sm text-red-600">
                    {errors.account_holder_name}
                  </p>
                )}
              </div>

              {/* Transfer Reference (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="transfer_reference">
                  Referensi Transfer{" "}
                  <span className="text-gray-500 text-sm">(Opsional)</span>
                </Label>
                <Input
                  id="transfer_reference"
                  value={formData.transfer_reference}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transfer_reference: e.target.value,
                    })
                  }
                  placeholder="Contoh: TRF20260205001"
                />
              </div>
            </>
          )}

          {paymentMethod === "check" && (
            <>
              {/* Check Number */}
              <div className="space-y-2">
                <Label htmlFor="check_number">
                  Nomor Cek <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="check_number"
                  value={formData.check_number}
                  onChange={(e) =>
                    setFormData({ ...formData, check_number: e.target.value })
                  }
                  placeholder="Contoh: CHK001"
                  className={errors.check_number ? "border-red-500" : ""}
                />
                {errors.check_number && (
                  <p className="text-sm text-red-600">{errors.check_number}</p>
                )}
              </div>

              {/* Check Date */}
              <div className="space-y-2">
                <Label htmlFor="check_date">
                  Tanggal Cek <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="check_date"
                  type="date"
                  value={formData.check_date}
                  onChange={(e) =>
                    setFormData({ ...formData, check_date: e.target.value })
                  }
                  className={errors.check_date ? "border-red-500" : ""}
                />
                {errors.check_date && (
                  <p className="text-sm text-red-600">{errors.check_date}</p>
                )}
              </div>
            </>
          )}

          {/* Notes (Common for all methods) */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Catatan <span className="text-gray-500 text-sm">(Opsional)</span>
            </Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Catatan tambahan untuk pencairan dana..."
            />
          </div>

          {/* Warning */}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              Pastikan semua data sudah benar sebelum memproses pencairan.
              Proses ini tidak dapat dibatalkan.
            </AlertDescription>
          </Alert>

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
              className="min-w-[160px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Icon className="mr-2 h-4 w-4" />
                  Proses Pencairan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
