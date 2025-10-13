import React, { useState, useEffect } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Download,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { useSavings } from '@/hooks/useSavings';
import { useLoans } from '@/hooks/useLoans';

// Modal Components
const AddMemberModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    initialSavings: '1000000'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { addMember, refetch } = useMembers();
  const { processTransaction } = useSavings();

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      initialSavings: '1000000'
    });
    setSuccess(false);
    setErrorMsg('');
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      setErrorMsg('Nama wajib diisi');
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMsg('No. telepon wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      
      console.log('Starting member creation process...');
      
      // Generate unique member ID
      const timestamp = Date.now();
      const memberId = `A${timestamp.toString().slice(-6)}`;
      
      console.log('Generated member ID:', memberId);
      
      // Add member to database
      const memberPayload = {
        member_id: memberId,
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        address: formData.address.trim() || undefined,
        status: 'active' as const,
        join_date: new Date().toISOString().split('T')[0]
      };

      console.log('Adding member with payload:', memberPayload);
      
      const newMember = await addMember(memberPayload);
      console.log('Member added successfully:', newMember);

      // Create initial savings accounts
      const initialAmount = parseInt(formData.initialSavings) || 0;
      
      try {
        // Create mandatory savings (simpanan pokok)
        console.log('Creating simpanan pokok...');
        await processTransaction({
          member_id: memberId,
          account_type: 'pokok',
          transaction_type: 'deposit',
          amount: 500000, // Fixed amount for simpanan pokok
          description: 'Simpanan pokok anggota baru'
        });

        // Create voluntary savings if amount > 0
        if (initialAmount > 0) {
          console.log('Creating simpanan sukarela...');
          await processTransaction({
            member_id: memberId,
            account_type: 'sukarela',
            transaction_type: 'deposit',
            amount: initialAmount,
            description: 'Simpanan awal anggota baru'
          });
        }
      } catch (savingsError) {
        console.warn('Savings creation failed, but member was created:', savingsError);
        // Don't fail the entire process if savings creation fails
      }

      setSuccess(true);
      console.log('Member creation process completed successfully');
      
      // Refresh data
      await refetch();
      
      // Auto close after success
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error in member creation process:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Gagal menambahkan anggota');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Tambah Anggota Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi anggota baru untuk mendaftar ke koperasi.
          </DialogDescription>
        </DialogHeader>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Anggota berhasil ditambahkan! Modal akan tertutup otomatis...
            </AlertDescription>
          </Alert>
        )}

        {errorMsg && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errorMsg}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-name" className="text-right">Nama Lengkap *</Label>
            <Input 
              id="member-name" 
              className="col-span-3" 
              placeholder="Ahmad Sutanto"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={loading || success}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-email" className="text-right">Email</Label>
            <Input 
              id="member-email" 
              type="email" 
              className="col-span-3" 
              placeholder="ahmad@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={loading || success}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-phone" className="text-right">No. Telepon *</Label>
            <Input 
              id="member-phone" 
              className="col-span-3" 
              placeholder="08123456789"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              disabled={loading || success}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-address" className="text-right">Alamat</Label>
            <Textarea 
              id="member-address" 
              className="col-span-3" 
              placeholder="Jl. Contoh No. 123"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              disabled={loading || success}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="initial-savings" className="text-right">Simpanan Sukarela</Label>
            <Input 
              id="initial-savings" 
              type="number" 
              className="col-span-3" 
              placeholder="1000000"
              value={formData.initialSavings}
              onChange={(e) => setFormData({...formData, initialSavings: e.target.value})}
              disabled={loading || success}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div></div>
            <div className="col-span-3 text-sm text-gray-600">
              * Simpanan pokok Rp 500.000 akan otomatis ditambahkan
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {success ? 'Tutup' : 'Batal'}
          </Button>
          {!success && (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Tambah Anggota'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ViewMemberModal = ({ isOpen, onClose, member }: { isOpen: boolean; onClose: () => void; member: any }) => {
  const [memberStats, setMemberStats] = useState({
    totalSavings: 0,
    activeLoans: 0
  });
  const { getTotalSavings } = useSavings();
  const { getLoansByMember } = useLoans();

  useEffect(() => {
    if (member && isOpen) {
      const totalSavings = getTotalSavings(member.member_id);
      const activeLoans = getLoansByMember(member.member_id).length;
      setMemberStats({ totalSavings, activeLoans });
    }
  }, [member, isOpen, getTotalSavings, getLoansByMember]);

  if (!member) return null;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Detail Anggota - {member.name}</DialogTitle>
          <DialogDescription>
            Informasi lengkap anggota koperasi
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">ID Anggota:</Label>
              <p>{member.member_id}</p>
            </div>
            <div>
              <Label className="font-medium">Status:</Label>
              <Badge className={member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {member.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Email:</Label>
              <p>{member.email || 'Tidak ada'}</p>
            </div>
            <div>
              <Label className="font-medium">No. Telepon:</Label>
              <p>{member.phone || 'Tidak ada'}</p>
            </div>
          </div>
          <div>
            <Label className="font-medium">Alamat:</Label>
            <p>{member.address || 'Tidak ada alamat'}</p>
          </div>
          <div>
            <Label className="font-medium">Total Simpanan:</Label>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(memberStats.totalSavings)}
            </p>
          </div>
          <div>
            <Label className="font-medium">Pinjaman Aktif:</Label>
            <p className="text-lg font-semibold text-orange-600">{memberStats.activeLoans} pinjaman</p>
          </div>
          <div>
            <Label className="font-medium">Tanggal Bergabung:</Label>
            <p>{new Date(member.join_date).toLocaleDateString('id-ID')}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EditMemberModal = ({ isOpen, onClose, member }: { isOpen: boolean; onClose: () => void; member: any }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { updateMember, refetch } = useMembers();

  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || '',
        status: member.status || 'active'
      });
      setSuccess(false);
      setErrorMsg('');
    }
  }, [member, isOpen]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorMsg('Nama wajib diisi');
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMsg('No. telepon wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      
      await updateMember(member.id, {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim(),
        address: formData.address.trim() || null,
        status: formData.status as 'active' | 'inactive'
      });

      setSuccess(true);
      await refetch();
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error updating member:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Gagal mengupdate anggota');
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Anggota - {member.name}</DialogTitle>
          <DialogDescription>
            Ubah informasi anggota koperasi
          </DialogDescription>
        </DialogHeader>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Data anggota berhasil diupdate!
            </AlertDescription>
          </Alert>
        )}

        {errorMsg && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errorMsg}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">Nama Lengkap</Label>
            <Input 
              id="edit-name" 
              className="col-span-3"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={loading || success}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-email" className="text-right">Email</Label>
            <Input 
              id="edit-email" 
              type="email" 
              className="col-span-3"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={loading || success}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-phone" className="text-right">No. Telepon</Label>
            <Input 
              id="edit-phone" 
              className="col-span-3"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              disabled={loading || success}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-address" className="text-right">Alamat</Label>
            <Textarea 
              id="edit-address" 
              className="col-span-3"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              disabled={loading || success}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-status" className="text-right">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({...formData, status: value})}
              disabled={loading || success}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {success ? 'Tutup' : 'Batal'}
          </Button>
          {!success && (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [viewMemberModal, setViewMemberModal] = useState(false);
  const [editMemberModal, setEditMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const { members, loading, error, deleteMember, refetch } = useMembers();
  const { getTotalSavings } = useSavings();
  const { getLoansByMember } = useLoans();

  // Debug logging
  useEffect(() => {
    console.log('MemberManagement - Current state:', {
      membersCount: members.length,
      loading,
      error,
      members: members.slice(0, 3) // Log first 3 members for debugging
    });
  }, [members, loading, error]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      : <Badge className="bg-red-100 text-red-800">Tidak Aktif</Badge>;
  };

  // Filter members based on search term and status
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.member_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewMember = (member: any) => {
    setSelectedMember(member);
    setViewMemberModal(true);
  };

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setEditMemberModal(true);
  };

  const handleDeleteMember = async (member: any) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus anggota ${member.name}?`)) {
      try {
        await deleteMember(member.id);
        await refetch();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Gagal menghapus anggota');
      }
    }
  };

  const handleContactMember = (member: any, type: 'email' | 'phone') => {
    if (type === 'email' && member.email) {
      window.open(`mailto:${member.email}`, '_blank');
    } else if (type === 'phone' && member.phone) {
      window.open(`tel:${member.phone}`, '_blank');
    }
  };

  const handleExport = () => {
    const headers = ['ID Anggota', 'Nama', 'Email', 'Telepon', 'Status', 'Tanggal Bergabung', 'Total Simpanan', 'Pinjaman Aktif'];
    const csvContent = [
      headers.join(','),
      ...filteredMembers.map(member => {
        const totalSavings = getTotalSavings(member.member_id);
        const activeLoans = getLoansByMember(member.member_id).length;
        return [
          member.member_id,
          `"${member.name}"`,
          member.email || '',
          member.phone || '',
          member.status === 'active' ? 'Aktif' : 'Tidak Aktif',
          new Date(member.join_date).toLocaleDateString('id-ID'),
          totalSavings,
          activeLoans
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data-anggota-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics from real data
  const activeMembers = members.filter(m => m.status === 'active').length;
  const inactiveMembers = members.filter(m => m.status === 'inactive').length;
  const totalMembers = members.length;
  
  // Calculate new members this month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const newMembersThisMonth = members.filter(m => 
    m.join_date && m.join_date.startsWith(currentMonth)
  ).length;

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Memuat data anggota...</span>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Connection Status */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Gagal memuat data anggota: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Anggota</h1>
            <p className="text-gray-600 mt-1">Kelola data anggota koperasi</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={refetch}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setAddMemberModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Anggota
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Anggota</p>
                  <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{activeMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserX className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tidak Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{inactiveMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Baru Bulan Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{newMembersThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama, email, atau ID anggota..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
            {(searchTerm || statusFilter !== 'all') && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Menampilkan {filteredMembers.length} dari {totalMembers} anggota
                </span>
                {statusFilter !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    Status: {statusFilter === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="outline" className="text-xs">
                    Pencarian: "{searchTerm}"
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Anggota</CardTitle>
            <CardDescription>
              Menampilkan {filteredMembers.length} dari {totalMembers} anggota
              {loading && " (Memuat...)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ID Anggota</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nama</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Kontak</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Total Simpanan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Pinjaman Aktif</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => {
                      const totalSavings = getTotalSavings(member.member_id);
                      const activeLoans = getLoansByMember(member.member_id).length;
                      
                      return (
                        <tr key={member.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{member.member_id}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-500">
                                Bergabung: {member.join_date ? new Date(member.join_date).toLocaleDateString('id-ID') : 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {member.email && (
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-3 w-3 text-gray-400" />
                                  <button 
                                    className="text-sm text-blue-600 hover:underline"
                                    onClick={() => handleContactMember(member, 'email')}
                                  >
                                    {member.email}
                                  </button>
                                </div>
                              )}
                              {member.phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <button 
                                    className="text-sm text-blue-600 hover:underline"
                                    onClick={() => handleContactMember(member, 'phone')}
                                  >
                                    {member.phone}
                                  </button>
                                </div>
                              )}
                              {!member.email && !member.phone && (
                                <span className="text-sm text-gray-400">Tidak ada kontak</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(member.status)}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatCurrency(totalSavings)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={activeLoans > 0 ? "destructive" : "secondary"}>
                              {activeLoans} pinjaman
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewMember(member)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditMember(member)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteMember(member)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Memuat data anggota...
                          </div>
                        ) : error ? (
                          <div className="text-red-500">
                            Error: {error}
                          </div>
                        ) : searchTerm || statusFilter !== 'all' ? (
                          'Tidak ada anggota yang sesuai dengan filter yang dipilih'
                        ) : (
                          <div>
                            <p>Belum ada data anggota</p>
                            <Button 
                              className="mt-2" 
                              onClick={() => setAddMemberModal(true)}
                            >
                              Tambah Anggota Pertama
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddMemberModal 
        isOpen={addMemberModal} 
        onClose={() => setAddMemberModal(false)}
      />
      <ViewMemberModal 
        isOpen={viewMemberModal} 
        onClose={() => setViewMemberModal(false)}
        member={selectedMember}
      />
      <EditMemberModal 
        isOpen={editMemberModal} 
        onClose={() => setEditMemberModal(false)}
        member={selectedMember}
      />
    </ManagerLayout>
  );
}