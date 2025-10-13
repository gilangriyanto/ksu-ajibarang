import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PiggyBank, DollarSign, Calendar, User } from 'lucide-react';

interface NewSavings {
  memberNumber: string;
  memberName: string;
  savingsType: string;
  amount: number;
  description: string;
}

interface SavingsAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (savings: NewSavings) => void;
}

export function SavingsAddModal({ isOpen, onClose, onAdd }: SavingsAddModalProps) {
  const [formData, setFormData] = useState<NewSavings>({
    memberNumber: '',
    memberName: '',
    savingsType: '',
    amount: 0,
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock member data for selection
  const mockMembers = [
    { number: 'M001', name: 'Dr. Ahmad Santoso' },
    { number: 'M002', name: 'Siti Nurhaliza' },
    { number: 'M003', name: 'Budi Prasetyo' },
    { number: 'M004', name: 'Dr. Sarah Wijaya' },
    { number: 'M005', name: 'Andi Kurniawan' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.memberNumber) {
      newErrors.memberNumber = 'Anggota harus dipilih';
    }

    if (!formData.savingsType) {
      newErrors.savingsType = 'Jenis simpanan harus dipilih';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Jumlah simpanan harus lebih dari 0';
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAdd(formData);
      handleClose();
    } catch (error) {
      console.error('Error adding savings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof NewSavings, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMemberSelect = (memberNumber: string) => {
    const selectedMember = mockMembers.find(m => m.number === memberNumber);
    if (selectedMember) {
      setFormData(prev => ({
        ...prev,
        memberNumber: selectedMember.number,
        memberName: selectedMember.name
      }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleClose = () => {
    setFormData({
      memberNumber: '',
      memberName: '',
      savingsType: '',
      amount: 0,
      description: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5" />
            <span>Tambah Simpanan</span>
          </DialogTitle>
          <DialogDescription>
            Tambahkan simpanan baru untuk anggota
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member Selection */}
          <div className="space-y-2">
            <Label htmlFor="member">Pilih Anggota *</Label>
            <Select value={formData.memberNumber} onValueChange={handleMemberSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih anggota" />
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

          {/* Savings Type */}
          <div className="space-y-2">
            <Label htmlFor="savingsType">Jenis Simpanan *</Label>
            <Select value={formData.savingsType} onValueChange={(value) => handleInputChange('savingsType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis simpanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wajib">Simpanan Wajib</SelectItem>
                <SelectItem value="sukarela">Simpanan Sukarela</SelectItem>
                <SelectItem value="pokok">Simpanan Pokok</SelectItem>
                <SelectItem value="hariRaya">Simpanan Hari Raya</SelectItem>
              </SelectContent>
            </Select>
            {errors.savingsType && (
              <p className="text-sm text-red-600">{errors.savingsType}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Simpanan *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="pl-10"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Keterangan</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Keterangan tambahan (opsional)"
              rows={3}
            />
          </div>

          {/* Summary */}
          {formData.amount > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Ringkasan</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-700">Anggota:</span>
                  <span className="font-medium">{formData.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Jenis:</span>
                  <span className="font-medium">{formData.savingsType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Jumlah:</span>
                  <span className="font-medium">{formatCurrency(formData.amount)}</span>
                </div>
              </div>
            </div>
          )}

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
                  <span>Menyimpan...</span>
                </div>
              ) : (
                <>
                  <PiggyBank className="h-4 w-4 mr-2" />
                  Tambah Simpanan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}