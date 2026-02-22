import React, { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Building,
  Percent,
  Mail,
  Bell,
  Shield,
  Database,
  Save,
  Loader2,
} from "lucide-react";
import { settingService } from "@/lib/api/setting.service";
import { toast } from "sonner";
import { AccountingPeriodsList } from "./AccountingPeriods";

interface CooperativeSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  registration_number: string;
  tax_id: string;
  description: string;
}

interface LoanSettings {
  max_loan_amount: number;
  min_loan_amount: number;
  default_interest_rate: number;
  max_loan_term: number;
  min_loan_term: number;
  processing_fee_rate: number;
  late_payment_penalty: number;
}

interface SavingsSettings {
  mandatory_savings_amount: number;
  minimum_balance: number;
  interest_rate: number;
  withdrawal_fee: number;
  max_withdrawal_per_day: number;
}

interface SystemSettings {
  auto_backup: boolean;
  backup_frequency: "daily" | "weekly" | "monthly";
  email_notifications: boolean;
  sms_notifications: boolean;
  maintenance_mode: boolean;
  session_timeout: number;
}

export default function Settings() {
  const [cooperativeSettings, setCooperativeSettings] =
    useState<CooperativeSettings>({
      name: "Koperasi Rumah Sakit Sejahtera",
      address: "Jl. Rumah Sakit No. 123, Jakarta Selatan",
      phone: "021-12345678",
      email: "info@koperasi-rs.com",
      registration_number: "REG/001/2023",
      tax_id: "12.345.678.9-012.000",
      description:
        "Koperasi yang bergerak di bidang simpan pinjam untuk karyawan rumah sakit",
    });

  const [loanSettings, setLoanSettings] = useState<LoanSettings>({
    max_loan_amount: 100000000,
    min_loan_amount: 1000000,
    default_interest_rate: 12,
    max_loan_term: 60,
    min_loan_term: 6,
    processing_fee_rate: 1,
    late_payment_penalty: 5,
  });

  // const [savingsSettings, setSavingsSettings] = useState<SavingsSettings>({
  //   mandatory_savings_amount: 100000,
  //   minimum_balance: 50000,
  //   interest_rate: 6,
  //   withdrawal_fee: 5000,
  //   max_withdrawal_per_day: 5000000,
  // });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    auto_backup: true,
    backup_frequency: "daily",
    email_notifications: true,
    sms_notifications: false,
    maintenance_mode: false,
    session_timeout: 30,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load backend settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await settingService.getSettings();
      // Map API payload back to the component states
      if (response.cooperative) {
        setCooperativeSettings((prev) => ({ ...prev, ...response.cooperative }));
      }
      if (response.loan) {
        setLoanSettings((prev) => ({
          ...prev,
          max_loan_amount: Number(response.loan.max_loan_amount) || prev.max_loan_amount,
          min_loan_amount: Number(response.loan.min_loan_amount) || prev.min_loan_amount,
          default_interest_rate: Number(response.loan.default_interest_rate) || prev.default_interest_rate,
          max_loan_term: Number(response.loan.max_loan_term) || prev.max_loan_term,
          min_loan_term: Number(response.loan.min_loan_term) || prev.min_loan_term,
          processing_fee_rate: Number(response.loan.processing_fee_rate) || prev.processing_fee_rate,
          late_payment_penalty: Number(response.loan.late_payment_penalty) || prev.late_payment_penalty,
        }));
      }
      if (response.savings) {
        // Assume API structure aligns with new frontend spec
        setSavingsSettings((prev) => ({
          ...prev,
          mandatory: {
            amount: Number(response.savings.mandatory?.amount) || prev.mandatory.amount,
            interest_rate: Number(response.savings.mandatory?.interest_rate) || prev.mandatory.interest_rate,
          },
          voluntary: {
            amount: Number(response.savings.voluntary?.amount) || prev.voluntary.amount,
            interest_rate: Number(response.savings.voluntary?.interest_rate) || prev.voluntary.interest_rate,
          },
          principal: {
            amount: Number(response.savings.principal?.amount) || prev.principal.amount,
            interest_rate: Number(response.savings.principal?.interest_rate) || prev.principal.interest_rate,
          },
          holiday: {
            amount: Number(response.savings.holiday?.amount) || prev.holiday.amount,
            interest_rate: Number(response.savings.holiday?.interest_rate) || prev.holiday.interest_rate,
          },
          minimum_balance: Number(response.savings.minimum_balance) || prev.minimum_balance,
          max_withdrawal_per_day: Number(response.savings.max_withdrawal_per_day) || prev.max_withdrawal_per_day,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Gagal memuat data pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const handleSaveCooperative = async () => {
    try {
      setIsSaving(true);
      await settingService.updateSettings("cooperative", cooperativeSettings);
      toast.success("Pengaturan informasi koperasi berhasil disimpan");
    } catch (error) {
      console.error("Error saving cooperative settings:", error);
      toast.error("Gagal menyimpan pengaturan koperasi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLoan = async () => {
    try {
      setIsSaving(true);
      await settingService.updateSettings("loan", loanSettings as unknown as Record<string, any>);
      toast.success("Pengaturan pinjaman berhasil disimpan");
    } catch (error) {
      console.error("Error saving loan settings:", error);
      toast.error("Gagal menyimpan pengaturan pinjaman");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSavings = async () => {
    try {
      setIsSaving(true);
      await settingService.updateSettings("savings", savingsSettings);
      toast.success("Pengaturan simpanan berhasil disimpan");
    } catch (error) {
      console.error("Error saving savings settings:", error);
      toast.error("Gagal menyimpan pengaturan simpanan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSystem = async () => {
    // try {
    //   setIsSaving(true);
    //   await settingService.updateSettings("system", systemSettings);
    //   toast.success("Pengaturan sistem berhasil disimpan");
    // } catch (error) {
    //   console.error("Error saving system settings:", error);
    //   toast.error("Gagal menyimpan pengaturan sistem");
    // } finally {
    //   setIsSaving(false);
    // }
    console.log("Saving system settings:", systemSettings);
  };

  // State untuk jenis simpanan yang dipilih
  const [selectedSavingsType, setSelectedSavingsType] = useState("mandatory");

  // Update struktur savingsSettings
  const [savingsSettings, setSavingsSettings] = useState({
    mandatory: {
      amount: 100000,
      interest_rate: 12,
    },
    voluntary: {
      amount: 0,
      interest_rate: 2,
    },
    principal: {
      amount: 500000,
      interest_rate: 3,
    },
    holiday: {
      amount: 0,
      interest_rate: 14,
    },
    minimum_balance: 50000,
    max_withdrawal_per_day: 5000000,
  });

  // Helper function untuk mendapatkan nama jenis simpanan
  const getSavingsTypeName = (type: string) => {
    const names = {
      mandatory: "Simpanan Wajib",
      voluntary: "Simpanan Sukarela",
      principal: "Simpanan Pokok",
      holiday: "Simpanan Hari Raya",
    };
    return names[type as keyof typeof names] || "";
  };

  // Handler untuk update savings
  const handleSavingsChange = (type: string, field: string, value: number) => {
    setSavingsSettings((prev) => ({
      ...prev,
      [type]: {
        ...(prev[type as keyof typeof prev] as any),
        [field]: value,
      },
    }));
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pengaturan Sistem
            </h1>
            <p className="text-gray-600">
              Kelola konfigurasi dan pengaturan koperasi
            </p>
          </div>
        </div>

        <Tabs defaultValue="cooperative" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="cooperative"
              className="flex items-center space-x-2"
            >
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Koperasi</span>
            </TabsTrigger>
            <TabsTrigger value="loan" className="flex items-center space-x-2">
              <Percent className="h-4 w-4" />
              <span className="hidden sm:inline">Pinjaman</span>
            </TabsTrigger>
            <TabsTrigger
              value="savings"
              className="flex items-center space-x-2"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Simpanan</span>
            </TabsTrigger>
            <TabsTrigger
               value="accounting"
               className="flex items-center space-x-2"
            >
               <SettingsIcon className="h-4 w-4" />
               <span className="hidden sm:inline">Periode Akuntansi</span>
            </TabsTrigger>
            {/* <TabsTrigger value="system" className="flex items-center space-x-2">
              <SettingsIcon className="h-4 w-4" />
              <span>Sistem</span>
            </TabsTrigger> */}
          </TabsList>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          )}

          {!isLoading && (
            <TabsContent value="cooperative" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Informasi Koperasi</span>
                </CardTitle>
                <CardDescription>
                  Pengaturan informasi dasar koperasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coop_name">Nama Koperasi</Label>
                    <Input
                      id="coop_name"
                      value={cooperativeSettings.name}
                      onChange={(e) =>
                        setCooperativeSettings((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg_number">Nomor Registrasi</Label>
                    <Input
                      id="reg_number"
                      value={cooperativeSettings.registration_number}
                      onChange={(e) =>
                        setCooperativeSettings((prev) => ({
                          ...prev,
                          registration_number: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea
                    id="address"
                    value={cooperativeSettings.address}
                    onChange={(e) =>
                      setCooperativeSettings((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telepon</Label>
                    <Input
                      id="phone"
                      value={cooperativeSettings.phone}
                      onChange={(e) =>
                        setCooperativeSettings((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={cooperativeSettings.email}
                      onChange={(e) =>
                        setCooperativeSettings((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tax_id">NPWP</Label>
                  <Input
                    id="tax_id"
                    value={cooperativeSettings.tax_id}
                    onChange={(e) =>
                      setCooperativeSettings((prev) => ({
                        ...prev,
                        tax_id: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={cooperativeSettings.description}
                    onChange={(e) =>
                      setCooperativeSettings((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveCooperative} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Pengaturan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {!isLoading && (
          <TabsContent value="loan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Percent className="h-5 w-5" />
                  <span>Pengaturan Pinjaman</span>
                </CardTitle>
                <CardDescription>
                  Konfigurasi parameter pinjaman koperasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Grid untuk semua field - 2 kolom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Maksimal Pinjaman */}
                  <div className="space-y-2">
                    <Label htmlFor="max_loan">Maksimal Pinjaman</Label>
                    <Input
                      id="max_loan"
                      type="number"
                      value={loanSettings.max_loan_amount}
                      onChange={(e) =>
                        setLoanSettings((prev) => ({
                          ...prev,
                          max_loan_amount: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(loanSettings.max_loan_amount)}
                    </p>
                  </div>

                  {/* Suku Bunga Default */}
                  <div className="space-y-2">
                    <Label htmlFor="interest_rate">
                      Suku Bunga Default (%)
                    </Label>
                    <Input
                      id="interest_rate"
                      type="number"
                      step="0.1"
                      value={loanSettings.default_interest_rate}
                      onChange={(e) =>
                        setLoanSettings((prev) => ({
                          ...prev,
                          default_interest_rate: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Persentase bunga per tahun
                    </p>
                  </div>

                  {/* Maksimal Tenor */}
                  <div className="space-y-2">
                    <Label htmlFor="max_term">Maksimal Tenor (bulan)</Label>
                    <Input
                      id="max_term"
                      type="number"
                      value={loanSettings.max_loan_term}
                      onChange={(e) =>
                        setLoanSettings((prev) => ({
                          ...prev,
                          max_loan_term: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Jangka waktu pinjaman maksimal
                    </p>
                  </div>

                  {/* Minimal Tenor */}
                  <div className="space-y-2">
                    <Label htmlFor="min_term">Minimal Tenor (bulan)</Label>
                    <Input
                      id="min_term"
                      type="number"
                      value={loanSettings.min_loan_term}
                      onChange={(e) =>
                        setLoanSettings((prev) => ({
                          ...prev,
                          min_loan_term: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Jangka waktu pinjaman minimal
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSaveLoan} className="gap-2" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Simpan Pengaturan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {!isLoading && (
          <TabsContent value="savings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Pengaturan Simpanan</span>
                </CardTitle>
                <CardDescription>
                  Konfigurasi parameter simpanan koperasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Jenis Simpanan Selector */}
                <div className="space-y-2">
                  <Label htmlFor="savings_type">Jenis Simpanan</Label>
                  <Select
                    value={selectedSavingsType}
                    onValueChange={setSelectedSavingsType}
                  >
                    <SelectTrigger id="savings_type">
                      <SelectValue placeholder="Pilih jenis simpanan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mandatory">Simpanan Wajib</SelectItem>
                      <SelectItem value="voluntary">
                        Simpanan Sukarela
                      </SelectItem>
                      <SelectItem value="principal">Simpanan Pokok</SelectItem>
                      <SelectItem value="holiday">
                        Simpanan Hari Raya
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Pilih jenis simpanan untuk mengatur suku bunga
                  </p>
                </div>

                {/* Grid untuk pengaturan - 2 kolom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Suku Bunga per Jenis Simpanan */}
                  <div className="space-y-2">
                    <Label htmlFor="savings_interest">
                      Suku Bunga {getSavingsTypeName(selectedSavingsType)} (%)
                    </Label>
                    <Input
                      id="savings_interest"
                      type="number"
                      step="0.1"
                      value={
                        savingsSettings[selectedSavingsType]?.interest_rate || 0
                      }
                      onChange={(e) =>
                        handleSavingsChange(
                          selectedSavingsType,
                          "interest_rate",
                          Number(e.target.value)
                        )
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Persentase bunga per tahun
                    </p>
                  </div>

                  {/* Saldo Minimal */}
                  <div className="space-y-2">
                    <Label htmlFor="min_balance">Saldo Minimal</Label>
                    <Input
                      id="min_balance"
                      type="number"
                      value={savingsSettings.minimum_balance}
                      onChange={(e) =>
                        setSavingsSettings((prev) => ({
                          ...prev,
                          minimum_balance: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(savingsSettings.minimum_balance)}
                    </p>
                  </div>

                  {/* Maksimal Penarikan per Hari */}
                  <div className="space-y-2">
                    <Label htmlFor="max_withdrawal">
                      Maksimal Penarikan per Hari
                    </Label>
                    <Input
                      id="max_withdrawal"
                      type="number"
                      value={savingsSettings.max_withdrawal_per_day}
                      onChange={(e) =>
                        setSavingsSettings((prev) => ({
                          ...prev,
                          max_withdrawal_per_day: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(savingsSettings.max_withdrawal_per_day)}
                    </p>
                  </div>
                </div>

                {/* Summary Table - Hanya Suku Bunga */}
                <div className="space-y-2">
                  <Label>Ringkasan Suku Bunga Simpanan</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Jenis Simpanan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Suku Bunga
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="px-4 py-3 text-sm">Simpanan Wajib</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {savingsSettings.mandatory?.interest_rate || 0}%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm">
                            Simpanan Sukarela
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {savingsSettings.voluntary?.interest_rate || 0}%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm">Simpanan Pokok</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {savingsSettings.principal?.interest_rate || 0}%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm">
                            Simpanan Hari Raya
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {savingsSettings.holiday?.interest_rate || 0}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSaveSavings} className="gap-2" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Simpan Pengaturan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {!isLoading && (
          <TabsContent value="accounting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="h-5 w-5" />
                  <span>Periode Akuntansi</span>
                </CardTitle>
                <CardDescription>
                  Manajemen masa berlaku jurnal dan pembukuan koperasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <AccountingPeriodsList />
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="h-5 w-5" />
                  <span>Pengaturan Sistem</span>
                </CardTitle>
                <CardDescription>
                  Konfigurasi sistem dan keamanan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Backup & Keamanan</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-gray-500">
                        Backup otomatis database
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.auto_backup}
                      onCheckedChange={(checked) =>
                        setSystemSettings((prev) => ({
                          ...prev,
                          auto_backup: checked,
                        }))
                      }
                    />
                  </div>
                  {systemSettings.auto_backup && (
                    <div>
                      <Label htmlFor="backup_freq">Frekuensi Backup</Label>
                      <Select
                        value={systemSettings.backup_frequency}
                        onValueChange={(value) =>
                          setSystemSettings((prev) => ({
                            ...prev,
                            backup_frequency: value as any,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Harian</SelectItem>
                          <SelectItem value="weekly">Mingguan</SelectItem>
                          <SelectItem value="monthly">Bulanan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="session_timeout">
                      Session Timeout (menit)
                    </Label>
                    <Input
                      id="session_timeout"
                      type="number"
                      value={systemSettings.session_timeout}
                      onChange={(e) =>
                        setSystemSettings((prev) => ({
                          ...prev,
                          session_timeout: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Notifikasi</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Kirim notifikasi via email
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.email_notifications}
                      onCheckedChange={(checked) =>
                        setSystemSettings((prev) => ({
                          ...prev,
                          email_notifications: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Kirim notifikasi via SMS
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.sms_notifications}
                      onCheckedChange={(checked) =>
                        setSystemSettings((prev) => ({
                          ...prev,
                          sms_notifications: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Maintenance</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mode Maintenance</Label>
                      <p className="text-sm text-gray-500">
                        Nonaktifkan akses sistem untuk maintenance
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenance_mode}
                      onCheckedChange={(checked) =>
                        setSystemSettings((prev) => ({
                          ...prev,
                          maintenance_mode: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSystem}>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Pengaturan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </ManagerLayout>
  );
}
