// components/modals/ResignationApprovalModal.tsx
// 🆕 Admin approves resignation

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Resignation } from "@/lib/api/resignation.service";
import resignationService from "@/lib/api/resignation.service";

interface ResignationApprovalModalProps {
  resignation: Resignation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResignationApprovalModal({
  resignation,
  isOpen,
  onClose,
  onSuccess,
}: ResignationApprovalModalProps) {
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!resignation) return;

    setIsSubmitting(true);

    try {
      await resignationService.approveResignation(
        resignation.id,
        adminNotes.trim() || undefined,
      );

      toast.success("Pengajuan pengunduran diri berhasil disetujui");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error approving resignation:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menyetujui pengunduran diri";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAdminNotes("");
      onClose();
    }
  };

  if (!resignation) return null;

  const formatCurrency = (amount: number) => {
    return resignationService.formatCurrency(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Setujui Pengunduran Diri</span>
          </DialogTitle>
          <DialogDescription>
            Konfirmasi persetujuan pengajuan dari {resignation.user?.full_name}
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-sm">
            Dengan menyetujui, anggota akan diproses untuk pengunduran diri dan
            pengembalian dana akan dilakukan sesuai perhitungan.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Settlement Summary */}
          {resignation.return_amount !== undefined && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">
                Ringkasan Pengembalian Dana
              </h4>
              <div className="space-y-2 text-sm">
                {resignation.total_savings !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Simpanan:</span>
                    <span className="font-medium">
                      {formatCurrency(resignation.total_savings)}
                    </span>
                  </div>
                )}
                {resignation.total_loans !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Sisa Pinjaman:</span>
                    <span className="font-medium text-red-600">
                      - {formatCurrency(resignation.total_loans)}
                    </span>
                  </div>
                )}
                <div className="border-t border-blue-300 pt-2 flex justify-between">
                  <span className="text-blue-900 font-semibold">
                    Total Dikembalikan:
                  </span>
                  <span className="font-bold text-lg text-blue-900">
                    {formatCurrency(resignation.return_amount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="admin_notes">Catatan Admin (Opsional)</Label>
            <Textarea
              id="admin_notes"
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Tambahkan catatan untuk anggota (opsional)..."
              disabled={isSubmitting}
            />
          </div>

          <Alert className="bg-gray-50 border-gray-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Pastikan semua perhitungan sudah benar sebelum menyetujui.
            </AlertDescription>
          </Alert>
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
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Setujui
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResignationApprovalModal;
