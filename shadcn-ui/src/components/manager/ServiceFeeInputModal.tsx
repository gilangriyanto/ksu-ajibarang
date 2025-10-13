import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertCircle } from 'lucide-react';

interface ServiceFeeInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ServiceFeeData) => void;
}

interface ServiceFeeData {
  memberNumber: string;
  memberName: string;
  serviceFee: number;
  month: string;
  year: number;
}

export function ServiceFeeInputModal({ open, onOpenChange, onSubmit }: ServiceFeeInputModalProps) {
  const [formData, setFormData] = useState<ServiceFeeData>({
    memberNumber: '',
    memberName: '',
    serviceFee: 0,
    month: '',
    year: new Date().getFullYear()
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock member data for autocomplete
  const mockMembers = [
    { number: 'M001', name: 'Dr. Ahmad Santoso' },
    { number: 'M002', name: 'Siti Nurhaliza' },
    { number: 'M003', name: 'Budi Prasetyo' },
    { number: 'M004', name: 'Dr. Sarah Wijaya' },
    { number: 'M005', name: 'Andi Kurniawan' },
    { number: 'M006', name: 'Dr. Maya Sari' },
    { number: 'M007', name: 'Rizki Pratama' }
  ];

  const months = [
    { value: 'Januari', label: 'Januari' },
    { value: 'Februari', label: 'Februari' },
    { value: 'Maret', label: 'Maret' },
    { value: 'April', label: 'April' },
    { value: 'Mei', label: 'Mei' },
    { value: 'Juni', label: 'Juni' },
    { value: 'Juli', label: 'Juli' },
    { value: 'Agustus', label: 'Agustus' },
    { value: 'September', label: 'September' },
    { value: 'Oktober', label: 'Oktober' },
    { value: 'November', label: 'November' },
    { value: 'Desember', label: 'Desember' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.memberNumber.trim()) {
      newErrors.memberNumber = 'Nomor anggota harus diisi';
    }

    if (!formData.memberName.trim()) {
      newErrors.memberName = 'Nama anggota harus diisi';
    }

    if (formData.serviceFee <= 0) {
      newErrors.serviceFee = 'Jasa pelayanan harus lebih dari 0';
    }

    if (!formData.month) {
      newErrors.month = 'Bulan harus dipilih';
    }

    if (formData.year < 2020 || formData.year > 2030) {
      newErrors.year = 'Tahun tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMemberNumberChange = (value: string) => {
    setFormData(prev => ({ ...prev, memberNumber: value }));
    
    // Auto-fill member name if member number matches
    const member = mockMembers.find(m => m.number === value);
    if (member) {
      setFormData(prev => ({ ...prev, memberName: member.name }));
    }
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
      
      onSubmit(formData);
      
      // Reset form
      setFormData({
        memberNumber: '',
        memberName: '',
        serviceFee: 0,
        month: '',
        year: new Date().getFullYear()
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting service fee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Input Manual Jasa Pelayanan</span>
          </DialogTitle>
          <DialogDescription>
            Masukkan data jasa pelayanan anggota secara manual
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Member Number */}
            <div className="space-y-2">
              <Label htmlFor="memberNumber">Nomor Anggota *</Label>
              <Select value={formData.memberNumber} onValueChange={handleMemberNumberChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih nomor anggota" />
                </SelectTrigger>
                <SelectContent>
                  {mockMembers.map((member) => (
                    <SelectItem key={member.number} value={member.number}>
                      {member.number} - {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.memberNumber && (
                <p className="text-sm text-red-600">{errors.memberNumber}</p>
              )}
            </div>

            {/* Member Name */}
            <div className="space-y-2">
              <Label htmlFor="memberName">Nama Anggota *</Label>
              <Input
                id="memberName"
                value={formData.memberName}
                onChange={(e) => setFormData(prev => ({ ...prev, memberName: e.target.value }))}
                placeholder="Nama lengkap anggota"
                disabled={!!formData.memberNumber}
              />
              {errors.memberName && (
                <p className="text-sm text-red-600">{errors.memberName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Service Fee */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="serviceFee">Jasa Pelayanan *</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 text-sm">Rp</span>
                <Input
                  id="serviceFee"
                  type="number"
                  value={formData.serviceFee || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceFee: Number(e.target.value) }))}
                  placeholder="0"
                  className="pl-10"
                  min="0"
                  step="1000"
                />
              </div>
              {formData.serviceFee > 0 && (
                <p className="text-sm text-blue-600">
                  {formatCurrency(formData.serviceFee)}
                </p>
              )}
              {errors.serviceFee && (
                <p className="text-sm text-red-600">{errors.serviceFee}</p>
              )}
            </div>

            {/* Month */}
            <div className="space-y-2">
              <Label htmlFor="month">Bulan *</Label>
              <Select value={formData.month} onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.month && (
                <p className="text-sm text-red-600">{errors.month}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Tahun *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                placeholder="2024"
                min="2020"
                max="2030"
              />
              {errors.year && (
                <p className="text-sm text-red-600">{errors.year}</p>
              )}
            </div>
          </div>

          {/* Preview Calculation */}
          {formData.serviceFee > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Pratinjau:</strong> Jasa pelayanan sebesar {formatCurrency(formData.serviceFee)} 
                akan diproses untuk pemotongan angsuran anggota {formData.memberName || formData.memberNumber} 
                pada bulan {formData.month} {formData.year}.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
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
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Simpan Data</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}