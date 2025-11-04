import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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

// Kas Pages (NEW!)
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
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

            {/* Member Routes */}
            <Route path="/member" element={<MemberDashboard />} />
            <Route path="/member/profile" element={<MemberProfile />} />
            <Route path="/member/savings" element={<MemberSavings />} />
            <Route path="/member/loans" element={<MemberLoans />} />
            <Route path="/member/payroll" element={<PayrollView />} />

            {/* Manager Routes */}
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/manager/members" element={<MemberManagement />} />
            <Route path="/manager/savings" element={<Savings />} />
            <Route path="/manager/loans" element={<LoanManagement />} />
            <Route path="/manager/payroll" element={<PayrollManagement />} />
            <Route path="/manager/accounting" element={<Accounting />} />
            <Route path="/manager/accounts" element={<AccountManagement />} />
            <Route path="/manager/assets" element={<AssetManagement />} />
            <Route path="/manager/balance-sheet" element={<BalanceSheet />} />
            <Route path="/manager/reports" element={<Reports />} />
            <Route path="/manager/settings" element={<Settings />} />
            <Route
              path="/manager/income-statement"
              element={<IncomeStatement />}
            />

            {/* Kas Routes (NEW!) - Dynamic untuk semua kas */}
            <Route path="/kas/:kasId" element={<KasDashboard />} />
            <Route path="/kas/:kasId/loans" element={<KasLoanManagement />} />
            <Route path="/kas/:kasId/savings" element={<KasSavings />} />
            <Route path="/kas/:kasId/accounting" element={<KasAccounting />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
