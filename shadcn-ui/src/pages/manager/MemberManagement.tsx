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
  RefreshCw,
  UserX2
} from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { memberService, type Member, type MemberDetails } from '@/lib/api';
import { AddMemberModal } from '@/components/modals/AddMemberModal';

// ==================== MODAL: VIEW MEMBER ====================
const ViewMemberModal = ({ isOpen, onClose, member }: { isOpen: boolean; onClose: () => void; member: Member | null }) => {
  const [memberDetails, setMemberDetails] = useState<MemberDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member && isOpen) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          const details = await memberService.getMemberById(member.id);
          setMemberDetails(details);
        } catch (err) {
          console.error('Error fetching member details:', err);
          setError(err instanceof Error ? err.message : 'Gagal memuat detail anggota');
        } finally {
          setLoading(false);
        }
      };

      fetchDetails();
    }
  }, [member, isOpen]);

  if (!member) return null;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Anggota - {member.full_name}</DialogTitle>
          <DialogDescription>
            Informasi lengkap anggota koperasi
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Memuat detail anggota...</span>
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && memberDetails && (
          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Informasi Dasar</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium text-gray-600">ID Anggota:</Label>
                  <p className="text-lg font-mono">{memberDetails.profile.employee_id}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">Status:</Label>
                  <div className="mt-1">
                    <Badge className={
                      memberDetails.profile.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : memberDetails.profile.status === 'suspended'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }>
                      {memberDetails.profile.status === 'active' ? 'Aktif' : 
                       memberDetails.profile.status === 'suspended' ? 'Ditangguhkan' : 'Tidak Aktif'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium text-gray-600">Email:</Label>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {memberDetails.profile.email || 'Tidak ada'}
                  </p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">No. Telepon:</Label>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {memberDetails.profile.formatted_phone || memberDetails.profile.phone_number || 'Tidak ada'}
                  </p>
                </div>
              </div>

              <div>
                <Label className="font-medium text-gray-600">Alamat:</Label>
                <p className="text-gray-900">{memberDetails.profile.address || 'Tidak ada alamat'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium text-gray-600">Tanggal Bergabung:</Label>
                  <p>{formatDate(memberDetails.profile.joined_at)}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">Durasi Keanggotaan:</Label>
                  <p>{memberDetails.profile.membership_duration}</p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-4 mt-4">
              <h3 className="font-semibold text-lg border-b pb-2">Ringkasan Keuangan</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Label className="font-medium text-blue-600">Total Simpanan:</Label>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(memberDetails.financial_summary.savings.total)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <Label className="font-medium text-green-600">Posisi Neto:</Label>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(memberDetails.financial_summary.net_position)}
                  </p>
                </div>
              </div>

              {/* Savings Breakdown */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Simpanan Pokok:</Label>
                  <p className="font-semibold">{formatCurrency(memberDetails.financial_summary.savings.principal)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Simpanan Wajib:</Label>
                  <p className="font-semibold">{formatCurrency(memberDetails.financial_summary.savings.mandatory)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Simpanan Sukarela:</Label>
                  <p className="font-semibold">{formatCurrency(memberDetails.financial_summary.savings.voluntary)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Simpanan Hari Raya:</Label>
                  <p className="font-semibold">{formatCurrency(memberDetails.financial_summary.savings.holiday)}</p>
                </div>
              </div>

              {/* Loans Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <Label className="font-medium text-orange-600">Pinjaman Aktif:</Label>
                  <p className="text-2xl font-bold text-orange-800">
                    {memberDetails.financial_summary.loans.active_count} pinjaman
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Label className="font-medium text-purple-600">Sisa Pinjaman:</Label>
                  <p className="text-2xl font-bold text-purple-800">
                    {formatCurrency(memberDetails.financial_summary.loans.remaining_balance)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Total Dipinjam:</Label>
                  <p className="font-semibold">{formatCurrency(memberDetails.financial_summary.loans.total_borrowed)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Cicilan Per Bulan:</Label>
                  <p className="font-semibold">{formatCurrency(memberDetails.financial_summary.loans.monthly_installment)}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4 mt-4">
              <h3 className="font-semibold text-lg border-b pb-2">Statistik</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Total Transaksi Simpanan:</Label>
                  <p className="font-semibold">{memberDetails.statistics.total_savings_transactions}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Total Pinjaman:</Label>
                  <p className="font-semibold">{memberDetails.statistics.total_loans}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Pinjaman Aktif:</Label>
                  <p className="font-semibold">{memberDetails.statistics.active_loans}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Pinjaman Lunas:</Label>
                  <p className="font-semibold">{memberDetails.statistics.completed_loans}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ==================== MODAL: EDIT MEMBER ====================
const EditMemberModal = ({ isOpen, onClose, member }: { isOpen: boolean; onClose: () => void; member: Member | null }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { refetch } = useMembers();

  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        employee_id: member.employee_id || '',
        full_name: member.full_name || '',
        email: member.email || '',
        phone_number: member.phone_number || '',
        address: member.address || '',
        status: member.status || 'active'
      });
      setSuccess(false);
      setErrorMsg('');
    }
  }, [member, isOpen]);

  const handleSave = async () => {
    if (!member) return;

    if (!formData.full_name.trim()) {
      setErrorMsg('Nama wajib diisi');
      return;
    }

    if (!formData.phone_number.trim()) {
      setErrorMsg('No. telepon wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      
      await memberService.updateMember(member.id, {
        employee_id: formData.employee_id.trim() || undefined,
        full_name: formData.full_name.trim(),
        email: formData.email.trim() || null,
        phone_number: formData.phone_number.trim(),
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
          <DialogTitle>Edit Anggota - {member.full_name}</DialogTitle>
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
            <Label htmlFor="edit-employee-id" className="text-right">ID Anggota</Label>
            <Input 
              id="edit-employee-id" 
              className="col-span-3 font-mono"
              value={formData.employee_id}
              onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
              disabled={loading || success}
              placeholder="Kosongkan jika tidak ingin diubah"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">Nama Lengkap</Label>
            <Input 
              id="edit-name" 
              className="col-span-3"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
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
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
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
                <SelectItem value="suspended">Ditangguhkan</SelectItem>
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

// ==================== MAIN COMPONENT ====================
export default function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [viewMemberModal, setViewMemberModal] = useState(false);
  const [editMemberModal, setEditMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { members, loading, error, statistics, refetch } = useMembers();

  // Debug logging
  useEffect(() => {
    console.log('MemberManagement - Current state:', {
      membersCount: members.length,
      loading,
      error,
      statistics,
      members: members.slice(0, 3) // Log first 3 members for debugging
    });
  }, [members, loading, error, statistics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
    } else if (status === 'suspended') {
      return <Badge className="bg-yellow-100 text-yellow-800">Ditangguhkan</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Tidak Aktif</Badge>;
    }
  };

  // Filter members based on search term and status
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setViewMemberModal(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setEditMemberModal(true);
  };

  const handleDeleteMember = async (member: Member) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus anggota ${member.full_name}?`)) {
      try {
        // TODO: Implement when backend provides DELETE endpoint
        alert('Fitur hapus anggota belum tersedia di backend');
        // await deleteMember(member.id);
        // await refetch();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Gagal menghapus anggota');
      }
    }
  };

  const handleContactMember = (member: Member, type: 'email' | 'phone') => {
    if (type === 'email' && member.email) {
      window.open(`mailto:${member.email}`, '_blank');
    } else if (type === 'phone' && member.phone_number) {
      window.open(`tel:${member.phone_number}`, '_blank');
    }
  };

  const handleExport = () => {
    const headers = ['ID Anggota', 'Nama', 'Email', 'Telepon', 'Status', 'Tanggal Bergabung'];
    const csvContent = [
      headers.join(','),
      ...filteredMembers.map(member => {
        return [
          member.employee_id,
          `"${member.full_name}"`,
          member.email || '',
          member.phone_number || '',
          member.status === 'active' ? 'Aktif' : member.status === 'suspended' ? 'Ditangguhkan' : 'Tidak Aktif',
          new Date(member.joined_at).toLocaleDateString('id-ID')
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

  // Calculate statistics from data
  const totalMembers = statistics?.total_members || members.length;
  const activeMembers = statistics?.active_members || members.filter(m => m.status === 'active').length;
  const inactiveMembers = statistics?.inactive_members || members.filter(m => m.status === 'inactive').length;
  const suspendedMembers = statistics?.suspended_members || members.filter(m => m.status === 'suspended').length;
  const newMembersThisMonth = statistics?.new_members_this_month || 0;

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
              {error}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <UserX2 className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ditangguhkan</p>
                  <p className="text-2xl font-bold text-gray-900">{suspendedMembers}</p>
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
                    placeholder="Cari nama, email, telepon, atau ID anggota..."
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
                    <SelectItem value="suspended">Ditangguhkan</SelectItem>
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
                    Status: {statusFilter === 'active' ? 'Aktif' : statusFilter === 'suspended' ? 'Ditangguhkan' : 'Tidak Aktif'}
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Durasi Keanggotaan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium font-mono">{member.employee_id}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{member.full_name}</p>
                            <p className="text-sm text-gray-500">
                              Bergabung: {new Date(member.joined_at).toLocaleDateString('id-ID')}
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
                            {member.phone_number && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <button 
                                  className="text-sm text-blue-600 hover:underline"
                                  onClick={() => handleContactMember(member, 'phone')}
                                >
                                  {member.formatted_phone || member.phone_number}
                                </button>
                              </div>
                            )}
                            {!member.email && !member.phone_number && (
                              <span className="text-sm text-gray-400">Tidak ada kontak</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{member.membership_duration || '-'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewMember(member)}
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditMember(member)}
                              title="Edit Anggota"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteMember(member)}
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
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
                          'Belum ada data anggota'
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