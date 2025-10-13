import React, { useEffect, useState } from 'react';
import { MemberLayout } from '@/components/layout/MemberLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp,
  PiggyBank,
  Banknote,
  Calculator,
  AlertCircle,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { useSavings } from '@/hooks/useSavings';
import { useLoans } from '@/hooks/useLoans';
import { useServiceFees } from '@/hooks/useServiceFees';

// For demo purposes, we'll use a sample member ID
// In a real app, this would come from authentication/session
const SAMPLE_MEMBER_ID = 'A001';

export default function MemberDashboard() {
  const { members, loading: membersLoading, error: membersError } = useMembers();
  const { savingsAccounts, savingsTransactions, loading: savingsLoading, error: savingsError } = useSavings();
  const { loans, loading: loansLoading, error: loansError } = useLoans();
  const { serviceFees, loading: feesLoading, error: feesError } = useServiceFees();

  const [memberStats, setMemberStats] = useState({
    memberInfo: null as any,
    totalSavings: 0,
    savingsByType: {
      pokok: 0,
      wajib: 0,
      sukarela: 0
    },
    recentTransactions: [] as any[],
    activeLoans: [] as any[],
    totalLoanAmount: 0,
    serviceFees: [] as any[],
    pendingServiceFees: 0,
    paidServiceFeesThisMonth: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateMemberStats = () => {
    try {
      console.log('=== CALCULATING MEMBER DASHBOARD STATS ===');
      console.log('Member ID:', SAMPLE_MEMBER_ID);

      // Find member info
      const memberInfo = members.find(m => m.member_id === SAMPLE_MEMBER_ID);
      
      // Calculate savings by type
      const memberSavingsAccounts = savingsAccounts.filter(acc => acc.member_id === SAMPLE_MEMBER_ID);
      
      const savingsByType = {
        pokok: memberSavingsAccounts.find(acc => acc.account_type === 'pokok')?.balance || 0,
        wajib: memberSavingsAccounts.find(acc => acc.account_type === 'wajib')?.balance || 0,
        sukarela: memberSavingsAccounts.find(acc => acc.account_type === 'sukarela')?.balance || 0
      };
      
      const totalSavings = Object.values(savingsByType).reduce((sum, amount) => sum + amount, 0);

      // Get recent transactions (last 5)
      const recentTransactions = savingsTransactions
        .filter(t => t.member_id === SAMPLE_MEMBER_ID)
        .slice(0, 5);

      // Get active loans
      const activeLoans = loans.filter(l => 
        l.member_id === SAMPLE_MEMBER_ID && l.status === 'active'
      );
      
      const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + (loan.remaining_balance || 0), 0);

      // Get service fees
      const memberServiceFees = serviceFees.filter(sf => sf.member_id === SAMPLE_MEMBER_ID);
      const pendingServiceFees = memberServiceFees.filter(sf => sf.status === 'pending').length;
      
      // Service fees paid this month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const paidServiceFeesThisMonth = memberServiceFees
        .filter(sf => sf.status === 'paid' && sf.period?.startsWith(currentMonth.replace('-', '-')))
        .reduce((sum, sf) => sum + sf.net_amount, 0);

      const stats = {
        memberInfo,
        totalSavings,
        savingsByType,
        recentTransactions,
        activeLoans,
        totalLoanAmount,
        serviceFees: memberServiceFees,
        pendingServiceFees,
        paidServiceFeesThisMonth
      };

      console.log('Calculated member stats:', stats);
      setMemberStats(stats);
      setError(null);
    } catch (err) {
      console.error('Error calculating member stats:', err);
      setError('Gagal menghitung statistik anggota');
    }
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      calculateMemberStats();
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    // Calculate stats when all data is loaded
    if (!membersLoading && !savingsLoading && !loansLoading && !feesLoading) {
      calculateMemberStats();
      setLoading(false);
    }
  }, [
    members, savingsAccounts, savingsTransactions, loans, serviceFees,
    membersLoading, savingsLoading, loansLoading, feesLoading
  ]);

  // Check for any loading state
  const isLoading = loading || membersLoading || savingsLoading || loansLoading || feesLoading;

  // Check for any errors
  const hasError = membersError || savingsError || loansError || feesError;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Memuat data dashboard...</span>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Anggota</h1>
            {memberStats.memberInfo && (
              <p className="text-gray-600 mt-1">
                Selamat datang, {memberStats.memberInfo.name} ({memberStats.memberInfo.member_id})
              </p>
            )}
          </div>
          <Button 
            variant="outline"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Error Alert */}
        {hasError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Ada error saat memuat data: {hasError}
            </AlertDescription>
          </Alert>
        )}

        {/* Member Info Card */}
        {memberStats.memberInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Anggota</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID Anggota</p>
                  <p className="font-semibold">{memberStats.memberInfo.member_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={memberStats.memberInfo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {memberStats.memberInfo.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Bergabung</p>
                  <p className="font-semibold">{formatDate(memberStats.memberInfo.join_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Savings Overview */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ringkasan Simpanan</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <PiggyBank className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Simpanan</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(memberStats.totalSavings)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Banknote className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Simpanan Pokok</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(memberStats.savingsByType.pokok)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calculator className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Simpanan Wajib</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(memberStats.savingsByType.wajib)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Simpanan Sukarela</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(memberStats.savingsByType.sukarela)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loans and Service Fees */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-red-600" />
                Ringkasan Pinjaman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Pinjaman Aktif</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {memberStats.activeLoans.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total Outstanding</span>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(memberStats.totalLoanAmount)}
                  </span>
                </div>
                {memberStats.activeLoans.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-2">Pinjaman Aktif:</p>
                    {memberStats.activeLoans.map((loan) => (
                      <div key={loan.id} className="flex justify-between text-sm">
                        <span>{loan.loan_id}</span>
                        <span className="font-medium">{formatCurrency(loan.remaining_balance)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                Jasa Pelayanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Belum Dibayar</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {memberStats.pendingServiceFees}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Dibayar Bulan Ini</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(memberStats.paidServiceFeesThisMonth)}
                  </span>
                </div>
                {memberStats.serviceFees.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-2">Riwayat Terbaru:</p>
                    {memberStats.serviceFees.slice(0, 3).map((fee) => (
                      <div key={fee.id} className="flex justify-between text-sm">
                        <span>{fee.period}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{formatCurrency(fee.net_amount)}</span>
                          {fee.status === 'paid' ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Clock className="h-3 w-3 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>
              5 transaksi simpanan terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            {memberStats.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {memberStats.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {transaction.transaction_type === 'deposit' ? 'Setoran' : 'Penarikan'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(transaction.transaction_date)} • {transaction.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'deposit' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Saldo: {formatCurrency(transaction.balance_after)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Belum ada transaksi
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}