import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ctqtbvynajpdwqzhwduu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0cXRidnluYWpwZHdxemh3ZHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNDI4MDIsImV4cCI6MjA3NTYxODgwMn0.Xe32Zdvrivu2Dhobky6T5_J1JxLfJwUbCftiAskNUNg'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('test').select('*').limit(1)
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist, which is OK
      console.error('Supabase connection error:', error)
      return false
    }
    console.log('✅ Supabase connection successful')
    return true
  } catch (err) {
    console.error('❌ Supabase connection failed:', err)
    return false
  }
}

// Generate journal entry function
export const generateJournalEntry = async (
  entryType: string,
  data: any
) => {
  try {
    const entryId = `JE-${Date.now()}`
    const date = new Date().toISOString()
    
    console.log(`Creating journal entry: ${entryType}`, data)
    
    return {
      id: entryId,
      date,
      entry_type: entryType,
      description: data.description || `Journal entry for ${entryType}`,
      amount: data.amount,
      member_id: data.member_id,
      created_at: date,
      ...data
    }
  } catch (err) {
    console.error('Error generating journal entry:', err)
    throw err
  }
}

// Database table type definitions
export type Member = {
  id: string
  member_id: string
  name: string
  email?: string
  phone?: string
  address?: string
  join_date: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export type SavingsAccount = {
  id: string
  account_id: string
  member_id: string
  account_type: 'pokok' | 'wajib' | 'sukarela'
  balance: number
  created_at: string
  updated_at: string
}

export type SavingsTransaction = {
  id: string
  transaction_id: string
  account_id: string
  member_id: string
  transaction_type: 'deposit' | 'withdrawal'
  amount: number
  description?: string
  transaction_date: string
  balance_after: number
  created_at: string
}

export type Loan = {
  id: string
  loan_id: string
  member_id: string
  amount: number
  interest_rate: number
  term_months: number
  monthly_payment: number
  remaining_balance: number
  status: 'active' | 'paid_off' | 'overdue' | 'pending'
  purpose?: string
  approved_date?: string
  created_at: string
  updated_at: string
}

export type LoanPayment = {
  id: string
  payment_id: string
  loan_id: string
  member_id: string
  amount: number
  payment_date: string
  principal_amount: number
  interest_amount: number
  remaining_balance: number
  status: 'completed' | 'pending' | 'failed'
  created_at: string
}

export type ServiceFee = {
  id: string
  fee_id: string
  member_id: string
  period: string
  gross_amount: number
  loan_deduction: number
  net_amount: number
  status: 'pending' | 'paid'
  payment_date?: string
  created_at: string
  updated_at: string
}