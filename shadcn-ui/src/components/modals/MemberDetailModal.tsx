import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  CreditCard,
  PiggyBank,
  TrendingUp,
  DollarSign,
  FileText,
  Edit,
  X
} from 'lucide-react';

interface Member {
  id: string;
  memberNumber: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  joinDate: string;
  status: string;
  totalSavings: number;
  totalLoans: number;
  address?: string;
  department?: string;
}

interface MemberDetailModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (member: Member) => void;
}

export function MemberDetailModal({ member, isOpen, onClose, onEdit }: MemberDetailModalProps) {
  if (!member) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Tidak Aktif</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Ditangguhkan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Mock additional data for detailed view
  const memberDetails = {
    ...member,
    address: member.address || 'Jl. Merdeka No. 123, Jakarta Pusat',
    department: member.department || 'Departemen Medis',
    lastLogin: '2024-01-28 14:30:00',
    serviceFee: 2500000, // Mock service fee
    loanBalance: member.totalLoans * 0.7, // Mock remaining loan balance
    savingsBreakdown: {
      wajib: Math.floor(member.totalSavings * 0.3),
      sukarela: Math.floor(member.totalSavings * 0.4),
      pokok: Math.floor(member.totalSavings * 0.2),
      hariRaya: Math.floor(member.totalSavings * 0.1)
    },
    loanHistory: [
      {
        id: '1',
        amount: member.totalLoans,
        purpose: 'Renovasi Rumah',
        status: 'active',
        remaining: member.totalLoans * 0.7
      }
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{memberDetails.name}</DialogTitle>
                <DialogDescription className="flex items-center space-x-2">
                  <span>No. Anggota: {memberDetails.memberNumber}</span>
                  {getStatusBadge(memberDetails.status)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(member)}
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
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informasi Pribadi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{memberDetails.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Telepon</p>
                  <p className="font-medium">{memberDetails.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="font-medium">{memberDetails.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Informasi Pekerjaan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Jabatan</p>
                  <p className="font-medium">{memberDetails.position}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Departemen</p>
                  <p className="font-medium">{memberDetails.department}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Tanggal Bergabung</p>
                  <p className="font-medium">
                    {new Date(memberDetails.joinDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <PiggyBank className="h-4 w-4 mr-2" />
                Total Simpanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(memberDetails.totalSavings)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Akumulasi simpanan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Pinjaman Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(memberDetails.loanBalance)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Sisa pinjaman</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Jasa Pelayanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(memberDetails.serviceFee)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Bulan ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Savings Breakdown */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PiggyBank className="h-5 w-5 text-green-600" />
              <span>Detail Simpanan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Simpanan Wajib</p>
                <p className="font-medium text-green-600">{formatCurrency(memberDetails.savingsBreakdown.wajib)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Simpanan Sukarela</p>
                <p className="font-medium text-green-600">{formatCurrency(memberDetails.savingsBreakdown.sukarela)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Simpanan Pokok</p>
                <p className="font-medium text-green-600">{formatCurrency(memberDetails.savingsBreakdown.pokok)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Simpanan Hari Raya</p>
                <p className="font-medium text-green-600">{formatCurrency(memberDetails.savingsBreakdown.hariRaya)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Aksi Cepat</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" size="sm" className="h-auto py-3">
                <div className="text-center">
                  <PiggyBank className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs">Tambah Simpanan</div>
                </div>
              </Button>
              <Button variant="outline" size="sm" className="h-auto py-3">
                <div className="text-center">
                  <CreditCard className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs">Ajukan Pinjaman</div>
                </div>
              </Button>
              <Button variant="outline" size="sm" className="h-auto py-3">
                <div className="text-center">
                  <FileText className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs">Lihat Riwayat</div>
                </div>
              </Button>
              <Button variant="outline" size="sm" className="h-auto py-3">
                <div className="text-center">
                  <DollarSign className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs">Bayar Angsuran</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}