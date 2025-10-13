import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  CreditCard, 
  Users, 
  TrendingUp,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'loan_application' | 'payment_due' | 'system' | 'member_activity';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  user?: {
    name: string;
    avatar?: string;
  };
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'loan_application',
    title: 'Pengajuan Pinjaman Baru',
    message: 'Dr. Ahmad Santoso mengajukan pinjaman sebesar Rp 50.000.000',
    timestamp: '2024-01-28T10:30:00Z',
    read: false,
    priority: 'high',
    user: {
      name: 'Dr. Ahmad Santoso',
    },
  },
  {
    id: '2',
    type: 'payment_due',
    title: 'Pembayaran Jatuh Tempo',
    message: '5 anggota memiliki pembayaran yang akan jatuh tempo dalam 3 hari',
    timestamp: '2024-01-28T09:15:00Z',
    read: false,
    priority: 'medium',
  },
  {
    id: '3',
    type: 'member_activity',
    title: 'Setoran Simpanan',
    message: 'Ns. Siti Rahayu melakukan setoran simpanan wajib Rp 500.000',
    timestamp: '2024-01-28T08:45:00Z',
    read: true,
    priority: 'low',
    user: {
      name: 'Ns. Siti Rahayu',
    },
  },
  {
    id: '4',
    type: 'system',
    title: 'Laporan Bulanan Siap',
    message: 'Laporan keuangan bulan Januari 2024 telah selesai dibuat',
    timestamp: '2024-01-28T07:00:00Z',
    read: true,
    priority: 'medium',
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'loan_application':
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'payment_due':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'member_activity':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'system':
        return <Info className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    const variants = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };

    const labels = {
      high: 'Tinggi',
      medium: 'Sedang',
      low: 'Rendah',
    };

    return (
      <Badge className={variants[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    toast.success('Notifikasi ditandai sebagai dibaca');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('Semua notifikasi ditandai sebagai dibaca');
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'high') return n.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} menit yang lalu`;
    } else if (hours < 24) {
      return `${hours} jam yang lalu`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} hari yang lalu`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifikasi</h1>
          <p className="text-muted-foreground">
            Kelola dan pantau semua notifikasi sistem
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Tandai Semua Dibaca
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifikasi</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              Semua notifikasi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Dibaca</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              Memerlukan perhatian
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prioritas Tinggi</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">
              Butuh tindakan segera
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Notifikasi</CardTitle>
          <CardDescription>
            Pantau semua aktivitas dan notifikasi sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                Semua ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Belum Dibaca ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="high">
                Prioritas Tinggi ({highPriorityCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Tidak ada notifikasi</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {notification.user ? (
                            <Avatar>
                              <AvatarImage src={notification.user.avatar} />
                              <AvatarFallback>
                                {notification.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="p-2 rounded-full bg-gray-100">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {getPriorityBadge(notification.priority)}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimestamp(notification.timestamp)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Tandai Dibaca
                                </Button>
                              )}
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}