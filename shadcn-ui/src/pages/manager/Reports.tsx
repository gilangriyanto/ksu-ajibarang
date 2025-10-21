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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  PieChart,
  BarChart3,
  Users,
  DollarSign,
  CreditCard,
  PiggyBank,
  Eye,
  Filter,
} from "lucide-react";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState("2024");

  // Mock data - replace with actual API calls
  const reportTemplates = [
    {
      id: "financial-summary",
      title: "Ringkasan Keuangan",
      description: "Laporan ringkasan keuangan bulanan/tahunan",
      icon: DollarSign,
      category: "financial",
      lastGenerated: "2024-01-25",
    },
    {
      id: "member-report",
      title: "Laporan Keanggotaan",
      description: "Data anggota, registrasi baru, dan status keanggotaan",
      icon: Users,
      category: "membership",
      lastGenerated: "2024-01-20",
    },
    {
      id: "savings-report",
      title: "Laporan Simpanan",
      description: "Analisis simpanan anggota dan tren pertumbuhan",
      icon: PiggyBank,
      category: "savings",
      lastGenerated: "2024-01-22",
    },
    {
      id: "loan-report",
      title: "Laporan Pinjaman",
      description: "Status pinjaman, pembayaran, dan tunggakan",
      icon: CreditCard,
      category: "loans",
      lastGenerated: "2024-01-18",
    },
    {
      id: "transaction-report",
      title: "Laporan Transaksi",
      description: "Detail semua transaksi keuangan",
      icon: FileText,
      category: "transactions",
      lastGenerated: "2024-01-24",
    },
    {
      id: "performance-report",
      title: "Laporan Kinerja",
      description: "Analisis kinerja koperasi dan KPI",
      icon: TrendingUp,
      category: "performance",
      lastGenerated: "2024-01-15",
    },
  ];

  const quickStats = {
    totalMembers: 150,
    totalSavings: 125000000,
    totalLoans: 85000000,
    monthlyTransactions: 324,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      financial: DollarSign,
      membership: Users,
      savings: PiggyBank,
      loans: CreditCard,
      transactions: FileText,
      performance: TrendingUp,
    };
    return icons[category as keyof typeof icons] || FileText;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      financial: "bg-green-100 text-green-800",
      membership: "bg-blue-100 text-blue-800",
      savings: "bg-purple-100 text-purple-800",
      loans: "bg-orange-100 text-orange-800",
      transactions: "bg-gray-100 text-gray-800",
      performance: "bg-red-100 text-red-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Laporan & Analitik
            </h1>
            <p className="text-gray-600">
              Generate dan kelola laporan koperasi
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            Laporan Custom
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Anggota
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quickStats.totalMembers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <PiggyBank className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Simpanan
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(quickStats.totalSavings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Pinjaman
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(quickStats.totalLoans)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Transaksi Bulan Ini
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quickStats.monthlyTransactions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Template Laporan</TabsTrigger>
            <TabsTrigger value="custom">Laporan Custom</TabsTrigger>
            <TabsTrigger value="history">Riwayat Laporan</TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Laporan</CardTitle>
                <CardDescription>
                  Pilih template laporan yang ingin di-generate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reportTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <Card
                        key={template.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Icon className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {template.title}
                                </h3>
                                <Badge
                                  className={getCategoryColor(
                                    template.category
                                  )}
                                >
                                  {template.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <span>
                              Terakhir:{" "}
                              {new Date(
                                template.lastGenerated
                              ).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                            <Button size="sm" className="flex-1">
                              <Download className="w-4 h-4 mr-2" />
                              Generate
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Buat Laporan Custom</CardTitle>
                <CardDescription>
                  Buat laporan sesuai kebutuhan dengan filter dan parameter
                  khusus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Periode Laporan
                      </label>
                      <Select
                        value={selectedPeriod}
                        onValueChange={setSelectedPeriod}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih periode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Harian</SelectItem>
                          <SelectItem value="weekly">Mingguan</SelectItem>
                          <SelectItem value="monthly">Bulanan</SelectItem>
                          <SelectItem value="quarterly">Kuartalan</SelectItem>
                          <SelectItem value="yearly">Tahunan</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Tahun
                      </label>
                      <Select
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tahun" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Kategori Data
                      </label>
                      <div className="space-y-2">
                        {[
                          "Keanggotaan",
                          "Simpanan",
                          "Pinjaman",
                          "Transaksi",
                          "Keuangan",
                        ].map((category) => (
                          <label
                            key={category}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              className="rounded"
                              defaultChecked
                            />
                            <span className="text-sm text-gray-700">
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Laporan
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Laporan</CardTitle>
                <CardDescription>
                  Laporan yang telah di-generate sebelumnya
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Laporan Keuangan Januari 2024",
                      type: "PDF",
                      size: "2.4 MB",
                      date: "2024-01-25",
                    },
                    {
                      name: "Analisis Simpanan Q4 2023",
                      type: "Excel",
                      size: "1.8 MB",
                      date: "2024-01-20",
                    },
                    {
                      name: "Laporan Pinjaman Desember 2023",
                      type: "PDF",
                      size: "3.1 MB",
                      date: "2024-01-15",
                    },
                    {
                      name: "Ringkasan Transaksi 2023",
                      type: "PDF",
                      size: "4.2 MB",
                      date: "2024-01-10",
                    },
                  ].map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {report.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {report.type} • {report.size} •{" "}
                            {new Date(report.date).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Distribusi Simpanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <p className="text-gray-500">
                      Chart Placeholder - Pie Chart
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Tren Pinjaman
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <p className="text-gray-500">
                      Chart Placeholder - Bar Chart
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Pertumbuhan Anggota
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <p className="text-gray-500">
                      Chart Placeholder - Line Chart
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Analisis Keuangan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Aset</span>
                      <span className="font-medium">
                        {formatCurrency(210000000)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Likuiditas</span>
                      <span className="font-medium text-green-600">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">NPL Ratio</span>
                      <span className="font-medium text-orange-600">2.1%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ROA</span>
                      <span className="font-medium text-blue-600">12.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ManagerLayout>
  );
}
