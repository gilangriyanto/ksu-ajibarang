import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  X
} from 'lucide-react';

interface Payment {
  id: string;
  memberNumber: string;
  memberName: string;
  paymentType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  method: string;
  reference: string;
  description?: string;
}

interface PaymentDetailModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsPaid?: (payment: Payment) => void;
}

export function PaymentDetailModal({ payment, isOpen, onClose, onMarkAsPaid }: PaymentDetailModalProps) {
  if (!payment) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Lunas</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Terlambat</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Akan Datang</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'upcoming':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case 'loan':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Angsuran Pinjaman</Badge>;
      case 'savings':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Simpanan Wajib</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getDaysOverdue = () => {
    if (payment.status !== 'overdue') return 0;
    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysUntilDue = () => {
    if (payment.status !== 'upcoming') return 0;
    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Detail Pembayaran</DialogTitle>
                <DialogDescription className="flex items-center space-x-2">
                  <span>{payment.memberNumber} - {payment.memberName}</span>
                  {getStatusBadge(payment.status)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {payment.status !== 'paid' && onMarkAsPaid && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkAsPaid(payment)}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tandai Lunas
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Member Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informasi Anggota</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nama Anggota</p>
                  <p className="font-medium">{payment.memberName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nomor Anggota</p>
                  <p className="font-medium">{payment.memberNumber}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Jenis Pembayaran</p>
                  <p className="font-medium">{getPaymentTypeBadge(payment.paymentType)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {getStatusIcon(payment.status)}
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{getStatusBadge(payment.status)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Informasi Pembayaran</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Jumlah</p>
                  <p className="font-medium text-blue-600">{formatCurrency(payment.amount)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Tanggal Jatuh Tempo</p>
                  <p className="font-medium">
                    {new Date(payment.dueDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              {payment.paidDate && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Bayar</p>
                    <p className="font-medium text-green-600">
                      {new Date(payment.paidDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              )}

              {payment.method && (
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Metode Pembayaran</p>
                    <p className="font-medium">
                      {payment.method === 'transfer' ? 'Transfer Bank' : 'Tunai'}
                    </p>
                  </div>
                </div>
              )}

              {payment.reference && (
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">No. Referensi</p>
                    <p className="font-medium font-mono">{payment.reference}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(payment.status)}
              <span>Status Pembayaran</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payment.status === 'paid' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Pembayaran Lunas</h4>
                </div>
                <p className="text-green-700 text-sm">
                  Pembayaran telah diterima pada {new Date(payment.paidDate!).toLocaleDateString('id-ID')} 
                  melalui {payment.method === 'transfer' ? 'transfer bank' : 'tunai'}.
                </p>
              </div>
            )}

            {payment.status === 'overdue' && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium text-red-900">Pembayaran Terlambat</h4>
                </div>
                <p className="text-red-700 text-sm">
                  Pembayaran telah melewati jatuh tempo selama {getDaysOverdue()} hari. 
                  Segera lakukan pembayaran untuk menghindari denda.
                </p>
              </div>
            )}

            {payment.status === 'pending' && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900">Menunggu Verifikasi</h4>
                </div>
                <p className="text-yellow-700 text-sm">
                  Pembayaran sedang dalam proses verifikasi. Mohon tunggu konfirmasi dari admin.
                </p>
              </div>
            )}

            {payment.status === 'upcoming' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Akan Jatuh Tempo</h4>
                </div>
                <p className="text-blue-700 text-sm">
                  Pembayaran akan jatuh tempo dalam {getDaysUntilDue()} hari. 
                  Siapkan pembayaran sebelum tanggal jatuh tempo.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Jumlah Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(payment.amount)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {payment.paymentType === 'loan' ? 'Angsuran' : 'Simpanan'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Jatuh Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {new Date(payment.dueDate).getDate()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(payment.dueDate).toLocaleDateString('id-ID', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                {getStatusIcon(payment.status)}
                <span className="ml-2">Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getStatusBadge(payment.status)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {payment.status === 'paid' ? 'Terbayar' : 
                 payment.status === 'overdue' ? `${getDaysOverdue()} hari terlambat` :
                 payment.status === 'upcoming' ? `${getDaysUntilDue()} hari lagi` : 
                 'Dalam proses'}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}