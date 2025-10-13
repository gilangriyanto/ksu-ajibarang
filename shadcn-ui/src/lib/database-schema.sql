-- Phase 3A: Database Schema for Loan Management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Loan Applications Table
CREATE TABLE loan_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES profiles(id),
    amount NUMERIC(15,2) NOT NULL,
    tenor_months INTEGER NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans Table
CREATE TABLE loans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES loan_applications(id),
    member_id UUID NOT NULL REFERENCES profiles(id),
    principal_amount NUMERIC(15,2) NOT NULL,
    interest_rate NUMERIC(5,4) NOT NULL, -- e.g., 0.01 for 1%
    tenor_months INTEGER NOT NULL,
    monthly_payment NUMERIC(15,2) NOT NULL,
    total_payment NUMERIC(15,2) NOT NULL,
    remaining_balance NUMERIC(15,2) NOT NULL,
    disbursement_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid_off', 'defaulted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Payments Table
CREATE TABLE loan_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    loan_id UUID NOT NULL REFERENCES loans(id),
    payment_date DATE NOT NULL,
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    principal_amount NUMERIC(15,2) NOT NULL,
    interest_amount NUMERIC(15,2) NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'auto_debit' CHECK (payment_method IN ('auto_debit', 'manual')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_loan_applications_member_id ON loan_applications(member_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX idx_loan_payments_status ON loan_payments(status);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;

-- Loan Applications Policies
CREATE POLICY "Members can view their own applications" ON loan_applications
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Members can create their own applications" ON loan_applications
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Managers can view all applications" ON loan_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "Managers can update applications" ON loan_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

-- Loans Policies
CREATE POLICY "Members can view their own loans" ON loans
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Managers can view all loans" ON loans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "Managers can create loans" ON loans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "Managers can update loans" ON loans
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

-- Loan Payments Policies
CREATE POLICY "Members can view their own loan payments" ON loan_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM loans 
            WHERE loans.id = loan_payments.loan_id 
            AND loans.member_id = auth.uid()
        )
    );

CREATE POLICY "Managers can view all loan payments" ON loan_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "System can create loan payments" ON loan_payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update loan payments" ON loan_payments
    FOR UPDATE USING (true);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_payments_updated_at BEFORE UPDATE ON loan_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();