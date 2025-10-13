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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Journal generation request started`);

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error(`[${requestId}] Invalid JSON body:`, error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    const { transaction_type, transaction_data } = requestBody;

    if (!transaction_type || !transaction_data) {
      return new Response(
        JSON.stringify({ error: 'Missing transaction_type or transaction_data' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    console.log(`[${requestId}] Processing ${transaction_type} transaction`);

    const journalId = `JE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let journalEntries = [];
    let description = '';

    switch (transaction_type) {
      case 'savings_deposit':
        description = `Setoran Simpanan ${transaction_data.account_type} - ${transaction_data.member_id}`;
        journalEntries = [
          { account_code: '1001', debit_amount: transaction_data.amount, credit_amount: 0, description: 'Penerimaan kas dari setoran simpanan' },
          { account_code: transaction_data.account_type === 'pokok' ? '2001' : transaction_data.account_type === 'wajib' ? '2002' : '2003', debit_amount: 0, credit_amount: transaction_data.amount, description: `Simpanan ${transaction_data.account_type} anggota` }
        ];
        break;

      case 'savings_withdrawal':
        description = `Penarikan Simpanan ${transaction_data.account_type} - ${transaction_data.member_id}`;
        journalEntries = [
          { account_code: transaction_data.account_type === 'pokok' ? '2001' : transaction_data.account_type === 'wajib' ? '2002' : '2003', debit_amount: transaction_data.amount, credit_amount: 0, description: `Penarikan simpanan ${transaction_data.account_type}` },
          { account_code: '1001', debit_amount: 0, credit_amount: transaction_data.amount, description: 'Pengeluaran kas untuk penarikan simpanan' }
        ];
        break;

      case 'loan_disbursement':
        description = `Pencairan Pinjaman ${transaction_data.loan_type} - ${transaction_data.member_id}`;
        journalEntries = [
          { account_code: '1101', debit_amount: transaction_data.principal_amount, credit_amount: 0, description: 'Piutang pinjaman anggota' },
          { account_code: '1001', debit_amount: 0, credit_amount: transaction_data.principal_amount, description: 'Pencairan pinjaman tunai' }
        ];
        break;

      case 'loan_payment':
        description = `Pembayaran Angsuran Pinjaman - ${transaction_data.member_id}`;
        journalEntries = [
          { account_code: '1001', debit_amount: transaction_data.payment_amount, credit_amount: 0, description: 'Penerimaan pembayaran angsuran' },
          { account_code: '1101', debit_amount: 0, credit_amount: transaction_data.principal_amount, description: 'Pengurangan piutang pinjaman' },
          { account_code: '4001', debit_amount: 0, credit_amount: transaction_data.interest_amount, description: 'Pendapatan bunga pinjaman' }
        ];
        break;

      case 'service_fee_payment':
        description = `Pembayaran Jasa Pelayanan ${transaction_data.period} - ${transaction_data.member_id}`;
        journalEntries = [
          { account_code: '5001', debit_amount: transaction_data.gross_amount, credit_amount: 0, description: 'Beban jasa pelayanan anggota' },
          { account_code: '1001', debit_amount: 0, credit_amount: transaction_data.net_amount, description: 'Pembayaran jasa pelayanan tunai' }
        ];
        
        // Add loan deduction entry if applicable
        if (transaction_data.loan_deduction > 0) {
          journalEntries.push({
            account_code: '1101',
            debit_amount: 0,
            credit_amount: transaction_data.loan_deduction,
            description: 'Pemotongan angsuran dari jasa pelayanan'
          });
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid transaction_type' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          }
        );
    }

    // Calculate totals
    const totalDebit = journalEntries.reduce((sum, entry) => sum + entry.debit_amount, 0);
    const totalCredit = journalEntries.reduce((sum, entry) => sum + entry.credit_amount, 0);

    // Validate balanced entry
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      console.error(`[${requestId}] Unbalanced journal entry: Debit=${totalDebit}, Credit=${totalCredit}`);
      return new Response(
        JSON.stringify({ error: 'Unbalanced journal entry' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    // Insert journal entry
    const { data: journalEntry, error: journalError } = await supabase
      .from('app_1c0eac5202_journal_entries')
      .insert({
        journal_id: journalId,
        entry_date: transaction_data.transaction_date || new Date().toISOString().split('T')[0],
        reference_type: transaction_type,
        reference_id: transaction_data.reference_id || transaction_data.transaction_id || journalId,
        description: description,
        total_debit: totalDebit,
        total_credit: totalCredit,
        status: 'posted'
      })
      .select()
      .single();

    if (journalError) {
      console.error(`[${requestId}] Error creating journal entry:`, journalError);
      return new Response(
        JSON.stringify({ error: 'Failed to create journal entry', details: journalError.message }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    // Insert journal entry details
    const journalDetails = journalEntries.map(entry => ({
      journal_id: journalId,
      ...entry
    }));

    const { error: detailsError } = await supabase
      .from('app_1c0eac5202_journal_entry_details')
      .insert(journalDetails);

    if (detailsError) {
      console.error(`[${requestId}] Error creating journal details:`, detailsError);
      return new Response(
        JSON.stringify({ error: 'Failed to create journal details', details: detailsError.message }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    console.log(`[${requestId}] Journal entry created successfully: ${journalId}`);

    return new Response(
      JSON.stringify({
        success: true,
        journal_id: journalId,
        total_debit: totalDebit,
        total_credit: totalCredit,
        entries_count: journalEntries.length
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