import { useState, useEffect } from 'react';
import { supabase, Loan, LoanPayment, generateJournalEntry } from '@/lib/supabase';

export const useLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all loans
  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('app_1c0eac5202_loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loans:', error);
        throw error;
      }

      setLoans(data || []);
    } catch (err) {
      console.error('Fetch loans error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all loan payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('app_1c0eac5202_loan_payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        throw error;
      }

      setPayments(data || []);
    } catch (err) {
      console.error('Fetch payments error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  // Create a new loan application
  const createLoan = async (loanData: {
    member_id: string;
    loan_amount: number;
    interest_rate: number;
    term_months: number;
    application_date?: string;
  }) => {
    try {
      console.log('Creating loan:', loanData);

      // Generate unique loan ID
      const timestamp = Date.now();
      const loanId = `L-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate monthly payment using simple interest
      const monthlyInterestRate = loanData.interest_rate / 100 / 12;
      const monthlyPayment = loanData.loan_amount * 
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanData.term_months)) /
        (Math.pow(1 + monthlyInterestRate, loanData.term_months) - 1);

      const newLoanData = {
        loan_id: loanId,
        member_id: loanData.member_id,
        loan_amount: loanData.loan_amount,
        interest_rate: loanData.interest_rate,
        term_months: loanData.term_months,
        monthly_payment: Math.round(monthlyPayment),
        remaining_balance: loanData.loan_amount,
        status: 'pending' as const,
        application_date: loanData.application_date || new Date().toISOString().split('T')[0],
        disbursement_date: new Date().toISOString().split('T')[0],
      };

      const { data: newLoan, error: loanError } = await supabase
        .from('app_1c0eac5202_loans')
        .insert([newLoanData])
        .select()
        .single();

      if (loanError) {
        console.error('Error creating loan:', loanError);
        throw loanError;
      }

      setLoans(prev => [newLoan, ...prev]);

      // Create journal entry for loan disbursement
      try {
        await generateJournalEntry('loan_disbursement', {
          loan_id: loanId,
          loan_amount: loanData.loan_amount,
          transaction_date: new Date().toISOString().split('T')[0]
        });
      } catch (journalError) {
        console.warn('Journal entry creation failed:', journalError);
      }

      console.log('Loan created successfully:', newLoan);
      return newLoan;
    } catch (err) {
      console.error('Create loan error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create loan');
    }
  };

  // Process a loan payment
  const processPayment = async (paymentData: {
    loan_id: string;
    member_id: string;
    payment_amount: number;
    payment_method: string;
  }) => {
    try {
      console.log('Processing loan payment:', paymentData);

      // Find the loan
      const loan = loans.find(l => l.loan_id === paymentData.loan_id);
      if (!loan) {
        throw new Error('Loan not found');
      }

      if (loan.remaining_balance <= 0) {
        throw new Error('Loan is already paid off');
      }

      // Generate unique payment ID
      const timestamp = Date.now();
      const paymentId = `LP-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate interest and principal portions (simplified)
      const monthlyInterestRate = loan.interest_rate / 100 / 12;
      const interestAmount = Math.round(loan.remaining_balance * monthlyInterestRate);
      const principalAmount = Math.min(
        paymentData.payment_amount - interestAmount,
        loan.remaining_balance
      );
      const newRemainingBalance = Math.max(0, loan.remaining_balance - principalAmount);

      const paymentRecord = {
        payment_id: paymentId,
        loan_id: paymentData.loan_id,
        member_id: paymentData.member_id,
        payment_amount: paymentData.payment_amount,
        principal_amount: principalAmount,
        interest_amount: interestAmount,
        remaining_balance: newRemainingBalance,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: paymentData.payment_method,
      };

      const { data: newPayment, error: paymentError } = await supabase
        .from('app_1c0eac5202_loan_payments')
        .insert([paymentRecord])
        .select()
        .single();

      if (paymentError) {
        console.error('Error creating payment:', paymentError);
        throw paymentError;
      }

      // Update loan balance and status
      const newStatus = newRemainingBalance === 0 ? 'paid_off' : 'active';
      
      const { error: updateError } = await supabase
        .from('app_1c0eac5202_loans')
        .update({ 
          remaining_balance: newRemainingBalance,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', loan.id);

      if (updateError) {
        console.error('Error updating loan:', updateError);
        throw updateError;
      }

      // Update local state
      setLoans(prev => 
        prev.map(l => l.id === loan.id ? { 
          ...l, 
          remaining_balance: newRemainingBalance,
          status: newStatus
        } : l)
      );
      setPayments(prev => [newPayment, ...prev]);

      // Create journal entry
      try {
        await generateJournalEntry('loan_payment', {
          loan_id: paymentData.loan_id,
          payment_amount: paymentData.payment_amount,
          transaction_date: new Date().toISOString().split('T')[0]
        });
      } catch (journalError) {
        console.warn('Journal entry creation failed:', journalError);
      }

      console.log('Payment processed successfully:', newPayment);
      return newPayment;
    } catch (err) {
      console.error('Process payment error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to process payment');
    }
  };

  // Get loans by member
  const getLoansByMember = (memberId: string) => {
    return loans.filter(loan => loan.member_id === memberId);
  };

  // Get active loans by member
  const getActiveLoansByMember = (memberId: string) => {
    return loans.filter(loan => 
      loan.member_id === memberId && 
      (loan.status === 'active' || loan.status === 'approved')
    );
  };

  // Get payment history for a loan
  const getPaymentHistory = (loanId: string) => {
    return payments.filter(payment => payment.loan_id === loanId);
  };

  // Get total outstanding balance for a member
  const getTotalOutstanding = (memberId: string): number => {
    return loans
      .filter(loan => loan.member_id === memberId && loan.status === 'active')
      .reduce((total, loan) => total + (loan.remaining_balance || 0), 0);
  };

  useEffect(() => {
    fetchLoans();
    fetchPayments();
  }, []);

  return {
    loans,
    payments,
    loading,
    error,
    createLoan,
    processPayment,
    getLoansByMember,
    getActiveLoansByMember,
    getPaymentHistory,
    getTotalOutstanding,
    refetch: () => {
      fetchLoans();
      fetchPayments();
    },
  };
};