import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import useInstallments from "@/hooks/useInstallments";
import { toast } from "sonner";

// ✅ Use types from loans.service.ts
import type { Installment } from "@/lib/api/loans.service";

interface InstallmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: Installment;
  onPayment?: (
    installmentId: number,
    paymentMethod: string,
    notes: string
  ) => Promise<void>;
}

export default function InstallmentDetailModal({
  isOpen,
  onClose,
  installment,
  onPayment,
}: InstallmentDetailModalProps) {
  const { user } = useAuth();
  const isManager = user?.role === "manager" || user?.role === "admin";
  const { payInstallment } = useInstallments();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format currency
  const formatCurrency = (amount: number | string | undefined) => {
    if (!amount) return "Rp 0";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Calculate days
  const calculateDays = (dueDate: string | undefined) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysInfo = calculateDays(installment.due_date);

  // Get status badge
  const getStatusBadge = (status: string | undefined) => {
    const statusConfig: Record<
      string,
      { color: string; text: string; icon: any }
    > = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        text: "Belum Bayar",
        icon: Clock,
      },
      paid: {
        color: "bg-green-100 text-green-800 border-green-200",
        text: "Lunas",
        icon: CheckCircle,
      },
      overdue: {
        color: "bg-red-100 text-red-800 border-red-200",
        text: "Terlambat",
        icon: AlertCircle,
      },
      partial: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        text: "Sebagian",
        icon: DollarSign,
      },
    };

    const config = statusConfig[status || "pending"] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (!paymentMethod) {
      toast.error("Pilih metode pembayaran");
      return;
    }

    try {
      setIsSubmitting(true);

      if (onPayment) {
        await onPayment(installment.id, paymentMethod, paymentNotes);
      } else {
        await payInstallment(
          installment.id,
          paymentMethod as "cash" | "transfer" | "service_allowance",
          paymentNotes
        );
      }

      toast.success("Pembayaran berhasil diproses");
      setShowPaymentForm(false);
      onClose();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Gagal memproses pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parse amounts
  const principalAmount =
    typeof installment.principal_amount === "string"
      ? parseFloat(installment.principal_amount)
      : installment.principal_amount || 0;

  const interestAmount =
    typeof installment.interest_amount === "string"
      ? parseFloat(installment.interest_amount)
      : installment.interest_amount || 0;

  const lateFee =
    typeof installment.late_fee === "string"
      ? parseFloat(installment.late_fee)
      : installment.late_fee || 0;

  const totalAmount =
    typeof installment.total_amount === "string"
      ? parseFloat(installment.total_amount)
      : installment.total_amount || 0;

  const totalWithLateFee = totalAmount + lateFee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Detail Cicilan
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap cicilan pinjaman
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Status Pembayaran
                  </p>
                  {getStatusBadge(installment.status)}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-2">Cicilan ke</p>
                  <p className="text-2xl font-bold text-blue-600">
                    #{installment.installment_number}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Informasi Pinjaman
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">Nomor Pinjaman</Label>
                <p className="font-medium mt-1">
                  {installment.loan?.loan_number || "-"}
                </p>
              </div>
              {isManager && installment.loan?.user && (
                <>
                  <div>
                    <Label className="text-gray-600">Nama Anggota</Label>
                    <p className="font-medium mt-1">
                      {installment.loan.user.full_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">NIP</Label>
                    <p className="font-medium mt-1">
                      {installment.loan.user.employee_id}
                    </p>
                  </div>
                </>
              )}
              <div>
                <Label className="text-gray-600">Akun Kas</Label>
                <p className="font-medium mt-1">
                  {installment.loan?.cash_account
                    ? `${installment.loan.cash_account.code} - ${installment.loan.cash_account.name}`
                    : "-"}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Jumlah Pinjaman</Label>
                <p className="font-medium mt-1">
                  {formatCurrency(installment.loan?.principal_amount)}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Tenor</Label>
                <p className="font-medium mt-1">
                  {installment.loan?.tenure_months || 0} bulan
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Bunga</Label>
                <p className="font-medium mt-1">
                  {installment.loan?.interest_percentage || 0}%
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Installment Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Detail Cicilan
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">Tanggal Jatuh Tempo</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(installment.due_date)}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">
                  {daysInfo > 0
                    ? "Sisa Waktu"
                    : daysInfo === 0
                    ? "Jatuh Tempo"
                    : "Keterlambatan"}
                </Label>
                <p
                  className={`font-medium mt-1 ${
                    daysInfo < 0
                      ? "text-red-600"
                      : daysInfo === 0
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {daysInfo === 0
                    ? "Hari ini"
                    : daysInfo > 0
                    ? `${daysInfo} hari lagi`
                    : `${Math.abs(daysInfo)} hari`}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Rincian Pembayaran
            </h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pokok</span>
                <span className="font-semibold">
                  {formatCurrency(principalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bunga</span>
                <span className="font-semibold">
                  {formatCurrency(interestAmount)}
                </span>
              </div>
              {lateFee > 0 && (
                <div className="flex justify-between items-center text-red-600">
                  <span>Denda Keterlambatan</span>
                  <span className="font-semibold">
                    {formatCurrency(lateFee)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(totalWithLateFee)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info (if paid) */}
          {installment.status === "paid" && installment.payment_date && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Informasi Pembayaran
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Tanggal Bayar</Label>
                    <p className="font-medium mt-1">
                      {formatDate(installment.payment_date)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Metode Pembayaran</Label>
                    <p className="font-medium mt-1 capitalize">
                      {installment.payment_method?.replace("_", " ") || "-"}
                    </p>
                  </div>
                  {installment.notes && (
                    <div className="col-span-2">
                      <Label className="text-gray-600">Catatan</Label>
                      <p className="font-medium mt-1">{installment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Payment Form */}
          {!isManager && installment.status !== "paid" && !showPaymentForm && (
            <div className="flex justify-end">
              <Button onClick={() => setShowPaymentForm(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Bayar Sekarang
              </Button>
            </div>
          )}

          {showPaymentForm && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Form Pembayaran
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payment-method">
                      Metode Pembayaran <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <SelectTrigger id="payment-method" className="mt-1">
                        <SelectValue placeholder="Pilih metode pembayaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Tunai</SelectItem>
                        <SelectItem value="transfer">Transfer Bank</SelectItem>
                        <SelectItem value="service_allowance">
                          Potong Jasa Pelayanan
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment-notes">Catatan (Opsional)</Label>
                    <Textarea
                      id="payment-notes"
                      placeholder="Tambahkan catatan pembayaran..."
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {showPaymentForm ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={isSubmitting || !paymentMethod}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Konfirmasi Bayar
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
