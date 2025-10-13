import React, { useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  PiggyBank, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Plus,
  Eye,
  ArrowRight,
  UserPlus,
  Download
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Modal Components
const AddMemberModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Anggota Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi anggota baru di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nama</Label>
            <Input id="name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Telepon</Label>
            <Input id="phone" className="col-span-3" />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onClose}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const LoanApprovalModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Persetujuan Pinjaman</DialogTitle>
          <DialogDescription>
            Review dan setujui pengajuan pinjaman berikut.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Pemohon</Label>
            <div className="col-span-3 font-medium">Ahmad Sutanto</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Jumlah</Label>
            <div className="col-span-3 font-medium">Rp 5.000.000</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tujuan</Label>
            <div className="col-span-3">Renovasi Rumah</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">Catatan</Label>
            <Textarea id="notes" className="col-span-3" placeholder="Catatan persetujuan..." />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Tolak</Button>
          <Button onClick={onClose}>Setujui</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [loanApprovalModal, setLoanApprovalModal] = useState(false);

  // Mock data matching the images
  const dashboardData = {
    totalMembers: 10,
    newMembersThisMonth: 8,
    totalSavings: 125000000,
    totalLoans: 85000000,
    activeLoans: 45,
    pendingApplications: 12,
    overduePayments: 3,
    monthlyTransactions: 324,
    recentActivities: [
      {
        id: '1',
        type: 'member_registration',
        description: 'Anggota baru: Dewi Sartika',
        time: '2 jam yang lalu',
        status: 'success'
      },
      {
        id: '2',
        type: 'loan_application',
        description: 'Pengajuan pinjaman Rp 5.000.000 dari Ahmad Sutanto',
        time: '4 jam yang lalu',
        status: 'pending'
      },
      {
        id: '3',
        type: 'payment',
        description: 'Pembayaran cicilan Rp 235.000 dari Siti Rahayu',
        time: '6 jam yang lalu',
        status: 'success'
      }
    ],
    pendingTasks: [
      {
        id: '1',
        title: 'Review pengajuan pinjaman',
        count: 5,
        priority: 'high',
        action: () => navigate('/manager/loans')
      },
      {
        id: '2',
        title: 'Verifikasi anggota baru',
        count: 3,
        priority: 'medium',
        action: () => navigate('/manager/members')
      },
      {
        id: '3',
        title: 'Generate laporan bulanan',
        count: 1,
        priority: 'low',
        action: () => navigate('/manager/reports')
      }
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_registration':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'loan_application':
        return <CreditCard className="h-4 w-4 text-orange-600" />;
      case 'payment':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Berhasil</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang, Manager!</h1>
          <p className="text-gray-600">Berikut adalah ringkasan aktivitas koperasi hari ini</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/manager/members')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Anggota</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.totalMembers}</p>
                  <p className="text-xs text-green-600">+{dashboardData.newMembersThisMonth} bulan ini</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/manager/savings')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <PiggyBank className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Simpanan</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.totalSavings)}</p>
                  <p className="text-xs text-green-600">↗ 12% dari bulan lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/manager/loans')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pinjaman Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.activeLoans}</p>
                  <p className="text-xs text-orange-600">{dashboardData.pendingApplications} pengajuan pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/manager/reports')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Transaksi Bulan Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.monthlyTransactions}</p>
                  <p className="text-xs text-purple-600">↗ 8% dari bulan lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Akses fitur utama dengan cepat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2 hover:bg-blue-50"
                onClick={() => setAddMemberModal(true)}
              >
                <UserPlus className="h-6 w-6" />
                <span className="text-sm">Tambah Anggota</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2 hover:bg-green-50"
                onClick={() => setLoanApprovalModal(true)}
              >
                <CheckCircle className="h-6 w-6" />
                <span className="text-sm">Review Pinjaman</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2 hover:bg-purple-50"
                onClick={() => navigate('/manager/savings')}
              >
                <PiggyBank className="h-6 w-6" />
                <span className="text-sm">Kelola Simpanan</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2 hover:bg-orange-50"
                onClick={() => navigate('/manager/reports')}
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Generate Laporan</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tugas Pending</CardTitle>
                  <CardDescription>Tugas yang memerlukan perhatian Anda</CardDescription>
                </div>
                <Badge className="bg-red-100 text-red-800">
                  {dashboardData.pendingTasks.reduce((sum, task) => sum + task.count, 0)} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.pendingTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`p-4 border-l-4 rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${getPriorityColor(task.priority)}`}
                    onClick={task.action}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600">{task.count} item menunggu</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Aktivitas Terbaru</CardTitle>
                  <CardDescription>Aktivitas terbaru di sistem</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/manager/reports')}>
                  Lihat Semua
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {dashboardData.overduePayments > 0 && (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-800">Perhatian: Pembayaran Terlambat</h3>
                  <p className="text-sm text-red-700">
                    Ada {dashboardData.overduePayments} anggota dengan pembayaran yang terlambat. 
                    Segera lakukan tindak lanjut.
                  </p>
                </div>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => navigate('/manager/loans')}
                >
                  Lihat Detail
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <AddMemberModal 
        isOpen={addMemberModal} 
        onClose={() => setAddMemberModal(false)}
      />
      <LoanApprovalModal 
        isOpen={loanApprovalModal} 
        onClose={() => setLoanApprovalModal(false)}
      />
    </ManagerLayout>
  );
}