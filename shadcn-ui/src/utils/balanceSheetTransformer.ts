// src/lib/utils/balanceSheetTransformer.ts
import { TrialBalanceAccount } from "../lib/api/trialBalance.service";

export interface BalanceSheetItem {
  code: string;
  name: string;
  current: number;
  previous: number;
}

export interface BalanceSheetData {
  assets: {
    currentAssets: BalanceSheetItem[];
    nonCurrentAssets: BalanceSheetItem[];
  };
  liabilities: {
    currentLiabilities: BalanceSheetItem[];
    nonCurrentLiabilities: BalanceSheetItem[];
  };
  equity: BalanceSheetItem[];
}

/**
 * Account type mapping for balance sheet categorization
 */
const ACCOUNT_CATEGORIES = {
  // Aktiva Lancar (Current Assets)
  currentAssets: [
    "Cash",
    "Bank",
    "Accounts Receivable",
    "Inventory",
    "Prepaid Expenses",
  ],

  // Aktiva Tidak Lancar (Non-Current Assets)
  nonCurrentAssets: [
    "Fixed Assets",
    "Building",
    "Land",
    "Equipment",
    "Vehicle",
    "Accumulated Depreciation",
    "Intangible Assets",
    "Long-term Investment",
  ],

  // Kewajiban Lancar (Current Liabilities)
  currentLiabilities: [
    "Accounts Payable",
    "Short-term Debt",
    "Accrued Expenses",
    "Tax Payable",
    "Salary Payable",
  ],

  // Kewajiban Jangka Panjang (Non-Current Liabilities)
  nonCurrentLiabilities: [
    "Member Savings",
    "Long-term Debt",
    "Time Deposit",
    "Member Deposits",
  ],

  // Modal (Equity)
  equity: [
    "Equity",
    "Capital",
    "Retained Earnings",
    "Reserve",
    "Current Year Earnings",
  ],
};

/**
 * Determine if account is asset based on account code
 */
const isAssetAccount = (accountCode: string): boolean => {
  return accountCode.startsWith("1-");
};

/**
 * Determine if account is liability based on account code
 */
const isLiabilityAccount = (accountCode: string): boolean => {
  return accountCode.startsWith("2-");
};

/**
 * Determine if account is equity based on account code
 */
const isEquityAccount = (accountCode: string): boolean => {
  return accountCode.startsWith("3-");
};

/**
 * Account category types
 */
type AccountCategory =
  | "currentAssets"
  | "nonCurrentAssets"
  | "currentLiabilities"
  | "nonCurrentLiabilities"
  | "equity";

/**
 * Categorize account based on account type and code
 */
const categorizeAccount = (
  account: TrialBalanceAccount
): AccountCategory | null => {
  const { account_code, account_type } = account;

  // Assets (1-xxx)
  if (isAssetAccount(account_code)) {
    // Check if non-current asset
    if (
      ACCOUNT_CATEGORIES.nonCurrentAssets.some((type) =>
        account_type.toLowerCase().includes(type.toLowerCase())
      ) ||
      account_code.startsWith("1-2") // Convention: 1-2xxx for non-current assets
    ) {
      return "nonCurrentAssets";
    }
    return "currentAssets";
  }

  // Liabilities (2-xxx)
  if (isLiabilityAccount(account_code)) {
    // Check if non-current liability
    if (
      ACCOUNT_CATEGORIES.nonCurrentLiabilities.some((type) =>
        account_type.toLowerCase().includes(type.toLowerCase())
      ) ||
      account_code.startsWith("2-2") // Convention: 2-2xxx for non-current liabilities
    ) {
      return "nonCurrentLiabilities";
    }
    return "currentLiabilities";
  }

  // Equity (3-xxx)
  if (isEquityAccount(account_code)) {
    return "equity";
  }

  // Income (4-xxx) and Expense (5-xxx) accounts are not shown in balance sheet
  // They should be summarized in retained earnings/SHU
  return null;
};

/**
 * Calculate account balance for balance sheet
 * Assets have debit normal balance, Liabilities and Equity have credit normal balance
 */
const calculateBalance = (account: TrialBalanceAccount): number => {
  const { account_code, debit, credit } = account;

  if (isAssetAccount(account_code)) {
    // Assets: Debit increases, Credit decreases
    return debit - credit;
  } else {
    // Liabilities and Equity: Credit increases, Debit decreases
    return credit - debit;
  }
};

/**
 * Transform trial balance data to balance sheet format
 */
export const transformToBalanceSheet = (
  currentPeriod: TrialBalanceAccount[],
  previousPeriod: TrialBalanceAccount[]
): BalanceSheetData => {
  const balanceSheet: BalanceSheetData = {
    assets: {
      currentAssets: [],
      nonCurrentAssets: [],
    },
    liabilities: {
      currentLiabilities: [],
      nonCurrentLiabilities: [],
    },
    equity: [],
  };

  // Create a map of previous period balances for quick lookup
  const previousBalanceMap = new Map<string, number>();
  previousPeriod.forEach((account) => {
    previousBalanceMap.set(account.account_code, calculateBalance(account));
  });

  // Process current period accounts
  currentPeriod.forEach((account) => {
    const category = categorizeAccount(account);
    if (!category) return; // Skip income/expense accounts

    const item: BalanceSheetItem = {
      code: account.account_code,
      name: account.account_name,
      current: calculateBalance(account),
      previous: previousBalanceMap.get(account.account_code) || 0,
    };

    // Add to appropriate category
    switch (category) {
      case "currentAssets":
        balanceSheet.assets.currentAssets.push(item);
        break;
      case "nonCurrentAssets":
        balanceSheet.assets.nonCurrentAssets.push(item);
        break;
      case "currentLiabilities":
        balanceSheet.liabilities.currentLiabilities.push(item);
        break;
      case "nonCurrentLiabilities":
        balanceSheet.liabilities.nonCurrentLiabilities.push(item);
        break;
      case "equity":
        balanceSheet.equity.push(item);
        break;
    }
  });

  // Add accounts that exist in previous period but not in current
  previousPeriod.forEach((account) => {
    const category = categorizeAccount(account);
    if (!category) return;

    // Check if account already exists in current period
    const existsInCurrent = currentPeriod.some(
      (curr) => curr.account_code === account.account_code
    );

    if (!existsInCurrent) {
      const item: BalanceSheetItem = {
        code: account.account_code,
        name: account.account_name,
        current: 0,
        previous: calculateBalance(account),
      };

      switch (category) {
        case "currentAssets":
          balanceSheet.assets.currentAssets.push(item);
          break;
        case "nonCurrentAssets":
          balanceSheet.assets.nonCurrentAssets.push(item);
          break;
        case "currentLiabilities":
          balanceSheet.liabilities.currentLiabilities.push(item);
          break;
        case "nonCurrentLiabilities":
          balanceSheet.liabilities.nonCurrentLiabilities.push(item);
          break;
        case "equity":
          balanceSheet.equity.push(item);
          break;
      }
    }
  });

  // Sort by account code
  const sortByCode = (a: BalanceSheetItem, b: BalanceSheetItem) =>
    a.code.localeCompare(b.code);

  balanceSheet.assets.currentAssets.sort(sortByCode);
  balanceSheet.assets.nonCurrentAssets.sort(sortByCode);
  balanceSheet.liabilities.currentLiabilities.sort(sortByCode);
  balanceSheet.liabilities.nonCurrentLiabilities.sort(sortByCode);
  balanceSheet.equity.sort(sortByCode);

  return balanceSheet;
};

/**
 * Calculate net income from trial balance
 * This should be added to equity section
 */
export const calculateNetIncome = (
  trialBalance: TrialBalanceAccount[]
): { current: number; previous: number } => {
  let income = 0;
  let expense = 0;

  trialBalance.forEach((account) => {
    // Income accounts (4-xxx) have credit normal balance
    if (account.account_code.startsWith("4-")) {
      income += account.credit - account.debit;
    }
    // Expense accounts (5-xxx) have debit normal balance
    else if (account.account_code.startsWith("5-")) {
      expense += account.debit - account.credit;
    }
  });

  return {
    current: income - expense,
    previous: 0, // Will be calculated from previous period data
  };
};
