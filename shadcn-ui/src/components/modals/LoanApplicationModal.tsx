import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface KasOption {
  id: number;
  name: string;
  description: string;
  interest_rate: number;
  max_amount: number;
}

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  availableKas?: KasOption[];
}

export function LoanApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  availableKas = [],
}: LoanApplicationModalProps) {
  const [formData, setFormData] = useState({
    kas_id: "",
    amount: "",
    purpose: "",
    term: "",
    collateral: "",
    description: "",
  });

  const [selectedKas, setSelectedKas] = useState<number | null>(null);
  const selectedKasOption = availableKas?.find((k) => k.id === selectedKas); // ✅ Fixed dengan optional chaining

  useEffect(() => {
    if (selectedKas) {
      setFormData((prev) => ({ ...prev, kas_id: selectedKas.toString() }));
    }
  }, [selectedKas]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMonthlyPayment = () => {
    if (!formData.amount || !formData.term || !selectedKasOption) return 0;

    const principal = parseFloat(formData.amount);
    const months = parseInt(formData.term);
    const annualRate = selectedKasOption.interest_rate / 100;
    const monthlyRate = annualRate / 12;

    if (monthlyRate === 0) {
      return principal / months;
    }

    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return monthlyPayment;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      term: parseInt(formData.term),
      kas_id: parseInt(formData.kas_id),
      estimatedMonthlyPayment: calculateMonthlyPayment(),
    });
    onClose();
    setFormData({
      kas_id: "",
      amount: "",
      purpose: "",
      term: "",
      collateral: "",
      description: "",
    });
    setSelectedKas(null);
  };

  const isFormValid = () => {
    return (
      formData.kas_id &&
      formData.amount &&
      formData.purpose &&
      formData.term &&
      formData.collateral &&
      parseFloat(formData.amount) > 0 &&
      parseInt(formData.term) > 0
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajukan Pinjaman Baru</DialogTitle>
          <DialogDescription>
            Isi formulir di bawah ini untuk mengajukan pinjaman. Pengajuan akan
            diproses oleh admin kas yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pilih Kas */}
          <div className="space-y-3">
            <Label>Pilih Kas Pinjaman *</Label>
            <div className="grid gap-3">
              {availableKas.map((kas) => (
                <div
                  key={kas.id}
                  onClick={() => setSelectedKas(kas.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedKas === kas.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">
                          {kas.name}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          Bunga {kas.interest_rate}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {kas.description}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Maksimal: {formatCurrency(kas.max_amount)}
                      </p>
                    </div>
                    {selectedKas === kas.id && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedKas && (
            <>
              {/* Jumlah Pinjaman */}
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah Pinjaman *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Masukkan jumlah pinjaman"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  min="0"
                  max={selectedKasOption?.max_amount}
                  required
                />
                {selectedKasOption && (
                  <p className="text-sm text-gray-500">
                    Maksimal: {formatCurrency(selectedKasOption.max_amount)}
                  </p>
                )}
              </div>

              {/* Tujuan Pinjaman */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Tujuan Pinjaman *</Label>
                <Select
                  value={formData.purpose}
                  onValueChange={(value) =>
                    setFormData({ ...formData, purpose: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tujuan pinjaman" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Modal Usaha</SelectItem>
                    <SelectItem value="education">Pendidikan</SelectItem>
                    <SelectItem value="health">Kesehatan</SelectItem>
                    <SelectItem value="home_improvement">
                      Renovasi Rumah
                    </SelectItem>
                    <SelectItem value="vehicle">Kendaraan</SelectItem>
                    <SelectItem value="emergency">Kebutuhan Darurat</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Jangka Waktu */}
              <div className="space-y-2">
                <Label htmlFor="term">Jangka Waktu (Bulan) *</Label>
                <Select
                  value={formData.term}
                  onValueChange={(value) =>
                    setFormData({ ...formData, term: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jangka waktu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 Bulan</SelectItem>
                    <SelectItem value="12">12 Bulan (1 Tahun)</SelectItem>
                    <SelectItem value="24">24 Bulan (2 Tahun)</SelectItem>
                    <SelectItem value="36">36 Bulan (3 Tahun)</SelectItem>
                    <SelectItem value="48">48 Bulan (4 Tahun)</SelectItem>
                    <SelectItem value="60">60 Bulan (5 Tahun)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Jaminan */}
              <div className="space-y-2">
                <Label htmlFor="collateral">Jaminan *</Label>
                <Select
                  value={formData.collateral}
                  onValueChange={(value) =>
                    setFormData({ ...formData, collateral: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis jaminan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="certificate">
                      Sertifikat Tanah/Rumah
                    </SelectItem>
                    <SelectItem value="vehicle">BPKB Kendaraan</SelectItem>
                    <SelectItem value="savings">Simpanan</SelectItem>
                    <SelectItem value="salary">Potongan Gaji</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Keterangan */}
              <div className="space-y-2">
                <Label htmlFor="description">Keterangan Tambahan</Label>
                <Textarea
                  id="description"
                  placeholder="Jelaskan detail kebutuhan pinjaman Anda..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Estimasi Pembayaran */}
              {formData.amount && formData.term && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">Estimasi Pembayaran:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Angsuran per bulan:</p>
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(calculateMonthlyPayment())}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total pembayaran:</p>
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(
                              calculateMonthlyPayment() *
                                parseInt(formData.term)
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        * Estimasi ini bersifat sementara dan dapat berubah
                        sesuai persetujuan admin
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ajukan Pinjaman
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
