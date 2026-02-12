// components/modals/ResignationRejectionModal.tsx
// 🆕 Admin rejects resignation

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
import { Loader2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Resignation } from "@/lib/api/resignation.service";
import resignationService from "@/lib/api/resignation.service";

interface ResignationRejectionModalProps {
  resignation: Resignation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResignationRejectionModal({
  resignation,
  isOpen,
  onClose,
  onSuccess,
}: ResignationRejectionModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = async () => {
    if (!resignation) return;

    if (!rejectionReason.trim()) {
      setError("Alasan penolakan harus diisi");
      return;
    }

    if (rejectionReason.length < 20) {
      setError("Alasan penolakan minimal 20 karakter");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await resignationService.rejectResignation(
        resignation.id,
        rejectionReason.trim(),
        adminNotes.trim() || undefined,
      );

      toast.success("Pengajuan pengunduran diri berhasil ditolak");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error rejecting resignation:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menolak pengunduran diri";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRejectionReason("");
      setAdminNotes("");
      setError("");
      onClose();
    }
  };

  if (!resignation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span>Tolak Pengunduran Diri</span>
          </DialogTitle>
          <DialogDescription>
            Berikan alasan penolakan untuk {resignation.user?.full_name}
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 text-sm">
            Anggota akan menerima notifikasi penolakan beserta alasan yang Anda
            berikan.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label htmlFor="rejection_reason">
              Alasan Penolakan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejection_reason"
              rows={5}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setError("");
              }}
              placeholder="Jelaskan mengapa pengajuan ditolak..."
              disabled={isSubmitting}
              className={error ? "border-red-500" : ""}
            />
            <p className="text-xs text-gray-500">
              Minimal 20 karakter. {rejectionReason.length}/20
            </p>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="admin_notes">Catatan Tambahan (Opsional)</Label>
            <Textarea
              id="admin_notes"
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Catatan internal admin (opsional)..."
              disabled={isSubmitting}
            />
          </div>
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
            onClick={handleReject}
            disabled={isSubmitting}
            variant="destructive"
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Tolak
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResignationRejectionModal;
