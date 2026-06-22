import { useEffect, useMemo, useState } from 'react';
import { api } from '../contexts/AuthProvider';
import { FAB } from '../components/FAB';
import { Modal } from '../components/Modal';
import { Input, Textarea } from '../components/FormInputs';
import {
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Search,
  IndianRupee,
  FileText,
  ChevronRight,
  User,
  CreditCard
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

interface Loan {
  id: string;
  principal: number;
  interestRate: number;
  interestRateType: string;
  interestType: string;
  status: string;
  startDate: string;
  dueDate?: string | null;
}

interface Borrower {
  id: string;
  name: string;
  phone: string;
  altPhone?: string | null;
  address?: string | null;
  idNumber?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  loans: Loan[];
}

const borrowerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone is required'),
  altPhone: z.string().optional(),
  address: z.string().optional(),
  idNumber: z.string().optional(),
  notes: z.string().optional(),
});

type BorrowerFormValues = z.infer<typeof borrowerSchema>;

const ACTIVE_STATUSES = new Set(['ACTIVE', 'DEFAULTED']);

function getBorrowerStats(loans: Loan[]) {
  const activeLoans = loans.filter(l => ACTIVE_STATUSES.has(l.status));
  const closedLoans = loans.filter(l => !ACTIVE_STATUSES.has(l.status));
  const activePrincipal = activeLoans.reduce((sum, l) => sum + l.principal, 0);
  const latestActive = activeLoans.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )[0];

  return {
    totalLoans: loans.length,
    activeCount: activeLoans.length,
    closedCount: closedLoans.length,
    activePrincipal,
    latestActive,
  };
}

const formatAmount = (value: number) =>
  value.toLocaleString('en-IN', { maximumFractionDigits: 0 });

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');
}

export function Borrowers() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');

  const fetchBorrowers = async () => {
    try {
      const res = await api.get('/borrowers');
      setBorrowers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<BorrowerFormValues>({
    resolver: zodResolver(borrowerSchema)
  });

  const onSubmit = async (data: BorrowerFormValues) => {
    try {
      await api.post('/borrowers', data);
      setIsModalOpen(false);
      reset();
      fetchBorrowers();
    } catch (err) {
      console.error('Error creating borrower', err);
      alert('Failed to create borrower');
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, id: string, newStatus: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/borrowers/${id}/toggle-status`, { isActive: newStatus });
      fetchBorrowers();
    } catch (err) {
      console.error('Error toggling borrower status', err);
      alert('Failed to update borrower status');
    }
  };

  const filteredBorrowers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return borrowers
      .filter(b => (showInactive ? true : b.isActive))
      .filter(b => {
        if (!q) return true;
        return (
          b.name.toLowerCase().includes(q) ||
          b.phone.includes(q) ||
          (b.altPhone?.includes(q) ?? false) ||
          (b.idNumber?.toLowerCase().includes(q) ?? false) ||
          (b.address?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [borrowers, showInactive, search]);

  const portfolioStats = useMemo(() => {
    let activeLoans = 0;
    let totalActivePrincipal = 0;
    filteredBorrowers.forEach(b => {
      const stats = getBorrowerStats(b.loans);
      activeLoans += stats.activeCount;
      totalActivePrincipal += stats.activePrincipal;
    });
    return {
      borrowerCount: filteredBorrowers.length,
      activeLoans,
      totalActivePrincipal,
    };
  }, [filteredBorrowers]);

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight">Borrowers</h2>
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 bg-muted/50 px-2.5 py-1.5 rounded-lg border border-border/50 shrink-0"
        >
          {showInactive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showInactive ? 'Hide Inactive' : 'Show Inactive'}
        </button>
      </div>

      {/* Portfolio summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <User className="h-3.5 w-3.5" />
            Borrowers
          </div>
          <div className="text-lg font-bold">{portfolioStats.borrowerCount}</div>
        </div>
        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <FileText className="h-3.5 w-3.5" />
            Active Loans
          </div>
          <div className="text-lg font-bold text-primary">{portfolioStats.activeLoans}</div>
        </div>
        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <IndianRupee className="h-3.5 w-3.5" />
            Exposure
          </div>
          <div className="text-sm font-bold leading-tight">
            ₹{formatAmount(portfolioStats.totalActivePrincipal)}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search name, phone, ID, address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
        />
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm py-8 text-center">Loading borrowers...</div>
      ) : (
        <div className="space-y-3">
          {filteredBorrowers.map(b => {
            const stats = getBorrowerStats(b.loans);
            const rateLabel = stats.latestActive
              ? `${stats.latestActive.interestRate}${stats.latestActive.interestRateType === 'PERCENTAGE' ? '%' : '₹'} ${stats.latestActive.interestType.toLowerCase()}`
              : null;

            return (
              <Link key={b.id} to={`/borrowers/${b.id}`} className="block group">
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden hover:border-primary/40 hover:shadow-md transition-all">
                  <div className="p-4 flex gap-3">
                    {/* Avatar */}
                    <div className={`shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold ${
                      b.isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {getInitials(b.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-base truncate">{b.name}</h3>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>{b.phone}</span>
                            {b.altPhone && (
                              <span className="text-xs text-muted-foreground/70">/ {b.altPhone}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={e => handleToggleStatus(e, b.id, !b.isActive)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-primary transition-all rounded-md hover:bg-muted"
                            title={b.isActive ? 'Archive borrower' : 'Restore borrower'}
                          >
                            {b.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                            b.isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {b.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {b.address && (
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{b.address}</span>
                        </div>
                      )}

                      {b.idNumber && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <CreditCard className="h-3.5 w-3.5 shrink-0" />
                          <span>{b.idNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Loan stats strip */}
                  <div className="grid grid-cols-3 divide-x border-t bg-muted/30 text-center">
                    <div className="px-2 py-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Loans</div>
                      <div className="text-sm font-bold mt-0.5">
                        {stats.activeCount}
                        <span className="text-muted-foreground font-normal text-xs"> / {stats.totalLoans}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">active / total</div>
                    </div>
                    <div className="px-2 py-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Principal</div>
                      <div className="text-sm font-bold mt-0.5 text-primary">
                        {stats.activePrincipal > 0 ? `₹${formatAmount(stats.activePrincipal)}` : '—'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">active exposure</div>
                    </div>
                    <div className="px-2 py-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Rate</div>
                      <div className="text-xs font-semibold mt-0.5 truncate px-1">
                        {rateLabel ?? '—'}
                      </div>
                      {stats.latestActive?.dueDate && (
                        <div className="text-[10px] text-muted-foreground">
                          Due {dayjs(stats.latestActive.dueDate).format('MMM D')}
                        </div>
                      )}
                      {!stats.latestActive?.dueDate && stats.latestActive && (
                        <div className="text-[10px] text-muted-foreground">
                          Since {dayjs(stats.latestActive.startDate).format('MMM D')}
                        </div>
                      )}
                    </div>
                  </div>

                  {b.notes && (
                    <div className="px-4 py-2 border-t bg-muted/10 text-xs text-muted-foreground italic line-clamp-1">
                      {b.notes}
                    </div>
                  )}

                  <div className="px-4 py-2 border-t flex items-center justify-between text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View loans & details</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}

          {filteredBorrowers.length === 0 && (
            <div className="text-center text-muted-foreground p-10 rounded-xl border border-dashed">
              {search ? 'No borrowers match your search.' : 'No borrowers found.'}
            </div>
          )}
        </div>
      )}

      <FAB onClick={() => setIsModalOpen(true)} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Borrower">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name *"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="Phone Number *"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Input
            label="Alternate Phone"
            type="tel"
            {...register('altPhone')}
            error={errors.altPhone?.message}
          />
          <Textarea
            label="Address"
            {...register('address')}
            error={errors.address?.message}
          />
          <Input
            label="ID Number (Aadhaar/PAN)"
            {...register('idNumber')}
            error={errors.idNumber?.message}
          />
          <Textarea
            label="Notes"
            {...register('notes')}
            error={errors.notes?.message}
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
              {isSubmitting ? 'Saving...' : 'Save Borrower'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
