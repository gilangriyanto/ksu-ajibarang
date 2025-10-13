-- Phase 5B: Seed Data for Chart of Accounts

-- Function to insert COA with proper hierarchy
CREATE OR REPLACE FUNCTION seed_chart_of_accounts()
RETURNS VOID AS $$
DECLARE
    asset_parent_id UUID;
    liability_parent_id UUID;
    equity_parent_id UUID;
    revenue_parent_id UUID;
    expense_parent_id UUID;
    current_asset_id UUID;
    fixed_asset_id UUID;
BEGIN
    -- Clear existing data (for re-seeding)
    DELETE FROM journal_entry_lines;
    DELETE FROM journal_entries;
    DELETE FROM chart_of_accounts;
    
    -- AKTIVA (ASSETS)
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES ('1-0000', 'AKTIVA', 'asset', 'debit', NULL, true)
    RETURNING id INTO asset_parent_id;
    
    -- 1. Aset Lancar
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES ('1-1000', 'Aset Lancar', 'asset', 'debit', asset_parent_id, true)
    RETURNING id INTO current_asset_id;
    
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES 
        ('1-1100', 'Kas', 'asset', 'debit', current_asset_id, true),
        ('1-1200', 'Bank', 'asset', 'debit', current_asset_id, true),
        ('1-1300', 'Piutang Anggota', 'asset', 'debit', current_asset_id, true);
    
    -- 2. Aset Tetap
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES ('1-2000', 'Aset Tetap', 'asset', 'debit', asset_parent_id, true)
    RETURNING id INTO fixed_asset_id;
    
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES 
        ('1-2100', 'Peralatan Kantor', 'asset', 'debit', fixed_asset_id, true),
        ('1-2200', 'Akumulasi Penyusutan Peralatan', 'asset', 'credit', fixed_asset_id, true);
    
    -- PASIVA (LIABILITIES + EQUITY)
    -- 3. Liabilitas
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES ('2-0000', 'LIABILITAS', 'liability', 'credit', NULL, true)
    RETURNING id INTO liability_parent_id;
    
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES ('2-1000', 'Liabilitas Jangka Pendek', 'liability', 'credit', liability_parent_id, true);
    
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES ('2-1100', 'Utang Jangka Pendek', 'liability', 'credit', 
            (SELECT id FROM chart_of_accounts WHERE code = '2-1000'), true);
    
    -- 4. Ekuitas
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES ('3-0000', 'EKUITAS', 'equity', 'credit', NULL, true)
    RETURNING id INTO equity_parent_id;
    
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES ('3-1000', 'Modal dan Simpanan', 'equity', 'credit', equity_parent_id, true);
    
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES 
        ('3-1100', 'Modal', 'equity', 'credit', 
         (SELECT id FROM chart_of_accounts WHERE code = '3-1000'), true),
        ('3-1200', 'Simpanan Pokok', 'equity', 'credit', 
         (SELECT id FROM chart_of_accounts WHERE code = '3-1000'), true),
        ('3-1300', 'Simpanan Wajib', 'equity', 'credit', 
         (SELECT id FROM chart_of_accounts WHERE code = '3-1000'), true),
        ('3-1400', 'Simpanan Sukarela', 'equity', 'credit', 
         (SELECT id FROM chart_of_accounts WHERE code = '3-1000'), true),
        ('3-1500', 'Laba Ditahan', 'equity', 'credit', 
         (SELECT id FROM chart_of_accounts WHERE code = '3-1000'), true),
        ('3-1600', 'Laba Tahun Berjalan', 'equity', 'credit', 
         (SELECT id FROM chart_of_accounts WHERE code = '3-1000'), true);
    
    -- PENDAPATAN (REVENUE)
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES ('4-0000', 'PENDAPATAN', 'revenue', 'credit', NULL, true)
    RETURNING id INTO revenue_parent_id;
    
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES ('4-1000', 'Pendapatan Operasional', 'revenue', 'credit', revenue_parent_id, true);
    
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES 
        ('4-1100', 'Pendapatan Bunga Pinjaman', 'revenue', 'credit', 
         (SELECT id FROM chart_of_accounts WHERE code = '4-1000'), true),
        ('4-1200', 'Pendapatan Administrasi', 'revenue', 'credit', 
         (SELECT id FROM chart_of_accounts WHERE code = '4-1000'), true);
    
    -- BEBAN (EXPENSES)
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES ('5-0000', 'BEBAN', 'expense', 'debit', NULL, true)
    RETURNING id INTO expense_parent_id;
    
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES ('5-1000', 'Beban Operasional', 'expense', 'debit', expense_parent_id, true);
    
    INSERT INTO chart_of_accounts (code, name, account_type, normal_balance, parent_id, is_active)
    VALUES 
        ('5-1100', 'Beban Gaji', 'expense', 'debit', 
         (SELECT id FROM chart_of_accounts WHERE code = '5-1000'), true),
        ('5-1200', 'Beban Operasional', 'expense', 'debit', 
         (SELECT id FROM chart_of_accounts WHERE code = '5-1000'), true),
        ('5-1300', 'Beban Penyusutan', 'expense', 'debit', 
         (SELECT id FROM chart_of_accounts WHERE code = '5-1000'), true);
    
    RAISE NOTICE 'Chart of Accounts seeded successfully';
END;
$$ LANGUAGE plpgsql;

-- Execute the seeding function
SELECT seed_chart_of_accounts();