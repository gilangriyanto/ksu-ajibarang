import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import MemberDashboard from './pages/MemberDashboard';
import MemberProfile from './pages/member/Profile';
import MemberSavings from './pages/member/MemberSavings';
import MemberLoans from './pages/member/MemberLoans';
import PayrollView from './pages/member/PayrollView';
import ManagerDashboard from './pages/ManagerDashboard';
import MemberManagement from './pages/manager/MemberManagement';
import SavingsManagement from './pages/manager/SavingsManagement';
import LoanManagement from './pages/manager/LoanManagement';
import PayrollManagement from './pages/manager/PayrollManagement';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
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
            <Route path="/manager/savings" element={<SavingsManagement />} />
            <Route path="/manager/loans" element={<LoanManagement />} />
            <Route path="/manager/payroll" element={<PayrollManagement />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;