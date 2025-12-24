// src/utils/incomeStatementTransformer.ts
import { GeneralLedgerAccount } from "@/lib/api/generalLedger.service";

export interface IncomeStatementItem {
  code: string;
  name: string;
  current: number;
  previous: number;
}

export interface IncomeStatementData {
  revenue: IncomeStatementItem[];
  operatingExpenses: IncomeStatementItem[];
  nonOperatingIncome: IncomeStatementItem[];
  nonOperatingExpenses: IncomeStatementItem[];
}

/**
 * Determine if account is revenue (4-xxxx)
 */
const isRevenueAccount = (accountCode: string): boolean => {
  return accountCode.startsWith("4-");
};

/**
 * Determine if account is expense (5-xxxx)
 */
const isExpenseAccount = (accountCode: string): boolean => {
  return accountCode.startsWith("5-");
};

/**
 * Determine if account is operating or non-operating
 * Operating accounts typically: 4-1xxx (revenue) and 5-1xxx (expense)
 * Non-operating accounts: 4-2xxx (other income) and 5-2xxx (other expense)
 */
const isOperatingAccount = (accountCode: string): boolean => {
  // Check if it's 4-1xxx or 5-1xxx
  return accountCode.startsWith("4-1") || accountCode.startsWith("5-1");
};

/**
 * Calculate account balance for income statement
 * Revenue: Credit increases (normal balance credit)
 * Expense: Debit increases (normal balance debit)
 */
const calculateAccountAmount = (account: GeneralLedgerAccount): number => {
  const { total_debit, total_credit } = account;

  if (isRevenueAccount(account.account.code)) {
    // Revenue: Credit - Debit
    return total_credit - total_debit;
  } else if (isExpenseAccount(account.account.code)) {
    // Expense: Debit - Credit
    return total_debit - total_credit;
  }

  return 0;
};

/**
 * Transform general ledger data to income statement format
 */
export const transformToIncomeStatement = (
  currentPeriod: GeneralLedgerAccount[],
  previousPeriod: GeneralLedgerAccount[]
): IncomeStatementData => {
  const incomeStatement: IncomeStatementData = {
    revenue: [],
    operatingExpenses: [],
    nonOperatingIncome: [],
    nonOperatingExpenses: [],
  };

  // Create a map of previous period balances for quick lookup
  const previousBalanceMap = new Map<string, number>();
  previousPeriod.forEach((account) => {
    previousBalanceMap.set(
      account.account.code,
      calculateAccountAmount(account)
    );
  });

  // Process current period accounts
  currentPeriod.forEach((account) => {
    const accountCode = account.account.code;
    const isRevenue = isRevenueAccount(accountCode);
    const isExpense = isExpenseAccount(accountCode);

    // Skip non-revenue and non-expense accounts
    if (!isRevenue && !isExpense) {
      return;
    }

    const item: IncomeStatementItem = {
      code: accountCode,
      name: account.account.name,
      current: calculateAccountAmount(account),
      previous: previousBalanceMap.get(accountCode) || 0,
    };

    // Categorize the account
    const isOperating = isOperatingAccount(accountCode);

    if (isRevenue && isOperating) {
      incomeStatement.revenue.push(item);
    } else if (isRevenue && !isOperating) {
      incomeStatement.nonOperatingIncome.push(item);
    } else if (isExpense && isOperating) {
      incomeStatement.operatingExpenses.push(item);
    } else if (isExpense && !isOperating) {
      incomeStatement.nonOperatingExpenses.push(item);
    }
  });

  // Add accounts that exist in previous period but not in current
  previousPeriod.forEach((account) => {
    const accountCode = account.account.code;
    const isRevenue = isRevenueAccount(accountCode);
    const isExpense = isExpenseAccount(accountCode);

    // Skip non-revenue and non-expense accounts
    if (!isRevenue && !isExpense) {
      return;
    }

    // Check if account already exists in current period
    const existsInCurrent = currentPeriod.some(
      (curr) => curr.account.code === accountCode
    );

    if (!existsInCurrent) {
      const item: IncomeStatementItem = {
        code: accountCode,
        name: account.account.name,
        current: 0,
        previous: calculateAccountAmount(account),
      };

      const isOperating = isOperatingAccount(accountCode);

      if (isRevenue && isOperating) {
        incomeStatement.revenue.push(item);
      } else if (isRevenue && !isOperating) {
        incomeStatement.nonOperatingIncome.push(item);
      } else if (isExpense && isOperating) {
        incomeStatement.operatingExpenses.push(item);
      } else if (isExpense && !isOperating) {
        incomeStatement.nonOperatingExpenses.push(item);
      }
    }
  });

  // Sort by account code
  const sortByCode = (a: IncomeStatementItem, b: IncomeStatementItem) =>
    a.code.localeCompare(b.code);

  incomeStatement.revenue.sort(sortByCode);
  incomeStatement.operatingExpenses.sort(sortByCode);
  incomeStatement.nonOperatingIncome.sort(sortByCode);
  incomeStatement.nonOperatingExpenses.sort(sortByCode);

  return incomeStatement;
};

/**
 * Calculate totals for income statement
 */
export const calculateIncomeStatementTotals = (data: IncomeStatementData) => {
  const calculateTotal = (items: IncomeStatementItem[]) =>
    items.reduce((sum, item) => sum + item.current, 0);

  const calculatePreviousTotal = (items: IncomeStatementItem[]) =>
    items.reduce((sum, item) => sum + item.previous, 0);

  // Current period
  const totalRevenue = calculateTotal(data.revenue);
  const totalOperatingExpenses = calculateTotal(data.operatingExpenses);
  const operatingIncome = totalRevenue - totalOperatingExpenses;

  const totalNonOperatingIncome = calculateTotal(data.nonOperatingIncome);
  const totalNonOperatingExpenses = calculateTotal(data.nonOperatingExpenses);
  const nonOperatingIncome =
    totalNonOperatingIncome - totalNonOperatingExpenses;

  const netIncome = operatingIncome + nonOperatingIncome;

  // Previous period
  const previousTotalRevenue = calculatePreviousTotal(data.revenue);
  const previousTotalOperatingExpenses = calculatePreviousTotal(
    data.operatingExpenses
  );
  const previousOperatingIncome =
    previousTotalRevenue - previousTotalOperatingExpenses;

  const previousTotalNonOperatingIncome = calculatePreviousTotal(
    data.nonOperatingIncome
  );
  const previousTotalNonOperatingExpenses = calculatePreviousTotal(
    data.nonOperatingExpenses
  );
  const previousNonOperatingIncome =
    previousTotalNonOperatingIncome - previousTotalNonOperatingExpenses;

  const previousNetIncome =
    previousOperatingIncome + previousNonOperatingIncome;

  // Margins and ratios
  const grossMargin =
    totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0;
  const netMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
  const operatingExpenseRatio =
    totalRevenue > 0 ? (totalOperatingExpenses / totalRevenue) * 100 : 0;

  return {
    current: {
      totalRevenue,
      totalOperatingExpenses,
      operatingIncome,
      totalNonOperatingIncome,
      totalNonOperatingExpenses,
      nonOperatingIncome,
      netIncome,
    },
    previous: {
      totalRevenue: previousTotalRevenue,
      totalOperatingExpenses: previousTotalOperatingExpenses,
      operatingIncome: previousOperatingIncome,
      totalNonOperatingIncome: previousTotalNonOperatingIncome,
      totalNonOperatingExpenses: previousTotalNonOperatingExpenses,
      nonOperatingIncome: previousNonOperatingIncome,
      netIncome: previousNetIncome,
    },
    ratios: {
      grossMargin,
      netMargin,
      operatingExpenseRatio,
    },
  };
};

/**
 * Calculate variance between current and previous period
 */
export const calculateVariance = (current: number, previous: number) => {
  const variance = current - previous;
  const percentage = previous !== 0 ? (variance / previous) * 100 : 0;
  return { amount: variance, percentage };
};
