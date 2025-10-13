import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  AlertTriangle, 
  CheckCircle,
  Save,
  FileText
} from 'lucide-react';
import { formatCurrency, parseCurrency, formatCurrencyInput } from '@/lib/loan-utils';
import { JournalEntryForm, JournalLineForm, ChartOfAccount } from '@/types/accounting';
import { toast } from 'sonner';

const journalSchema = z.object({
  entry_date: z.string().min(1, 'Tanggal harus diisi'),
  journal_type: z.enum(['general', 'adjustment']),
  description: z.string().min(1, 'Deskripsi harus diisi'),
  lines: z.array(z.object({
    account_id: z.string().min(1, 'Akun harus dipilih'),
    debit: z.number().min(0),
    credit: z.number().min(0),
    description: z.string().optional(),
  })).min(2, 'Minimal 2 baris jurnal')
    .refine((lines) => {
      // Check if each line has either debit or credit (not both)
      return lines.every(line => 
        (line.debit > 0 && line.credit === 0) || 
        (line.credit > 0 && line.debit === 0)
      );
    }, { message: 'Setiap baris harus memiliki debit ATAU credit, tidak boleh keduanya' })
    .refine((lines) => {
      // Check if total debit equals total credit
      const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
      return totalDebit === totalCredit && totalDebit > 0;
    }, { message: 'Total debit harus sama dengan total credit' }),
});

// Mock Chart of Accounts
const mockAccounts: ChartOfAccount[] = [
  { id: '1', code: '1-1100', name: 'Kas', account_type: 'asset', normal_balance: 'debit', is_active: true, created_at: '', updated_at: '' },
  { id: '2', code: '1-1200', name: 'Bank', account_type: 'asset', normal_balance: 'debit', is_active: true, created_at: '', updated_at: '' },
  { id: '3', code: '1-1300', name: 'Piutang Anggota', account_type: 'asset', normal_balance: 'debit', is_active: true, created_at: '', updated_at: '' },
  { id: '4', code: '3-1200', name: 'Simpanan Pokok', account_type: 'equity', normal_balance: 'credit', is_active: true, created_at: '', updated_at: '' },
  { id: '5', code: '3-1300', name: 'Simpanan Wajib', account_type: 'equity', normal_balance: 'credit', is_active: true, created_at: '', updated_at: '' },
  { id: '6', code: '4-1100', name: 'Pendapatan Bunga Pinjaman', account_type: 'revenue', normal_balance: 'credit', is_active: true, created_at: '', updated_at: '' },
  { id: '7', code: '5-1100', name: 'Beban Gaji', account_type: 'expense', normal_balance: 'debit', is_active: true, created_at: '', updated_at: '' },
  { id: '8', code: '5-1300', name: 'Beban Penyusutan', account_type: 'expense', normal_balance: 'debit', is_active: true, created_at: '', updated_at: '' },
];

export default function ManualJournal() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debitInputs, setDebitInputs] = useState<string[]>(['']);
  const [creditInputs, setCreditInputs] = useState<string[]>(['']);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<JournalEntryForm>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      entry_date: new Date().toISOString().split('T')[0],
      journal_type: 'general',
      description: '',
      lines: [
        { account_id: '', debit: 0, credit: 0, description: '' },
        { account_id: '', debit: 0, credit: 0, description: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const watchedLines = watch('lines');
  const watchedData = watch();

  const totalDebit = watchedLines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = watchedLines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleDebitChange = (index: number, value: string) => {
    const newInputs = [...debitInputs];
    newInputs[index] = formatCurrencyInput(value);
    setDebitInputs(newInputs);
    
    const numericValue = parseCurrency(value);
    setValue(`lines.${index}.debit`, numericValue);
    
    // Clear credit if debit is entered
    if (numericValue > 0) {
      setValue(`lines.${index}.credit`, 0);
      const newCreditInputs = [...creditInputs];
      newCreditInputs[index] = '';
      setCreditInputs(newCreditInputs);
    }
  };

  const handleCreditChange = (index: number, value: string) => {
    const newInputs = [...creditInputs];
    newInputs[index] = formatCurrencyInput(value);
    setCreditInputs(newInputs);
    
    const numericValue = parseCurrency(value);
    setValue(`lines.${index}.credit`, numericValue);
    
    // Clear debit if credit is entered
    if (numericValue > 0) {
      setValue(`lines.${index}.debit`, 0);
      const newDebitInputs = [...debitInputs];
      newDebitInputs[index] = '';
      setDebitInputs(newDebitInputs);
    }
  };

  const addLine = () => {
    append({ account_id: '', debit: 0, credit: 0, description: '' });
    setDebitInputs([...debitInputs, '']);
    setCreditInputs([...creditInputs, '']);
  };

  const removeLine = (index: number) => {
    if (fields.length > 2) {
      remove(index);
      const newDebitInputs = [...debitInputs];
      const newCreditInputs = [...creditInputs];
      newDebitInputs.splice(index, 1);
      newCreditInputs.splice(index, 1);
      setDebitInputs(newDebitInputs);
      setCreditInputs(newCreditInputs);
    }
  };

  const onSubmit = (data: JournalEntryForm) => {
    if (!isBalanced) {
      toast.error('Jurnal tidak seimbang! Total debit harus sama dengan total credit.');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Mock API call - replace with actual Supabase call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Jurnal berhasil disimpan!');
      reset();
      setDebitInputs(['', '']);
      setCreditInputs(['', '']);
    } catch (error) {
      toast.error('Gagal menyimpan jurnal');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const getAccountDisplay = (accountId: string) => {
    const account = mockAccounts.find(acc => acc.id === accountId);
    return account ? `${account.code} - ${account.name}` : '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Input Jurnal Manual</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Jurnal</CardTitle>
            <CardDescription>
              Masukkan informasi dasar jurnal entry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry_date">Tanggal</Label>
                <Input
                  id="entry_date"
                  type="date"
                  {...register('entry_date')}
                />
                {errors.entry_date && (
                  <p className="text-sm text-red-600">{errors.entry_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="journal_type">Tipe Jurnal</Label>
                <Select onValueChange={(value) => setValue('journal_type', value as 'general' | 'adjustment')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe jurnal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Jurnal Umum</SelectItem>
                    <SelectItem value="adjustment">Jurnal Penyesuaian</SelectItem>
                  </SelectContent>
                </Select>
                {errors.journal_type && (
                  <p className="text-sm text-red-600">{errors.journal_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Periode</Label>
                <Input
                  value={watchedData.entry_date ? 
                    new Date(watchedData.entry_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 
                    ''
                  }
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Masukkan deskripsi jurnal..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Journal Lines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detail Jurnal</span>
              <Button type="button" onClick={addLine} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Baris
              </Button>
            </CardTitle>
            <CardDescription>
              Masukkan detail transaksi jurnal (minimal 2 baris)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Akun</TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Select onValueChange={(value) => setValue(`lines.${index}.account_id`, value)}>
                          <SelectTrigger className="min-w-[250px]">
                            <SelectValue placeholder="Pilih akun" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.code} - {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.lines?.[index]?.account_id && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.lines[index]?.account_id?.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            Rp
                          </span>
                          <Input
                            type="text"
                            value={debitInputs[index] || ''}
                            onChange={(e) => handleDebitChange(index, e.target.value)}
                            placeholder="0"
                            className="pl-8 min-w-[120px]"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            Rp
                          </span>
                          <Input
                            type="text"
                            value={creditInputs[index] || ''}
                            onChange={(e) => handleCreditChange(index, e.target.value)}
                            placeholder="0"
                            className="pl-8 min-w-[120px]"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register(`lines.${index}.description`)}
                          placeholder="Keterangan..."
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeLine(index)}
                          disabled={fields.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {errors.lines && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errors.lines.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Debit</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(totalDebit)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Credit</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(totalCredit)}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Balance</p>
                <div className="flex items-center justify-center">
                  {isBalanced ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-xl font-bold text-green-600">Balanced</p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-xl font-bold text-red-600">
                        {formatCurrency(Math.abs(totalDebit - totalCredit))}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {!isBalanced && totalDebit > 0 && totalCredit > 0 && (
              <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Jurnal belum seimbang. Pastikan total debit sama dengan total credit.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={!isBalanced} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Simpan Jurnal
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Konfirmasi Jurnal Entry
            </DialogTitle>
            <DialogDescription>
              Pastikan data jurnal sudah benar sebelum menyimpan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span className="font-bold">
                  {new Date(watchedData.entry_date).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tipe:</span>
                <span className="font-bold capitalize">{watchedData.journal_type}</span>
              </div>
              <div className="flex justify-between">
                <span>Deskripsi:</span>
                <span className="font-bold">{watchedData.description}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Detail Transaksi:</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Akun</TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {watchedData.lines?.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>{getAccountDisplay(line.account_id)}</TableCell>
                      <TableCell className="text-right">
                        {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(totalDebit)} = {formatCurrency(totalCredit)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Konfirmasi & Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}