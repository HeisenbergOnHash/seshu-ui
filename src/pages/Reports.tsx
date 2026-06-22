import { useState } from 'react';
import { api } from '../contexts/AuthProvider';
import { Download, FileText } from 'lucide-react';

export function Reports() {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = async (type: string) => {
    setLoading(true);
    try {
      let endpoint = '/transactions';
      if (startDate || endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        endpoint += `?${params.toString()}`;
      }
      
      const res = await api.get(endpoint);
      const data = res.data;
      
      if (!data || data.length === 0) {
        alert('No data to export');
        return;
      }

      // Simple CSV export
      const headers = Object.keys(data[0]).join(',');
      const csv = [
        headers,
        ...data.map((row: any) => Object.values(row).map(val => {
          if (typeof val === 'object' && val !== null) {
            return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          }
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${type}-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { id: 'transactions', title: 'Transaction History', desc: 'All credits and debits' },
    { id: 'loans', title: 'Active Loans', desc: 'Current active loans and balances' },
    { id: 'interest', title: 'Interest Earned', desc: 'Detailed interest collections' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Reports & Exports</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
          <input 
            type="date" 
            className="w-full h-11 md:h-10 rounded-md border border-input bg-background px-3 py-1 text-base md:text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date</label>
          <input 
            type="date" 
            className="w-full h-11 md:h-10 rounded-md border border-input bg-background px-3 py-1 text-base md:text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        {reportTypes.map((report) => (
          <div key={report.id} className="rounded-xl border bg-card p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-xs text-muted-foreground">{report.desc}</p>
              </div>
            </div>
            <button
              onClick={() => handleExport(report.id)}
              disabled={loading}
              className="touch-target hover:bg-muted rounded-full transition-colors disabled:opacity-50"
              aria-label={`Download ${report.title}`}
            >
              <Download className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
