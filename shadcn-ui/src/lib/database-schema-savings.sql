-- Phase 4A: Database Schema for Savings Management

-- Savings Table (Monthly aggregated data)
CREATE TABLE savings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES profiles(id),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    simpanan_pokok NUMERIC(15,2) DEFAULT 0,
    simpanan_wajib NUMERIC(15,2) DEFAULT 0,
    simpanan_sukarela NUMERIC(15,2) DEFAULT 0,
    total NUMERIC(15,2) GENERATED ALWAYS AS (simpanan_pokok + simpanan_wajib + simpanan_sukarela) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, month, year)
);

-- Savings Transactions Table (Individual transactions)
CREATE TABLE savings_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES profiles(id),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('pokok', 'wajib', 'sukarela', 'withdrawal')),
    amount NUMERIC(15,2) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto Debit Processing Table
CREATE TABLE auto_debit_batches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    batch_date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    total_members INTEGER DEFAULT 0,
    total_amount NUMERIC(15,2) DEFAULT 0,
    processed_by UUID NOT NULL REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_savings_member_id ON savings(member_id);
CREATE INDEX idx_savings_period ON savings(year, month);
CREATE INDEX idx_savings_transactions_member_id ON savings_transactions(member_id);
CREATE INDEX idx_savings_transactions_date ON savings_transactions(transaction_date);
CREATE INDEX idx_savings_transactions_type ON savings_transactions(type);
CREATE INDEX idx_auto_debit_batches_period ON auto_debit_batches(period_year, period_month);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_debit_batches ENABLE ROW LEVEL SECURITY;

-- Savings Policies
CREATE POLICY "Members can view their own savings" ON savings
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Managers can view all savings" ON savings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "System can manage savings" ON savings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'system')
        )
    );

-- Savings Transactions Policies
CREATE POLICY "Members can view their own transactions" ON savings_transactions
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Members can create their own transactions" ON savings_transactions
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Managers can view all transactions" ON savings_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "Managers can create transactions" ON savings_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

-- Auto Debit Batches Policies
CREATE POLICY "Managers can manage auto debit batches" ON auto_debit_batches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

-- View for total savings per member
CREATE VIEW member_savings_summary AS
SELECT 
    p.id as member_id,
    p.full_name,
    p.employee_id,
    COALESCE(SUM(s.simpanan_pokok), 0) as total_pokok,
    COALESCE(SUM(s.simpanan_wajib), 0) as total_wajib,
    COALESCE(SUM(s.simpanan_sukarela), 0) as total_sukarela,
    COALESCE(SUM(s.total), 0) as total_savings,
    COUNT(s.id) as months_count,
    MAX(s.updated_at) as last_updated
FROM profiles p
LEFT JOIN savings s ON p.id = s.member_id
WHERE p.role = 'member'
GROUP BY p.id, p.full_name, p.employee_id;

-- Function to update savings after transaction
CREATE OR REPLACE FUNCTION update_savings_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update savings record for the month
    INSERT INTO savings (member_id, month, year, simpanan_pokok, simpanan_wajib, simpanan_sukarela, created_by)
    VALUES (
        NEW.member_id,
        EXTRACT(MONTH FROM NEW.transaction_date)::INTEGER,
        EXTRACT(YEAR FROM NEW.transaction_date)::INTEGER,
        CASE WHEN NEW.type = 'pokok' THEN NEW.amount ELSE 0 END,
        CASE WHEN NEW.type = 'wajib' THEN NEW.amount ELSE 0 END,
        CASE WHEN NEW.type = 'sukarela' THEN NEW.amount ELSE 0 END,
        NEW.created_by
    )
    ON CONFLICT (member_id, month, year)
    DO UPDATE SET
        simpanan_pokok = savings.simpanan_pokok + CASE WHEN NEW.type = 'pokok' THEN NEW.amount ELSE 0 END,
        simpanan_wajib = savings.simpanan_wajib + CASE WHEN NEW.type = 'wajib' THEN NEW.amount ELSE 0 END,
        simpanan_sukarela = savings.simpanan_sukarela + CASE WHEN NEW.type = 'sukarela' THEN NEW.amount ELSE 0 END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update savings after transaction
CREATE TRIGGER update_savings_after_transaction_trigger
    AFTER INSERT ON savings_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_savings_after_transaction();

-- Triggers for updated_at
CREATE TRIGGER update_savings_updated_at BEFORE UPDATE ON savings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_transactions_updated_at BEFORE UPDATE ON savings_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();