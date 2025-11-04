import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PiggyBank,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  X,
  Download,
} from "lucide-react";

interface SavingsAccount {
  id: string;
  type: string;
  balance: number;
  monthlyDeposit: number;
  openDate: string;
  lastTransaction: string;
  status: string;
  interestRate: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

interface Transaction {
  id: string;
  date: string;
  type: "deposit" | "withdrawal";
  amount: number;
  description: string;
  balance: number;
}

interface SavingsDetailViewModalProps {
  account: SavingsAccount | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SavingsDetailViewModal({
  account,
  isOpen,
  onClose,
}: SavingsDetailViewModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case "pokok":
        return "Simpanan Pokok";
      case "wajib":
        return "Simpanan Wajib";
      case "sukarela":
        return "Simpanan Sukarela";
      case "hariRaya":
        return "Simpanan Hari Raya";
      default:
        return type;
    }
  };

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case "pokok":
        return (
          <Badge className="bg-blue-100 text-blue-800">Simpanan Pokok</Badge>
        );
      case "wajib":
        return (
          <Badge className="bg-green-100 text-green-800">Simpanan Wajib</Badge>
        );
      case "sukarela":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Simpanan Sukarela
          </Badge>
        );
      case "hariRaya":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            Simpanan Hari Raya
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Aktif</Badge>
    ) : (
      <Badge variant="secondary">Tidak Aktif</Badge>
    );
  };

  // Mock transaction history
  const transactions: Transaction[] = [
    {
      id: "1",
      date: "2024-01-28",
      type: "deposit",
      amount: 100000,
      description: "Setoran rutin bulanan",
      balance: 2400000,
    },
    {
      id: "2",
      date: "2024-01-01",
      type: "deposit",
      amount: 100000,
      description: "Setoran rutin bulanan",
      balance: 2300000,
    },
    {
      id: "3",
      date: "2023-12-01",
      type: "deposit",
      amount: 100000,
      description: "Setoran rutin bulanan",
      balance: 2200000,
    },
    {
      id: "4",
      date: "2023-11-15",
      type: "withdrawal",
      amount: 50000,
      description: "Penarikan darurat",
      balance: 2100000,
    },
    {
      id: "5",
      date: "2023-11-01",
      type: "deposit",
      amount: 100000,
      description: "Setoran rutin bulanan",
      balance: 2150000,
    },
  ];

  const calculateAccountAge = (openDate: string) => {
    const openDateObj = new Date(openDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - openDateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return `${years} tahun ${months} bulan`;
    }
    return `${months} bulan`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {account ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <PiggyBank className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold">
                      Detail Rekening Simpanan
                    </DialogTitle>
                    <DialogDescription className="flex items-center space-x-2">
                      <span>{getAccountTypeName(account.type)}</span>
                      {getAccountTypeBadge(account.type)}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* Account Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Saldo Saat Ini
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(account.balance)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Total saldo</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Total Setoran
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(account.totalDeposits)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Akumulasi setoran
                    </p>
                  </CardContent>
                </Card>

                {/* <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Usia Rekening
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {calculateAccountAge(account.openDate)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Dibuka:{" "}
                      {new Date(account.openDate).toLocaleDateString("id-ID")}
                    </p>
                  </CardContent>
                </Card> */}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(account.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Bunga: {account.interestRate}% per tahun
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PiggyBank className="h-5 w-5" />
                    <span>Informasi Rekening</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Jenis Simpanan</p>
                        <p className="font-medium">
                          {getAccountTypeName(account.type)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Tanggal Pembukaan
                        </p>
                        <p className="font-medium">
                          {new Date(account.openDate).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Transaksi Terakhir
                        </p>
                        <p className="font-medium">
                          {new Date(account.lastTransaction).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Setoran Bulanan</p>
                        <p className="font-medium">
                          {formatCurrency(account.monthlyDeposit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tingkat Bunga</p>
                        <p className="font-medium">
                          {account.interestRate}% per tahun
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Penarikan</p>
                        <p className="font-medium">
                          {formatCurrency(account.totalWithdrawals)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Riwayat Transaksi</span>
                  </CardTitle>
                  <CardDescription>5 transaksi terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              transaction.type === "deposit"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {transaction.type === "deposit" ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString(
                                "id-ID"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium ${
                              transaction.type === "deposit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "deposit" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Saldo: {formatCurrency(transaction.balance)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Account Benefits */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">
                    Keuntungan Simpanan Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">
                        Manfaat:
                      </h4>
                      <ul className="space-y-1 text-blue-700">
                        <li>
                          • Bunga kompetitif {account.interestRate}% per tahun
                        </li>
                        <li>• Bebas biaya administrasi bulanan</li>
                        <li>• Dapat dijadikan jaminan pinjaman</li>
                        <li>• Perlindungan asuransi simpanan</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">
                        Fasilitas:
                      </h4>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Setoran minimum rendah</li>
                        <li>• Penarikan fleksibel (sesuai ketentuan)</li>
                        <li>• Laporan bulanan otomatis</li>
                        <li>• Layanan online 24/7</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">Tidak ada data rekening</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SavingsDetailViewModal;
