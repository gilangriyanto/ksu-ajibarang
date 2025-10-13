import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Eye, FileText, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/loan-utils';
import { LoanApplication } from '@/types/loan';

// Mock data for loan applications
const mockLoanApplications: LoanApplication[] = [
  {
    id: '1',
    member_id: 'member-1',
    amount: 25000000,
    tenor_months: 12,
    purpose: 'Renovasi rumah untuk memperbaiki atap yang bocor dan menambah ruang keluarga',
    status: 'approved',
    applied_date: '2024-09-15T10:30:00Z',
    reviewed_by: 'manager-1',
    reviewed_date: '2024-09-18T14:20:00Z',
    notes: 'Pengajuan disetujui dengan bunga 1% per bulan',
    created_at: '2024-09-15T10:30:00Z',
    updated_at: '2024-09-18T14:20:00Z',
  },
  {
    id: '2',
    member_id: 'member-1',
    amount: 50000000,
    tenor_months: 24,
    purpose: 'Modal usaha untuk membuka warung makan di dekat rumah',
    status: 'pending',
    applied_date: '2024-10-01T09:15:00Z',
    created_at: '2024-10-01T09:15:00Z',
    updated_at: '2024-10-01T09:15:00Z',
  },
  {
    id: '3',
    member_id: 'member-1',
    amount: 15000000,
    tenor_months: 6,
    purpose: 'Biaya pendidikan anak untuk semester baru',
    status: 'rejected',
    applied_date: '2024-08-20T11:45:00Z',
    reviewed_by: 'manager-1',
    reviewed_date: '2024-08-22T16:30:00Z',
    notes: 'Pengajuan ditolak karena masih memiliki pinjaman aktif',
    created_at: '2024-08-20T11:45:00Z',
    updated_at: '2024-08-22T16:30:00Z',
  },
];

export default function LoanHistory() {
  const [applications, setApplications] = useState(mockLoanApplications);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = app.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formatCurrency(app.amount).includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const handleViewDetail = (application: LoanApplication) => {
    setSelectedApplication(application);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Riwayat Pengajuan Pinjaman</h1>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pencarian</label>
              <Input
                placeholder="Cari berdasarkan tujuan atau nominal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengajuan</CardTitle>
          <CardDescription>
            Total {filteredApplications.length} pengajuan ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal Pengajuan</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Tenor</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {new Date(application.applied_date).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(application.amount)}
                    </TableCell>
                    <TableCell>{application.tenor_months} bulan</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {application.purpose}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(application.status)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(application)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada pengajuan pinjaman ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan Pinjaman</DialogTitle>
            <DialogDescription>
              Informasi lengkap pengajuan pinjaman Anda
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">ID Pengajuan</label>
                  <p className="font-mono text-sm">#{selectedApplication.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div>{getStatusBadge(selectedApplication.status)}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Tanggal Pengajuan</label>
                  <p>{new Date(selectedApplication.applied_date).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Nominal</label>
                  <p className="font-bold text-blue-600">
                    {formatCurrency(selectedApplication.amount)}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Tenor</label>
                  <p>{selectedApplication.tenor_months} bulan</p>
                </div>
                {selectedApplication.reviewed_date && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Tanggal Review</label>
                    <p>{new Date(selectedApplication.reviewed_date).toLocaleDateString('id-ID')}</p>
                  </div>
                )}
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Tujuan Pinjaman</label>
                <p className="p-3 bg-gray-50 rounded-lg">{selectedApplication.purpose}</p>
              </div>

              {/* Notes from Manager */}
              {selectedApplication.notes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Catatan Manager</label>
                  <p className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    {selectedApplication.notes}
                  </p>
                </div>
              )}

              {/* Action Button for Approved Applications */}
              {selectedApplication.status === 'approved' && (
                <div className="pt-4 border-t">
                  <Button className="w-full" size="lg">
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Detail Pinjaman
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}