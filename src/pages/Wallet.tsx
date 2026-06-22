import { useEffect, useState } from 'react';
import { api } from '../contexts/AuthProvider';
import { ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';

interface WalletData {
  balance: number;
  totalAssets: number;
  totalLiabilities: number;
  interestEarned: number;
  totalCollections: number;
}

export function Wallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get('/wallet');
        setWallet(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWallet();
  }, []);

  if (!wallet) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold tracking-tight">Wallet</h2>
      
      <div className="rounded-2xl bg-primary text-primary-foreground p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
        <div className="relative z-10">
          <div className="text-primary-foreground/80 text-sm font-medium mb-1">Available Cash</div>
          <div className="text-4xl font-bold flex items-center gap-1">
            <IndianRupee className="h-8 w-8" />
            {wallet.balance.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span>Total Assets</span>
          </div>
          <div className="text-xl font-bold">₹{wallet.totalAssets.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ArrowDownRight className="h-4 w-4 text-red-500" />
            <span>Liabilities</span>
          </div>
          <div className="text-xl font-bold">₹{wallet.totalLiabilities.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
