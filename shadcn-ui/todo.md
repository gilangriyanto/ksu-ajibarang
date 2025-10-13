# Hospital Cooperative System - MVP Implementation Plan

## Overview
Building a hospital cooperative web application with Member and Manager roles, featuring loan management, savings, accounting, and asset management.

## Core Files to Create (Max 8 files limit - MVP focus)

### 1. Database Schema & Types
- `src/types/database.ts` - TypeScript interfaces for all database entities
- `src/lib/supabase.ts` - Supabase client configuration

### 2. Authentication & Context
- `src/contexts/AuthContext.tsx` - Authentication context with role-based access
- `src/components/auth/LoginForm.tsx` - Login form component

### 3. Main Dashboard Components
- `src/pages/MemberDashboard.tsx` - Member dashboard with loan/savings summary
- `src/pages/ManagerDashboard.tsx` - Manager dashboard with KPIs and management tools

### 4. Core Business Logic
- `src/components/loans/LoanModule.tsx` - Loan application and management
- `src/components/savings/SavingsModule.tsx` - Savings management

## MVP Features Priority (Simplified for 8-file limit)

### Phase 1 - Essential Core (This Implementation)
1. **Authentication System**
   - Login/Register with role assignment
   - Protected routes based on role

2. **Member Features (Simplified)**
   - Basic dashboard with loan/savings summary
   - Loan application form
   - Savings deposit form
   - View transaction history

3. **Manager Features (Simplified)**
   - Dashboard with basic KPIs
   - Approve/reject loan applications
   - View all members and their data
   - Basic reporting

### Phase 2 - Advanced Features (Future Enhancement)
- Full accounting module with COA and journals
- Asset management
- PDF/Excel exports
- Auto-debit system
- Advanced reporting

## Database Tables (Supabase)
1. `profiles` - User profiles with roles
2. `loans` - Loan applications and active loans
3. `loan_payments` - Loan payment history
4. `savings` - Savings transactions
5. `members` - Member details and status

## Key Business Rules (Simplified for MVP)
1. Members can apply for loans and make savings deposits
2. Managers can approve/reject loans and view all data
3. Basic transaction tracking
4. Role-based access control

## Implementation Strategy
- Focus on core functionality first
- Use localStorage for temporary data if needed
- Implement Supabase integration for persistent storage
- Ensure responsive design with Tailwind CSS
- Use shadcn/ui components for consistent UI