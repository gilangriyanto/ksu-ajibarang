import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, User } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberModal = ({ isOpen, onClose }: AddMemberModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    work_unit: '',
    position: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { addMember, refetch } = useMembers();

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      work_unit: '',
      position: ''
    });
    setSuccess(false);
    setErrorMsg('');
  };

  const generateEmployeeId = () => {
    // Generate employee ID dengan format: EMP + timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `EMP${timestamp}`;
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
      
      // Generate unique employee ID
      const employeeId = generateEmployeeId();
      
      console.log('Generated employee ID:', employeeId);
      
      // Add member to database
      const memberPayload = {
        member_id: employeeId,
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        address: formData.address.trim() || undefined,
        join_date: new Date().toISOString().split('T')[0]
      };

      console.log('Adding member with payload:', memberPayload);
      
      const newMember = await addMember(memberPayload);
      console.log('Member added successfully:', newMember);

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
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Tambah Anggota Baru
          </DialogTitle>
          <DialogDescription>
            Masukkan informasi anggota baru untuk mendaftar ke koperasi.
            <br />
            <span className="text-xs text-gray-500">
              Password default: <strong>Password123!</strong> (anggota harus mengubahnya setelah login pertama kali)
            </span>
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
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Informasi Dasar</h3>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="member-name" className="text-right">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="member-phone" className="text-right">
                No. Telepon <span className="text-red-500">*</span>
              </Label>
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
                rows={3}
              />
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Informasi Pekerjaan</h3>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="work-unit" className="text-right">Unit Kerja</Label>
              <Input 
                id="work-unit" 
                className="col-span-3" 
                placeholder="Departemen Medis"
                value={formData.work_unit}
                onChange={(e) => setFormData({...formData, work_unit: e.target.value})}
                disabled={loading || success}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">Jabatan</Label>
              <Input 
                id="position" 
                className="col-span-3" 
                placeholder="Perawat"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                disabled={loading || success}
              />
            </div>
          </div>

          {/* Important Note */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>Catatan Penting:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>ID Anggota akan digenerate otomatis</li>
                <li>Password default: <strong>Password123!</strong></li>
                <li>Anggota harus mengubah password setelah login pertama</li>
                <li>Status anggota: <strong>Aktif</strong> (default)</li>
              </ul>
            </AlertDescription>
          </Alert>
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