import React from 'react';
import { MemberLayout } from '@/components/layout/MemberLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CreditCard,
  Shield,
  Edit,
  Camera,
  PiggyBank,
  TrendingUp
} from 'lucide-react';

export default function Profile() {
  // Mock user data - replace with actual API calls
  const userData = {
    name: 'Ahmad Wijaya',
    email: 'ahmad.wijaya@email.com',
    phone: '+62 812-3456-7890',
    address: 'Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta 10110',
    memberNumber: 'A001',
    joinDate: '2023-01-15',
    status: 'active',
    avatar: null,
    identityNumber: '3171012345678901',
    occupation: 'Wiraswasta',
    monthlyIncome: 15000000,
    emergencyContact: {
      name: 'Siti Wijaya',
      relationship: 'Istri',
      phone: '+62 813-9876-5432'
    },
    bankAccount: {
      bankName: 'Bank Mandiri',
      accountNumber: '1234567890',
      accountName: 'Ahmad Wijaya'
    },
    membershipStats: {
      totalSavings: 6000000,
      totalLoans: 3590000,
      activeSavingsAccounts: 4,
      activeLoans: 1,
      membershipDuration: calculateMembershipDuration('2023-01-15')
    }
  };

  function calculateMembershipDuration(joinDate: string) {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} tahun ${months} bulan`;
    }
    return `${months} bulan`;
  }

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
        return <Badge className="bg-red-100 text-red-800">Tidak Aktif</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Ditangguhkan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
            <p className="text-gray-600 mt-1">Kelola informasi pribadi dan keanggotaan Anda</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profil
          </Button>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData.avatar || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                  {getStatusBadge(userData.status)}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>No. Anggota: {userData.memberNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Bergabung sejak {new Date(userData.joinDate).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Masa keanggotaan: {userData.membershipStats.membershipDuration}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(userData.membershipStats.totalSavings)}
                    </div>
                    <div className="text-xs text-gray-500">Total Simpanan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(userData.membershipStats.totalLoans)}
                    </div>
                    <div className="text-xs text-gray-500">Total Pinjaman</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informasi Pribadi</span>
              </CardTitle>
              <CardDescription>Data pribadi dan kontak</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama Lengkap</label>
                  <p className="mt-1 text-sm text-gray-900">{userData.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">{userData.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Nomor Telepon</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">{userData.phone}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Alamat</label>
                  <div className="mt-1 flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-900">{userData.address}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">NIK</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{userData.identityNumber}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Pekerjaan</label>
                  <p className="mt-1 text-sm text-gray-900">{userData.occupation}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Penghasilan Bulanan</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(userData.monthlyIncome)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact & Bank Info */}
          <div className="space-y-6">
            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Kontak Darurat</span>
                </CardTitle>
                <CardDescription>Kontak yang dapat dihubungi dalam keadaan darurat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama</label>
                  <p className="mt-1 text-sm text-gray-900">{userData.emergencyContact.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hubungan</label>
                  <p className="mt-1 text-sm text-gray-900">{userData.emergencyContact.relationship}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nomor Telepon</label>
                  <p className="mt-1 text-sm text-gray-900">{userData.emergencyContact.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Bank Account */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Rekening Bank</span>
                </CardTitle>
                <CardDescription>Informasi rekening untuk transaksi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama Bank</label>
                  <p className="mt-1 text-sm text-gray-900">{userData.bankAccount.bankName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nomor Rekening</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{userData.bankAccount.accountNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama Pemilik</label>
                  <p className="mt-1 text-sm text-gray-900">{userData.bankAccount.accountName}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Membership Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Statistik Keanggotaan</span>
            </CardTitle>
            <CardDescription>Ringkasan aktivitas dan pencapaian Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto mb-3">
                  <PiggyBank className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {userData.membershipStats.activeSavingsAccounts}
                </div>
                <div className="text-sm text-gray-500">Rekening Simpanan</div>
              </div>
              
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mx-auto mb-3">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {userData.membershipStats.activeLoans}
                </div>
                <div className="text-sm text-gray-500">Pinjaman Aktif</div>
              </div>
              
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {userData.membershipStats.membershipDuration}
                </div>
                <div className="text-sm text-gray-500">Masa Keanggotaan</div>
              </div>
              
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(userData.membershipStats.totalSavings - userData.membershipStats.totalLoans)}
                </div>
                <div className="text-sm text-gray-500">Net Worth</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Keamanan Akun</span>
            </CardTitle>
            <CardDescription>Pengaturan keamanan dan privasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Kata Sandi</h4>
                  <p className="text-sm text-gray-500">Terakhir diubah 3 bulan yang lalu</p>
                </div>
                <Button variant="outline" size="sm">
                  Ubah Password
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Autentikasi Dua Faktor</h4>
                  <p className="text-sm text-gray-500">Tambahan keamanan untuk akun Anda</p>
                </div>
                <Button variant="outline" size="sm">
                  Aktifkan
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Notifikasi Email</h4>
                  <p className="text-sm text-gray-500">Terima pemberitahuan melalui email</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Aktif</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}