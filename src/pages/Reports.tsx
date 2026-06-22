import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../contexts/AuthProvider';
import { DateInput } from '../components/FormInputs';
import { Download, Eye, FileText, IndianRupee, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

type ReportId = 'transactions' | 'loans' | 'interest';

interface TransactionRow {
  id: string;
  type: string;
  amount: number;
  paymentMethod?: string;
  createdAt: string;
  loan?: {
    id: string;
    borrower?: { id: string; name: string };
  };
}

interface LoanRow {
  id: string;
  principal: number;
  interestRate: number;
  interestRateType: string;
  interestType: string;
  status: string;
  startDate: string;
  dueDate?: string | null;
  borrower?: { id: string; name: string };
}

const reportTypes: { id: ReportId; title: string; desc: string }[] = [
  { id: 'transactions', title: 'Transaction History', desc: 'All credits and debits' },
  { id: 'loans', title: 'Active Loans', desc: 'Current active loans and balances' },
  { id: 'interest', title: 'Interest Earned', desc: 'Detailed interest collections' },
];

function formatAmount(value: number) {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function txTypeLabel(type: string) {
  switch (type) {
    case 'INTEREST_COLLECTION':
      return 'Interest';
    case 'DEBIT':
      return 'Principal Repaid';
    case 'CREDIT':
      return 'Disbursement';
    case 'CHARGE':
      return 'Charge';
    default:
      return type;
  }
}

function buildEndpoint(startDate: string, endDate: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString();
  return query ? `/transactions?${query}` : '/transactions';
}

function exportCsv(type: ReportId, rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0]).join(',');
  const csv = [
    headers,
    ...rows.map(row =>
      Object.values(row)
        .map(val => {
          if (typeof val === 'object' && val !== null) {
            return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          }
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
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
}

export function Reports() {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeReport, setActiveReport] = useState<ReportId | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [error, setError] = useState('');

  const fetchReportData = useCallback(
    async (type: ReportId) => {
      if (type === 'loans') {
        const res = await api.get('/loans');
        const active = (res.data as LoanRow[]).filter(l =>
          l.status === 'ACTIVE' || l.status === 'DEFAULTED'
        );
        return { loans: active, transactions: [] as TransactionRow[] };
      }

      const res = await api.get(buildEndpoint(startDate, endDate));
      let txs = res.data as TransactionRow[];
      if (type === 'interest') {
        txs = txs.filter(t => t.type === 'INTEREST_COLLECTION');
      }
      return { loans: [] as LoanRow[], transactions: txs };
    },
    [startDate, endDate]
  );

  const fetchAndSet = useCallback(
    async (type: ReportId) => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchReportData(type);
        setTransactions(data.transactions);
        setLoans(data.loans);
      } catch (err) {
        console.error(err);
        setError('Failed to load report data');
        setTransactions([]);
        setLoans([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchReportData]
  );

  useEffect(() => {
    if (activeReport) {
      fetchAndSet(activeReport);
    }
  }, [activeReport, startDate, endDate, fetchAndSet]);

  const handleExport = async (type: ReportId) => {
    setLoading(true);
    try {
      const data = await fetchReportData(type);
      const rows =
        type === 'loans'
          ? data.loans.map(l => ({ ...l }))
          : data.transactions.map(t => ({ ...t }));

      if (rows.length === 0) {
        alert('No data to export');
        return;
      }

      exportCsv(type, rows as Record<string, unknown>[]);
    } catch (err) {
      console.error(err);
      alert('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const activeMeta = reportTypes.find(r => r.id === activeReport);
  const resultCount =
    activeReport === 'loans' ? loans.length : transactions.length;

  return (
    <div className="page-shell space-y-4 sm:space-y-6 content-pb-nav">
      <h2 className="text-lg font-bold tracking-tight sm:text-xl">Reports & Exports</h2>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/50">
        <DateInput
          id="report-start-date"
          label="Start Date"
          value={startDate}
          max={endDate || undefined}
          onChange={e => setStartDate(e.target.value)}
        />
        <DateInput
          id="report-end-date"
          label="End Date"
          value={endDate}
          min={startDate || undefined}
          onChange={e => setEndDate(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {reportTypes.map(report => (
          <div
            key={report.id}
            className={`list-card flex items-center justify-between gap-3 p-3 sm:p-4 ${
              activeReport === report.id ? 'border-primary/40 ring-1 ring-primary/20' : ''
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">{report.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{report.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setActiveReport(report.id)}
                disabled={loading}
                className="touch-target hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                aria-label={`View ${report.title}`}
                title="View data"
              >
                <Eye className="h-5 w-5 text-primary" />
              </button>
              <button
                onClick={() => handleExport(report.id)}
                disabled={loading}
                className="touch-target hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                aria-label={`Download ${report.title}`}
                title="Download CSV"
              >
                <Download className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeReport && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold sm:text-lg truncate">
              {activeMeta?.title}
              {!loading && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({resultCount})
                </span>
              )}
            </h3>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
          </div>

          {error && (
            <div className="text-sm text-destructive text-center py-4 border border-destructive/30 rounded-xl bg-destructive/5">
              {error}
            </div>
          )}

          {!loading && !error && resultCount === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-xl">
              No records found for this period.
            </div>
          )}

          {!loading && !error && activeReport === 'loans' && loans.length > 0 && (
            <div className="space-y-2">
              {loans.map(loan => (
                <Link
                  key={loan.id}
                  to={`/loans/${loan.id}`}
                  className="block list-card p-3 sm:p-4"
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base truncate">
                        {loan.borrower?.name ?? 'Unknown borrower'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Started {dayjs(loan.startDate).format('MMM D, YYYY')}
                        {loan.dueDate && ` · Due ${dayjs(loan.dueDate).format('MMM D, YYYY')}`}
                      </div>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {loan.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
                    <span className="font-bold text-primary tabular-nums">
                      ₹{formatAmount(loan.principal)}
                    </span>
                    <span className="text-muted-foreground">
                      {loan.interestRate}
                      {loan.interestRateType === 'PERCENTAGE' ? '%' : '₹'} · {loan.interestType.toLowerCase()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && activeReport !== 'loans' && transactions.length > 0 && (
            <div className="space-y-2">
              {transactions.map(tx => (
                <div key={tx.id} className="list-card p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                        <IndianRupee className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base truncate">
                          {tx.loan?.borrower?.name ?? 'Unknown borrower'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {txTypeLabel(tx.type)}
                          {tx.paymentMethod && ` · ${tx.paymentMethod.replace(/_/g, ' ')}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dayjs(tx.createdAt).format('MMM D, YYYY h:mm A')}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-primary tabular-nums shrink-0">
                      ₹{formatAmount(tx.amount)}
                    </div>
                  </div>
                  {tx.loan?.id && (
                    <Link
                      to={`/loans/${tx.loan.id}`}
                      className="mt-2 inline-block text-xs text-primary font-medium hover:underline"
                    >
                      View loan →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
