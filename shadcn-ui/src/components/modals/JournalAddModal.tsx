// src/components/modals/JournalAddModal.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Loader2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import journalService from "@/lib/api/journal.service";

interface JournalEntry {
  chart_of_account_id: number;
  debit: number;
  credit: number;
  description: string;
}

interface JournalAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JournalAddModal({
  isOpen,
  onClose,
  onSuccess,
}: JournalAddModalProps) {
  const [formData, setFormData] = useState({
    journal_type: "general",
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  const [entries, setEntries] = useState<JournalEntry[]>([
    { chart_of_account_id: 0, debit: 0, credit: 0, description: "" },
    { chart_of_account_id: 0, debit: 0, credit: 0, description: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      { chart_of_account_id: 0, debit: 0, credit: 0, description: "" },
    ]);
  };

  const handleRemoveEntry = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const handleEntryChange = (
    index: number,
    field: keyof JournalEntry,
    value: number | string
  ) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const calculateTotals = () => {
    const totalDebit = entries.reduce(
      (sum, entry) => sum + (entry.debit || 0),
      0
    );
    const totalCredit = entries.reduce(
      (sum, entry) => sum + (entry.credit || 0),
      0
    );
    return { totalDebit, totalCredit, isBalanced: totalDebit === totalCredit };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = "Deskripsi jurnal harus diisi";
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = "Tanggal transaksi harus diisi";
    }

    const { totalDebit, totalCredit, isBalanced } = calculateTotals();

    if (totalDebit === 0 || totalCredit === 0) {
      newErrors.entries = "Minimal harus ada satu entry debit dan kredit";
    }

    if (!isBalanced) {
      newErrors.balance = "Total debit dan kredit harus sama (balanced)";
    }

    entries.forEach((entry, index) => {
      if (entry.debit > 0 || entry.credit > 0) {
        if (entry.chart_of_account_id === 0) {
          newErrors[`entry_${index}`] = "Akun harus dipilih";
        }
      }
    });

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
      // Filter entries yang memiliki debit atau credit
      const validEntries = entries.filter(
        (entry) => entry.debit > 0 || entry.credit > 0
      );

      const payload = {
        journal_type: formData.journal_type as any,
        description: formData.description,
        transaction_date: formData.transaction_date,
        details: validEntries.map((entry) => ({
          chart_of_account_id: entry.chart_of_account_id,
          debit: entry.debit,
          credit: entry.credit,
          description: entry.description || "",
        })),
      };

      console.log("📤 Creating journal:", payload);

      await journalService.create(payload);

      toast.success("Jurnal berhasil dibuat");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("❌ Error creating journal:", error);

      if (error.response?.status === 422 && error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Gagal membuat jurnal"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      journal_type: "general",
      description: "",
      transaction_date: new Date().toISOString().split("T")[0],
    });
    setEntries([
      { chart_of_account_id: 0, debit: 0, credit: 0, description: "" },
      { chart_of_account_id: 0, debit: 0, credit: 0, description: "" },
    ]);
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

  const { totalDebit, totalCredit, isBalanced } = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Buat Jurnal Baru</span>
          </DialogTitle>
          <DialogDescription>
            Buat entri jurnal akuntansi dengan sistem double-entry
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Journal Type */}
          <div className="space-y-2">
            <Label htmlFor="journal_type">Jenis Jurnal *</Label>
            <Select
              value={formData.journal_type}
              onValueChange={(value) =>
                setFormData({ ...formData, journal_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis jurnal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Jurnal Umum</SelectItem>
                <SelectItem value="special">Jurnal Khusus</SelectItem>
                <SelectItem value="adjusting">Jurnal Penyesuaian</SelectItem>
                <SelectItem value="closing">Jurnal Penutup</SelectItem>
                <SelectItem value="reversing">Jurnal Pembalik</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Date */}
          <div className="space-y-2">
            <Label htmlFor="transaction_date">Tanggal Transaksi *</Label>
            <Input
              id="transaction_date"
              type="date"
              value={formData.transaction_date}
              onChange={(e) =>
                setFormData({ ...formData, transaction_date: e.target.value })
              }
              max={new Date().toISOString().split("T")[0]}
              className={errors.transaction_date ? "border-red-500" : ""}
            />
            {errors.transaction_date && (
              <p className="text-sm text-red-600">{errors.transaction_date}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Deskripsi jurnal"
              rows={2}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Journal Entries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Entri Jurnal *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddEntry}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Baris
              </Button>
            </div>

            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="col-span-4">
                    <Input
                      type="number"
                      placeholder="ID Akun"
                      value={entry.chart_of_account_id || ""}
                      onChange={(e) =>
                        handleEntryChange(
                          index,
                          "chart_of_account_id",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className={
                        errors[`entry_${index}`] ? "border-red-500" : ""
                      }
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Debit"
                      value={entry.debit || ""}
                      onChange={(e) =>
                        handleEntryChange(
                          index,
                          "debit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Kredit"
                      value={entry.credit || ""}
                      onChange={(e) =>
                        handleEntryChange(
                          index,
                          "credit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    {entries.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEntry(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {errors.entries && (
              <p className="text-sm text-red-600">{errors.entries}</p>
            )}
          </div>

          {/* Balance Summary */}
          <div
            className={`p-4 rounded-lg border-2 ${
              isBalanced
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Total Debit</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(totalDebit)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Kredit</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(totalCredit)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p
                  className={`text-lg font-bold ${
                    isBalanced ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isBalanced ? "✓ Balanced" : "✗ Not Balanced"}
                </p>
              </div>
            </div>
            {errors.balance && (
              <p className="text-sm text-red-600 text-center mt-2">
                {errors.balance}
              </p>
            )}
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
              disabled={isSubmitting || !isBalanced}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Buat Jurnal
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
