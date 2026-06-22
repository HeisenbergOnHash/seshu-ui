import { useEffect, useMemo, useState } from 'react';
import { api } from '../contexts/AuthProvider';
import { FAB } from '../components/FAB';
import { Modal } from '../components/Modal';
import { ModalFooter } from '../components/ModalFooter';
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

function formatAmountCompact(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

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
    <div className="page-shell space-y-3 sm:space-y-4 content-pb-fab">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl truncate">Borrowers</h2>
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 bg-muted/50 px-2.5 py-2 sm:px-3 rounded-lg border border-border/50 shrink-0 min-h-10 sm:min-h-11"
        >
          {showInactive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span className="hidden min-[380px]:inline">{showInactive ? 'Hide Inactive' : 'Show Inactive'}</span>
          <span className="min-[380px]:hidden">{showInactive ? 'Hide' : 'Show'}</span>
        </button>
      </div>

      {/* Portfolio summary */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 min-w-0">
        <div className="rounded-xl border bg-card p-2 sm:p-3 shadow-sm min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">
            <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="truncate">Borrowers</span>
          </div>
          <div className="text-base sm:text-lg font-bold tabular-nums">{portfolioStats.borrowerCount}</div>
        </div>
        <div className="rounded-xl border bg-card p-2 sm:p-3 shadow-sm min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">
            <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="truncate">Loans</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-primary tabular-nums">{portfolioStats.activeLoans}</div>
        </div>
        <div className="rounded-xl border bg-card p-2 sm:p-3 shadow-sm min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">
            <IndianRupee className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="truncate">Exposure</span>
          </div>
          <div
            className="text-xs sm:text-sm font-bold leading-tight tabular-nums truncate"
            title={`₹${formatAmount(portfolioStats.totalActivePrincipal)}`}
          >
            <span className="sm:hidden">{formatAmountCompact(portfolioStats.totalActivePrincipal)}</span>
            <span className="hidden sm:inline">₹{formatAmount(portfolioStats.totalActivePrincipal)}</span>
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
          className="w-full pl-9 pr-3 py-2.5 text-base md:text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors h-11 md:h-10"
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
              <Link key={b.id} to={`/borrowers/${b.id}`} className="block group min-w-0 w-full">
                <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden list-card">
                  <div className="p-3 sm:p-4 flex gap-2.5 sm:gap-3 min-w-0">
                    {/* Avatar */}
                    <div className={`shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                      b.isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {getInitials(b.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5 sm:gap-2 min-w-0">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{b.name}</h3>
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mt-0.5 min-w-0">
                            <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                            <span className="truncate">{b.phone}</span>
                            {b.altPhone && (
                              <span className="hidden sm:inline text-xs text-muted-foreground/70 shrink-0">/ {b.altPhone}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                          <button
                            onClick={e => handleToggleStatus(e, b.id, !b.isActive)}
                            className="touch-target text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted h-9 w-9 sm:h-11 sm:w-11"
                            title={b.isActive ? 'Archive borrower' : 'Restore borrower'}
                            aria-label={b.isActive ? 'Archive borrower' : 'Restore borrower'}
                          >
                            {b.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide ${
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
                  <div className="grid grid-cols-3 divide-x border-t bg-muted/30 text-center min-w-0">
                    <div className="px-1 py-2 sm:px-2 sm:py-2.5 min-w-0">
                      <div className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-medium truncate">Loans</div>
                      <div className="text-xs sm:text-sm font-bold mt-0.5 tabular-nums">
                        {stats.activeCount}
                        <span className="text-muted-foreground font-normal text-[10px] sm:text-xs"> / {stats.totalLoans}</span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">active / total</div>
                    </div>
                    <div className="px-1 py-2 sm:px-2 sm:py-2.5 min-w-0">
                      <div className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-medium truncate">Principal</div>
                      <div
                        className="text-xs sm:text-sm font-bold mt-0.5 text-primary tabular-nums truncate px-0.5"
                        title={stats.activePrincipal > 0 ? `₹${formatAmount(stats.activePrincipal)}` : undefined}
                      >
                        {stats.activePrincipal > 0 ? (
                          <>
                            <span className="sm:hidden">{formatAmountCompact(stats.activePrincipal)}</span>
                            <span className="hidden sm:inline">₹{formatAmount(stats.activePrincipal)}</span>
                          </>
                        ) : '—'}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">exposure</div>
                    </div>
                    <div className="px-1 py-2 sm:px-2 sm:py-2.5 min-w-0">
                      <div className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-medium truncate">Rate</div>
                      <div className="text-[10px] sm:text-xs font-semibold mt-0.5 truncate px-0.5">
                        {rateLabel ?? '—'}
                      </div>
                      {stats.latestActive?.dueDate && (
                        <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          Due {dayjs(stats.latestActive.dueDate).format('MMM D')}
                        </div>
                      )}
                      {!stats.latestActive?.dueDate && stats.latestActive && (
                        <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          Since {dayjs(stats.latestActive.startDate).format('MMM D')}
                        </div>
                      )}
                    </div>
                  </div>

                  {b.notes && (
                    <div className="px-3 sm:px-4 py-2 border-t bg-muted/10 text-xs text-muted-foreground italic line-clamp-1">
                      {b.notes}
                    </div>
                  )}

                  <div className="px-3 sm:px-4 py-2 border-t flex items-center justify-between text-xs text-primary font-medium">
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Borrower"
        footer={
          <ModalFooter
            formId="add-borrower-form"
            onCancel={() => setIsModalOpen(false)}
            submitLabel="Save Borrower"
            isSubmitting={isSubmitting}
          />
        }
      >
        <form id="add-borrower-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name *"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="Phone Number *"
            type="tel"
            inputMode="numeric"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Input
            label="Alternate Phone"
            type="tel"
            inputMode="numeric"
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
        </form>
      </Modal>
    </div>
  );
}
