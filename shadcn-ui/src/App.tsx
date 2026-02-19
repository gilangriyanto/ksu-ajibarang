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
import SalaryDeductionManagement from "./pages/manager/SalaryDeductionManagement";
import Reports from "./pages/manager/Reports";
import Settings from "./pages/manager/Settings";

// ✅ Import Manajemen Kas
import CashAccountsPage from "./pages/manager/kas";
import CashAccountDetailPage from "./pages/manager/kas/Detail";
// ✅ ADD: Import Saving Types Management
import SavingTypesManagement from "./pages/manager/SavingTypesManagement";
// ✅ Import Installment Pages
import ManagerOverdueInstallments from "./pages/manager/OverdueInstallments";
import ManagerUpcomingInstallments from "./pages/manager/UpcomingInstallments";
import ResignationManagement from "./pages/manager/ResignationManagement";
import MemberOverdueInstallments from "./pages/member/OverdueInstallments";
import MemberUpcomingInstallments from "./pages/member/UpcomingInstallments";
import MemberResignation from "./pages/member/MemberResignation";
// ✅ Import Cash Transfer Pages
import CashTransferManagement from "./pages/manager/CashTransferManagement";
// import MemberCashTransfer from "./pages/member/MemberCashTransfer";

// ✅ Kas Layout & Dashboard - Used by Manager Kas (role="manager")
import KasLayout from "./components/layout/KasLayout";
import KasDashboard from "./pages/kas/KasDashboard";
import KasLoanManagement from "./pages/kas/KasLoanManagement";
import KasSavings from "./pages/kas/KasSavings";
import KasAccounting from "./pages/kas/KasAccounting";
import KasSettings from "./pages/kas/KasSettings";
// ✅ NEW: Dedicated Cash Transfer page for Manager Kas (uses KasLayout, NOT ManagerLayout)
import KasCashTransfer from "./pages/kas/KasCashTransfer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes - INSIDE AuthProvider */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

            {/* ==========================================
                MEMBER ROUTES (role="anggota")
                ========================================== */}
            <Route
              path="/member"
              element={
                <ProtectedRoute allowedRoles={["anggota"]}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/profile"
              element={
                <ProtectedRoute allowedRoles={["anggota"]}>
                  <MemberProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/savings"
              element={
                <ProtectedRoute allowedRoles={["anggota"]}>
                  <MemberSavings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/loans"
              element={
                <ProtectedRoute allowedRoles={["anggota"]}>
                  <MemberLoans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/cicilan-terlambat"
              element={
                <ProtectedRoute allowedRoles={["anggota"]}>
                  <MemberOverdueInstallments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/cicilan-mendatang"
              element={
                <ProtectedRoute allowedRoles={["anggota"]}>
                  <MemberUpcomingInstallments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/payroll"
              element={
                <ProtectedRoute allowedRoles={["anggota"]}>
                  <PayrollView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/resignation"
              element={
                <ProtectedRoute allowedRoles={["anggota"]}>
                  <MemberResignation />
                </ProtectedRoute>
              }
            />

            {/* ==========================================
                ADMIN ROUTES (role="admin")
                Uses ManagerLayout - Full System Access
                ========================================== */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <ManagerDashboard />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/members"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <MemberManagement />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/kas"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <CashAccountsPage />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/kas/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <CashAccountDetailPage />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/savings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <Savings />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/saving-types"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <SavingTypesManagement />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/loans"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <LoanManagement />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/cicilan-terlambat"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <ManagerOverdueInstallments />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/cicilan-mendatang"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <ManagerUpcomingInstallments />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/payroll"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <PayrollManagement />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/accounting"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <Accounting />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/accounts"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <AccountManagement />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/resignations"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <ResignationManagement />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/salary-deductions"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <SalaryDeductionManagement />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/assets"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <AssetManagement />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/balance-sheet"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <BalanceSheet />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/reports"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <Reports />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <Settings />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/income-statement"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <IncomeStatement />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/cash-transfers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerLayout>
                    <CashTransferManagement />
                  </ManagerLayout>
                </ProtectedRoute>
              }
            />

            {/* ==========================================
                MANAGER KAS ROUTES (role="manager")
                Uses KasLayout - Specific Kas Access Only
                ========================================== */}
            <Route
              path="/kas/:kasId"
              element={
                <ProtectedRoute allowedRoles={["manager"]} requireKasId={true}>
                  <KasLayout>
                    <KasDashboard />
                  </KasLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kas/:kasId/loans"
              element={
                <ProtectedRoute allowedRoles={["manager"]} requireKasId={true}>
                  <KasLayout>
                    <KasLoanManagement />
                  </KasLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kas/:kasId/savings"
              element={
                <ProtectedRoute allowedRoles={["manager"]} requireKasId={true}>
                  <KasLayout>
                    <KasSavings />
                  </KasLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kas/:kasId/accounting"
              element={
                <ProtectedRoute allowedRoles={["manager"]} requireKasId={true}>
                  <KasLayout>
                    <KasAccounting />
                  </KasLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kas/:kasId/settings"
              element={
                <ProtectedRoute allowedRoles={["manager"]} requireKasId={true}>
                  <KasLayout>
                    <KasSettings />
                  </KasLayout>
                </ProtectedRoute>
              }
            />
            {/* ✅ FIXED: KasCashTransfer (dedicated page for kas role, no ManagerLayout conflict) */}
            <Route
              path="/kas/:kasId/cash-transfers"
              element={
                <ProtectedRoute allowedRoles={["manager"]} requireKasId={true}>
                  <KasLayout>
                    <KasCashTransfer />
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
