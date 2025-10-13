import React, { useState } from 'react';
import { MemberLayout } from '@/components/layout/MemberLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign,
  TrendingDown,
  Calculator,
  Calendar,
  FileText,
  Download,
  Eye
} from 'lucide-react';

export default function PayrollView() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Mock data for current member (A001)
  const memberPayroll = [
    {
      id: 'PR001',
      serviceFee: 2000000,
      loanDeduction: 485000,
      netAmount: 1515000,
      month: '2024-01',
      status: 'paid',
      loanDetails: [
        { id: 'L001', type: 'Pinjaman Reguler', monthlyPayment: 235000 },
        { id: 'L004', type: 'Pinjaman Darurat', monthlyPayment: 250000 }
      ]
    },
    {
      id: 'PR005',
      serviceFee: 2000000,
      loanDeduction: 485000,
      netAmount: 1515000,
      month: '2023-12',
      status: 'paid',
      loanDetails: [
        { id: 'L001', type: 'Pinjaman Reguler', monthlyPayment: 235000 },
        { id: 'L004', type: 'Pinjaman Darurat', monthlyPayment: 250000 }
      ]
    },
    {
      id: 'PR006',
      serviceFee: 1800000,
      loanDeduction: 235000,
      netAmount: 1565000,
      month: '2023-11',
      status: 'paid',
      loanDetails: [
        { id: 'L001', type: 'Pinjaman Reguler', monthlyPayment: 235000 }
      ]
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    return status === 'paid' ? (
      <Badge className="bg-green-100 text-green-800">Sudah Dibayar</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Belum Dibayar</Badge>
    );
  };

  const handleDownloadSlip = (payroll: any) => {
    const csvContent = `Slip Jasa Pelayanan\nPeriode: ${new Date(payroll.month).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}\nNama: Ahmad Sutanto\nID: A001\n\nRincian:\nJasa Pelayanan Bruto,${formatCurrency(payroll.serviceFee)}\nPotongan Angsuran,${formatCurrency(payroll.loanDeduction)}\nJasa Pelayanan Netto,${formatCurrency(payroll.netAmount)}\n\nDetail Potongan:\n${payroll.loanDetails.map((loan: any) => `${loan.id} - ${loan.type}: ${formatCurrency(loan.monthlyPayment)}`).join('\n')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `slip-gaji-${payroll.month}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentPayroll = memberPayroll.find(p => p.month === selectedMonth);
  const filteredPayroll = memberPayroll.filter(p => p.month <= selectedMonth).slice(0, 6);

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jasa Pelayanan Saya</h1>
            <p className="text-gray-600 mt-1">Lihat rincian jasa pelayanan dan potongan angsuran</p>
          </div>
          <div className="w-48">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        {/* Current Month Summary */}
        {currentPayroll ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Jasa Pelayanan Bruto</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(currentPayroll.serviceFee)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Potongan Angsuran</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(currentPayroll.loanDeduction)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calculator className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Jasa Pelayanan Netto</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(currentPayroll.netAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada data</h3>
              <p className="mt-1 text-sm text-gray-500">
                Belum ada data jasa pelayanan untuk periode {new Date(selectedMonth).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Current Month Detail */}
        {currentPayroll && (
          <Card>
            <CardHeader>
              <CardTitle>Rincian Jasa Pelayanan</CardTitle>
              <CardDescription>
                Periode: {new Date(currentPayroll.month).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-700">Jasa Pelayanan Bruto</span>
                  <span className="font-bold text-green-700 text-lg">
                    {formatCurrency(currentPayroll.serviceFee)}
                  </span>
                </div>
                
                {currentPayroll.loanDetails.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium text-gray-700">Potongan Angsuran:</p>
                    {currentPayroll.loanDetails.map((loan: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded">
                        <span className="text-red-700">{loan.id} - {loan.type}</span>
                        <span className="font-medium text-red-700">
                          -{formatCurrency(loan.monthlyPayment)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <span className="font-bold text-blue-700">Jasa Pelayanan Netto</span>
                  <span className="font-bold text-blue-700 text-xl">
                    {formatCurrency(currentPayroll.netAmount)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    {getStatusBadge(currentPayroll.status)}
                  </div>
                  <Button onClick={() => handleDownloadSlip(currentPayroll)}>
                    <Download className="w-4 h-4 mr-2" />
                    Unduh Slip
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Jasa Pelayanan</CardTitle>
            <CardDescription>
              Menampilkan 6 periode terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Periode</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Jasa Pelayanan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Potongan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Netto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayroll.map((payroll) => (
                    <tr key={payroll.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(payroll.month).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
                      </td>
                      <td className="py-3 px-4 font-medium text-green-600">
                        {formatCurrency(payroll.serviceFee)}
                      </td>
                      <td className="py-3 px-4 font-medium text-red-600">
                        {formatCurrency(payroll.loanDeduction)}
                      </td>
                      <td className="py-3 px-4 font-medium text-blue-600">
                        {formatCurrency(payroll.netAmount)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(payroll.status)}
                      </td>
                      <td className="py-3 px-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadSlip(payroll)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}