import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, Briefcase, Calendar } from 'lucide-react';

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

interface MemberEditModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => void;
}

export function MemberEditModal({ member, isOpen, onClose, onSave }: MemberEditModalProps) {
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        ...member,
        address: member.address || 'Jl. Merdeka No. 123, Jakarta Pusat',
        department: member.department || 'Departemen Medis'
      });
    }
  }, [member]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi';
    }

    if (!formData.position?.trim()) {
      newErrors.position = 'Jabatan harus diisi';
    }

    if (!formData.status) {
      newErrors.status = 'Status harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !member) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedMember: Member = {
        ...member,
        ...formData as Member
      };
      
      onSave(updatedMember);
      onClose();
    } catch (error) {
      console.error('Error updating member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Member, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Edit Anggota</span>
          </DialogTitle>
          <DialogDescription>
            Ubah informasi anggota {member.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Member Number (Read Only) */}
            <div className="space-y-2">
              <Label htmlFor="memberNumber">Nomor Anggota</Label>
              <Input
                id="memberNumber"
                value={formData.memberNumber || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Masukkan nama lengkap"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="nama@email.com"
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="081234567890"
                  className="pl-10"
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Jabatan *</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="position"
                  value={formData.position || ''}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Jabatan"
                  className="pl-10"
                />
              </div>
              {errors.position && (
                <p className="text-sm text-red-600">{errors.position}</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Departemen</Label>
              <Input
                id="department"
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Departemen"
              />
            </div>

            {/* Join Date (Read Only) */}
            <div className="space-y-2">
              <Label htmlFor="joinDate">Tanggal Bergabung</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="joinDate"
                  value={formData.joinDate ? new Date(formData.joinDate).toLocaleDateString('id-ID') : ''}
                  disabled
                  className="bg-gray-50 pl-10"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Alamat lengkap"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menyimpan...</span>
                </div>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}