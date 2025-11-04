import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  TrendingUp,
  Building2,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import { useSavings } from "@/hooks/useSavings";
import { useLoans } from "@/hooks/useLoans";
import { useServiceFees } from "@/hooks/useServiceFees";

export default function WelcomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  const { members } = useMembers();
  const { savingsAccounts } = useSavings();
  const { loans } = useLoans();
  const { serviceFees } = useServiceFees();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate statistics from real data
  const activeMembers = members.filter((m) => m.status === "active").length;
  const totalMembers = members.length;

  const totalSavings = savingsAccounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  const activeLoans = loans.filter((loan) => loan.status === "active");
  const totalLoanAmount = activeLoans.reduce(
    (sum, loan) => sum + loan.remaining_balance,
    0
  );

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthServiceFees = serviceFees.filter(
    (sf) => sf.period === currentMonth
  );
  const totalServiceFeesPaid = currentMonthServiceFees
    .filter((sf) => sf.status === "paid")
    .reduce((sum, sf) => sum + sf.net_amount, 0);

  const pendingServiceFees = currentMonthServiceFees.filter(
    (sf) => sf.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Koperasi Simpan Pinjam
                </h1>
                <p className="text-sm text-gray-600">
                  Sistem Manajemen Koperasi
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {currentTime.toLocaleTimeString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Selamat Datang di Sistem Koperasi
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Kelola anggota, simpanan, pinjaman, dan jasa pelayanan dengan mudah
            dan efisien
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => (window.location.href = "/manager")}
            >
              Masuk ke Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Anggota
                  </p>
                  <p className="text-3xl font-bold">{totalMembers}</p>
                  <p className="text-blue-100 text-xs mt-1">
                    {activeMembers} aktif
                  </p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Total Simpanan
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalSavings)}
                  </p>
                  <p className="text-green-100 text-xs mt-1">
                    {savingsAccounts.length} rekening
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Pinjaman Aktif
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalLoanAmount)}
                  </p>
                  <p className="text-orange-100 text-xs mt-1">
                    {activeLoans.length} pinjaman
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Jasa Pelayanan
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalServiceFeesPaid)}
                  </p>
                  <p className="text-purple-100 text-xs mt-1">Bulan ini</p>
                </div>
                <CheckCircle className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Status Jasa Pelayanan Bulan Ini
              </CardTitle>
              <CardDescription>
                Ringkasan pembayaran jasa pelayanan periode{" "}
                {new Date().toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Total Anggota
                  </span>
                  <Badge variant="outline">
                    {currentMonthServiceFees.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Sudah Dibayar
                  </span>
                  <Badge className="bg-green-100 text-green-800">
                    {
                      currentMonthServiceFees.filter(
                        (sf) => sf.status === "paid"
                      ).length
                    }
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Belum Dibayar
                  </span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {pendingServiceFees}
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">
                      Total Dibayarkan
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(totalServiceFeesPaid)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                Ringkasan Pinjaman
              </CardTitle>
              <CardDescription>
                Status pinjaman anggota saat ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Pinjaman Aktif
                  </span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {activeLoans.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Pinjaman Lunas
                  </span>
                  <Badge className="bg-green-100 text-green-800">
                    {loans.filter((loan) => loan.status === "paid_off").length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Menunggak
                  </span>
                  <Badge className="bg-red-100 text-red-800">
                    {loans.filter((loan) => loan.status === "overdue").length}
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">
                      Total Outstanding
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                      {formatCurrency(totalLoanAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Fitur Sistem Koperasi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Manajemen Anggota
              </h4>
              <p className="text-sm text-gray-600">
                Kelola data anggota, status keanggotaan, dan informasi kontak
              </p>
            </div>
            <div className="text-center p-4">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Simpanan</h4>
              <p className="text-sm text-gray-600">
                Kelola simpanan pokok, wajib, dan sukarela anggota
              </p>
            </div>
            <div className="text-center p-4">
              <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Pinjaman</h4>
              <p className="text-sm text-gray-600">
                Kelola pinjaman anggota dan pembayaran angsuran
              </p>
            </div>
            <div className="text-center p-4">
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Jasa Pelayanan
              </h4>
              <p className="text-sm text-gray-600">
                Kelola pembagian jasa pelayanan dan potongan angsuran
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
