import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  CreditCard, 
  Search, 
  Eye, 
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { PaymentDetailModal } from '@/components/modals/PaymentDetailModal';
import { toast } from 'sonner';

interface Payment {
  id: string;
  memberNumber: string;
  memberName: string;
  paymentType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  method: string;
  reference: string;
}

export default function PaymentMonitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock data for payments
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      memberNumber: 'M001',
      memberName: 'Dr. Ahmad Santoso',
      paymentType: 'loan',
      amount: 235442,
      dueDate: '2024-02-15',
      paidDate: '2024-02-14',
      status: 'paid',
      method: 'transfer',
      reference: 'TRX001'
    },
    {
      id: '2',
      memberNumber: 'M001',
      memberName: 'Dr. Ahmad Santoso',
      paymentType: 'savings',
      amount: 100000,
      dueDate: '2024-02-01',
      paidDate: '2024-01-31',
      status: 'paid',
      method: 'cash',
      reference: 'TRX002'
    },
    {
      id: '3',
      memberNumber: 'M002',
      memberName: 'Siti Nurhaliza',
      paymentType: 'savings',
      amount: 100000,
      dueDate: '2024-02-01',
      status: 'overdue',
      method: '',
      reference: ''
    },
    {
      id: '4',
      memberNumber: 'M003',
      memberName: 'Budi Prasetyo',
      paymentType: 'loan',
      amount: 195678,
      dueDate: '2024-02-10',
      status: 'pending',
      method: '',
      reference: ''
    },
    {
      id: '5',
      memberNumber: 'M004',
      memberName: 'Dr. Sarah Wijaya',
      paymentType: 'loan',
      amount: 235890,
      dueDate: '2024-02-20',
      status: 'upcoming',
      method: '',
      reference: ''
    },
    {
      id: '6',
      memberNumber: 'M005',
      memberName: 'Andi Kurniawan',
      paymentType: 'savings',
      amount: 100000,
      dueDate: '2024-02-01',
      status: 'overdue',
      method: '',
      reference: ''
    }
  ]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.memberNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.paymentType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Lunas</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Terlambat</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Akan Datang</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'upcoming':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case 'loan':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Angsuran Pinjaman</Badge>;
      case 'savings':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Simpanan Wajib</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Calculate statistics
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidPayments = payments.filter(p => p.status === 'paid');
  const overduePayments = payments.filter(p => p.status === 'overdue');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const upcomingPayments = payments.filter(p => p.status === 'upcoming');

  const totalPaid = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, payment) => sum + payment.amount, 0);

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  const handleMarkAsPaid = (payment: Payment) => {
    const updatedPayment = {
      ...payment,
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      method: 'cash',
      reference: `TRX${Date.now().toString().slice(-6)}`
    };

    setPayments(prev => prev.map(p => p.id === payment.id ? updatedPayment : p));
    
    toast.success(`Pembayaran ${payment.memberName} ditandai sebagai lunas`, {
      description: `${formatCurrency(payment.amount)} - ${new Date().toLocaleDateString('id-ID')}`
    });

    // Close modal if it's open
    if (isDetailModalOpen && selectedPayment?.id === payment.id) {
      setIsDetailModalOpen(false);
      setSelectedPayment(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <BackButton to="/manager" />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monitoring Pembayaran</h1>
            <p className="text-gray-600">Pantau status pembayaran angsuran dan simpanan anggota</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Laporan
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Jadwal Pembayaran
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalPayments)}</div>
              <p className="text-xs text-gray-500">Bulan ini</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sudah Dibayar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-gray-500">{paidPayments.length} transaksi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Terlambat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</div>
              <p className="text-xs text-gray-500">{overduePayments.length} transaksi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Menunggu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
              <p className="text-xs text-gray-500">Pembayaran</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Akan Datang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingPayments.length}</div>
              <p className="text-xs text-gray-500">Pembayaran</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Daftar Pembayaran</span>
                </CardTitle>
                <CardDescription>
                  Monitor semua pembayaran anggota koperasi
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari pembayaran..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="paid">Lunas</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="overdue">Terlambat</SelectItem>
                    <SelectItem value="upcoming">Akan Datang</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="loan">Angsuran Pinjaman</SelectItem>
                    <SelectItem value="savings">Simpanan Wajib</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Jenis Pembayaran</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                    <TableHead>Tanggal Bayar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.memberName}</div>
                          <div className="text-sm text-gray-500">{payment.memberNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getPaymentTypeBadge(payment.paymentType)}</TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.dueDate).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        {payment.paidDate ? 
                          new Date(payment.paidDate).toLocaleDateString('id-ID') : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          {getStatusBadge(payment.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.method ? (
                          <Badge variant="outline">
                            {payment.method === 'transfer' ? 'Transfer' : 'Tunai'}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPayment(payment)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          {payment.status !== 'paid' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsPaid(payment)}
                              className="h-8 w-8 p-0 hover:bg-green-50"
                              title="Tandai Lunas"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredPayments.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada pembayaran yang ditemukan</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Detail Modal */}
        <PaymentDetailModal
          payment={selectedPayment}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedPayment(null);
          }}
          onMarkAsPaid={handleMarkAsPaid}
        />
      </div>
    </Layout>
  );
}