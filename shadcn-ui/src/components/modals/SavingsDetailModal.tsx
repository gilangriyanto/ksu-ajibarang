import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  PiggyBank,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  Edit,
  X
} from 'lucide-react';

interface SavingsRecord {
  id: string;
  memberNumber: string;
  memberName: string;
  savingsType: string;
  amount: number;
  balance: number;
  lastTransaction: string;
  status: string;
  description?: string;
  transactions?: Array<{
    date: string;
    type: string;
    amount: number;
    description: string;
  }>;
}

interface SavingsDetailModalProps {
  savings: SavingsRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (savings: SavingsRecord) => void;
}

export function SavingsDetailModal({ savings, isOpen, onClose, onEdit }: SavingsDetailModalProps) {
  if (!savings) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSavingsTypeBadge = (type: string) => {
    switch (type) {
      case 'wajib':
        return <Badge className="bg-blue-100 text-blue-800">Simpanan Wajib</Badge>;
      case 'sukarela':
        return <Badge className="bg-green-100 text-green-800">Simpanan Sukarela</Badge>;
      case 'pokok':
        return <Badge className="bg-purple-100 text-purple-800">Simpanan Pokok</Badge>;
      case 'hariRaya':
        return <Badge className="bg-orange-100 text-orange-800">Simpanan Hari Raya</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Aktif</Badge>
    ) : (
      <Badge variant="secondary">Tidak Aktif</Badge>
    );
  };

  // Mock transaction history
  const mockTransactions = [
    {
      date: '2024-01-28',
      type: 'deposit',
      amount: savings.amount,
      description: 'Setoran rutin'
    },
    {
      date: '2023-12-28',
      type: 'deposit',
      amount: savings.amount,
      description: 'Setoran rutin'
    },
    {
      date: '2023-11-28',
      type: 'deposit',
      amount: savings.amount,
      description: 'Setoran rutin'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <PiggyBank className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Detail Simpanan</DialogTitle>
                <DialogDescription className="flex items-center space-x-2">
                  <span>{savings.memberNumber} - {savings.memberName}</span>
                  {getSavingsTypeBadge(savings.savingsType)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(savings)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
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
                  <p className="font-medium">{savings.memberName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nomor Anggota</p>
                  <p className="font-medium">{savings.memberNumber}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Transaksi Terakhir</p>
                  <p className="font-medium">
                    {new Date(savings.lastTransaction).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{getStatusBadge(savings.status)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PiggyBank className="h-5 w-5" />
                <span>Informasi Simpanan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <PiggyBank className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Jenis Simpanan</p>
                  <p className="font-medium">{getSavingsTypeBadge(savings.savingsType)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Setoran Terakhir</p>
                  <p className="font-medium text-green-600">{formatCurrency(savings.amount)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Saldo</p>
                  <p className="font-medium text-blue-600">{formatCurrency(savings.balance)}</p>
                </div>
              </div>

              {savings.description && (
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Keterangan</p>
                    <p className="font-medium">{savings.description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Saldo Saat Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(savings.balance)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total simpanan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Setoran Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(savings.amount)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(savings.lastTransaction).toLocaleDateString('id-ID')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Total Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {mockTransactions.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Transaksi</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Riwayat Transaksi</span>
            </CardTitle>
            <CardDescription>
              Riwayat setoran simpanan terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      +{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">Setoran</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}