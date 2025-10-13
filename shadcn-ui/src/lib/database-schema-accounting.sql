-- Phase 5A: Database Schema for Accounting System

-- Chart of Accounts Table
CREATE TABLE chart_of_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    normal_balance TEXT NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
    parent_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounting Periods Table
CREATE TABLE accounting_periods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    opened_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_date TIMESTAMP WITH TIME ZONE,
    closed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year, month)
);

-- Journal Entries Table
CREATE TABLE journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    journal_number TEXT UNIQUE NOT NULL,
    journal_type TEXT NOT NULL CHECK (journal_type IN ('general', 'special', 'adjustment', 'closing', 'reversing')),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_id UUID NOT NULL REFERENCES accounting_periods(id),
    description TEXT NOT NULL,
    reference_type TEXT, -- 'loan', 'saving', 'manual'
    reference_id UUID,
    is_auto_generated BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal Entry Lines Table
CREATE TABLE journal_entry_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    debit NUMERIC(15,2) DEFAULT 0 CHECK (debit >= 0),
    credit NUMERIC(15,2) DEFAULT 0 CHECK (credit >= 0),
    description TEXT,
    line_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_debit_or_credit CHECK (
        (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)
    )
);

-- Indexes for better performance
CREATE INDEX idx_coa_code ON chart_of_accounts(code);
CREATE INDEX idx_coa_type ON chart_of_accounts(account_type);
CREATE INDEX idx_coa_parent ON chart_of_accounts(parent_id);
CREATE INDEX idx_periods_year_month ON accounting_periods(year, month);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_period ON journal_entries(period_id);
CREATE INDEX idx_journal_entries_type ON journal_entries(journal_type);
CREATE INDEX idx_journal_entry_lines_journal ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_entry_lines_account ON journal_entry_lines(account_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- Chart of Accounts Policies
CREATE POLICY "Managers can manage COA" ON chart_of_accounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

-- Accounting Periods Policies
CREATE POLICY "Managers can manage periods" ON accounting_periods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

-- Journal Entries Policies
CREATE POLICY "Managers can manage journal entries" ON journal_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

-- Journal Entry Lines Policies
CREATE POLICY "Managers can manage journal entry lines" ON journal_entry_lines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

-- Function to validate journal entry balance
CREATE OR REPLACE FUNCTION validate_journal_balance()
RETURNS TRIGGER AS $$
DECLARE
    total_debit NUMERIC(15,2);
    total_credit NUMERIC(15,2);
BEGIN
    -- Calculate totals for the journal entry
    SELECT 
        COALESCE(SUM(debit), 0),
        COALESCE(SUM(credit), 0)
    INTO total_debit, total_credit
    FROM journal_entry_lines
    WHERE journal_entry_id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id);
    
    -- Check if debits equal credits
    IF total_debit != total_credit THEN
        RAISE EXCEPTION 'Journal entry is not balanced: Debit (%) != Credit (%)', total_debit, total_credit;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate journal balance
CREATE TRIGGER validate_journal_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON journal_entry_lines
    FOR EACH ROW
    EXECUTE FUNCTION validate_journal_balance();

-- Function to generate journal number
CREATE OR REPLACE FUNCTION generate_journal_number(journal_type_param TEXT, entry_date_param DATE)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    year_month TEXT;
    sequence_num INTEGER;
    journal_number TEXT;
BEGIN
    -- Set prefix based on journal type
    CASE journal_type_param
        WHEN 'general' THEN prefix := 'JU';
        WHEN 'special' THEN prefix := 'JK';
        WHEN 'adjustment' THEN prefix := 'JP';
        WHEN 'closing' THEN prefix := 'JT';
        WHEN 'reversing' THEN prefix := 'JB';
        ELSE prefix := 'JU';
    END CASE;
    
    -- Format year-month
    year_month := TO_CHAR(entry_date_param, 'YYYYMM');
    
    -- Get next sequence number for this type and month
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(journal_number FROM LENGTH(prefix || '-' || year_month || '-') + 1) 
            AS INTEGER
        )
    ), 0) + 1
    INTO sequence_num
    FROM journal_entries
    WHERE journal_number LIKE prefix || '-' || year_month || '-%';
    
    -- Generate journal number
    journal_number := prefix || '-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN journal_number;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create accounting period
CREATE OR REPLACE FUNCTION get_or_create_period(entry_date DATE)
RETURNS UUID AS $$
DECLARE
    period_id UUID;
    entry_year INTEGER;
    entry_month INTEGER;
BEGIN
    entry_year := EXTRACT(YEAR FROM entry_date);
    entry_month := EXTRACT(MONTH FROM entry_date);
    
    -- Try to find existing period
    SELECT id INTO period_id
    FROM accounting_periods
    WHERE year = entry_year AND month = entry_month;
    
    -- Create period if not exists
    IF period_id IS NULL THEN
        INSERT INTO accounting_periods (year, month, status)
        VALUES (entry_year, entry_month, 'open')
        RETURNING id INTO period_id;
    END IF;
    
    RETURN period_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_coa_updated_at BEFORE UPDATE ON chart_of_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();