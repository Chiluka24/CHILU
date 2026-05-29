import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Eye,
  HandCoins,
  Megaphone,
  TrendingUp,
  Users,
} from 'lucide-react';
import { API_BASE } from '../../config/env';
import PageHeader from '../../components/layout/PageHeader';
import SubNav from '../../components/layout/SubNav';
import { CreditCard } from 'lucide-react';

type ActiveAd = {
  id: string;
  brand: string;
  campaignName: string;
  category: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  status: 'active';
};

type CampaignStatus = 'active' | 'completed';

type Campaign = {
  id: string;
  brand: string;
  category: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  revenue: number;
};

type TimePeriod = 'monthly' | 'yearly' | 'custom';

const CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    brand: 'OSEA',
    category: 'Beauty',
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-03-30',
    impressions: 84200,
    clicks: 2640,
    revenue: 1240,
  },
  {
    id: 'c2',
    brand: 'Blue Bottle',
    category: 'Food & Beverage',
    status: 'active',
    startDate: '2026-03-05',
    endDate: '2026-03-28',
    impressions: 47600,
    clicks: 1530,
    revenue: 860,
  },
  {
    id: 'c3',
    brand: 'Lululemon',
    category: 'Apparel',
    status: 'completed',
    startDate: '2026-02-01',
    endDate: '2026-02-25',
    impressions: 60800,
    clicks: 1940,
    revenue: 920,
  },
  {
    id: 'c4',
    brand: 'Notion',
    category: 'Productivity',
    status: 'completed',
    startDate: '2026-01-10',
    endDate: '2026-01-30',
    impressions: 41200,
    clicks: 1180,
    revenue: 640,
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

const formatCurrency = (value: number) => `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getCtr = (impressions: number, clicks: number) => {
  if (impressions === 0) {
    return '0.0';
  }
  return ((clicks / impressions) * 100).toFixed(1);
};

const getDaysRemaining = (endDate: string) => {
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const remaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  return `${remaining}d left`;
};

const inRange = (dateString: string, fromDate: string, toDate: string) => {
  const point = new Date(dateString).getTime();
  const from = new Date(fromDate).getTime();
  const to = new Date(toDate).getTime();
  return point >= from && point <= to;
};

export default function Campaigns() {
  const navigate = useNavigate();
  const [activeAds, setActiveAds] = useState<ActiveAd[]>([]);
  const [campaignPeriod, setCampaignPeriod] = useState<TimePeriod>('monthly');
  const [campaignFrom, setCampaignFrom] = useState('2026-03-01');
  const [campaignTo, setCampaignTo] = useState('2026-03-31');

  const filteredCampaigns = useMemo(() => {
    if (campaignPeriod === 'custom') {
      return CAMPAIGNS.filter((campaign) => inRange(campaign.startDate, campaignFrom, campaignTo));
    }

    const now = new Date();

    if (campaignPeriod === 'yearly') {
      return CAMPAIGNS.filter((campaign) => new Date(campaign.startDate).getFullYear() === now.getFullYear());
    }

    return CAMPAIGNS.filter((campaign) => {
      const start = new Date(campaign.startDate);
      return start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth();
    });
  }, [campaignFrom, campaignPeriod, campaignTo]);

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

  useEffect(() => {
    const fetchActiveAds = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No auth token found, skipping active ads fetch');
        return;
      }
      
      try {
        const res = await fetch(`${API_BASE}/api/ads/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch active ads:', res.status, errorData);
          
          if (res.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          
          setActiveAds([]);
          return;
        }
        
        const data = await res.json();
        const adsArray = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
        setActiveAds(adsArray);
      } catch (e) {
        console.error("Failed to fetch active ads", e);
        setActiveAds([]);
      }
    };

    fetchActiveAds();
  }, [navigate]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto app-page">
      <PageHeader
        title="Monetization"
        subtitle="Manage your active campaigns and view performance metrics."
        action={
          <SubNav
            items={[
              { path: '/monetization/campaigns', label: 'Campaigns', icon: TrendingUp },
              { path: '/monetization/payouts',   label: 'Payouts',   icon: CreditCard },
            ]}
          />
        }
      />

      <section className="app-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg lg:text-base font-semibold app-heading">Live Campaigns</h3>
          <span className="text-xs font-semibold px-2 py-1 app-chip-accent">{Array.isArray(activeAds) ? activeAds.length : 0} Active</span>
        </div>

        {!Array.isArray(activeAds) || activeAds.length === 0 ? (
          <div className="app-subcard p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, var(--button-primary), var(--chart-primary))', opacity: 0.1 }} />
                <div className="absolute inset-4 rounded-full app-icon-tile flex items-center justify-center">
                  <Megaphone className="w-12 h-12" style={{ color: 'var(--button-primary)' }} />
                </div>
              </div>
              
              <h4 className="text-xl lg:text-base font-semibold app-heading mb-2">
                No Active Campaigns Yet
              </h4>
              <p className="text-sm app-body mb-6">
                Your profile is ready for brand partnerships. Active campaigns will appear here once brands start running ads on your page.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="app-panel p-3">
                  <TrendingUp className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--chart-primary)' }} />
                  <p className="font-semibold app-heading text-xs">Track Performance</p>
                  <p className="app-muted mt-1 text-[11px]">Real-time metrics</p>
                </div>
                <div className="app-panel p-3">
                  <Eye className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--chart-primary)' }} />
                  <p className="font-semibold app-heading text-xs">Monitor Reach</p>
                  <p className="app-muted mt-1 text-[11px]">Impressions & clicks</p>
                </div>
                <div className="app-panel p-3">
                  <HandCoins className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--chart-primary)' }} />
                  <p className="font-semibold app-heading text-xs">Earn Revenue</p>
                  <p className="app-muted mt-1 text-[11px]">Automatic payouts</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(activeAds) ? activeAds : []).map((ad) => (
              <article key={ad.id} className="app-subcard p-4" style={{ borderTop: '4px solid var(--chart-primary)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg lg:text-base font-semibold app-heading" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {ad.brand}
                    </p>
                    <p className="text-xs app-muted">{ad.campaignName} • {ad.category}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-1 app-chip-accent">Active</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="app-panel p-2">
                    <div className="app-muted">Started</div>
                    <div className="font-semibold app-heading">{formatDate(ad.startDate)}</div>
                  </div>
                  <div className="app-panel p-2">
                    <div className="app-muted">Remaining</div>
                    <div className="font-semibold app-heading">{getDaysRemaining(ad.endDate)}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="text-sm font-semibold app-heading">{formatNumber(ad.impressions)}</p>
                    <p className="text-[11px] app-muted">Impressions</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold app-heading">{formatNumber(ad.clicks)}</p>
                    <p className="text-[11px] app-muted">Clicks ({getCtr(ad.impressions, ad.clicks)}%)</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-wide app-muted mb-2">Ad Preview</p>
                  <div className="relative rounded-lg overflow-hidden border border-[var(--border-default)]">
                    <div className="absolute top-1 right-1 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded">Sponsored</div>
                    <img src={ad.bannerImage} alt={ad.campaignName} className="w-full h-auto" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="app-card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg lg:text-base font-semibold app-heading">Campaign History</h3>
            <p className="text-xs app-muted mt-0.5">Filter and review all brand campaigns</p>
          </div>
          <div className="app-tabs-shell p-1 inline-flex w-fit">
            {(['monthly', 'yearly', 'custom'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setCampaignPeriod(period)}
                className={`px-3 py-1.5 text-xs font-semibold app-tab ${campaignPeriod === period ? 'app-tab-active' : ''}`}
              >
                {period[0].toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {campaignPeriod === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            <input
              type="date"
              value={campaignFrom}
              onChange={(event) => setCampaignFrom(event.target.value)}
              className="app-input px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={campaignTo}
              onChange={(event) => setCampaignTo(event.target.value)}
              className="app-input px-3 py-2 text-sm"
            />
            <button type="button" className="app-button-secondary px-3 py-2 text-sm font-medium">Apply Range</button>
          </div>
        )}

        {filteredCampaigns.length === 0 ? (
          <div className="app-subcard p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, var(--button-primary), var(--chart-primary))', opacity: 0.1 }} />
                <div className="absolute inset-3 rounded-full app-icon-tile flex items-center justify-center">
                  <TrendingUp className="w-10 h-10" style={{ color: 'var(--button-primary)' }} />
                </div>
              </div>
              
              <h4 className="text-lg lg:text-base font-semibold app-heading mb-2">No Campaign History</h4>
              <p className="text-sm app-body mb-5">
                {campaignPeriod === 'custom' 
                  ? 'No campaigns found in the selected date range. Try adjusting your filters.'
                  : `No campaigns ran during this ${campaignPeriod === 'yearly' ? 'year' : 'month'}. Past campaigns will appear here once completed.`}
              </p>
              
              <div className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg" style={{ background: 'var(--surface-strong)', color: 'var(--text-muted)' }}>
                <Users className="w-4 h-4" />
                <span>Keep growing your audience to attract more brands</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    <th className="text-left py-3 pr-3 app-muted font-semibold">Brand</th>
                    <th className="text-left py-3 pr-3 app-muted font-semibold">Status</th>
                    <th className="text-left py-3 pr-3 app-muted font-semibold">Duration</th>
                    <th className="text-left py-3 pr-3 app-muted font-semibold">Impressions</th>
                    <th className="text-left py-3 pr-3 app-muted font-semibold">Clicks</th>
                    <th className="text-left py-3 app-muted font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-[var(--border-default)] last:border-b-0">
                      <td className="py-3 pr-3">
                        <p className="font-semibold app-heading">{campaign.brand}</p>
                        <p className="text-xs app-muted">{campaign.category}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`text-[11px] font-semibold px-2 py-1 ${campaign.status === 'active' ? 'app-chip-accent' : 'app-chip'}`}>
                          {campaign.status === 'active' ? 'Active' : 'Completed'}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs app-body">{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</td>
                      <td className="py-3 pr-3 font-semibold app-heading">{formatNumber(campaign.impressions)}</td>
                      <td className="py-3 pr-3 font-semibold app-heading">{formatNumber(campaign.clicks)} ({getCtr(campaign.impressions, campaign.clicks)}%)</td>
                      <td className="py-3 font-semibold app-heading">{formatCurrency(campaign.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {filteredCampaigns.map((campaign) => (
                <article key={campaign.id} className="app-subcard p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold app-heading">{campaign.brand}</p>
                      <p className="text-xs app-muted">{campaign.category}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-1 ${campaign.status === 'active' ? 'app-chip-accent' : 'app-chip'}`}>
                      {campaign.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs app-body">{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="font-semibold app-heading">{formatNumber(campaign.impressions)}</p>
                      <p className="app-muted">Impressions</p>
                    </div>
                    <div>
                      <p className="font-semibold app-heading">{formatNumber(campaign.clicks)}</p>
                      <p className="app-muted">Clicks</p>
                    </div>
                    <div>
                      <p className="font-semibold app-heading">{formatCurrency(campaign.revenue)}</p>
                      <p className="app-muted">Revenue</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}