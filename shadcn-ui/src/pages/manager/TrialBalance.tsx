import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search
} from 'lucide-react';
import { TrialBalanceData } from '@/types/financial-reports';
import { generateMockTrialBalance } from '@/lib/financial-reports';

interface Period {
  id: string;
  year: number;
  month: number;
  status: 'open' | 'closed';
}

const mockPeriods: Period[] = [
  { id: '1', year: 2024, month: 1, status: 'closed' },
  { id: '2', year: 2024, month: 2, status: 'open' },
];

export default function TrialBalance() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2');
  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const loadTrialBalance = async () => {
    setIsLoading(true);
    try {
      const data = generateMockTrialBalance(selectedPeriod);
      setTrialBalanceData(data);
    } catch (error) {
      console.error('Error loading trial balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrialBalance();
  }, [selectedPeriod]);

  const selectedPeriodData = mockPeriods.find(p => p.id === selectedPeriod);

  const filteredAccounts = trialBalanceData?.accounts.filter(account =>
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getAccountTypeBadge = (type: string) => {
    const variants = {
      asset: 'bg-blue-100 text-blue-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-green-100 text-green-800',
      revenue: 'bg-purple-100 text-purple-800',
      expense: 'bg-orange-100 text-orange-800',
    };

    const labels = {
      asset: 'Aset',
      liability: 'Liabilitas',
      equity: 'Ekuitas',
      revenue: 'Pendapatan',
      expense: 'Beban',
    };

    return (
      <Badge className={variants[type as keyof typeof variants]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!trialBalanceData) return;
    
    let csvContent = `
Neraca Saldo
Periode: ${trialBalanceData.period_name}
Generated: ${new Date(trialBalanceData.generated_at).toLocaleDateString('id-ID')}

Kode Akun,Nama Akun,Jenis,Debit,Kredit
`;

    trialBalanceData.accounts.forEach(account => {
      csvContent += `${account.account_code},${account.account_name},${account.account_type},${account.debit_balance},${account.credit_balance}\n`;
    });

    csvContent += `\nTotal,,,${trialBalanceData.total_debits},${trialBalanceData.total_credits}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neraca_saldo_${trialBalanceData.period_name.replace(' ', '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Neraca Saldo</h1>
          <p className="text-gray-600">Trial Balance - Daftar saldo semua akun</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadTrialBalance} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleExport} disabled={!trialBalanceData}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Pilih Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="period">Periode Akuntansi</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  {mockPeriods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {getMonthName(period.month)} {period.year}
                      {period.status === 'open' && (
                        <Badge variant="outline" className="ml-2">Open</Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {trialBalanceData && (
              <Badge className={trialBalanceData.is_balanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {trialBalanceData.is_balanced ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Balanced
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Not Balanced
                  </>
                )}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trial Balance */}
      {trialBalanceData && (
        <div className="print:shadow-none">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">NERACA SALDO</CardTitle>
              <CardTitle className="text-xl">KOPERASI RUMAH SAKIT SEJAHTERA</CardTitle>
              <CardDescription className="text-lg">
                Per {trialBalanceData.period_name}
              </CardDescription>
              <p className="text-sm text-gray-500">
                Generated on {new Date(trialBalanceData.generated_at).toLocaleDateString('id-ID')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari akun..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                {/* Accounts Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Akun</TableHead>
                      <TableHead>Nama Akun</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Kredit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.account_code}>
                        <TableCell className="font-mono">{account.account_code}</TableCell>
                        <TableCell className="font-medium">{account.account_name}</TableCell>
                        <TableCell>{getAccountTypeBadge(account.account_type)}</TableCell>
                        <TableCell className="text-right font-mono">
                          {account.debit_balance > 0 ? formatCurrency(account.debit_balance) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {account.credit_balance > 0 ? formatCurrency(account.credit_balance) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow className="border-t-2 border-gray-300 font-bold bg-gray-50">
                      <TableCell colSpan={3} className="text-center">TOTAL</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(trialBalanceData.total_debits)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(trialBalanceData.total_credits)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Balance Check */}
                <div className={`mt-6 p-4 rounded-lg border ${
                  trialBalanceData.is_balanced 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold flex items-center">
                      {trialBalanceData.is_balanced ? (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                          Neraca Saldo Seimbang
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
                          Neraca Saldo Tidak Seimbang
                        </>
                      )}
                    </span>
                    <span className={`font-mono font-bold ${
                      trialBalanceData.is_balanced ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Selisih: {formatCurrency(Math.abs(trialBalanceData.total_debits - trialBalanceData.total_credits))}
                    </span>
                  </div>
                </div>

                {/* Summary by Account Type */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
                  {['asset', 'liability', 'equity', 'revenue', 'expense'].map(type => {
                    const typeAccounts = trialBalanceData.accounts.filter(acc => acc.account_type === type);
                    const totalDebit = typeAccounts.reduce((sum, acc) => sum + acc.debit_balance, 0);
                    const totalCredit = typeAccounts.reduce((sum, acc) => sum + acc.credit_balance, 0);
                    
                    return (
                      <div key={type} className="text-center p-3 bg-white rounded border">
                        {getAccountTypeBadge(type)}
                        <div className="mt-2 text-sm">
                          <div className="font-mono">D: {formatCurrency(totalDebit)}</div>
                          <div className="font-mono">K: {formatCurrency(totalCredit)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}