import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, Briefcase, Calendar, UserPlus } from 'lucide-react';

interface NewMember {
  name: string;
  email: string;
  phone: string;
  position: string;
  status: string;
  address: string;
  department: string;
}

interface MemberAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: NewMember) => void;
}

export function MemberAddModal({ isOpen, onClose, onAdd }: MemberAddModalProps) {
  const [formData, setFormData] = useState<NewMember>({
    name: '',
    email: '',
    phone: '',
    position: '',
    status: 'active',
    address: '',
    department: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Jabatan harus diisi';
    }

    if (!formData.status) {
      newErrors.status = 'Status harus dipilih';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Departemen harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onAdd(formData);
      handleClose();
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof NewMember, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      status: 'active',
      address: '',
      department: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Tambah Anggota Baru</span>
          </DialogTitle>
          <DialogDescription>
            Masukkan informasi lengkap untuk mendaftarkan anggota baru
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Informasi Dasar</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="nama@email.com"
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="081234567890"
                    className="pl-10"
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    <SelectItem value="suspended">Ditangguhkan</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status}</p>
                )}
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Informasi Pekerjaan</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor="position">Jabatan *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="Jabatan"
                    className="pl-10"
                  />
                </div>
                {errors.position && (
                  <p className="text-sm text-red-600">{errors.position}</p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Departemen *</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Departemen Medis">Departemen Medis</SelectItem>
                    <SelectItem value="Departemen Perawatan">Departemen Perawatan</SelectItem>
                    <SelectItem value="Departemen Administrasi">Departemen Administrasi</SelectItem>
                    <SelectItem value="Departemen Teknis">Departemen Teknis</SelectItem>
                    <SelectItem value="Departemen Keuangan">Departemen Keuangan</SelectItem>
                    <SelectItem value="Departemen SDM">Departemen SDM</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-red-600">{errors.department}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Alamat lengkap (opsional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menambahkan...</span>
                </div>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Tambah Anggota
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}