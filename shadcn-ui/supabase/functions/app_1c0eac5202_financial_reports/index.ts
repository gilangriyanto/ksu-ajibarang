import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Financial reports request started`);

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const reportType = url.searchParams.get('type');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    if (!reportType) {
      return new Response(
        JSON.stringify({ error: 'Missing report type parameter' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    console.log(`[${requestId}] Generating ${reportType} report for period ${startDate} to ${endDate}`);

    let reportData = {};

    switch (reportType) {
      case 'trial_balance':
        // Generate trial balance
        const { data: accounts } = await supabase
          .from('app_1c0eac5202_chart_of_accounts')
          .select('*')
          .eq('is_active', true)
          .order('account_code');

        const trialBalanceData = [];
        
        for (const account of accounts || []) {
          // Get account balance from journal entries
          const { data: journalDetails } = await supabase
            .from('app_1c0eac5202_journal_entry_details')
            .select(`
              debit_amount,
              credit_amount,
              app_1c0eac5202_journal_entries!inner(entry_date, status)
            `)
            .eq('account_code', account.account_code)
            .eq('app_1c0eac5202_journal_entries.status', 'posted')
            .gte('app_1c0eac5202_journal_entries.entry_date', startDate || '2024-01-01')
            .lte('app_1c0eac5202_journal_entries.entry_date', endDate || '2024-12-31');

          const totalDebit = journalDetails?.reduce((sum, detail) => sum + (detail.debit_amount || 0), 0) || 0;
          const totalCredit = journalDetails?.reduce((sum, detail) => sum + (detail.credit_amount || 0), 0) || 0;
          
          let balance = 0;
          if (['asset', 'expense'].includes(account.account_type)) {
            balance = totalDebit - totalCredit;
          } else {
            balance = totalCredit - totalDebit;
          }

          if (totalDebit > 0 || totalCredit > 0 || balance !== 0) {
            trialBalanceData.push({
              account_code: account.account_code,
              account_name: account.account_name,
              account_type: account.account_type,
              debit: totalDebit,
              credit: totalCredit,
              balance: balance
            });
          }
        }

        reportData = {
          report_type: 'Trial Balance',
          period: `${startDate} to ${endDate}`,
          accounts: trialBalanceData,
          total_debit: trialBalanceData.reduce((sum, acc) => sum + acc.debit, 0),
          total_credit: trialBalanceData.reduce((sum, acc) => sum + acc.credit, 0)
        };
        break;

      case 'balance_sheet':
        // Generate balance sheet
        const { data: balanceSheetAccounts } = await supabase
          .from('app_1c0eac5202_chart_of_accounts')
          .select('*')
          .in('account_type', ['asset', 'liability', 'equity'])
          .eq('is_active', true)
          .order('account_code');

        const assets = [];
        const liabilities = [];
        const equity = [];

        for (const account of balanceSheetAccounts || []) {
          const { data: journalDetails } = await supabase
            .from('app_1c0eac5202_journal_entry_details')
            .select(`
              debit_amount,
              credit_amount,
              app_1c0eac5202_journal_entries!inner(entry_date, status)
            `)
            .eq('account_code', account.account_code)
            .eq('app_1c0eac5202_journal_entries.status', 'posted')
            .lte('app_1c0eac5202_journal_entries.entry_date', endDate || '2024-12-31');

          const totalDebit = journalDetails?.reduce((sum, detail) => sum + (detail.debit_amount || 0), 0) || 0;
          const totalCredit = journalDetails?.reduce((sum, detail) => sum + (detail.credit_amount || 0), 0) || 0;
          
          let balance = 0;
          if (account.account_type === 'asset') {
            balance = totalDebit - totalCredit;
            if (balance !== 0) {
              assets.push({
                account_code: account.account_code,
                account_name: account.account_name,
                balance: balance
              });
            }
          } else {
            balance = totalCredit - totalDebit;
            if (balance !== 0) {
              if (account.account_type === 'liability') {
                liabilities.push({
                  account_code: account.account_code,
                  account_name: account.account_name,
                  balance: balance
                });
              } else {
                equity.push({
                  account_code: account.account_code,
                  account_name: account.account_name,
                  balance: balance
                });
              }
            }
          }
        }

        const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
        const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
        const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);

        reportData = {
          report_type: 'Balance Sheet',
          as_of_date: endDate || '2024-12-31',
          assets: assets,
          liabilities: liabilities,
          equity: equity,
          total_assets: totalAssets,
          total_liabilities: totalLiabilities,
          total_equity: totalEquity,
          total_liabilities_equity: totalLiabilities + totalEquity
        };
        break;

      case 'income_statement':
        // Generate income statement
        const { data: incomeAccounts } = await supabase
          .from('app_1c0eac5202_chart_of_accounts')
          .select('*')
          .in('account_type', ['revenue', 'expense'])
          .eq('is_active', true)
          .order('account_code');

        const revenues = [];
        const expenses = [];

        for (const account of incomeAccounts || []) {
          const { data: journalDetails } = await supabase
            .from('app_1c0eac5202_journal_entry_details')
            .select(`
              debit_amount,
              credit_amount,
              app_1c0eac5202_journal_entries!inner(entry_date, status)
            `)
            .eq('account_code', account.account_code)
            .eq('app_1c0eac5202_journal_entries.status', 'posted')
            .gte('app_1c0eac5202_journal_entries.entry_date', startDate || '2024-01-01')
            .lte('app_1c0eac5202_journal_entries.entry_date', endDate || '2024-12-31');

          const totalDebit = journalDetails?.reduce((sum, detail) => sum + (detail.debit_amount || 0), 0) || 0;
          const totalCredit = journalDetails?.reduce((sum, detail) => sum + (detail.credit_amount || 0), 0) || 0;
          
          if (account.account_type === 'revenue') {
            const balance = totalCredit - totalDebit;
            if (balance !== 0) {
              revenues.push({
                account_code: account.account_code,
                account_name: account.account_name,
                balance: balance
              });
            }
          } else {
            const balance = totalDebit - totalCredit;
            if (balance !== 0) {
              expenses.push({
                account_code: account.account_code,
                account_name: account.account_name,
                balance: balance
              });
            }
          }
        }

        const totalRevenues = revenues.reduce((sum, acc) => sum + acc.balance, 0);
        const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
        const netIncome = totalRevenues - totalExpenses;

        reportData = {
          report_type: 'Income Statement',
          period: `${startDate} to ${endDate}`,
          revenues: revenues,
          expenses: expenses,
          total_revenues: totalRevenues,
          total_expenses: totalExpenses,
          net_income: netIncome
        };
        break;

      case 'cash_flow':
        // Generate cash flow statement (simplified)
        const { data: cashTransactions } = await supabase
          .from('app_1c0eac5202_journal_entry_details')
          .select(`
            debit_amount,
            credit_amount,
            description,
            app_1c0eac5202_journal_entries!inner(entry_date, reference_type, description)
          `)
          .eq('account_code', '1001') // Cash account
          .eq('app_1c0eac5202_journal_entries.status', 'posted')
          .gte('app_1c0eac5202_journal_entries.entry_date', startDate || '2024-01-01')
          .lte('app_1c0eac5202_journal_entries.entry_date', endDate || '2024-12-31')
          .order('app_1c0eac5202_journal_entries.entry_date');

        const operatingActivities = [];
        const financingActivities = [];

        for (const transaction of cashTransactions || []) {
          const cashFlow = (transaction.debit_amount || 0) - (transaction.credit_amount || 0);
          
          if (transaction.app_1c0eac5202_journal_entries.reference_type.includes('savings') || 
              transaction.app_1c0eac5202_journal_entries.reference_type.includes('service_fee')) {
            operatingActivities.push({
              description: transaction.app_1c0eac5202_journal_entries.description,
              amount: cashFlow,
              date: transaction.app_1c0eac5202_journal_entries.entry_date
            });
          } else {
            financingActivities.push({
              description: transaction.app_1c0eac5202_journal_entries.description,
              amount: cashFlow,
              date: transaction.app_1c0eac5202_journal_entries.entry_date
            });
          }
        }

        const netOperatingCashFlow = operatingActivities.reduce((sum, activity) => sum + activity.amount, 0);
        const netFinancingCashFlow = financingActivities.reduce((sum, activity) => sum + activity.amount, 0);
        const netCashFlow = netOperatingCashFlow + netFinancingCashFlow;

        reportData = {
          report_type: 'Cash Flow Statement',
          period: `${startDate} to ${endDate}`,
          operating_activities: operatingActivities,
          financing_activities: financingActivities,
          net_operating_cash_flow: netOperatingCashFlow,
          net_financing_cash_flow: netFinancingCashFlow,
          net_cash_flow: netCashFlow
        };
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid report type' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          }
        );
    }

    console.log(`[${requestId}] Report generated successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        generated_at: new Date().toISOString(),
        data: reportData
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
});