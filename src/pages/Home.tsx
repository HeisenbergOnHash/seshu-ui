import { useEffect, useState } from 'react';
import { api } from '../contexts/AuthProvider';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Wallet, Activity } from 'lucide-react';

interface DashboardStats {
  totalLoans: number;
  activeLoans: number;
  totalPrincipal: number;
  totalCollections: number;
  interestEarned: number;
}

const mockChartData = [
  { name: 'Jan', amount: 4000 },
  { name: 'Feb', amount: 3000 },
  { name: 'Mar', amount: 2000 },
  { name: 'Apr', amount: 2780 },
  { name: 'May', amount: 1890 },
  { name: 'Jun', amount: 2390 },
  { name: 'Jul', amount: 3490 },
];

export function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats');
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="text-muted-foreground py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Cards */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Wallet className="h-4 w-4" />
            <span>Principal</span>
          </div>
          <div className="text-xl font-bold">₹{stats.totalPrincipal.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>Interest</span>
          </div>
          <div className="text-xl font-bold text-green-500">₹{stats.interestEarned.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Activity className="h-4 w-4" />
            <span>Collections</span>
          </div>
          <div className="text-xl font-bold">₹{stats.totalCollections.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            <span>Active Loans</span>
          </div>
          <div className="text-xl font-bold">{stats.activeLoans} / {stats.totalLoans}</div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Monthly Collections</h3>
        <div className="h-64 lg:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
