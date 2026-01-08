import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import MemberDashboard from "./pages/MemberDashboard";
import MemberProfile from "./pages/member/Profile";
import MemberSavings from "./pages/member/MemberSavings";
import MemberLoans from "./pages/member/MemberLoans";
import PayrollView from "./pages/member/PayrollView";
import ManagerDashboard from "./pages/ManagerDashboard";
import MemberManagement from "./pages/manager/MemberManagement";
import Savings from "./pages/manager/Savings";
import LoanManagement from "./pages/manager/LoanManagement";
import PayrollManagement from "./pages/manager/PayrollManagement";
import Accounting from "./pages/manager/Accounting";
import AccountManagement from "./pages/manager/AccountManagement";
import AssetManagement from "./pages/manager/AssetManagement";
import BalanceSheet from "./pages/manager/BalanceSheet";
import IncomeStatement from "./pages/manager/IncomeStatement";
import Reports from "./pages/manager/Reports";
import Settings from "./pages/manager/Settings";

// ✅ Import Manajemen Kas
import CashAccountsPage from "./pages/manager/kas";
import CashAccountDetailPage from "./pages/manager/kas/Detail";

// ✅ Import Installment Pages
import ManagerOverdueInstallments from "./pages/manager/OverdueInstallments";
import ManagerUpcomingInstallments from "./pages/manager/UpcomingInstallments";
import MemberOverdueInstallments from "./pages/member/OverdueInstallments";
import MemberUpcomingInstallments from "./pages/member/UpcomingInstallments";

// ✅ Kas Layout & Dashboard - Used by Admin
import KasLayout from "./components/layout/KasLayout";
import KasDashboard from "./pages/kas/KasDashboard";
import KasLoanManagement from "./pages/kas/KasLoanManagement";
import KasSavings from "./pages/kas/KasSavings";
import KasAccounting from "./pages/kas/KasAccounting";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

            {/* ✅ Admin Route - Uses KasLayout with KasDashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <KasLayout>
                    <KasDashboard />
                  </KasLayout>
                </ProtectedRoute>
              }
            />

            {/* Member Routes - Only for role "anggota" */}
            <Route
              path="/member"
              element={
                <ProtectedRoute allowedRoles={["anggota", "member"]}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/profile"
              element={
                <ProtectedRoute allowedRoles={["anggota", "member"]}>
                  <MemberProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/savings"
              element={
                <ProtectedRoute allowedRoles={["anggota", "member"]}>
                  <MemberSavings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/loans"
              element={
                <ProtectedRoute allowedRoles={["anggota", "member"]}>
                  <MemberLoans />
                </ProtectedRoute>
              }
            />

            {/* ✅ Member Installment Routes */}
            <Route
              path="/member/cicilan-terlambat"
              element={
                <ProtectedRoute allowedRoles={["anggota", "member"]}>
                  <MemberOverdueInstallments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/cicilan-mendatang"
              element={
                <ProtectedRoute allowedRoles={["anggota", "member"]}>
                  <MemberUpcomingInstallments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/member/payroll"
              element={
                <ProtectedRoute allowedRoles={["anggota", "member"]}>
                  <PayrollView />
                </ProtectedRoute>
              }
            />

            {/* Manager Routes - Only for manager WITHOUT kas_id - Uses ManagerLayout */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={["manager", "admin"]}>
                  <ManagerLayout>
                    {/* ✅ Harus ada ini */}
                    <ManagerDashboard />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/members"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <MemberManagement />
                </ProtectedRoute>
              }
            />

            {/* ✅ Manajemen Kas Route */}
            <Route
              path="/manager/kas"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <CashAccountsPage />
                </ProtectedRoute>
              }
            />

            {/* ✅ Manajemen Kas Detail Route */}
            <Route
              path="/manager/kas/:id"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <CashAccountDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/manager/savings"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <Savings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/loans"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <LoanManagement />
                </ProtectedRoute>
              }
            />

            {/* ✅ Manager Installment Routes */}
            <Route
              path="/manager/cicilan-terlambat"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <ManagerOverdueInstallments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/cicilan-mendatang"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <ManagerUpcomingInstallments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/manager/payroll"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <PayrollManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/accounting"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <Accounting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/accounts"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <AccountManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/assets"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <AssetManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/balance-sheet"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <BalanceSheet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/reports"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/settings"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/income-statement"
              element={
                <ProtectedRoute allowedRoles={["manajer", "manager", "admin"]}>
                  <IncomeStatement />
                </ProtectedRoute>
              }
            />

            {/* Kas Routes - Only for manager WITH kas_id - Uses KasLayout */}
            <Route
              path="/kas/:kasId"
              element={
                <ProtectedRoute
                  allowedRoles={["manajer", "manager", "admin"]}
                  requireKasId={true}
                >
                  <KasLayout>
                    <KasDashboard />
                  </KasLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kas/:kasId/loans"
              element={
                <ProtectedRoute
                  allowedRoles={["manajer", "manager", "admin"]}
                  requireKasId={true}
                >
                  <KasLayout>
                    <KasLoanManagement />
                  </KasLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kas/:kasId/savings"
              element={
                <ProtectedRoute
                  allowedRoles={["manajer", "manager", "admin"]}
                  requireKasId={true}
                >
                  <KasLayout>
                    <KasSavings />
                  </KasLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kas/:kasId/accounting"
              element={
                <ProtectedRoute
                  allowedRoles={["manajer", "manager", "admin"]}
                  requireKasId={true}
                >
                  <KasLayout>
                    <KasAccounting />
                  </KasLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
