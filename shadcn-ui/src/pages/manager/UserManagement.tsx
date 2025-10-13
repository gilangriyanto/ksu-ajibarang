import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Shield, User, UserCheck, Eye, EyeOff } from 'lucide-react';

interface SystemUser {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'member';
  status: 'active' | 'inactive' | 'suspended';
  last_login: string;
  created_date: string;
  permissions: string[];
}

const mockUsers: SystemUser[] = [
  {
    id: '1',
    username: 'admin',
    full_name: 'Administrator',
    email: 'admin@koperasi.com',
    role: 'admin',
    status: 'active',
    last_login: '2024-01-15T10:30:00',
    created_date: '2023-01-01',
    permissions: ['all'],
  },
  {
    id: '2',
    username: 'manager01',
    full_name: 'Dr. Ahmad Wijaya',
    email: 'ahmad.wijaya@koperasi.com',
    role: 'manager',
    status: 'active',
    last_login: '2024-01-14T16:45:00',
    created_date: '2023-01-15',
    permissions: ['manage_members', 'manage_loans', 'view_reports'],
  },
  {
    id: '3',
    username: 'staff01',
    full_name: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@koperasi.com',
    role: 'staff',
    status: 'active',
    last_login: '2024-01-14T14:20:00',
    created_date: '2023-02-01',
    permissions: ['manage_savings', 'process_transactions'],
  },
  {
    id: '4',
    username: 'member001',
    full_name: 'Dr. Budi Santoso',
    email: 'budi.santoso@koperasi.com',
    role: 'member',
    status: 'inactive',
    last_login: '2024-01-10T09:15:00',
    created_date: '2023-03-10',
    permissions: ['view_own_data'],
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    const icons = {
      admin: Shield,
      manager: UserCheck,
      staff: User,
      member: User,
    };
    const Icon = icons[role as keyof typeof icons] || User;
    return <Icon className="h-4 w-4" />;
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800',
      member: 'bg-gray-100 text-gray-800',
    };
    return variants[role as keyof typeof variants] || variants.member;
  };

  const getRoleText = (role: string) => {
    const texts = {
      admin: 'Administrator',
      manager: 'Manager',
      staff: 'Staff',
      member: 'Anggota',
    };
    return texts[role as keyof typeof texts] || role;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return variants[status as keyof typeof variants] || variants.inactive;
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      suspended: 'Suspended',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const activeUsers = users.filter(user => user.status === 'active').length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const managerUsers = users.filter(user => user.role === 'manager').length;
  const staffUsers = users.filter(user => user.role === 'staff').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-600">Kelola akses pengguna sistem koperasi</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Pengguna Baru</DialogTitle>
              <DialogDescription>
                Buat akun pengguna baru untuk sistem koperasi.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="username" />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="member">Anggota</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="full_name">Nama Lengkap</Label>
                <Input id="full_name" placeholder="Masukkan nama lengkap" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Password" />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeUsers} aktif
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrator</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">
              Akses penuh
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manager</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managerUsers}</div>
            <p className="text-xs text-muted-foreground">
              Akses manajemen
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffUsers}</div>
            <p className="text-xs text-muted-foreground">
              Akses operasional
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Pengguna</CardTitle>
              <CardDescription>Kelola akun pengguna sistem</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari pengguna..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Login Terakhir</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <Badge className={getRoleBadge(user.role)}>
                        {getRoleText(user.role)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(user.status)}>
                      {getStatusText(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDateTime(user.last_login)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Detail Pengguna</DialogTitle>
                            <DialogDescription>
                              Informasi lengkap pengguna {selectedUser?.username}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Username</label>
                                  <p>{selectedUser.username}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Role</label>
                                  <p>{getRoleText(selectedUser.role)}</p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Nama Lengkap</label>
                                <p>{selectedUser.full_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Email</label>
                                <p>{selectedUser.email}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <p>{getStatusText(selectedUser.status)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Login Terakhir</label>
                                  <p>{formatDateTime(selectedUser.last_login)}</p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Permissions</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {selectedUser.permissions.map((permission, index) => (
                                    <Badge key={index} variant="outline">
                                      {permission}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-end space-x-2 pt-4">
                                <Select
                                  value={selectedUser.status}
                                  onValueChange={(value) => handleStatusChange(selectedUser.id, value as any)}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                      >
                        {user.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}