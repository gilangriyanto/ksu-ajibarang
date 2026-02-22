// src/pages/manager/ManagementUsers.tsx
import React, { useState } from "react";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Search,
  Users,
  UserCheck,
  Shield,
  Loader2,
  AlertCircle,
  RefreshCw,
  Mail,
  MoreHorizontal,
} from "lucide-react";
import { useManagementUsers } from "@/hooks/useManagementUsers";
import { AddStaffModal } from "@/components/modals/AddStaffModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ManagementUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const { users, loading, error, refetch } = useManagementUsers();

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "manager":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
            <UserCheck className="w-3 h-3 mr-1" />
            Manager
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
            Aktif
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
            Nonaktif
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
            Ditangguhkan
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Manajemen Staff
            </h1>
            <p className="text-gray-500 mt-1">
              Kelola akses admin dan manager sistem
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
              onClick={() => setIsAddStaffModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Staff
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Column */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-gray-50/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-gray-50/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Admin</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-gray-50/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Manager</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.role === "manager").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Card */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg font-semibold">Daftar Pengguna Manajemen</CardTitle>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama, email, atau ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium">Memuat data staff...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30 text-center px-4">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Tidak ada staff ditemukan</h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  {searchTerm 
                    ? `Tidak ada hasil untuk pencarian "${searchTerm}"`
                    : "Belum ada data staff yang terdaftar di sistem."}
                </p>
                {searchTerm && (
                  <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-blue-600">
                    Bersihkan pencarian
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-semibold">ID Staff</th>
                      <th className="px-6 py-4 font-semibold">Nama & Email</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Terdaftar Pada</th>
                      <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-gray-600">
                          {user.employee_id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{user.full_name}</span>
                            <div className="flex items-center text-gray-500 mt-0.5">
                              <Mail className="h-3 w-3 mr-1.5" />
                              <span className="text-xs truncate max-w-[180px]">{user.email || "-"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                        <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }) : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 shadow-lg border-gray-100">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2 text-blue-600" />
                                Edit Profil
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                                Nonaktifkan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddStaffModal 
        isOpen={isAddStaffModalOpen} 
        onClose={() => setIsAddStaffModalOpen(false)} 
        onSuccess={() => refetch()}
      />
    </ManagerLayout>
  );
}
// Note: Dialog is closed by ManagementUsers but wrapping root might be needed if using AddStaffModal inside it. 
// Actually I'll fix the return fragment at the end.
