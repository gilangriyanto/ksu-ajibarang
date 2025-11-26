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
import {
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Loan, Installment } from "@/lib/api/loans.service";
import { toast } from "sonner";

interface LoanPaymentModalProps {
  loan: Loan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  upcomingInstallment?: Installment | null;
}

export function LoanPaymentModal({
  loan,
  isOpen,
  onClose,
  onSuccess,
  upcomingInstallment,
}: LoanPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod("");
      setNotes("");
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!paymentMethod) {
      newErrors.paymentMethod = "Metode pembayaran harus dipilih";
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

    if (!upcomingInstallment) {
      toast.error("Tidak ada cicilan yang perlu dibayar");
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentData = {
        payment_method: paymentMethod,
        notes: notes || "Pembayaran cicilan",
      };

      console.log("💰 Processing payment:", {
        installment_id: upcomingInstallment.id,
        ...paymentData,
      });

      // ✅ FIXED: Actually call payment API
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://ksp.gascpns.id/api/installments/${upcomingInstallment.id}/pay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      console.log("📡 Payment response status:", response.status);

      // ✅ Handle both 200 (with data) and 204 (no content) as success
      if (response.status === 200 || response.status === 204) {
        console.log("✅ Payment successful");

        toast.success("Pembayaran berhasil diproses!");

        // ✅ CRITICAL: Trigger parent refresh AFTER successful payment
        console.log("🔄 Triggering parent refresh...");
        await onSuccess();

        handleClose();
      } else {
        // Handle error response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Pembayaran gagal");
      }
    } catch (error: any) {
      console.error("❌ Error processing payment:", error);
      toast.error(error.message || "Gagal memproses pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  const handleClose = () => {
    setPaymentMethod("");
    setNotes("");
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!loan) return null;

  const monthlyPayment =
    typeof loan.monthly_payment === "string"
      ? parseFloat(loan.monthly_payment)
      : loan.monthly_payment;

  const remainingBalance = loan.remaining_balance
    ? typeof loan.remaining_balance === "string"
      ? parseFloat(loan.remaining_balance)
      : loan.remaining_balance
    : typeof loan.principal_amount === "string"
    ? parseFloat(loan.principal_amount)
    : loan.principal_amount;

  const paymentAmount = upcomingInstallment
    ? typeof upcomingInstallment.total_amount === "string"
      ? parseFloat(upcomingInstallment.total_amount)
      : upcomingInstallment.total_amount
    : monthlyPayment;

  const principalAmount = upcomingInstallment
    ? typeof upcomingInstallment.principal_amount === "string"
      ? parseFloat(upcomingInstallment.principal_amount)
      : upcomingInstallment.principal_amount
    : 0;

  const interestAmount = upcomingInstallment
    ? typeof upcomingInstallment.interest_amount === "string"
      ? parseFloat(upcomingInstallment.interest_amount)
      : upcomingInstallment.interest_amount
    : 0;

  const newBalance = remainingBalance - paymentAmount;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Bayar Cicilan Pinjaman</span>
          </DialogTitle>
          <DialogDescription>
            Lakukan pembayaran cicilan pinjaman #{loan.id}
          </DialogDescription>
        </DialogHeader>

        {upcomingInstallment ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Installment Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">
                  Cicilan #{upcomingInstallment.installment_number}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-700">Jatuh Tempo:</p>
                  <p className="font-medium text-blue-900">
                    {new Date(upcomingInstallment.due_date).toLocaleDateString(
                      "id-ID"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Status:</p>
                  <p className="font-medium text-blue-900">
                    {upcomingInstallment.status === "pending"
                      ? "Belum Dibayar"
                      : upcomingInstallment.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Metode Pembayaran *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger
                  className={errors.paymentMethod ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service_allowance">
                    Potong Jasa Pelayanan (Otomatis)
                  </SelectItem>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="transfer">Transfer Bank</SelectItem>
                  <SelectItem value="deduction">Potongan Gaji</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <p className="text-sm text-red-600">{errors.paymentMethod}</p>
              )}
              {paymentMethod === "service_allowance" && (
                <p className="text-xs text-blue-600">
                  💡 Pembayaran akan dipotong otomatis dari jasa pelayanan bulan
                  ini
                </p>
              )}
              {paymentMethod === "transfer" && (
                <p className="text-xs text-gray-600">
                  Transfer ke rekening koperasi, kemudian konfirmasi
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  paymentMethod === "service_allowance"
                    ? "Pembayaran otomatis dari jasa pelayanan"
                    : paymentMethod === "transfer"
                    ? "Transfer Bank Mandiri ke rekening koperasi"
                    : "Catatan untuk pembayaran ini (opsional)"
                }
                rows={2}
              />
            </div>

            {/* Payment Summary */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-3">
                Ringkasan Pembayaran
              </h4>
              <div className="space-y-2 text-sm">
                {principalAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Pokok:</span>
                    <span className="font-medium">
                      {formatCurrency(principalAmount)}
                    </span>
                  </div>
                )}
                {interestAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Bunga:</span>
                    <span className="font-medium">
                      {formatCurrency(interestAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-green-300 pt-2">
                  <span className="text-green-700 font-medium">
                    Total Pembayaran:
                  </span>
                  <span className="font-bold text-green-900 text-lg">
                    {formatCurrency(paymentAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">
                    Sisa Pinjaman Setelah Bayar:
                  </span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(newBalance > 0 ? newBalance : 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Success Info */}
            {newBalance <= 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-blue-900">
                    Pelunasan Pinjaman
                  </h4>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Dengan pembayaran ini, pinjaman Anda akan lunas sepenuhnya! 🎉
                </p>
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
                className="min-w-[140px] bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Bayar Sekarang
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Tidak ada cicilan yang perlu dibayar
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Semua cicilan sudah lunas atau belum ada jadwal pembayaran
            </p>
            <Button onClick={handleClose} className="mt-4">
              Tutup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
