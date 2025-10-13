import { useState, useEffect } from 'react';
import { supabase, SavingsAccount, SavingsTransaction } from '@/lib/supabase';

export const useSavings = () => {
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch savings accounts
  const fetchSavingsAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('app_1c0eac5202_savings_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavingsAccounts(data || []);
    } catch (err) {
      console.error('Error fetching savings accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch savings accounts');
    }
  };

  // Fetch savings transactions
  const fetchSavingsTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('app_1c0eac5202_savings_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setSavingsTransactions(data || []);
    } catch (err) {
      console.error('Error fetching savings transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch savings transactions');
    }
  };

  // Create new savings account
  const createSavingsAccount = async (accountData: Omit<SavingsAccount, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('app_1c0eac5202_savings_accounts')
        .insert([accountData])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh accounts list
      await fetchSavingsAccounts();
      return data;
    } catch (err) {
      console.error('Error creating savings account:', err);
      throw err;
    }
  };

  // Create new savings transaction
  const createSavingsTransaction = async (transactionData: Omit<SavingsTransaction, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('app_1c0eac5202_savings_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;

      // Update account balance
      const account = savingsAccounts.find(acc => acc.id === transactionData.account_id);
      if (account) {
        const newBalance = transactionData.transaction_type === 'deposit' 
          ? account.balance + transactionData.amount
          : account.balance - transactionData.amount;

        await supabase
          .from('app_1c0eac5202_savings_accounts')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', account.id);
      }
      
      // Refresh data
      await fetchSavingsAccounts();
      await fetchSavingsTransactions();
      return data;
    } catch (err) {
      console.error('Error creating savings transaction:', err);
      throw err;
    }
  };

  // Update savings account
  const updateSavingsAccount = async (id: string, updates: Partial<SavingsAccount>) => {
    try {
      const { data, error } = await supabase
        .from('app_1c0eac5202_savings_accounts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh accounts list
      await fetchSavingsAccounts();
      return data;
    } catch (err) {
      console.error('Error updating savings account:', err);
      throw err;
    }
  };

  // Delete savings account
  const deleteSavingsAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('app_1c0eac5202_savings_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh accounts list
      await fetchSavingsAccounts();
    } catch (err) {
      console.error('Error deleting savings account:', err);
      throw err;
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchSavingsAccounts(),
          fetchSavingsTransactions()
        ]);
      } catch (err) {
        console.error('Error loading savings data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    savingsAccounts,
    savingsTransactions,
    loading,
    error,
    createSavingsAccount,
    createSavingsTransaction,
    updateSavingsAccount,
    deleteSavingsAccount,
    refreshData: () => {
      fetchSavingsAccounts();
      fetchSavingsTransactions();
    }
  };
};