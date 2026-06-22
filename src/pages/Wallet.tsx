import { useEffect, useState } from 'react';
import { api } from '../contexts/AuthProvider';
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  IndianRupee,
  PiggyBank,
  TrendingUp,
  Wallet as WalletIcon,
} from 'lucide-react';

interface WalletData {
  openingBalance: number;
  balance: number;
  totalAssets: number;
  totalLiabilities: number;
  interestEarned: number;
  totalCollections: number;
  updatedAt?: string;
}

function formatAmount(value: number) {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatAmountCompact(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

function Amount({
  value,
  className = '',
  compactOnMobile = true,
}: {
  value: number;
  className?: string;
  compactOnMobile?: boolean;
}) {
  const full = `₹${formatAmount(value)}`;
  return (
    <span className={className} title={full}>
      {compactOnMobile ? (
        <>
          <span className="sm:hidden">{formatAmountCompact(value)}</span>
          <span className="hidden sm:inline">{full}</span>
        </>
      ) : (
        full
      )}
    </span>
  );
}

export function Wallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get('/wallet');
        setWallet(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  if (loading) {
    return <div className="text-muted-foreground py-8 text-center text-sm">Loading wallet…</div>;
  }

  if (!wallet) {
    return <div className="text-destructive py-8 text-center text-sm">Unable to load wallet</div>;
  }

  const disbursements = Math.max(
    0,
    wallet.openingBalance + wallet.totalCollections - wallet.balance
  );

  return (
    <div className="page-shell space-y-4 sm:space-y-6">
      <h2 className="text-lg font-bold tracking-tight sm:text-xl">Wallet</h2>

      {/* Available cash hero */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/90 to-primary p-4 sm:p-6 text-primary-foreground shadow-lg shadow-primary/20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary-foreground/80 text-xs sm:text-sm font-medium mb-1">
            <WalletIcon className="h-4 w-4 shrink-0" />
            Available Cash
          </div>
          <div className="flex items-baseline gap-1 tabular-nums">
            <IndianRupee className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 opacity-90" />
            <span className="text-2xl sm:text-4xl font-bold tracking-tight">
              {formatAmount(wallet.balance)}
            </span>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-primary-foreground/75">
            Estimated cash after disbursements and collections
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 min-w-0">
        <div className="stat-card min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-sm text-muted-foreground mb-1 sm:mb-2">
            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-green-500" />
            <span className="truncate">Outstanding</span>
          </div>
          <div className="text-sm sm:text-xl font-bold tabular-nums truncate">
            <Amount value={wallet.totalAssets} />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">Principal out</p>
        </div>

        <div className="stat-card min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-sm text-muted-foreground mb-1 sm:mb-2">
            <Banknote className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Collections</span>
          </div>
          <div className="text-sm sm:text-xl font-bold tabular-nums truncate">
            <Amount value={wallet.totalCollections} />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">Repayments & fees</p>
        </div>

        <div className="stat-card min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-sm text-muted-foreground mb-1 sm:mb-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-green-500" />
            <span className="truncate">Interest</span>
          </div>
          <div className="text-sm sm:text-xl font-bold text-green-500 tabular-nums truncate">
            <Amount value={wallet.interestEarned} />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">Interest earned</p>
        </div>

        <div className="stat-card min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-sm text-muted-foreground mb-1 sm:mb-2">
            <PiggyBank className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Opening</span>
          </div>
          <div className="text-sm sm:text-xl font-bold tabular-nums truncate">
            <Amount value={wallet.openingBalance} />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">Starting cash</p>
        </div>
      </div>

      {/* Cash flow breakdown */}
      <div className="stat-card space-y-3">
        <h3 className="text-sm sm:text-base font-semibold">Cash Flow</h3>
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between gap-2 text-muted-foreground">
            <span>Opening cash</span>
            <span className="font-medium text-foreground tabular-nums shrink-0">
              ₹{formatAmount(wallet.openingBalance)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 text-muted-foreground">
            <span className="flex items-center gap-1">
              <ArrowDownRight className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              Loan disbursements
            </span>
            <span className="font-medium text-orange-500 tabular-nums shrink-0">
              − ₹{formatAmount(disbursements)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 text-muted-foreground">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5 text-green-500 shrink-0" />
              Collections received
            </span>
            <span className="font-medium text-green-500 tabular-nums shrink-0">
              + ₹{formatAmount(wallet.totalCollections)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2 font-semibold text-foreground">
            <span>Available cash</span>
            <span className="text-primary tabular-nums shrink-0">
              ₹{formatAmount(wallet.balance)}
            </span>
          </div>
        </div>
      </div>

      {wallet.totalLiabilities > 0 && (
        <div className="stat-card">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Liabilities</span>
            <span className="text-sm sm:text-base font-bold text-red-500 tabular-nums">
              ₹{formatAmount(wallet.totalLiabilities)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
