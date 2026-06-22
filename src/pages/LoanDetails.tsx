import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../contexts/AuthProvider';
import { FAB } from '../components/FAB';
import { Modal } from '../components/Modal';
import { Input, Select, Textarea } from '../components/FormInputs';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IndianRupee, ArrowDownRight, ArrowUpRight, Percent, Calendar, Edit2 } from 'lucide-react';
import dayjs from 'dayjs';
import { numberToWords } from '../lib/numberToWords';

const formatAmount = (value: number) =>
  value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 3 });

interface InterestInfo {
  totalPrincipal: number;
  totalInterestAccrued: number;
  totalInterestCollected: number;
  totalCharges: number;
  currentOutstandingPrincipal: number;
  currentOutstandingInterest: number;
  totalPayable: number;
  daysElapsed: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
  balanceAfterTx: {
    principal: number;
    interest: number;
    interestDays: number;
  };
}

interface RateLog {
  id: string;
  interestRate: number;
  interestRateType: string;
  effectiveDate: string;
}

interface Loan {
  id: string;
  principal: number;
  interestRate: number;
  interestRateType: string;
  interestType: string;
  status: string;
  startDate: string;
  dueDate?: string;
  borrower: {
    name: string;
  };
  transactions: Transaction[];
  rateLogs: RateLog[];
  interestInfo: InterestInfo;
  termDays: number | null;
}

const txSchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT', 'INTEREST_COLLECTION', 'CHARGE']),
  date: z.string().min(1, 'Date is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER']),
  referenceNumber: z.string().optional(),
  remarks: z.string().optional(),
});

type TxFormValues = z.infer<typeof txSchema>;

export function LoanDetails() {
  const { id } = useParams<{ id: string }>();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isForecloseModalOpen, setIsForecloseModalOpen] = useState(false);
  const [isDatesModalOpen, setIsDatesModalOpen] = useState(false);
  const [forecloseNotes, setForecloseNotes] = useState('');
  
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const fetchLoan = async (asOf?: string) => {
    try {
      const res = await api.get(`/loans/${id}`, {
        params: asOf ? { asOf } : undefined
      });
      setLoan(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchLoan(filterEndDate || undefined);
  }, [id, filterEndDate]);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm<TxFormValues>({
    resolver: zodResolver(txSchema),
    defaultValues: {
      type: 'INTEREST_COLLECTION',
      paymentMethod: 'CASH',
      date: dayjs().format('YYYY-MM-DD')
    }
  });

  const txAmount = watch('amount');

  const onSubmit = async (data: TxFormValues) => {
    try {
      await api.post('/transactions', { ...data, loanId: id });
      setIsModalOpen(false);
      reset();
      fetchLoan(filterEndDate || undefined);
    } catch (err) {
      console.error('Error recording transaction', err);
      alert('Failed to record transaction');
    }
  };

  const { register: registerRate, handleSubmit: handleRateSubmit, watch: watchRate, formState: { errors: rateErrors, isSubmitting: isRateSubmitting }, reset: resetRate } = useForm({
    resolver: zodResolver(z.object({
      interestRateType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
      interestRate: z.number().min(0.1, 'Rate must be > 0'),
      effectiveDate: z.string().min(1, 'Effective date is required')
    })),
    defaultValues: {
      interestRateType: 'PERCENTAGE',
      effectiveDate: dayjs().format('YYYY-MM-DD')
    }
  });

  const rateType = watchRate('interestRateType');
  const rateAmount = watchRate('interestRate');

  const onRateSubmit = async (data: any) => {
    try {
      await api.post(`/loans/${id}/rate`, data);
      setIsRateModalOpen(false);
      resetRate();
      fetchLoan(filterEndDate || undefined);
    } catch (err) {
      console.error('Error updating rate', err);
      alert('Failed to update interest rate');
    }
  };

  const { register: registerDates, handleSubmit: handleDatesSubmit, formState: { errors: datesErrors, isSubmitting: isDatesSubmitting }, reset: resetDates } = useForm({
    resolver: zodResolver(z.object({
      startDate: z.string().min(1, 'Start date is required'),
      dueDate: z.string().optional()
    })),
    defaultValues: {
      startDate: loan?.startDate ? dayjs(loan.startDate).format('YYYY-MM-DD') : '',
      dueDate: loan?.dueDate ? dayjs(loan.dueDate).format('YYYY-MM-DD') : ''
    }
  });

  // Re-initialize default values when loan data is loaded
  useEffect(() => {
    if (loan) {
      resetDates({
        startDate: dayjs(loan.startDate).format('YYYY-MM-DD'),
        dueDate: loan.dueDate ? dayjs(loan.dueDate).format('YYYY-MM-DD') : ''
      });
    }
  }, [loan, resetDates]);

  const onDatesSubmit = async (data: any) => {
    try {
      await api.post(`/loans/${id}/dates`, data);
      setIsDatesModalOpen(false);
      fetchLoan(filterEndDate || undefined);
    } catch (err) {
      console.error('Error updating dates', err);
      alert('Failed to update loan dates');
    }
  };

  const { register: registerEditTx, handleSubmit: handleEditTxSubmit, watch: watchEditTx, formState: { errors: editTxErrors, isSubmitting: isEditTxSubmitting }, reset: resetEditTx } = useForm({
    resolver: zodResolver(z.object({
      type: z.enum(['CREDIT', 'DEBIT', 'INTEREST_COLLECTION', 'CHARGE']),
      date: z.string().min(1, 'Date is required'),
      amount: z.number().min(1, 'Amount must be greater than 0'),
    }))
  });

  const editTxAmount = watchEditTx('amount');

  const openEditTxModal = (tx: Transaction) => {
    setEditingTx(tx);
    resetEditTx({
      type: tx.type as 'CREDIT' | 'DEBIT' | 'INTEREST_COLLECTION' | 'CHARGE',
      date: dayjs(tx.createdAt).format('YYYY-MM-DD'),
      amount: tx.amount
    });
  };

  const onEditTxSubmit = async (data: any) => {
    if (!editingTx) return;
    try {
      await api.post(`/transactions/${editingTx.id}`, data);
      setEditingTx(null);
      fetchLoan(filterEndDate || undefined);
    } catch (err) {
      console.error('Error updating transaction', err);
      alert('Failed to update transaction');
    }
  };

  const handleForeclose = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/loans/${id}/foreclose`, { notes: forecloseNotes });
      setIsForecloseModalOpen(false);
      fetchLoan(filterEndDate || undefined);
      alert('Loan successfully foreclosed!');
    } catch (err) {
      console.error('Error foreclosing loan', err);
      alert('Failed to foreclose loan');
    }
  };

  if (loading) return <div className="p-4 text-muted-foreground">Loading...</div>;
  if (!loan) return <div className="p-4 text-destructive">Loan not found</div>;

  const finalDisplayTransactions = loan.transactions
    .filter(tx => {
      if (!filterStartDate && !filterEndDate) return true;
      const txDate = dayjs(tx.createdAt);
      let isValid = true;
      if (filterStartDate && txDate.isBefore(dayjs(filterStartDate).startOf('day'))) isValid = false;
      if (filterEndDate && txDate.isAfter(dayjs(filterEndDate).endOf('day'))) isValid = false;
      return isValid;
    })
    .reverse();

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold tracking-tight">{loan.borrower.name}'s Loan</h2>
          {loan.status !== 'FORECLOSED' && loan.status !== 'CLOSED' && (
            <button 
              onClick={() => setIsRateModalOpen(true)}
              className="text-xs font-medium text-primary hover:underline"
            >
              Update Rate
            </button>
          )}
        </div>
        <span className="text-sm text-muted-foreground flex items-center gap-1 group relative">
          <Calendar className="h-4 w-4" /> 
          <div>
            Started {dayjs(loan.startDate).format('MMM D, YYYY')} ({loan.termDays != null ? `${loan.termDays}-day term` : `${loan.interestInfo.daysElapsed} days elapsed`})
            {loan.dueDate && ` • Due ${dayjs(loan.dueDate).format('MMM D, YYYY')}`}
            {filterEndDate && ` • Interest as of ${dayjs(filterEndDate).format('MMM D, YYYY')}`}
          </div>
          {loan.status !== 'FORECLOSED' && loan.status !== 'CLOSED' && (
            <button 
              onClick={() => setIsDatesModalOpen(true)}
              className="ml-2 p-1 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
              title="Edit Dates"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
        </span>
        <div className="flex gap-2 text-xs mt-1">
          <span className={`px-2 py-0.5 rounded font-medium ${
            loan.status === 'FORECLOSED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {loan.status}
          </span>
          <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
            Current Rate: {loan.interestRate}{loan.interestRateType === 'PERCENTAGE' ? '%' : '₹'}
          </span>
          <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
            {loan.interestType}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <IndianRupee className="h-4 w-4" />
            <span>Out. Principal</span>
          </div>
          <div className="text-xl font-bold">₹{loan.interestInfo.currentOutstandingPrincipal.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Percent className="h-4 w-4 text-red-500" />
            <span>Out. Interest</span>
          </div>
          <div className="text-xl font-bold text-red-500">₹{formatAmount(loan.interestInfo.currentOutstandingInterest)}</div>
        </div>
        <div className="col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-primary font-medium mb-1">Total Payable (Today)</div>
              <div className="text-3xl font-bold text-primary">₹{loan.interestInfo.totalPayable.toLocaleString()}</div>
            </div>
            {loan.status !== 'FORECLOSED' && loan.status !== 'CLOSED' && (
              <button 
                onClick={() => setIsForecloseModalOpen(true)}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Foreclose
              </button>
            )}
          </div>
          
          <div className="bg-background/80 rounded-lg p-3 border text-sm mt-1">
            <div className="flex justify-between items-center text-muted-foreground mb-1">
              <span>Original Principal:</span>
              <span className="font-medium text-foreground">₹{loan.principal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground mb-1">
              <span>Total Interest Accrued:</span>
              <span className="font-medium text-red-500">₹{formatAmount(loan.interestInfo.totalInterestAccrued)}</span>
            </div>
            {loan.interestInfo.totalCharges > 0 && (
              <div className="flex justify-between items-center text-muted-foreground mb-1">
                <span>Charges:</span>
                <span className="font-medium text-orange-600">₹{formatAmount(loan.interestInfo.totalCharges)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-muted-foreground pt-1 border-t">
              <span>Total Interest Collected:</span>
              <span className="font-medium text-green-600">₹{loan.interestInfo.totalInterestCollected.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold tracking-tight">Interest Rate History</h3>
        {loan.rateLogs.map((log, i) => (
          <div key={log.id} className="rounded-xl border bg-card p-3 shadow-sm flex justify-between items-center text-sm">
            <div className="flex flex-col">
              <span className="font-semibold">{log.interestRate}{log.interestRateType === 'PERCENTAGE' ? '%' : '₹'}</span>
              <span className="text-xs text-muted-foreground">Effective: {dayjs(log.effectiveDate).format('MMM D, YYYY')}</span>
            </div>
            {i === loan.rateLogs.length - 1 && (
              <span className="text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">Transactions</h3>
        </div>
        
        {/* Date Filter */}
        <div className="grid grid-cols-2 gap-2 mb-2 p-3 bg-muted/30 rounded-lg border border-border/50">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">From</label>
            <input 
              type="date" 
              className="w-full bg-background border rounded px-2 py-1 text-sm focus:ring-primary focus:border-primary transition-colors"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">To</label>
            <input 
              type="date" 
              className="w-full bg-background border rounded px-2 py-1 text-sm focus:ring-primary focus:border-primary transition-colors"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>
        </div>

        {finalDisplayTransactions.length === 0 ? (
          <div className="text-sm text-muted-foreground italic text-center py-4 border rounded-xl border-dashed">No transactions found for this period.</div>
        ) : (
          finalDisplayTransactions.map((tx) => (
            <div key={tx.id} className="group rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    tx.type === 'DEBIT' ? 'bg-blue-100 text-blue-600' :
                    tx.type === 'CREDIT' ? 'bg-orange-100 text-orange-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {tx.type === 'DEBIT' ? <ArrowUpRight className="h-5 w-5" /> : 
                     tx.type === 'CREDIT' ? <ArrowDownRight className="h-5 w-5" /> : 
                     <IndianRupee className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {tx.type === 'INTEREST_COLLECTION' ? 'Interest Paid' : 
                       tx.type === 'DEBIT' ? 'Principal Repaid' : 
                       tx.type === 'CREDIT' ? 'Principal Disbursed' : 'Charge'}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{dayjs(tx.createdAt).format('MMM D, YYYY h:mm A')}</span>
                      {loan.status !== 'FORECLOSED' && loan.status !== 'CLOSED' && (
                        <button 
                          className="opacity-0 group-hover:opacity-100 hover:text-primary transition-colors flex items-center gap-1"
                          onClick={() => openEditTxModal(tx)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`font-bold ${tx.type === 'CREDIT' ? 'text-foreground' : 'text-green-600'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs bg-muted/40 p-2 rounded-lg border border-border/40">
                <span className="text-muted-foreground font-medium">Pending After Payment:</span>
                <div className="flex gap-3 font-semibold text-foreground">
                  <span>Prin: ₹{formatAmount(tx.balanceAfterTx.principal)}</span>
                  <span className={tx.balanceAfterTx.interest > 0 ? "text-red-500" : ""}>
                    Int: ₹{formatAmount(tx.balanceAfterTx.interest)}
                    {tx.balanceAfterTx.interestDays > 0 && (
                      <span className="text-muted-foreground font-normal"> ({tx.balanceAfterTx.interestDays}d)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {loan.status !== 'FORECLOSED' && loan.status !== 'CLOSED' && (
        <FAB onClick={() => setIsModalOpen(true)} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Transaction">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Transaction Type *"
              options={[
                { label: 'Interest Collection', value: 'INTEREST_COLLECTION' },
                { label: 'Principal Repayment (Debit)', value: 'DEBIT' },
                { label: 'Add Principal (Credit)', value: 'CREDIT' },
                { label: 'Charge/Penalty', value: 'CHARGE' },
              ]}
              {...register('type')}
              error={errors.type?.message}
            />
            <Input 
              label="Transaction Date *" 
              type="date"
              {...register('date')} 
              error={errors.date?.message} 
            />
          </div>
          <div>
            <Input 
              label="Amount *" 
              type="number"
              {...register('amount', { valueAsNumber: true })} 
              error={errors.amount?.message} 
            />
            {txAmount > 0 && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {numberToWords(txAmount)}
              </p>
            )}
          </div>
          <Select
            label="Payment Method *"
            options={[
              { label: 'Cash', value: 'CASH' },
              { label: 'UPI', value: 'UPI' },
              { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
              { label: 'Cheque', value: 'CHEQUE' },
            ]}
            {...register('paymentMethod')}
            error={errors.paymentMethod?.message}
          />
          <Input 
            label="Reference Number (Optional)" 
            {...register('referenceNumber')} 
            error={errors.referenceNumber?.message} 
          />
          <Textarea 
            label="Remarks (Optional)" 
            {...register('remarks')} 
            error={errors.remarks?.message} 
          />
          
          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isRateModalOpen} onClose={() => setIsRateModalOpen(false)} title="Update Interest Rate">
        <form onSubmit={handleRateSubmit(onRateSubmit)} className="space-y-4">
          <Select
            label="Rate Calculation *"
            options={[
              { label: 'Percentage (%)', value: 'PERCENTAGE' },
              { label: 'Fixed Amount (₹)', value: 'FIXED' },
            ]}
            {...registerRate('interestRateType')}
            error={rateErrors.interestRateType?.message as string}
          />
          <div>
            <Input 
              label={rateType === 'PERCENTAGE' ? 'New Interest Rate (%) *' : 'New Interest Amount (₹) *'}
              type="number"
              step="0.01"
              {...registerRate('interestRate', { valueAsNumber: true })} 
              error={rateErrors.interestRate?.message as string} 
            />
            {rateType === 'FIXED' && rateAmount > 0 && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {numberToWords(rateAmount)}
              </p>
            )}
          </div>
          <Input 
            label="Effective From Date *" 
            type="date"
            {...registerRate('effectiveDate')} 
            error={rateErrors.effectiveDate?.message as string} 
          />
          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setIsRateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isRateSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isRateSubmitting ? 'Saving...' : 'Update Rate'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isForecloseModalOpen} onClose={() => setIsForecloseModalOpen(false)} title="Confirm Foreclosure">
        <form onSubmit={handleForeclose} className="space-y-4">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-900/50">
            <h4 className="text-red-800 dark:text-red-400 font-semibold mb-2">Final Settlement</h4>
            <div className="flex justify-between text-sm mb-1 text-red-700/80 dark:text-red-400/80">
              <span>Outstanding Principal:</span>
              <span>₹{loan.interestInfo.currentOutstandingPrincipal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-3 text-red-700/80 dark:text-red-400/80">
              <span>Accrued Interest:</span>
              <span>₹{formatAmount(loan.interestInfo.currentOutstandingInterest)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-red-900 dark:text-red-300 border-t border-red-200 dark:border-red-800 pt-2">
              <span>Total Payable:</span>
              <span>₹{loan.interestInfo.totalPayable.toLocaleString()}</span>
            </div>
          </div>
          
          <Textarea 
            label="Closure Notes (Optional)" 
            value={forecloseNotes}
            onChange={(e) => setForecloseNotes(e.target.value)}
            placeholder="e.g. Settled in cash, discount applied..."
          />

          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setIsForecloseModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Closure
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDatesModalOpen} onClose={() => setIsDatesModalOpen(false)} title="Update Loan Dates">
        <form onSubmit={handleDatesSubmit(onDatesSubmit)} className="space-y-4">
          <Input 
            label="Start Date *" 
            type="date"
            {...registerDates('startDate')} 
            error={datesErrors.startDate?.message as string} 
          />
          <Input 
            label="Due Date (Optional)" 
            type="date"
            {...registerDates('dueDate')} 
            error={datesErrors.dueDate?.message as string} 
          />
          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setIsDatesModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isDatesSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isDatesSubmitting ? 'Saving...' : 'Update Dates'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editingTx} onClose={() => setEditingTx(null)} title="Edit Transaction">
        <form onSubmit={handleEditTxSubmit(onEditTxSubmit)} className="space-y-4">
          <Select
            label="Transaction Type *"
            options={[
              { label: 'Interest Collection', value: 'INTEREST_COLLECTION' },
              { label: 'Principal Repayment (Debit)', value: 'DEBIT' },
              { label: 'Add Principal (Credit)', value: 'CREDIT' },
              { label: 'Charge/Penalty', value: 'CHARGE' },
            ]}
            {...registerEditTx('type')}
            error={editTxErrors.type?.message as string}
          />
          <Input 
            label="Transaction Date *" 
            type="date"
            {...registerEditTx('date')} 
            error={editTxErrors.date?.message as string} 
          />
          <div>
            <Input 
              label="Amount *" 
              type="number"
              {...registerEditTx('amount', { valueAsNumber: true })} 
              error={editTxErrors.amount?.message as string} 
            />
            {editTxAmount > 0 && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {numberToWords(editTxAmount)}
              </p>
            )}
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setEditingTx(null)}
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isEditTxSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isEditTxSubmitting ? 'Saving...' : 'Update Transaction'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
