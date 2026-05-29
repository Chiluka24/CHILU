import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  HandCoins,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  chartTheme,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipStyle,
} from '../../config/theme';
import { TrendingUp } from 'lucide-react';
import { API_BASE } from '../../config/env';
import PageHeader from '../../components/layout/PageHeader';
import SubNav from '../../components/layout/SubNav';

type TimePeriod = 'monthly' | 'yearly' | 'custom';

type Payout = {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'Paid';
  transactionId: string;
  netAmount: number;
};

type RevenuePoint = {
  label: string;
  value: number;
};

const PAYOUTS: Payout[] = [
  {
    id: 'p1',
    date: '2026-03-10',
    amount: 1240,
    method: 'Bank Transfer',
    status: 'Paid',
    transactionId: 'TXN-A91D2Q',
    netAmount: 1190,
  },
  {
    id: 'p2',
    date: '2026-02-26',
    amount: 860,
    method: 'Bank Transfer',
    status: 'Paid',
    transactionId: 'TXN-C45V8L',
    netAmount: 826,
  },
  {
    id: 'p3',
    date: '2026-02-12',
    amount: 920,
    method: 'Bank Transfer',
    status: 'Paid',
    transactionId: 'TXN-F77N3R',
    netAmount: 884,
  },
];

const MONTHLY_REVENUE: RevenuePoint[] = [
  { label: 'Mar 1', value: 70 },
  { label: 'Mar 4', value: 112 },
  { label: 'Mar 7', value: 140 },
  { label: 'Mar 10', value: 176 },
  { label: 'Mar 13', value: 158 },
  { label: 'Mar 16', value: 196 },
  { label: 'Mar 19', value: 214 },
  { label: 'Mar 22', value: 232 },
  { label: 'Mar 25', value: 205 },
  { label: 'Mar 28', value: 248 },
];

const YEARLY_REVENUE: RevenuePoint[] = [
  { label: 'Jan', value: 1240 },
  { label: 'Feb', value: 1780 },
  { label: 'Mar', value: 2180 },
  { label: 'Apr', value: 1970 },
  { label: 'May', value: 2410 },
  { label: 'Jun', value: 2660 },
  { label: 'Jul', value: 2890 },
  { label: 'Aug', value: 2720 },
  { label: 'Sep', value: 3020 },
  { label: 'Oct', value: 3260 },
  { label: 'Nov', value: 3110 },
  { label: 'Dec', value: 3480 },
];

const formatCurrency = (value: number) => `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function Payouts() {
  const navigate = useNavigate();
  const [revenuePeriod, setRevenuePeriod] = useState<TimePeriod>('monthly');
  const [revenueFrom, setRevenueFrom] = useState('2026-03-01');
  const [revenueTo, setRevenueTo] = useState('2026-03-31');

  const availableBalance = 2180;
  const totalPaid = PAYOUTS.reduce((sum, payout) => sum + payout.amount, 0);
  const lifetimeEarnings = availableBalance + totalPaid;

  const revenueData = useMemo(() => {
    if (revenuePeriod === 'yearly') {
      return YEARLY_REVENUE;
    }

    if (revenuePeriod === 'custom') {
      return MONTHLY_REVENUE.filter((point) => {
        const pointDate = new Date(`2026 ${point.label}`);
        const from = new Date(revenueFrom);
        const to = new Date(revenueTo);
        return pointDate.getTime() >= from.getTime() && pointDate.getTime() <= to.getTime();
      });
    }

    return MONTHLY_REVENUE;
  }, [revenueFrom, revenuePeriod, revenueTo]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user has monetization approved
    fetch(`${API_BASE}/api/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      })
      .then(data => {
        const userData = data.data || data;
        const approved = true; // Temporarily force to true to test APPROVED scenario
        
        if (!approved) {
          // Redirect to main monetization page if not approved
          navigate('/monetization');
        }
      })
      .catch(err => {
        console.error('Failed to fetch user monetization status:', err);
        navigate('/monetization');
      });
  }, [navigate]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto app-page">
      <PageHeader
        title="Monetization"
        subtitle="View your earnings and payout history."
        action={
          <SubNav
            items={[
              { path: '/monetization/campaigns', label: 'Campaigns', icon: TrendingUp },
              { path: '/monetization/payouts',   label: 'Payouts',   icon: CreditCard },
            ]}
          />
        }
      />

      {/* Total Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="app-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full" style={{ background: 'linear-gradient(135deg, var(--button-primary), var(--chart-primary))', opacity: 0.05, transform: 'translate(40%, -40%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <HandCoins className="w-4 h-4 app-muted" />
              <p className="text-[11px] uppercase tracking-wide app-muted">Total Earnings</p>
            </div>
            <p className="text-xl lg:text-lg font-semibold app-heading mt-1">${formatCurrency(lifetimeEarnings)}</p>
            <p className="text-xs app-muted mt-1">Lifetime earnings</p>
          </div>
        </article>
        
        <article className="app-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full" style={{ background: 'linear-gradient(135deg, var(--button-primary), var(--chart-primary))', opacity: 0.05, transform: 'translate(40%, -40%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock className="w-4 h-4 app-muted" />
              <p className="text-[11px] uppercase tracking-wide app-muted">Next Payout Date</p>
            </div>
            <p className="text-xl lg:text-lg font-semibold app-heading mt-1">Mar 18, 2026</p>
            <p className="text-xs app-muted mt-1">Automatic monthly transfer</p>
          </div>
        </article>
        
        <article className="app-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full" style={{ background: 'linear-gradient(135deg, var(--button-primary), var(--chart-primary))', opacity: 0.05, transform: 'translate(40%, -40%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-4 h-4 app-muted" />
              <p className="text-[11px] uppercase tracking-wide app-muted">Total Paid Out</p>
            </div>
            <p className="text-xl lg:text-lg font-semibold app-heading mt-1">${formatCurrency(totalPaid)}</p>
            <p className="text-xs app-muted mt-1">Transferred to bank</p>
          </div>
        </article>
      </div>

      <section className="app-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full" style={{ background: '#10B981', boxShadow: '0 0 0 6px rgba(16, 185, 129, 0.14)' }} />
          <h3 className="text-lg lg:text-base font-semibold app-heading">Real-Time Earnings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Today', value: 128, change: 8.4 },
            { label: 'This Week', value: 820, change: 13.7 },
            { label: 'This Month', value: 2180, change: 22.1 },
          ].map((item) => (
            <div key={item.label} className="app-subcard p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full" style={{ background: 'linear-gradient(135deg, var(--button-primary), var(--chart-primary))', opacity: 0.03, transform: 'translate(30%, -30%)' }} />
              
              <p className="text-[11px] uppercase tracking-wide app-muted relative z-10">{item.label}</p>
              <p className="text-xl lg:text-lg font-semibold app-heading mt-1 relative z-10">${formatCurrency(item.value)}</p>
              <span className="text-xs font-semibold app-chip-accent px-2 py-1 inline-flex items-center gap-1 mt-2 relative z-10">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{item.change}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="app-card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <h3 className="text-lg lg:text-base font-semibold app-heading">Revenue Overview</h3>
          <div className="app-tabs-shell p-1 inline-flex w-fit">
            {(['monthly', 'yearly', 'custom'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setRevenuePeriod(period)}
                className={`px-3 py-1.5 text-xs font-semibold app-tab ${revenuePeriod === period ? 'app-tab-active' : ''}`}
              >
                {period[0].toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {revenuePeriod === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            <input
              type="date"
              value={revenueFrom}
              onChange={(event) => setRevenueFrom(event.target.value)}
              className="app-input px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={revenueTo}
              onChange={(event) => setRevenueTo(event.target.value)}
              className="app-input px-3 py-2 text-sm"
            />
            <button type="button" className="app-button-secondary px-3 py-2 text-sm font-medium">Apply Range</button>
          </div>
        )}

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: chartTheme.tick, fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: chartTheme.tick, fontSize: 12 }}
                tickFormatter={(value: number) => formatCurrency(Number(value))}
              />
              <Tooltip contentStyle={chartTooltipStyle} itemStyle={chartTooltipItemStyle} labelStyle={chartTooltipLabelStyle} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartTheme.primary}
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--card-bg)', stroke: chartTheme.primary, strokeWidth: 2 }}
                activeDot={{ r: 5, fill: chartTheme.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="app-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Landmark className="w-4 h-4 app-muted" />
            <h3 className="text-base font-semibold app-heading">Payment Method</h3>
          </div>
          <div className="app-panel p-8 text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--button-primary), var(--chart-primary))', opacity: 0.1 }} />
              <div className="absolute inset-2 rounded-xl app-icon-tile flex items-center justify-center">
                <CreditCard className="w-8 h-8" style={{ color: 'var(--button-primary)' }} />
              </div>
            </div>
            
            <p className="text-base font-semibold app-heading mb-2">Secure Payment Setup</p>
            <p className="text-xs app-body mb-5 max-w-xs mx-auto">
              Connect your bank account to receive automatic payouts. All transactions are encrypted and secure.
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-5 text-[10px] app-muted">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant verification</span>
              </div>
            </div>
            
            <button type="button" className="app-button-primary px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Add Bank Account
            </button>
          </div>
        </section>

        <section className="app-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold app-heading">Recent Payouts</h3>
            <button type="button" className="text-xs font-semibold app-button-secondary px-3 py-1.5 inline-flex items-center gap-1">
              View All
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {PAYOUTS.length === 0 ? (
            <div className="app-panel p-8 text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--button-primary), var(--chart-primary))', opacity: 0.1 }} />
                <div className="absolute inset-2 rounded-xl app-icon-tile flex items-center justify-center">
                  <Clock3 className="w-6 h-6" style={{ color: 'var(--button-primary)' }} />
                </div>
              </div>
              
              <p className="text-sm font-semibold app-heading mb-1">No Payouts Yet</p>
              <p className="text-xs app-body mb-4 max-w-xs mx-auto">
                Your payout history will appear here once you reach the minimum threshold and receive your first payment.
              </p>
              
              <div className="inline-flex items-center gap-2 text-xs app-muted">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--chart-primary)' }} />
                <span>Minimum payout: $50</span>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-default)]">
                      <th className="text-left py-3 pr-3 app-muted font-semibold">Date</th>
                      <th className="text-left py-3 pr-3 app-muted font-semibold">Amount</th>
                      <th className="text-left py-3 pr-3 app-muted font-semibold">Method</th>
                      <th className="text-left py-3 pr-3 app-muted font-semibold">Status</th>
                      <th className="text-left py-3 app-muted font-semibold">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAYOUTS.map((payout) => (
                      <tr key={payout.id} className="border-b border-[var(--border-default)] last:border-b-0">
                        <td className="py-3 pr-3 app-body">{formatDate(payout.date)}</td>
                        <td className="py-3 pr-3 font-semibold app-heading">{formatCurrency(payout.amount)}</td>
                        <td className="py-3 pr-3 app-body">{payout.method}</td>
                        <td className="py-3 pr-3">
                          <span className="text-[11px] font-semibold px-2 py-1 app-chip-accent inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {payout.status}
                          </span>
                        </td>
                        <td className="py-3 font-semibold" style={{ color: '#689F38' }}>
                          {formatCurrency(payout.netAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {PAYOUTS.map((payout) => (
                  <article key={payout.id} className="app-subcard p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-xs app-muted uppercase tracking-wide">Amount</p>
                        <p className="text-lg lg:text-base font-semibold app-heading">{formatCurrency(payout.amount)}</p>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-1 app-chip-accent inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {payout.status}
                      </span>
                    </div>
                    <div className="mt-3 text-xs app-body space-y-1">
                      <p>{formatDate(payout.date)}</p>
                      <p>{payout.method}</p>
                      <p className="font-mono app-muted">{payout.transactionId}</p>
                      <p className="font-semibold" style={{ color: '#689F38' }}>Net: {formatCurrency(payout.netAmount)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}