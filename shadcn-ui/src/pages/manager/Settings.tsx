import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Building, 
  Percent, 
  Mail, 
  Bell, 
  Shield, 
  Database,
  Save
} from 'lucide-react';

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
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  email_notifications: boolean;
  sms_notifications: boolean;
  maintenance_mode: boolean;
  session_timeout: number;
}

export default function Settings() {
  const [cooperativeSettings, setCooperativeSettings] = useState<CooperativeSettings>({
    name: 'Koperasi Rumah Sakit Sejahtera',
    address: 'Jl. Rumah Sakit No. 123, Jakarta Selatan',
    phone: '021-12345678',
    email: 'info@koperasi-rs.com',
    registration_number: 'REG/001/2023',
    tax_id: '12.345.678.9-012.000',
    description: 'Koperasi yang bergerak di bidang simpan pinjam untuk karyawan rumah sakit',
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

  const [savingsSettings, setSavingsSettings] = useState<SavingsSettings>({
    mandatory_savings_amount: 100000,
    minimum_balance: 50000,
    interest_rate: 6,
    withdrawal_fee: 5000,
    max_withdrawal_per_day: 5000000,
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    auto_backup: true,
    backup_frequency: 'daily',
    email_notifications: true,
    sms_notifications: false,
    maintenance_mode: false,
    session_timeout: 30,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const handleSaveCooperative = () => {
    // Save cooperative settings
    console.log('Saving cooperative settings:', cooperativeSettings);
  };

  const handleSaveLoan = () => {
    // Save loan settings
    console.log('Saving loan settings:', loanSettings);
  };

  const handleSaveSavings = () => {
    // Save savings settings
    console.log('Saving savings settings:', savingsSettings);
  };

  const handleSaveSystem = () => {
    // Save system settings
    console.log('Saving system settings:', systemSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="text-gray-600">Kelola konfigurasi dan pengaturan koperasi</p>
        </div>
      </div>

      <Tabs defaultValue="cooperative" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cooperative" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Koperasi</span>
          </TabsTrigger>
          <TabsTrigger value="loan" className="flex items-center space-x-2">
            <Percent className="h-4 w-4" />
            <span>Pinjaman</span>
          </TabsTrigger>
          <TabsTrigger value="savings" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Simpanan</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <SettingsIcon className="h-4 w-4" />
            <span>Sistem</span>
          </TabsTrigger>
        </TabsList>

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
                    onChange={(e) => setCooperativeSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="reg_number">Nomor Registrasi</Label>
                  <Input
                    id="reg_number"
                    value={cooperativeSettings.registration_number}
                    onChange={(e) => setCooperativeSettings(prev => ({ ...prev, registration_number: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={cooperativeSettings.address}
                  onChange={(e) => setCooperativeSettings(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    value={cooperativeSettings.phone}
                    onChange={(e) => setCooperativeSettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={cooperativeSettings.email}
                    onChange={(e) => setCooperativeSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tax_id">NPWP</Label>
                <Input
                  id="tax_id"
                  value={cooperativeSettings.tax_id}
                  onChange={(e) => setCooperativeSettings(prev => ({ ...prev, tax_id: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={cooperativeSettings.description}
                  onChange={(e) => setCooperativeSettings(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveCooperative}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Pengaturan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_loan">Maksimal Pinjaman</Label>
                  <Input
                    id="max_loan"
                    type="number"
                    value={loanSettings.max_loan_amount}
                    onChange={(e) => setLoanSettings(prev => ({ ...prev, max_loan_amount: Number(e.target.value) }))}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(loanSettings.max_loan_amount)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="min_loan">Minimal Pinjaman</Label>
                  <Input
                    id="min_loan"
                    type="number"
                    value={loanSettings.min_loan_amount}
                    onChange={(e) => setLoanSettings(prev => ({ ...prev, min_loan_amount: Number(e.target.value) }))}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(loanSettings.min_loan_amount)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interest_rate">Suku Bunga Default (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.1"
                    value={loanSettings.default_interest_rate}
                    onChange={(e) => setLoanSettings(prev => ({ ...prev, default_interest_rate: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="processing_fee">Biaya Administrasi (%)</Label>
                  <Input
                    id="processing_fee"
                    type="number"
                    step="0.1"
                    value={loanSettings.processing_fee_rate}
                    onChange={(e) => setLoanSettings(prev => ({ ...prev, processing_fee_rate: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_term">Maksimal Tenor (bulan)</Label>
                  <Input
                    id="max_term"
                    type="number"
                    value={loanSettings.max_loan_term}
                    onChange={(e) => setLoanSettings(prev => ({ ...prev, max_loan_term: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="min_term">Minimal Tenor (bulan)</Label>
                  <Input
                    id="min_term"
                    type="number"
                    value={loanSettings.min_loan_term}
                    onChange={(e) => setLoanSettings(prev => ({ ...prev, min_loan_term: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="penalty">Denda Keterlambatan (%)</Label>
                <Input
                  id="penalty"
                  type="number"
                  step="0.1"
                  value={loanSettings.late_payment_penalty}
                  onChange={(e) => setLoanSettings(prev => ({ ...prev, late_payment_penalty: Number(e.target.value) }))}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveLoan}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Pengaturan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mandatory_savings">Simpanan Wajib</Label>
                  <Input
                    id="mandatory_savings"
                    type="number"
                    value={savingsSettings.mandatory_savings_amount}
                    onChange={(e) => setSavingsSettings(prev => ({ ...prev, mandatory_savings_amount: Number(e.target.value) }))}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(savingsSettings.mandatory_savings_amount)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="min_balance">Saldo Minimal</Label>
                  <Input
                    id="min_balance"
                    type="number"
                    value={savingsSettings.minimum_balance}
                    onChange={(e) => setSavingsSettings(prev => ({ ...prev, minimum_balance: Number(e.target.value) }))}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(savingsSettings.minimum_balance)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="savings_interest">Suku Bunga Simpanan (%)</Label>
                  <Input
                    id="savings_interest"
                    type="number"
                    step="0.1"
                    value={savingsSettings.interest_rate}
                    onChange={(e) => setSavingsSettings(prev => ({ ...prev, interest_rate: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="withdrawal_fee">Biaya Penarikan</Label>
                  <Input
                    id="withdrawal_fee"
                    type="number"
                    value={savingsSettings.withdrawal_fee}
                    onChange={(e) => setSavingsSettings(prev => ({ ...prev, withdrawal_fee: Number(e.target.value) }))}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(savingsSettings.withdrawal_fee)}
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="max_withdrawal">Maksimal Penarikan per Hari</Label>
                <Input
                  id="max_withdrawal"
                  type="number"
                  value={savingsSettings.max_withdrawal_per_day}
                  onChange={(e) => setSavingsSettings(prev => ({ ...prev, max_withdrawal_per_day: Number(e.target.value) }))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(savingsSettings.max_withdrawal_per_day)}
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSavings}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Pengaturan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
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
                    <p className="text-sm text-gray-500">Backup otomatis database</p>
                  </div>
                  <Switch
                    checked={systemSettings.auto_backup}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, auto_backup: checked }))}
                  />
                </div>
                {systemSettings.auto_backup && (
                  <div>
                    <Label htmlFor="backup_freq">Frekuensi Backup</Label>
                    <Select
                      value={systemSettings.backup_frequency}
                      onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backup_frequency: value as any }))}
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
                  <Label htmlFor="session_timeout">Session Timeout (menit)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={systemSettings.session_timeout}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, session_timeout: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-lg font-medium">Notifikasi</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Kirim notifikasi via email</p>
                  </div>
                  <Switch
                    checked={systemSettings.email_notifications}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, email_notifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Kirim notifikasi via SMS</p>
                  </div>
                  <Switch
                    checked={systemSettings.sms_notifications}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, sms_notifications: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-lg font-medium">Maintenance</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mode Maintenance</Label>
                    <p className="text-sm text-gray-500">Nonaktifkan akses sistem untuk maintenance</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenance_mode}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenance_mode: checked }))}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}