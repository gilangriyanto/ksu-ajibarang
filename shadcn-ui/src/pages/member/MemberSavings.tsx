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
import { SavingsDetailViewModal } from "@/components/modals/SavingsDetailViewModal";
import { PiggyBank, TrendingUp, Calendar, DollarSign, Eye } from "lucide-react";

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

export default function MemberSavings() {
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock data - replace with actual API calls
  const savingsData = {
    totalBalance: 6000000,
    thisMonthDeposit: 180000,
    accounts: [
      {
        id: "1",
        type: "wajib",
        typeName: "Simpanan Wajib",
        balance: 1200000,
        monthlyDeposit: 100000,
        openDate: "2023-01-15",
        lastTransaction: "2024-01-15",
        status: "active",
        interestRate: 6,
        totalDeposits: 1200000,
        totalWithdrawals: 0,
      },
      {
        id: "2",
        type: "sukarela",
        typeName: "Simpanan Sukarela",
        balance: 2500000,
        monthlyDeposit: 0,
        openDate: "2023-01-20",
        lastTransaction: "2024-01-20",
        status: "active",
        interestRate: 8,
        totalDeposits: 2500000,
        totalWithdrawals: 0,
      },
      {
        id: "3",
        type: "pokok",
        typeName: "Simpanan Pokok",
        balance: 500000,
        monthlyDeposit: 0,
        openDate: "2023-01-15",
        lastTransaction: "2023-01-15",
        status: "active",
        interestRate: 3,
        totalDeposits: 500000,
        totalWithdrawals: 0,
      },
      {
        id: "4",
        type: "hariRaya",
        typeName: "Simpanan Hari Raya",
        balance: 1800000,
        monthlyDeposit: 150000,
        openDate: "2023-01-25",
        lastTransaction: "2024-01-25",
        status: "active",
        interestRate: 7,
        totalDeposits: 1800000,
        totalWithdrawals: 0,
      },
    ],
    recentTransactions: [
      {
        id: "1",
        type: "deposit",
        savingsType: "Simpanan Hari Raya",
        amount: 150000,
        date: "2024-01-25",
        description: "Setoran rutin bulanan",
      },
      {
        id: "2",
        type: "deposit",
        savingsType: "Simpanan Sukarela",
        amount: 500000,
        date: "2024-01-20",
        description: "Setoran tambahan",
      },
      {
        id: "3",
        type: "interest",
        savingsType: "Simpanan Sukarela",
        amount: 15000,
        date: "2024-01-15",
        description: "Bunga simpanan bulan Desember",
      },
      {
        id: "4",
        type: "deposit",
        savingsType: "Simpanan Wajib",
        amount: 100000,
        date: "2024-01-15",
        description: "Setoran wajib bulanan",
      },
    ],
  };

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
        return <Badge className="bg-gray-100 text-gray-800">Tidak Aktif</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "interest":
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simpanan Saya</h1>
          <p className="text-gray-600 mt-1">Kelola dan pantau simpanan Anda</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <PiggyBank className="h-4 w-4 mr-2" />
                Total Simpanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(savingsData.totalBalance)}
              </div>
              <p className="text-xs text-gray-500 mt-1">4 jenis rekening</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Setoran Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(savingsData.thisMonthDeposit)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total setoran periode ini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Savings Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Simpanan</CardTitle>
            <CardDescription>Daftar semua simpanan Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savingsData.accounts.map((account) => (
                <Card key={account.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {account.typeName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Terakhir setor:{" "}
                          {new Date(account.lastTransaction).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      {getStatusBadge(account.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Saldo:</span>
                        <span className="font-medium">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Bunga:</span>
                        <span className="text-sm font-medium text-green-600">
                          {account.interestRate}% / tahun
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Prepare account data for modal
                          const accountData: SavingsAccount = {
                            id: account.id,
                            type: account.type,
                            balance: account.balance,
                            monthlyDeposit: account.monthlyDeposit,
                            openDate: account.openDate,
                            lastTransaction: account.lastTransaction,
                            status: account.status,
                            interestRate: account.interestRate,
                            totalDeposits: account.totalDeposits,
                            totalWithdrawals: account.totalWithdrawals,
                          };
                          console.log(
                            "Opening modal with account:",
                            accountData
                          );
                          setSelectedAccount(accountData);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Detail
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>
              Riwayat setoran dan bunga simpanan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savingsData.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.savingsType}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.description} •{" "}
                      {new Date(transaction.date).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        transaction.type === "deposit"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      +{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.type === "deposit" ? "Setoran" : "Bunga"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Detail Modal */}
      <SavingsDetailViewModal
        account={selectedAccount}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAccount(null);
        }}
      />
    </MemberLayout>
  );
}
