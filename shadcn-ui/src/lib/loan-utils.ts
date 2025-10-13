import { LoanCalculation } from '@/types/loan';

export function calculateLoan(
  principal: number,
  annualRate: number,
  tenorMonths: number
): LoanCalculation {
  const monthlyRate = annualRate / 12;
  
  // Calculate monthly payment using PMT formula
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, tenorMonths)) / 
    (Math.pow(1 + monthlyRate, tenorMonths) - 1);
  
  const totalPayment = monthlyPayment * tenorMonths;
  const totalInterest = totalPayment - principal;
  
  // Generate payment schedule
  const schedule = [];
  let remainingBalance = principal;
  
  for (let month = 1; month <= tenorMonths; month++) {
    const interestAmount = remainingBalance * monthlyRate;
    const principalAmount = monthlyPayment - interestAmount;
    remainingBalance -= principalAmount;
    
    schedule.push({
      month,
      principalAmount,
      interestAmount,
      totalAmount: monthlyPayment,
      remainingBalance: Math.max(0, remainingBalance),
    });
  }
  
  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    schedule,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d]/g, '')) || 0;
}

export function formatCurrencyInput(value: string): string {
  const number = parseCurrency(value);
  return number.toLocaleString('id-ID');
}

export const LOAN_CONSTANTS = {
  MIN_AMOUNT: 1000000, // Rp 1,000,000
  MAX_AMOUNT: 50000000, // Rp 50,000,000
  DEFAULT_INTEREST_RATE: 0.01, // 1% per month
  TENOR_OPTIONS: [
    { value: 6, label: '6 Bulan' },
    { value: 12, label: '12 Bulan' },
    { value: 18, label: '18 Bulan' },
    { value: 24, label: '24 Bulan' },
    { value: 36, label: '36 Bulan' },
  ],
};