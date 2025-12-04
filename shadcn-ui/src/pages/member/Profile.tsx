import React, { useState } from "react";
import { MemberLayout } from "@/components/layout/MemberLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Shield,
  Edit,
  Briefcase,
  RefreshCw,
  Lock,
  AlertCircle,
} from "lucide-react";

// ✅ Import hooks and modals
import useProfile from "@/hooks/useProfile";
import { EditProfileModal } from "@/components/modals/EditProfileModal";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";

export default function Profile() {
  // ✅ Use profile hook
  const {
    profile,
    loading,
    updating,
    changingPassword,
    error,
    updateProfile,
    changePassword,
    refresh,
  } = useProfile({
    autoLoad: true,
  });

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Tidak Aktif</Badge>;
      case "suspended":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Ditangguhkan</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMembershipStatusBadge = (status?: string) => {
    // ✅ Handle undefined or null status
    if (!status) {
      return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }

    if (status.toLowerCase().includes("overdue")) {
      return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
    } else if (status.toLowerCase().includes("good")) {
      return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  };

  // ✅ Loading state
  if (loading && !profile) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Memuat profil...</span>
        </div>
      </MemberLayout>
    );
  }

  // ✅ Error state
  if (error && !profile) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ✅ No profile state
  if (!profile) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <User className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Profil tidak ditemukan</p>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
            <p className="text-gray-600 mt-1">
              Kelola informasi pribadi dan keanggotaan Anda
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setEditModalOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profil
          </Button>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                    {profile.initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.full_name}
                  </h2>
                  {getStatusBadge(profile.status)}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>No. Anggota: {profile.employee_id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Bergabung sejak{" "}
                      {new Date(profile.joined_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>
                      Masa keanggotaan: {profile.membership_duration} bulan
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                {profile.membership_status && (
                  <>
                    <div className="mb-2">
                      {getMembershipStatusBadge(profile.membership_status)}
                    </div>
                    <p className="text-xs text-gray-500">Status Keanggotaan</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informasi Pribadi</span>
              </CardTitle>
              <CardDescription>Data pribadi dan kontak</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nama Lengkap
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {profile.full_name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">{profile.email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nomor Telepon
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {profile.formatted_phone || profile.phone_number}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Alamat
                  </label>
                  <div className="mt-1 flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-900">{profile.address}</p>
                  </div>
                </div>

                {profile.work_unit && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Unit Kerja
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {profile.work_unit}
                      </p>
                    </div>
                  </div>
                )}

                {profile.position && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Jabatan
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {profile.position}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Membership Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Informasi Keanggotaan</span>
              </CardTitle>
              <CardDescription>Detail keanggotaan koperasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nomor Anggota
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">
                    {profile.employee_id}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status Anggota
                  </label>
                  <div className="mt-1">{getStatusBadge(profile.status)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tanggal Bergabung
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {new Date(profile.joined_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Masa Keanggotaan
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {profile.membership_duration} bulan
                  </p>
                </div>

                {profile.membership_status && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status Keanggotaan
                    </label>
                    <div className="mt-1">
                      {getMembershipStatusBadge(profile.membership_status)}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Role
                  </label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {profile.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Keamanan Akun</span>
            </CardTitle>
            <CardDescription>Pengaturan keamanan dan privasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Kata Sandi</h4>
                  <p className="text-sm text-gray-500">
                    Ubah password untuk keamanan akun
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPasswordModalOpen(true)}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Ubah Password
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Terakhir Diperbarui</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(profile.updated_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        profile={profile}
        onUpdate={updateProfile}
        isUpdating={updating}
      />

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onChangePassword={changePassword}
        isChangingPassword={changingPassword}
      />
    </MemberLayout>
  );
}
