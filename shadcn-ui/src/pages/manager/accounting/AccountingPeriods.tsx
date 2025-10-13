import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Lock,
  Unlock,
  Calendar,
  CheckCircle
} from 'lucide-react';

interface AccountingPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'open' | 'closed' | 'locked';
  fiscalYear: string;
}

export default function AccountingPeriods() {
  // Mock data
  const periods: AccountingPeriod[] = [
    {
      id: '1',
      name: 'Januari 2024',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      status: 'closed',
      fiscalYear: '2024'
    },
    {
      id: '2',
      name: 'Februari 2024',
      startDate: '2024-02-01',
      endDate: '2024-02-29',
      status: 'open',
      fiscalYear: '2024'
    },
    {
      id: '3',
      name: 'Maret 2024',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      status: 'open',
      fiscalYear: '2024'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'bg-green-100 text-green-800',
      closed: 'bg-yellow-100 text-yellow-800',
      locked: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      open: 'Terbuka',
      closed: 'Tertutup',
      locked: 'Terkunci'
    };

    const icons = {
      open: <Unlock className="h-3 w-3 mr-1" />,
      closed: <CheckCircle className="h-3 w-3 mr-1" />,
      locked: <Lock className="h-3 w-3 mr-1" />
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const handleClosePeriod = (periodId: string) => {
    if (confirm('Apakah Anda yakin ingin menutup periode ini?')) {
      console.log('Closing period:', periodId);
    }
  };

  const handleLockPeriod = (periodId: string) => {
    if (confirm('Apakah Anda yakin ingin mengunci periode ini? Periode yang terkunci tidak dapat diubah.')) {
      console.log('Locking period:', periodId);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Periode Akuntansi</h1>
            <p className="text-gray-600">Kelola periode akuntansi dan penutupan buku</p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Buat Periode Baru
          </Button>
        </div>

        {/* Current Period Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Periode Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Februari 2024</div>
              <p className="text-xs text-green-600">1 Feb - 29 Feb 2024</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tahun Fiskal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2024</div>
              <p className="text-xs text-blue-600">1 Jan - 31 Des 2024</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Terbuka</div>
              <p className="text-xs text-green-600">Dapat melakukan transaksi</p>
            </CardContent>
          </Card>
        </div>

        {/* Periods Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Periode</CardTitle>
            <CardDescription>
              Semua periode akuntansi dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Tanggal Selesai</TableHead>
                    <TableHead>Tahun Fiskal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell className="font-medium">{period.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(period.startDate).toLocaleDateString('id-ID')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(period.endDate).toLocaleDateString('id-ID')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{period.fiscalYear}</TableCell>
                      <TableCell>
                        {getStatusBadge(period.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {period.status === 'open' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleClosePeriod(period.id)}
                            >
                              Tutup Periode
                            </Button>
                          )}
                          {period.status === 'closed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLockPeriod(period.id)}
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Kunci
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Period Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Penutupan Periode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Tutup periode untuk mencegah transaksi baru dan mulai proses penutupan buku.
              </p>
              <Button variant="outline" className="w-full">
                Tutup Periode Februari 2024
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Penutupan Tahun</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Tutup tahun fiskal dan transfer saldo ke periode berikutnya.
              </p>
              <Button variant="outline" className="w-full">
                Tutup Tahun Fiskal 2024
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}