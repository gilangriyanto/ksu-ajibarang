import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, Plus, ArrowRight, Lock, Unlock, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { accountingPeriodService, AccountingPeriod } from "@/lib/api/accountingPeriod.service";

export function AccountingPeriodsList() {
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<AccountingPeriod | null>(null);

  // Form states
  const [periodName, setPeriodName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchPeriods = async () => {
    setIsLoading(true);
    try {
      const response = await accountingPeriodService.getPeriods({ all: true });
      setPeriods(response.data || []);
    } catch (error) {
      console.error("Error fetching periods:", error);
      toast.error("Gagal memuat daftar periode akuntansi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleOpenCreateDialog = () => {
    setPeriodName("");
    setStartDate("");
    setEndDate("");
    setIsDialogOpen(true);
  };

  const handleCreatePeriod = async () => {
    if (!startDate || !endDate) {
      toast.error("Tanggal mulai dan tanggal akhir wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      await accountingPeriodService.createPeriod({
        period_name: periodName || undefined,
        start_date: startDate,
        end_date: endDate,
      });
      toast.success("Periode akuntansi berhasil dibuat");
      setIsDialogOpen(false);
      fetchPeriods();
    } catch (error: any) {
      console.error("Error creating period:", error);
      toast.error(error.response?.data?.message || "Gagal membuat periode akuntansi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCloseDialog = (period: AccountingPeriod) => {
    setSelectedPeriod(period);
    setIsCloseDialogOpen(true);
  };

  const handleClosePeriod = async () => {
    if (!selectedPeriod) return;

    setIsSubmitting(true);
    try {
      if (selectedPeriod.is_closed) {
        await accountingPeriodService.reopenPeriod(selectedPeriod.id);
        toast.success(`Periode ${selectedPeriod.period_name} berhasil dibuka kembali`);
      } else {
        await accountingPeriodService.closePeriod(selectedPeriod.id);
        toast.success(`Periode ${selectedPeriod.period_name} berhasil ditutup`);
      }
      setIsCloseDialogOpen(false);
      fetchPeriods();
    } catch (error: any) {
      console.error("Error updating period status:", error);
      toast.error(error.response?.data?.message || "Gagal mengubah status periode");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Daftar Periode</h3>
          <p className="text-sm text-muted-foreground">Kelola periode akuntansi untuk pencatatan jurnal</p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Periode
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : periods.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-500">Belum ada periode akuntansi yang dibuat.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {periods.map((period) => (
            <Card key={period.id} className={`${period.is_active ? 'border-green-200 bg-green-50/30' : ''}`}>
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{period.period_name}</h4>
                    {period.is_active && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">Aktif</Badge>
                    )}
                    {period.is_closed ? (
                      <Badge variant="outline" className="text-gray-500 bg-gray-100 border-gray-200">Ditutup</Badge>
                    ) : (
                      <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Terbuka</Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{formatDate(period.start_date)}</span>
                    <ArrowRight className="h-3 w-3 mx-2" />
                    <span>{formatDate(period.end_date)}</span>
                  </div>
                </div>

                <Button 
                  variant={period.is_closed ? "outline" : "destructive"} 
                  size="sm"
                  onClick={() => handleOpenCloseDialog(period)}
                  className="w-full sm:w-auto gap-2"
                >
                  {period.is_closed ? (
                    <>
                      <Unlock className="h-4 w-4" />
                      Buka Kembali
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Tutup Periode
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tambah Periode Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Periode Akuntansi</DialogTitle>
            <DialogDescription>
              Buat periode baru untuk pencatatan pembukuan koperasi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="period_name">Nama Periode (Opsional)</Label>
              <Input 
                id="period_name" 
                placeholder="Contoh: Periode Januari 2024"
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Jika dikosongkan, nama akan di-generate otomatis.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Tanggal Mulai <span className="text-red-500">*</span></Label>
                <Input 
                  id="start_date" 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Tanggal Akhir <span className="text-red-500">*</span></Label>
                <Input 
                  id="end_date" 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleCreatePeriod} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan Periode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi Tutup/Buka Dialog */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPeriod?.is_closed ? "Buka Kembali Periode?" : "Tutup Periode?"}
            </DialogTitle>
            <DialogDescription>
              {selectedPeriod?.is_closed 
                ? `Anda akan membuka kembali periode ${selectedPeriod?.period_name}. Jurnal baru dapat ditambahkan kembali ke periode ini.`
                : `Menutup periode ${selectedPeriod?.period_name} akan mencegah penambahan atau perubahan jurnal pada rentang waktu ini. Pastikan semua pembukuan sudah final.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {!selectedPeriod?.is_closed && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-start gap-2 text-sm mt-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>Tindakan ini ditujukan untuk proses tutup buku periode. Harap berhati-hati.</p>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button 
              variant={selectedPeriod?.is_closed ? "default" : "destructive"}
              onClick={handleClosePeriod} 
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {selectedPeriod?.is_closed ? "Ya, Buka Kembali" : "Ya, Tutup Periode"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
