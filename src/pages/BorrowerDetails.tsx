import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../contexts/AuthProvider';
import { FAB } from '../components/FAB';
import { Modal } from '../components/Modal';
import { ModalFooter } from '../components/ModalFooter';
import { Select, AmountInput, DateInput } from '../components/FormInputs';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IndianRupee, Calendar, ChevronLeft } from 'lucide-react';
import dayjs from 'dayjs';
import { numberToWords } from '../lib/numberToWords';

interface Loan {
  id: string;
  principal: number;
  interestRate: number;
  interestType: string;
  status: string;
  startDate: string;
}

interface Borrower {
  id: string;
  name: string;
  phone: string;
  address: string;
  isActive: boolean;
  loans: Loan[];
}

const loanSchema = z.object({
  principal: z.number().min(1, 'Principal is required'),
  interestRate: z.number().min(0.1, 'Rate must be > 0'),
  interestRateType: z.enum(['PERCENTAGE', 'FIXED']),
  interestType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  startDate: z.string().min(1, 'Start date is required'),
  dueDate: z.string().optional(),
});

type LoanFormValues = z.infer<typeof loanSchema>;

export function BorrowerDetails() {
  const { id } = useParams<{ id: string }>();
  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBorrower = async () => {
    try {
      const res = await api.get(`/borrowers/${id}`);
      setBorrower(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrower();
  }, [id]);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      startDate: dayjs().format('YYYY-MM-DD'),
      interestRateType: 'PERCENTAGE',
      interestType: 'DAILY'
    }
  });

  const rateType = watch('interestRateType');
  const principalAmount = watch('principal');
  const rateAmount = watch('interestRate');

  const onSubmit = async (data: LoanFormValues) => {
    try {
      await api.post('/loans', { ...data, borrowerId: id });
      setIsModalOpen(false);
      reset();
      fetchBorrower();
    } catch (err) {
      console.error('Error creating loan', err);
      alert('Failed to create loan');
    }
  };

  if (loading) return <div className="text-muted-foreground py-8 text-center">Loading...</div>;
  if (!borrower) return <div className="text-destructive py-8 text-center">Borrower not found</div>;

  return (
    <div className="space-y-6 content-pb-fab">
      <Link
        to="/borrowers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Borrowers
      </Link>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold tracking-tight">{borrower.name}</h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${borrower.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
            {borrower.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-muted-foreground text-sm">{borrower.phone}</p>
        {borrower.address && <p className="text-muted-foreground text-sm">{borrower.address}</p>}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold tracking-tight">Loans</h3>
        {borrower.loans.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">No loans found for this borrower.</div>
        ) : (
          borrower.loans.map((loan) => (
            <Link key={loan.id} to={`/loans/${loan.id}`} className="block">
              <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-2 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-lg flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {loan.principal.toLocaleString()}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase ${
                    loan.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    loan.status === 'CLOSED' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {loan.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {dayjs(loan.startDate).format('MMM D, YYYY')}
                  </div>
                  <div>
                    {loan.interestRate}% ({loan.interestType})
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <FAB onClick={() => setIsModalOpen(true)} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Loan"
        footer={
          <ModalFooter
            formId="new-loan-form"
            onCancel={() => setIsModalOpen(false)}
            submitLabel="Create Loan"
            isSubmitting={isSubmitting}
          />
        }
      >
        <form id="new-loan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <AmountInput
              label="Principal Amount *"
              {...register('principal', { valueAsNumber: true })}
              error={errors.principal?.message}
            />
            {principalAmount > 0 && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {numberToWords(principalAmount)}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Rate Calculation *"
              options={[
                { label: 'Percentage (%)', value: 'PERCENTAGE' },
                { label: 'Fixed Amount (₹)', value: 'FIXED' },
              ]}
              {...register('interestRateType')}
              error={errors.interestRateType?.message}
            />
            <div>
              <AmountInput
                label={rateType === 'PERCENTAGE' ? 'Interest Rate (%) *' : 'Interest Amount (₹) *'}
                step="0.01"
                {...register('interestRate', { valueAsNumber: true })}
                error={errors.interestRate?.message}
              />
              {rateType === 'FIXED' && rateAmount > 0 && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  {numberToWords(rateAmount)}
                </p>
              )}
            </div>
          </div>
          <Select
            label="Interest Frequency *"
            options={[
              { label: 'Daily', value: 'DAILY' },
              { label: 'Weekly', value: 'WEEKLY' },
              { label: 'Monthly', value: 'MONTHLY' },
            ]}
            {...register('interestType')}
            error={errors.interestType?.message}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateInput 
              label="Start Date *" 
              {...register('startDate')} 
              error={errors.startDate?.message} 
            />
            <DateInput 
              label="Due Date (Optional)" 
              {...register('dueDate')} 
              error={errors.dueDate?.message} 
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
