import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CalendarClock,
  Eye,
  HandCoins,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { API_BASE } from '../../config/env';

type ApprovalState = 'pending' | 'approved';

type Requirement = {
  id: string;
  label: string;
  subtitle: string;
  current: number;
  target: number;
  icon: LucideIcon;
};

const REQUIREMENTS: Requirement[] = [
  {
    id: 'impressions',
    label: 'Impressions',
    subtitle: 'Total views across your links',
    current: 4200,
    target: 10000,
    icon: Eye,
  },
  {
    id: 'visitors',
    label: 'Unique Visitors',
    subtitle: 'Distinct users who visited your page',
    current: 2300,
    target: 10000,
    icon: Users,
  },
  {
    id: 'age',
    label: 'Account Age (Days)',
    subtitle: 'Days since account creation',
    current: 31,
    target: 45,
    icon: CalendarClock,
  },
];

const BENEFITS: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: 'Earn Revenue',
    description: 'Generate income from brand campaigns and placements.',
    icon: HandCoins,
  },
  {
    title: 'Advanced Analytics',
    description: 'Get deeper visibility into CTR, impressions, and conversions.',
    icon: TrendingUp,
  },
  {
    title: 'Premium Features',
    description: 'Unlock premium monetization controls and campaign options.',
    icon: Sparkles,
  },
  {
    title: 'Priority Support',
    description: 'Receive faster support for monetization-related issues.',
    icon: ShieldCheck,
  },
];

const formatNumber = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return `${value}`;
};

export default function MonetizationPayouts() {
  const location = useLocation();
  const navigate = useNavigate();

  const [monetizationApproved, setMonetizationApproved] = useState<boolean>(false);
  const [approvalState, setApprovalState] = useState<ApprovalState>('pending');

  const requirementsWithProgress = useMemo(
    () =>
      REQUIREMENTS.map((entry) => ({
        ...entry,
        progress: Math.min(100, (entry.current / entry.target) * 100),
      })),
    [],
  );

  const isEligible = requirementsWithProgress.every((entry) => entry.current >= entry.target);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user's monetization approval status
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
        setMonetizationApproved(approved);
        
        // Set approval state based on actual user status
        if (approved) {
          setApprovalState('approved');
          // Redirect to campaigns page if monetization is approved and user is on base monetization page
          if (location.pathname === '/monetization') {
            navigate('/monetization/campaigns', { replace: true });
          }
        } else {
          setApprovalState('pending');
          // Redirect to main monetization page if trying to access campaigns/payouts without approval
          if (location.pathname.endsWith('/campaigns') || location.pathname.endsWith('/payouts')) {
            navigate('/monetization');
          }
        }
      })
      .catch(err => {
        console.error('Failed to fetch user monetization status:', err);
      });
  }, [navigate, location.pathname]);

  // If approved and on base monetization page, don't render anything (will redirect)
  if (approvalState === 'approved' && location.pathname === '/monetization') {
    return null;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto app-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold tracking-tight app-page-main-title">Monetization</h1>
          <p className="mt-1.5 text-sm app-page-subtitle font-medium">
            Complete requirements to unlock monetization.
          </p>
        </div>
      </div>

      {/* Hero banner section */}
      <section
        className="app-card p-8 text-center text-[var(--button-primary-text)]"
        style={{
          background: 'linear-gradient(135deg, var(--button-primary), var(--chart-primary))',
          border: 'none',
        }}
      >
        <h2 className="text-2xl font-bold" style={{ color: 'var(--button-primary-text)', fontFamily: "'Playfair Display', serif" }}>
          Unlock Your Earnings Potential
        </h2>
        <p className="mt-3 text-sm md:text-base" style={{ color: 'rgba(254, 249, 240, 0.9)' }}>
          Start earning from your content once your account clears monetization requirements.
        </p>
      </section>

      <section className="app-card p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg app-icon-tile flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg lg:text-base font-semibold app-heading">Monetization Is Currently Disabled</h3>
            <p className="mt-1 text-sm app-body">
              Your account becomes eligible after 45 days and after hitting the required traffic thresholds.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {requirementsWithProgress.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.article
              key={metric.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="app-card app-card-hover p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg app-icon-tile flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold app-heading">{metric.label}</p>
                  <p className="text-xs app-muted">{metric.subtitle}</p>
                </div>
              </div>

              <div className="text-xl lg:text-lg font-semibold app-heading">{formatNumber(metric.current)}</div>
              <p className="text-xs app-muted mt-1">Target: {formatNumber(metric.target)}</p>

              <div className="mt-4">
                <div className="h-2 rounded-full" style={{ background: 'var(--surface-strong)' }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${metric.progress}%`,
                      background: 'linear-gradient(90deg, var(--button-primary), var(--chart-primary))',
                    }}
                  />
                </div>
                <div className="mt-2 text-xs app-muted">{metric.progress.toFixed(1)}% completed</div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <section className="app-card p-6 text-center">
        <h3 className="text-xl lg:text-lg font-semibold app-heading" style={{ fontFamily: "'Playfair Display', serif" }}>
          Apply for Monetization
        </h3>
        <p className="mt-2 text-sm app-body max-w-2xl mx-auto">
          The apply button activates automatically once all requirements are satisfied.
        </p>
        <button
          type="button"
          className="mt-5 app-button-primary px-6 py-3 text-sm font-medium inline-flex items-center gap-2"
          disabled={!isEligible}
        >
          <Rocket className="w-4 h-4" />
          Apply for Monetization
        </button>
      </section>

      <section className="app-card p-6">
        <h3 className="text-xl lg:text-lg font-semibold app-heading text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Monetization Benefits
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
          {BENEFITS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="app-subcard p-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full app-icon-tile flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="mt-3 text-sm font-semibold app-heading">{item.title}</p>
                <p className="mt-1 text-xs app-body">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}