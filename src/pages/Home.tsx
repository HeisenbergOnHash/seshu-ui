import { useEffect, useState } from 'react';
import { api } from '../contexts/AuthProvider';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Wallet, Activity } from 'lucide-react';
import dayjs from 'dayjs';

interface DashboardStats {
  totalLoans: number;
  activeLoans: number;
  totalPrincipal: number;
  totalCollections: number;
  interestEarned: number;
}

interface Transaction {
  type: string;
  amount: number;
  createdAt: string;
}

interface ChartPoint {
  name: string;
  amount: number;
}

const COLLECTION_TYPES = new Set(['INTEREST_COLLECTION', 'DEBIT', 'CHARGE']);

function buildMonthlyCollections(transactions: Transaction[]): ChartPoint[] {
  const totals = new Map<string, number>();

  transactions
    .filter(tx => COLLECTION_TYPES.has(tx.type))
    .forEach(tx => {
      const key = dayjs(tx.createdAt).format('YYYY-MM');
      totals.set(key, (totals.get(key) ?? 0) + tx.amount);
    });

  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([key, amount]) => ({
      name: dayjs(key).format('MMM YY'),
      amount,
    }));
}

export function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  const formatAxisAmount = (value: number) => {
    if (value >= 1000) return `₹${Math.round(value / 1000)}k`;
    return `₹${value}`;
  };

  const formatAmountCompact = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  const formatAmount = (value: number) =>
    value.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, txsRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/transactions'),
        ]);
        setStats(statsRes.data);
        setChartData(buildMonthlyCollections(txsRes.data));
      } catch (err) {
        console.error('Failed to load dashboard');
      }
    };
    fetchDashboard();
  }, []);

  if (!stats) return <div className="text-muted-foreground py-8 text-center">Loading...</div>;

  return (
    <div className="page-shell space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 min-w-0">
        <div className="stat-card min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-sm text-muted-foreground mb-1 sm:mb-2">
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Principal</span>
          </div>
          <div
            className="text-sm sm:text-xl font-bold tabular-nums truncate"
            title={`₹${formatAmount(stats.totalPrincipal)}`}
          >
            <span className="sm:hidden">{formatAmountCompact(stats.totalPrincipal)}</span>
            <span className="hidden sm:inline">₹{formatAmount(stats.totalPrincipal)}</span>
          </div>
        </div>
        <div className="stat-card min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-sm text-muted-foreground mb-1 sm:mb-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-green-500" />
            <span className="truncate">Interest</span>
          </div>
          <div
            className="text-sm sm:text-xl font-bold text-green-500 tabular-nums truncate"
            title={`₹${formatAmount(stats.interestEarned)}`}
          >
            <span className="sm:hidden">{formatAmountCompact(stats.interestEarned)}</span>
            <span className="hidden sm:inline">₹{formatAmount(stats.interestEarned)}</span>
          </div>
        </div>
        <div className="stat-card min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-sm text-muted-foreground mb-1 sm:mb-2">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Collections</span>
          </div>
          <div
            className="text-sm sm:text-xl font-bold tabular-nums truncate"
            title={`₹${formatAmount(stats.totalCollections)}`}
          >
            <span className="sm:hidden">{formatAmountCompact(stats.totalCollections)}</span>
            <span className="hidden sm:inline">₹{formatAmount(stats.totalCollections)}</span>
          </div>
        </div>
        <div className="stat-card min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-sm text-muted-foreground mb-1 sm:mb-2">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Loans</span>
          </div>
          <div className="text-sm sm:text-xl font-bold tabular-nums">
            {stats.activeLoans}
            <span className="text-muted-foreground font-normal text-xs sm:text-base"> / {stats.totalLoans}</span>
          </div>
        </div>
      </div>

      <div className="stat-card overflow-hidden">
        <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">Monthly Collections</h3>
        {chartData.length === 0 ? (
          <div className="flex h-52 sm:h-64 items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl">
            No collection data yet
          </div>
        ) : (
          <div className="h-52 sm:h-64 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 0, left: -16, bottom: 4 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={18}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  tickMargin={6}
                  tickFormatter={formatAxisAmount}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value) => `₹${Number(value ?? 0).toLocaleString('en-IN')}`}
                />
                <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
