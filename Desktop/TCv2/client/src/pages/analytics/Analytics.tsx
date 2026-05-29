import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  Eye,
  Globe2,
  Lightbulb,
  MapPinned,
  MousePointer,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { API_BASE } from '../../config/env';

type PeriodKey = 'today' | '7d' | '14d' | '1m' | '3m' | '6m' | '1y' | 'custom';
type InsightsTab = 'links' | 'geo' | 'suggestions';

type LinkDefinition = {
  id: string;
  title: string;
  url: string;
  seed: number[];
  momentum: number;
};

type LinkPerformance = {
  id: string;
  title: string;
  url: string;
  clicksSeries: number[];
  impressionsSeries: number[];
  periodClicks: number;
  uniqueClicks: number;
  repeatClicks: number;
  growth: number;
};

type TopLinkBarDatum = {
  id: string;
  rank: number;
  title: string;
  host: string;
  url: string;
  clicks: number;
  uniqueClicks: number;
  repeatClicks: number;
  impressions: number;
  ctr: number;
  share: number;
  growth: number;
  colorStart: string;
  colorEnd: string;
};

type CountryPoint = {
  country: string;
  countryCode: string;
  clicks: number;
  uniqueVisitors: number;
  activityPercentage: number;
};

type SuggestionPoint = {
  title: string;
  description: string;
  metric: string;
};

const PERIOD_OPTIONS: Array<{ key: PeriodKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '14d', label: '14 Days' },
  { key: '1m', label: '1 Month' },
  { key: '3m', label: '3 Months' },
  { key: '6m', label: '6 Months' },
  { key: '1y', label: '1 Year' },
  { key: 'custom', label: 'Custom Range' },
];

// Helper function to generate dynamic labels based on actual date range
const generatePeriodLabels = (period: PeriodKey, fromDate?: string, toDate?: string): string[] => {
  const today = new Date();
  
  if (period === 'today') {
    return ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
  }
  
  if (period === '7d') {
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return labels;
  }
  
  if (period === '14d') {
    const labels = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return labels;
  }
  
  if (period === '1m') {
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
  }
  
  if (period === '3m') {
    const labels = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
    }
    return labels;
  }
  
  if (period === '6m') {
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
    }
    return labels;
  }
  
  if (period === '1y') {
    const labels = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
    }
    return labels;
  }
  
  if (period === 'custom' && fromDate && toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const labels = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return labels;
  }
  
  return [];
};

const PERIOD_LABELS: Record<string, string[]> = {
  today: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
  '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  '14d': ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14'],
  '1m': ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
  '3m': ['Month 1', 'Month 2', 'Month 3'],
  '6m': ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
  '1y': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const PERIOD_MULTIPLIER: Record<string, number> = {
  today: 1,
  '7d': 1,
  '14d': 1,
  '1m': 1,
  '3m': 1,
  '6m': 1,
  '1y': 1,
  custom: 1,
};

const PERIOD_AGGREGATION: Record<string, 'avg' | 'sum'> = {
  today: 'avg',
  '7d': 'avg',
  '14d': 'avg',
  '1m': 'sum',
  '3m': 'sum',
  '6m': 'sum',
  '1y': 'sum',
  custom: 'sum',
};

const TOP_LINK_BAR_PALETTE = [
  { start: '#7B4B2A', end: '#9C5C2E' },
  { start: '#9C5C2E', end: '#C9793A' },
  { start: '#C9793A', end: '#D4A574' },
  { start: '#8D6E63', end: '#A1887F' },
  { start: '#6D4C41', end: '#8D6E63' },
];

// ISO 3166-1 numeric codes for each country in COUNTRY_SHARES
const COUNTRY_ISO: Record<string, number> = {
  'India': 356,
  'United States': 840,
  'United Kingdom': 826,
  'Germany': 276,
  'Canada': 124,
  'Australia': 36,
  'Brazil': 76,
  'Singapore': 702,
};

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const sumValues = (values: number[]) => values.reduce((total, value) => total + value, 0);

const formatCompact = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return `${value}`;
};

const formatGrowth = (value: number) => `${value >= 0 ? '+' : ''}${value}%`;
const formatPercentage = (value: number) => `${value >= 10 ? value.toFixed(0) : value.toFixed(1)}%`;

const getLinkHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  }
};

const resampleSeries = (
  seed: number[],
  targetLength: number,
  multiplier: number,
  aggregation: 'avg' | 'sum',
) => {
  if (!seed.length || targetLength <= 0) {
    return [];
  }

  const scaledSeed = seed.map((value) => Math.round(value * multiplier));

  if (targetLength === scaledSeed.length) {
    return scaledSeed;
  }

  const result: number[] = [];

  for (let index = 0; index < targetLength; index += 1) {
    const start = Math.floor((index * scaledSeed.length) / targetLength);
    const end = Math.max(start + 1, Math.floor(((index + 1) * scaledSeed.length) / targetLength));
    const segment = scaledSeed.slice(start, end);

    if (!segment.length) {
      result.push(0);
      continue;
    }

    const value = aggregation === 'sum'
      ? sumValues(segment)
      : Math.round(sumValues(segment) / segment.length);

    result.push(value);
  }

  return result;
};

const buildLinkPerformance = (period: PeriodKey, definitions: LinkDefinition[], labels: string[] = []): LinkPerformance[] => {
  const multiplier = PERIOD_MULTIPLIER[period];
  const aggregation = PERIOD_AGGREGATION[period];

  console.log('📊 [BUILD_PERFORMANCE]', {
    period,
    definitionsCount: definitions.length,
    labelsCount: labels.length,
    firstLinkSeedLength: definitions[0]?.seed?.length || 0,
    multiplier,
    aggregation
  });

  return definitions.map((link) => {
    // Use the seed data directly as it comes from the backend already filtered by date range
    // The backend returns exactly the data for the requested period
    const periodData = link.seed;
    
    const clicksSeries = resampleSeries(periodData, labels.length, multiplier, aggregation);
    const periodClicks = sumValues(clicksSeries);
    const uniqueClicks = Math.min(periodClicks, Math.round(periodClicks * (0.62 + link.momentum * 0.06)));
    const repeatClicks = Math.max(0, periodClicks - uniqueClicks);
    const previousClicks = Math.max(1, Math.round(periodClicks / (1 + link.momentum)));
    const growth = Math.round(((periodClicks - previousClicks) / previousClicks) * 100);
    const impressionsSeries = clicksSeries.map(() => 0); // Remove fake impressions

    return {
      id: link.id,
      title: link.title,
      url: link.url,
      clicksSeries,
      impressionsSeries,
      periodClicks,
      uniqueClicks,
      repeatClicks,
      growth,
    };
  });
};

const buildSuggestions = (
  topLinks: LinkPerformance[],
  totalClicks: number,
  uniqueVisitors: number,
  totalImpressions: number,
): SuggestionPoint[] => {
  return [
    {
      title: 'Best Time to Post',
      description: 'Post around 14:00 for maximum engagement',
      metric: '+43%',
    },
    {
      title: 'Optimal Day',
      description: 'Tuesday generates the highest click-through rates',
      metric: '+28%',
    },
    {
      title: 'Device Optimization',
      description: '90.74% of clicks come from desktop devices',
      metric: 'desktop',
    },
    {
      title: 'Top Traffic Source',
      description: 'Instagram drives the most visitors to your profile',
      metric: '65% share',
    },
    {
      title: 'Link Placement',
      description: 'Moving your newest link to the top slot increases visibility',
      metric: '+15%',
    },
  ];
};

const TopLinksTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TopLinkBarDatum }>;
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const link = payload[0].payload;

  return (
    <div
      className="w-[190px] sm:w-[240px] rounded-[16px] sm:rounded-[20px] p-3 sm:p-4"
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        border: '1px solid #ECE6E2',
        boxShadow: '0 24px 50px -24px rgba(43, 26, 18, 0.35)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <div className="truncate text-[12px] sm:text-[13px] font-semibold" style={{ color: '#2B1A12' }}>{link.title}</div>
          <div className="mt-0.5 sm:mt-1 truncate text-[10px] sm:text-[11px] font-medium" style={{ color: '#6F6F6F' }}>{link.host}</div>
        </div>
        <div
          className="self-start shrink-0 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold"
          style={{
            color: link.growth >= 0 ? '#2FBF71' : '#B91C1C',
            background: link.growth >= 0 ? '#E9F8EF' : 'rgba(239, 68, 68, 0.12)',
          }}
        >
          {formatGrowth(link.growth)}
        </div>
      </div>

      <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-1.5 sm:gap-2">
        {[
          { label: 'Clicks', value: formatCompact(link.clicks) },
          { label: 'Unique', value: formatCompact(link.uniqueClicks) },
          { label: 'Repeat', value: formatCompact(link.repeatClicks) },
          { label: 'CTR', value: formatPercentage(link.ctr) },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl sm:rounded-2xl px-2 py-1.5 sm:px-3 sm:py-2"
            style={{ background: '#FAF7F5' }}
          >
            <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#A0A0A0' }}>
              {item.label}
            </div>
            <div className="mt-0.5 sm:mt-1 text-[12px] sm:text-[13px] font-semibold" style={{ color: '#2B1A12' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-2 sm:mt-3 flex items-center justify-between rounded-xl sm:rounded-2xl px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-medium" style={{ background: '#FAF7F5', color: '#6F6F6F' }}>
        <span>Share of total</span>
        <span className="font-semibold" style={{ color: '#2B1A12' }}>{formatPercentage(link.share)}</span>
      </div>
    </div>
  );
};

export default function Analytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodKey>('14d');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isDetailPeriodOpen, setIsDetailPeriodOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<InsightsTab>('links');
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [highlightedTopLinkId, setHighlightedTopLinkId] = useState<string | null>(null);
  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const detailPeriodDropdownRef = useRef<HTMLDivElement>(null);
  
  // Date state for custom range
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [linkDefinitions, setLinkDefinitions] = useState<LinkDefinition[]>([]);
  const [realCountries, setRealCountries] = useState<CountryPoint[]>([]);
  const [realStats, setRealStats] = useState<{
    totalClicks: number;
    totalViews: number;
    uniqueVisitors: number;
    ctr: string;
  }>({
    totalClicks: 0,
    totalViews: 0,
    uniqueVisitors: 0,
    ctr: '0.0'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Calculate date range based on period
    let fromDate = '';
    let toDate = '';
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (period === 'custom') {
      if (dateFrom && dateTo) {
        fromDate = dateFrom;
        toDate = dateTo;
      } else {
        // Don't fetch if custom dates not set
        return;
      }
    } else if (period === 'today') {
      fromDate = todayStr;
      toDate = todayStr;
    } else if (period === '7d') {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      fromDate = start.toISOString().split('T')[0];
      toDate = todayStr;
    } else if (period === '14d') {
      const start = new Date(today);
      start.setDate(start.getDate() - 13);
      fromDate = start.toISOString().split('T')[0];
      toDate = todayStr;
    } else if (period === '1m') {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      fromDate = start.toISOString().split('T')[0];
      toDate = todayStr;
    } else if (period === '3m') {
      const start = new Date(today);
      start.setDate(start.getDate() - 89);
      fromDate = start.toISOString().split('T')[0];
      toDate = todayStr;
    } else if (period === '6m') {
      const start = new Date(today);
      start.setDate(start.getDate() - 179);
      fromDate = start.toISOString().split('T')[0];
      toDate = todayStr;
    } else if (period === '1y') {
      const start = new Date(today);
      start.setDate(start.getDate() - 364);
      fromDate = start.toISOString().split('T')[0];
      toDate = todayStr;
    }

    let url = `${API_BASE}/api/analytics`;
    if (fromDate && toDate) {
      url += `?from=${fromDate}&to=${toDate}`;
    }

    console.log('📊 [ANALYTICS] Fetching data:', { period, fromDate, toDate, url });

    // Fetch analytics data
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(response => {
        const data = response.data || response;
        console.log('📊 [ANALYTICS] Received data:', { 
          period,
          dateRange: `${fromDate} to ${toDate}`,
          linksCount: data.links?.length || 0, 
          countriesCount: data.countries?.length || 0,
          firstLinkSeedLength: data.links?.[0]?.seed?.length || 0,
          firstLinkSeed: data.links?.[0]?.seed,
          stats: data.stats
        });
        setLinkDefinitions(data.links || []);
        setRealCountries(data.countries || []);
        setRealStats(data.stats || {
          totalClicks: 0,
          totalViews: 0,
          uniqueVisitors: 0,
          ctr: '0.0'
        });
      })
      .catch(err => console.error('❌ [ANALYTICS] Fetch error:', err));
  }, [navigate, period, dateFrom, dateTo]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target as Node)) {
        setIsPeriodOpen(false);
      }
      if (detailPeriodDropdownRef.current && !detailPeriodDropdownRef.current.contains(event.target as Node)) {
        setIsDetailPeriodOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setSelectedLinkId(null);
    setIsDetailPeriodOpen(false);
  }, [activeTab]);

  useEffect(() => {
    if (!selectedLinkId) {
      setIsDetailPeriodOpen(false);
    }
  }, [selectedLinkId]);

  // Generate dynamic labels based on period and date range
  const periodLabels = useMemo(() => {
    return generatePeriodLabels(period, dateFrom, dateTo);
  }, [period, dateFrom, dateTo]);
  const periodLabel = PERIOD_OPTIONS.find((item) => item.key === period)?.label ?? '14 Days';

  const linkPerformance = useMemo(
    () => buildLinkPerformance(period, linkDefinitions, periodLabels), 
    [period, linkDefinitions, periodLabels]
  );

  const timelineData = useMemo(
    () =>
      periodLabels.map((label, index) => ({
        label,
        clicks: linkPerformance.reduce((total, link) => total + (link.clicksSeries[index] ?? 0), 0),
        impressions: 0, // Remove fake impressions - we don't track real impressions yet
      })),
    [linkPerformance, periodLabels],
  );

  const topLinks = useMemo(
    () => [...linkPerformance].sort((a, b) => b.periodClicks - a.periodClicks),
    [linkPerformance],
  );

  const selectedLink = useMemo(
    () => linkPerformance.find((link) => link.id === selectedLinkId) ?? null,
    [linkPerformance, selectedLinkId],
  );

  const detailTimelineData = useMemo(() => {
    if (!selectedLink) {
      return [];
    }

    return periodLabels.map((label, index) => ({
      label,
      clicks: selectedLink.clicksSeries[index] ?? 0,
      impressions: selectedLink.impressionsSeries[index] ?? 0,
    }));
  }, [periodLabels, selectedLink]);

  const totalClicks = useMemo(
    () => timelineData.reduce((total, point) => total + point.clicks, 0),
    [timelineData],
  );

  const totalImpressions = useMemo(
    () => timelineData.reduce((total, point) => total + point.impressions, 0),
    [timelineData],
  );

  const rankedLinks = useMemo(
    () =>
      topLinks.map((link, index) => {
        const impressions = sumValues(link.impressionsSeries);
        const palette = TOP_LINK_BAR_PALETTE[index % TOP_LINK_BAR_PALETTE.length];

        return {
          ...link,
          rank: index + 1,
          host: getLinkHost(link.url),
          clicks: link.periodClicks,
          impressions,
          ctr: impressions > 0 ? (link.periodClicks / impressions) * 100 : 0,
          share: totalClicks > 0 ? (link.periodClicks / totalClicks) * 100 : 0,
          colorStart: palette.start,
          colorEnd: palette.end,
        };
      }),
    [topLinks, totalClicks],
  );

  const topLinkBars = useMemo(
    () => rankedLinks.slice(0, 5),
    [rankedLinks],
  );

  const resolvedHighlightedTopLinkId = useMemo(
    () => (topLinkBars.some((link) => link.id === highlightedTopLinkId) ? highlightedTopLinkId : null),
    [highlightedTopLinkId, topLinkBars],
  );

  const selectedRankedLink = useMemo(
    () => rankedLinks.find((link) => link.id === selectedLinkId) ?? null,
    [rankedLinks, selectedLinkId],
  );

  const uniqueVisitors = Math.round(totalClicks * 0.58);
  const averageGrowth = Math.round(topLinks.reduce((sum, link) => sum + link.growth, 0) / Math.max(topLinks.length, 1));
  const averageClicksPerPoint = Math.round(totalClicks / Math.max(timelineData.length, 1));
  const clickThroughRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const peakTimelinePoint = timelineData.reduce(
    (peak, point) => (point.clicks > peak.clicks ? point : peak),
    timelineData[0] ?? { label: '-', clicks: 0, impressions: 0 },
  );
  const leadingLink = topLinkBars[0] ?? null;

  const stats = useMemo(
    () => [
      {
        label: 'Total Clicks',
        value: realStats.totalClicks,
        growth: 0, // Real growth calculation would need previous period data
        icon: MousePointer,
        accent: '#1A0F08',
      },
      {
        label: 'Unique Visitors',
        value: realStats.uniqueVisitors,
        growth: 0,
        icon: Users,
        accent: '#D4A574',
      },
      {
        label: 'Total Views',
        value: realStats.totalViews,
        growth: 0,
        icon: Eye,
        accent: '#C19A5B',
      },
    ],
    [realStats],
  );

  const suggestions = useMemo(
    () => buildSuggestions(topLinks, totalClicks, uniqueVisitors, totalImpressions),
    [topLinks, totalClicks, totalImpressions, uniqueVisitors],
  );

  const countryLeaderboard = useMemo(
    () => [...realCountries].sort((a, b) => b.clicks - a.clicks),
    [realCountries],
  );

  const dominantCountry = countryLeaderboard[0] ?? null;
  const dominantCountryShare = dominantCountry && realStats.totalClicks > 0
    ? (dominantCountry.clicks / realStats.totalClicks) * 100
    : 0;
  const averageCountryActivity = countryLeaderboard.length
    ? Math.round(countryLeaderboard.reduce((sum, country) => sum + country.activityPercentage, 0) / countryLeaderboard.length)
    : 0;

  const suggestionPlaybook = useMemo(
    () =>
      suggestions.map((suggestion, index) => {
        const styles = [
          {
            label: 'Priority',
            level: 'High impact',
            accent: '#1A0F08',
            soft: 'rgba(26, 15, 8, 0.08)',
          },
          {
            label: 'Retention',
            level: 'Audience loyalty',
            accent: '#D4A574',
            soft: 'rgba(212, 165, 116, 0.08)',
          },
          {
            label: 'Conversion',
            level: 'Test next',
            accent: '#C19A5B',
            soft: 'rgba(193, 154, 91, 0.08)',
          },
          {
            label: 'Cleanup',
            level: 'Needs attention',
            accent: '#8D6E63',
            soft: 'rgba(141, 110, 99, 0.08)',
          },
        ];

        const style = styles[index % styles.length];

        return {
          ...suggestion,
          sectionLabel: style.label,
          priority: style.level,
          accent: style.accent,
          soft: style.soft,
        };
      }),
    [suggestions],
  );

  return (
    <div className="app-page mx-auto w-full max-w-[1340px] px-1 sm:px-3 md:px-4 pb-12">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-bold tracking-tight app-page-main-title">Insights</h1>
          <p className="mt-1.5 text-sm font-medium app-page-subtitle">
            Track your link performance and audience trends with a cleaner ranking and trend view.
          </p>
        </div>

        <div className="relative w-full md:w-auto md:min-w-[200px]">
          <div ref={periodDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsPeriodOpen((prev) => !prev)}
              className="w-full px-3 py-2.5 text-sm font-semibold transition-all appearance-none cursor-pointer outline-none flex items-center justify-between touch-target rounded-xl text-left"
              style={{
                background: 'var(--card-bg)',
                border: '1.5px solid var(--border-default)',
                color: 'var(--heading-color)',
                boxShadow: isPeriodOpen ? '0 0 0 3px rgba(99, 102, 241, 0.08)' : 'none',
              }}
            >
              <div className="truncate flex-1 text-left flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="w-4 h-4"
                    style={{ color: 'var(--icon-color)' }}
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <span className="truncate">{periodLabel}</span>
              </div>
              <ChevronDown
                size={18}
                className={`ml-3 shrink-0 transition-transform duration-300 ${isPeriodOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--icon-color)' }}
              />
            </button>

            {isPeriodOpen && (
              <div
                className="absolute left-0 top-full mt-2 z-[9999] w-full rounded-xl"
                style={{
                  background: 'var(--card-bg)',
                  border: '1.5px solid var(--border-default)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                  maxHeight: '270px',
                  overflowY: 'auto',
                }}
              >
                <div className="p-1">
                  {PERIOD_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setPeriod(option.key);
                        if (option.key !== 'custom') setIsPeriodOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all touch-target"
                      style={{
                        color: option.key === period ? 'var(--button-primary)' : 'var(--body-text)',
                        fontWeight: option.key === period ? 600 : 500,
                        background: option.key === period ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                        marginTop: option.key !== 'today' ? '1px' : '0',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {period === 'custom' && (
                  <div className="space-y-2 border-t p-3" style={{ borderColor: 'var(--border-default)', background: 'var(--surface-subtle)' }}>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--app-muted)' }}>Start</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full rounded-lg px-2 py-1.5 text-xs"
                        style={{ 
                          border: '1.5px solid var(--border-default)',
                          background: 'var(--card-bg)',
                          color: 'var(--body-text)'
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--app-muted)' }}>End</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full rounded-lg px-2 py-1.5 text-xs"
                        style={{ 
                          border: '1.5px solid var(--border-default)',
                          background: 'var(--card-bg)',
                          color: 'var(--body-text)'
                        }}
                      />
                    </div>
                    <button
                      onClick={() => setIsPeriodOpen(false)}
                      className="mt-1 w-full rounded-lg py-2 text-xs font-semibold text-white"
                      style={{ background: 'var(--button-primary)' }}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 sm:gap-4">
        {stats.map(({ label, value, growth, icon: Icon }) => (
          <article
            key={label}
            className="app-card p-3 sm:p-5 app-card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg" style={{ background: 'var(--surface-subtle)' }}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--icon-color)' }} />
              </div>
              <div
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
                style={{
                  color: growth >= 0 ? 'var(--success-600)' : 'var(--error-600)',
                  background: growth >= 0 ? 'var(--success-50)' : 'var(--error-50)',
                }}
              >
                <TrendingUp size={12} className={growth < 0 ? 'rotate-180' : ''} />
                <span>{formatGrowth(growth)}</span>
              </div>
            </div>
            <div className="text-[24px] font-bold leading-none app-heading">{formatCompact(value)}</div>
            <div className="mt-1 text-[12px] app-muted font-semibold uppercase tracking-wider">{label}</div>
            <div className="mt-1 text-[11px] app-muted">{Math.abs(growth)}% from last period</div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <section
          className="app-card overflow-hidden p-4 md:p-6"
          style={{
            boxShadow: '0 22px 48px -40px rgba(43, 26, 18, 0.3)',
            borderRadius: '28px',
            border: '1px solid #ECE6E2',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
          }}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Traffic pulse</div>
              <h3 className="mt-2 text-[18px] font-bold tracking-tight app-heading">Clicks Over Time</h3>
              <p className="mt-1 text-[12px] font-medium text-slate-500">
                Clicks and impressions across the selected {periodLabel.toLowerCase()} window.
              </p>
            </div>
            <div
              className="inline-flex w-fit items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                color: averageGrowth >= 0 ? '#2FBF71' : '#B91C1C',
                background: averageGrowth >= 0 ? '#E9F8EF' : 'rgba(239, 68, 68, 0.1)',
              }}
            >
              {formatGrowth(averageGrowth)} avg growth
            </div>
          </div>

          <div
            className="rounded-[24px] p-3 md:p-4"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.98) 100%)',
              border: '1px solid #F0EBE8',
            }}
          >
            <div className="h-[240px] md:h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 4, right: 10, left: -10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6F6F6F', fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6F6F6F', fontWeight: 500 }}
                    tickFormatter={(value) => formatCompact(Number(value))}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid var(--border-default)',
                      borderRadius: 10,
                      boxShadow: 'var(--shadow-md)',
                    }}
                  />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, color: '#6F6F6F' }} />
                  <Line
                    type="monotone"
                    dataKey="impressions"
                    name="Impressions"
                    stroke="#3D2817"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#FFFFFF', stroke: '#3D2817', strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    name="Clicks"
                    stroke="#D4A574"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#FFFFFF', stroke: '#D4A574', strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: 'Average per point', value: formatCompact(averageClicksPerPoint), meta: 'Clicks' },
              { label: 'Peak point', value: peakTimelinePoint.label, meta: `${formatCompact(peakTimelinePoint.clicks)} clicks` },
              { label: 'Click-through rate', value: formatPercentage(clickThroughRate), meta: 'Clicks / impressions' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[18px] px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  border: '1px solid #ECE6E2',
                  boxShadow: '0 16px 30px -32px rgba(43, 26, 18, 0.55)',
                }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                <div className="mt-2 text-[16px] font-semibold text-slate-900">{item.value}</div>
                <div className="mt-1 text-[11px] font-medium text-slate-500">{item.meta}</div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="relative app-card overflow-hidden p-6 md:p-7"
          style={{
            boxShadow: '0 30px 60px -38px rgba(43, 26, 18, 0.42)',
            borderRadius: '28px',
            border: '1px solid rgba(201, 121, 58, 0.12)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%)',
          }}
        >
          <div className="relative">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Link leaderboard</div>
                <h3 className="mt-2 text-[18px] font-bold tracking-tight text-slate-900">Top Performing Links</h3>
                <p className="mt-1 text-[12px] font-medium text-slate-500">
                  Ranked by total clicks for the selected {periodLabel.toLowerCase()} window.
                </p>
              </div>
              <div className="flex items-start gap-3">
                {leadingLink && (
                  <div
                    className="hidden rounded-[18px] px-3 py-2.5 md:block"
                    style={{
                      background: 'rgba(255,255,255,0.72)',
                      border: '1px solid #ECE6E2',
                    }}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Leader</div>
                    <div className="mt-1 max-w-[120px] truncate text-[13px] font-semibold text-slate-900">{leadingLink.title}</div>
                    <div className="mt-1 text-[11px] font-medium text-slate-500">{formatPercentage(leadingLink.share)} of clicks</div>
                  </div>
                )}
                <div
                  className="inline-flex w-fit items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    color: '#9C5C2E',
                    background: 'rgba(156, 92, 46, 0.08)',
                    border: '1px solid rgba(156, 92, 46, 0.12)',
                  }}
                >
                  Live ranking
                </div>
              </div>
            </div>

            <div
              className="rounded-[24px] p-3 md:p-4"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.96) 100%)',
                border: '1px solid #F0EBE8',
              }}
            >
              <div className="h-[300px] md:h-[330px] w-full">
                {topLinkBars.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topLinkBars}
                      layout="vertical"
                      margin={{ top: 4, right: 32, left: 20, bottom: 4 }}
                      barCategoryGap={16}
                      onMouseMove={(state: any) => setHighlightedTopLinkId(state?.activePayload?.[0]?.payload?.id ?? null)}
                      onMouseLeave={() => setHighlightedTopLinkId(null)}
                    >
                      <defs>
                        {topLinkBars.map((link) => (
                          <linearGradient
                            key={link.id}
                            id={`top-link-bar-${link.id}`}
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop offset="0%" stopColor={link.colorStart} />
                            <stop offset="100%" stopColor={link.colorEnd} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 10"
                        stroke="#F0EBE8"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                        tick={{ fill: '#3D2817', fontSize: 12, fontWeight: 600 }}
                        tickFormatter={(value) => formatCompact(Number(value))}
                      />
                      <YAxis
                        type="category"
                        dataKey="title"
                        axisLine={false}
                        tickLine={false}
                        width={90}
                        interval={0}
                        tick={{ fill: '#2C1810', fontSize: 12, fontWeight: 600 }}
                        tickFormatter={(value: string) => (value.length > 12 ? `${value.slice(0, 12)}...` : value)}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(201, 121, 58, 0.06)' }}
                        content={<TopLinksTooltip />}
                      />
                      <Bar
                        dataKey="clicks"
                        radius={[0, 18, 18, 0]}
                        barSize={28}
                        isAnimationActive
                        animationDuration={1600}
                        animationEasing="ease-out"
                      >
                        {topLinkBars.map((link) => (
                          <Cell
                            key={link.id}
                            fill={`url(#top-link-bar-${link.id})`}
                            fillOpacity={resolvedHighlightedTopLinkId && resolvedHighlightedTopLinkId !== link.id ? 0.32 : 1}
                            stroke={resolvedHighlightedTopLinkId === link.id ? 'rgba(255,255,255,0.98)' : 'transparent'}
                            strokeWidth={resolvedHighlightedTopLinkId === link.id ? 2 : 0}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-medium text-gray-400">
                    No link data available.
                  </div>
                )}
              </div>
            </div>

            {topLinkBars.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {topLinkBars.map((link, index) => {
                  const isFocused = resolvedHighlightedTopLinkId === link.id;
                  const isDimmed = Boolean(resolvedHighlightedTopLinkId) && !isFocused;

                  return (
                    <div
                      key={link.id}
                      onMouseEnter={() => setHighlightedTopLinkId(link.id)}
                      onMouseLeave={() => setHighlightedTopLinkId(null)}
                      className="rounded-[20px] px-4 py-3 transition-all duration-200"
                      style={{
                        background: isFocused ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.78)',
                        border: isFocused ? `1px solid ${link.colorStart}33` : '1px solid #ECE6E2',
                        boxShadow: isFocused
                          ? '0 18px 36px -30px rgba(43, 26, 18, 0.62)'
                          : '0 12px 28px -32px rgba(43, 26, 18, 0.72)',
                        transform: isFocused ? 'translateY(-1px)' : 'translateY(0px)',
                        opacity: isDimmed ? 0.55 : 1,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                          style={{
                            color: '#0F172A',
                            background: `linear-gradient(135deg, ${link.colorStart}22, ${link.colorEnd}30)`,
                          }}
                        >
                          #{index + 1}
                        </div>
                        <span
                          className="mt-2 h-3 w-3 shrink-0 rounded-full"
                          style={{ background: `linear-gradient(135deg, ${link.colorStart}, ${link.colorEnd})` }}
                        ></span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-slate-900">{link.title}</div>
                          <div className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{link.host}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[13px] font-bold text-slate-900">{formatCompact(link.clicks)}</div>
                          <div className="mt-0.5 text-[11px] font-medium text-slate-500">{formatPercentage(link.share)} share</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      <div
        className="mt-8 rounded-[24px] p-2"
        style={{
          background: 'rgba(255,255,255,0.74)',
          border: '1px solid #F0EBE8',
          boxShadow: '0 18px 40px -34px rgba(43, 26, 18, 0.34)',
        }}
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {[
            { key: 'links', label: 'Link Performance', meta: `${rankedLinks.length} ranked destinations` },
            { key: 'geo', label: 'Geographic Data', meta: `${countryLeaderboard.length} markets tracked` },
            { key: 'suggestions', label: 'Suggestions', meta: `${suggestionPlaybook.length} optimization plays` },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as InsightsTab)}
                className="rounded-[18px] px-4 py-3 text-left transition-all"
                style={{
                  color: isActive ? '#1A0F08' : '#3D2817',
                  background: isActive 
                    ? 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.98) 100%)' 
                    : 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.90) 100%)',
                  boxShadow: isActive 
                    ? '0 16px 30px -34px rgba(43, 26, 18, 0.5), 0 4px 12px -2px rgba(201, 121, 58, 0.15)' 
                    : '0 2px 8px -2px rgba(43, 26, 18, 0.08)',
                  border: isActive 
                    ? '1px solid rgba(201, 121, 58, 0.14)' 
                    : '1px solid #ECE6E2',
                }}
              >
                <div className="text-[14px] font-semibold">{tab.label}</div>
                <div className="mt-1 text-[11px] font-medium" style={{ color: isActive ? '#D4A574' : '#6F6F6F' }}>
                  {tab.meta}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'links' && (
        <section
          className="app-card mt-5 overflow-hidden p-6 md:p-7"
          style={{
            boxShadow: '0 26px 54px -40px rgba(43, 26, 18, 0.34)',
            borderRadius: '28px',
            border: '1px solid #ECE6E2',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)',
          }}
        >
          {!selectedLink && (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Ranked destinations</div>
                  <h4 className="mt-2 text-[20px] font-bold tracking-tight text-slate-900">Link Performance</h4>
                  <p className="mt-1 text-[13px] font-medium text-slate-500">
                    A curated leaderboard of your best-performing links for the selected {periodLabel.toLowerCase()} window.
                  </p>
                </div>
                <div
                  className="inline-flex w-fit items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{
                    color: '#9C5C2E',
                    background: 'rgba(156, 92, 46, 0.08)',
                    border: '1px solid rgba(156, 92, 46, 0.12)',
                  }}
                >
                  {rankedLinks.length} links in rotation
                </div>
              </div>

              {rankedLinks.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                    <button
                      onClick={() => setSelectedLinkId(rankedLinks[0].id)}
                      className="rounded-[12px] md:rounded-[14px] p-2.5 md:p-3 text-left transition-transform duration-200 hover:-translate-y-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${rankedLinks[0].colorStart}14 0%, rgba(255,255,255,0.98) 48%, ${rankedLinks[0].colorEnd}12 100%)`,
                        border: `1px solid ${rankedLinks[0].colorStart}26`,
                        boxShadow: '0 24px 48px -38px rgba(43, 26, 18, 0.5)',
                      }}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em]"
                            style={{
                              color: rankedLinks[0].colorStart,
                              background: 'rgba(255,255,255,0.7)',
                            }}
                          >
                            #{rankedLinks[0].rank} top destination
                          </div>
                          <h5 className="mt-1.5 truncate text-[20px] md:text-[22px] font-bold tracking-tight text-slate-900">{rankedLinks[0].title}</h5>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                            <span className="truncate">{rankedLinks[0].host}</span>
                            <ArrowUpRight size={13} />
                          </div>
                        </div>
                        <div
                          className="inline-flex w-fit items-center rounded-full px-2 py-1 text-[11px] font-semibold"
                          style={{
                            color: rankedLinks[0].growth >= 0 ? '#2FBF71' : '#B91C1C',
                            background: rankedLinks[0].growth >= 0 ? '#E9F8EF' : 'rgba(239, 68, 68, 0.1)',
                          }}
                        >
                          {formatGrowth(rankedLinks[0].growth)}
                        </div>
                      </div>

                      <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Total clicks</div>
                          <div className="mt-0.5 text-[26px] md:text-[28px] font-bold leading-none text-slate-900">{formatCompact(rankedLinks[0].periodClicks)}</div>
                          <div className="mt-0.5 text-[11px] font-medium text-slate-500">{periodLabel} performance</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Share of traffic</div>
                          <div className="mt-0.5 text-[22px] md:text-[24px] font-semibold text-slate-900">{formatPercentage(rankedLinks[0].share)}</div>
                          <div className="mt-0.5 text-[11px] font-medium text-slate-500">of all clicks captured</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Click-through rate</div>
                          <div className="mt-0.5 text-[22px] md:text-[24px] font-semibold text-slate-900">{formatPercentage(rankedLinks[0].ctr)}</div>
                          <div className="mt-0.5 text-[11px] font-medium text-slate-500">clicks vs impressions</div>
                        </div>
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                        {[
                          { label: 'Unique clicks', value: formatCompact(rankedLinks[0].uniqueClicks) },
                          { label: 'Repeat clicks', value: formatCompact(rankedLinks[0].repeatClicks) },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-[10px] px-2 py-1.5"
                            style={{
                              background: 'rgba(255,255,255,0.72)',
                              border: '1px solid #ECE6E2',
                            }}
                          >
                            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</div>
                            <div className="mt-0.5 text-[16px] font-semibold text-slate-900">{item.value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: rankedLinks[0].colorStart }}>
                        Inspect trend
                        <ArrowUpRight size={13} />
                      </div>
                    </button>

                    <div className="grid grid-cols-1 gap-2.5">
                      {rankedLinks.slice(1, 4).map((link) => (
                        <button
                          key={link.id}
                          onClick={() => setSelectedLinkId(link.id)}
                          className="rounded-[16px] px-3.5 py-3 text-left transition-transform duration-200 hover:-translate-y-0.5"
                          style={{
                            background: 'rgba(255,255,255,0.84)',
                            border: '1px solid #ECE6E2',
                            boxShadow: '0 14px 28px -32px rgba(43, 26, 18, 0.78)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 gap-2.5">
                              <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                                style={{
                                  color: '#0F172A',
                                  background: `linear-gradient(135deg, ${link.colorStart}24, ${link.colorEnd}30)`,
                                }}
                              >
                                #{link.rank}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-[13px] font-semibold text-slate-900">{link.title}</div>
                                <div className="truncate text-[11px] font-medium text-slate-500">{link.host}</div>
                              </div>
                            </div>
                            <div
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                color: link.growth >= 0 ? '#2FBF71' : '#B91C1C',
                                background: link.growth >= 0 ? '#E9F8EF' : 'rgba(239, 68, 68, 0.08)',
                              }}
                            >
                              {formatGrowth(link.growth)}
                            </div>
                          </div>

                          <div className="mt-2.5 flex items-end justify-between gap-3">
                            <div>
                              <div className="text-[18px] font-bold leading-none text-slate-900">{formatCompact(link.periodClicks)}</div>
                              <div className="mt-0.5 text-[11px] font-medium text-slate-500">{formatPercentage(link.share)} of total clicks</div>
                            </div>
                            <div className="min-w-[90px]">
                              <div className="h-1 w-full rounded-full" style={{ background: '#F0EBE8' }}>
                                <div
                                  className="h-1 rounded-full"
                                  style={{
                                    width: `${Math.max(8, Math.min(100, link.share))}%`,
                                    background: `linear-gradient(135deg, ${link.colorStart}, ${link.colorEnd})`,
                                  }}
                                ></div>
                              </div>
                              <div className="mt-1 text-right text-[10px] font-semibold" style={{ color: link.colorStart }}>
                                View detail
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {rankedLinks.length > 4 && (
                    <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                      {rankedLinks.slice(4).map((link) => (
                        <button
                          key={link.id}
                          onClick={() => setSelectedLinkId(link.id)}
                          className="rounded-[16px] px-3.5 py-2.5 text-left transition-all duration-200 hover:-translate-y-0.5"
                          style={{
                            background: 'rgba(255,255,255,0.8)',
                            border: '1px solid #ECE6E2',
                            boxShadow: '0 12px 24px -30px rgba(43, 26, 18, 0.75)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">#{link.rank}</span>
                                <span className="h-2 w-2 rounded-full" style={{ background: link.colorStart }}></span>
                              </div>
                              <div className="mt-1 truncate text-[13px] font-semibold text-slate-900">{link.title}</div>
                              <div className="truncate text-[11px] font-medium text-slate-500">{link.host}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[16px] font-bold text-slate-900">{formatCompact(link.periodClicks)}</div>
                              <div className="text-[10px] font-medium text-slate-500">{formatPercentage(link.share)} share</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-[24px] border px-5 py-10 text-center text-sm font-medium text-slate-400" style={{ borderColor: '#ECE6E2' }}>
                  No link data available.
                </div>
              )}
            </>
          )}

          {selectedLink && selectedRankedLink && (
            <div>
              <button
                onClick={() => setSelectedLinkId(null)}
                className="mb-5 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: 'var(--accent)' }}
              >
                <ArrowLeft size={16} />
                Back to ranked links
              </button>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
                <div
                  className="rounded-[28px] p-5"
                  style={{
                    background: `linear-gradient(135deg, ${selectedRankedLink.colorStart}14 0%, rgba(255,255,255,0.98) 48%, ${selectedRankedLink.colorEnd}12 100%)`,
                    border: `1px solid ${selectedRankedLink.colorStart}22`,
                    boxShadow: '0 22px 44px -36px rgba(43, 26, 18, 0.45)',
                  }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="inline-flex items-center rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: selectedRankedLink.colorStart }}>
                        Ranked #{selectedRankedLink.rank}
                      </div>
                      <h4 className="mt-4 truncate text-[24px] font-bold tracking-tight text-slate-900">{selectedLink.title}</h4>
                      <p className="mt-1 truncate text-sm font-medium text-slate-500">{selectedLink.url}</p>
                    </div>
                    <div
                      className="inline-flex w-fit items-center rounded-full px-3 py-1.5 text-[12px] font-semibold"
                      style={{
                        color: selectedLink.growth >= 0 ? '#2FBF71' : '#B91C1C',
                        background: selectedLink.growth >= 0 ? '#E9F8EF' : 'rgba(239, 68, 68, 0.1)',
                      }}
                    >
                      {formatGrowth(selectedLink.growth)}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Traffic share</div>
                      <div className="mt-2 text-[24px] font-semibold text-slate-900">{formatPercentage(selectedRankedLink.share)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">CTR</div>
                      <div className="mt-2 text-[24px] font-semibold text-slate-900">{formatPercentage(selectedRankedLink.ctr)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Host</div>
                      <div className="mt-2 truncate text-[18px] font-semibold text-slate-900">{selectedRankedLink.host}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total clicks', value: formatCompact(selectedLink.periodClicks) },
                    { label: 'Unique clicks', value: formatCompact(selectedLink.uniqueClicks) },
                    { label: 'Repeat clicks', value: formatCompact(selectedLink.repeatClicks) },
                    { label: 'Impressions', value: formatCompact(selectedRankedLink.impressions) },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[20px] px-4 py-4"
                      style={{
                        background: 'rgba(255,255,255,0.84)',
                        border: '1px solid #ECE6E2',
                        boxShadow: '0 16px 30px -34px rgba(43, 26, 18, 0.54)',
                      }}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                      <div className="mt-2 text-[24px] font-bold text-slate-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="mt-5 rounded-[26px] p-5"
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  border: '1px solid #ECE6E2',
                  boxShadow: '0 18px 38px -36px rgba(43, 26, 18, 0.55)',
                }}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider app-muted">{periodLabel}</div>
                    <h5 className="text-[18px] font-semibold text-slate-900">Link Performance Over Time</h5>
                    <p className="mt-1 text-[12px] font-medium text-slate-500">
                      Trend view for clicks and impressions on this destination.
                    </p>
                  </div>

                  <div ref={detailPeriodDropdownRef} className="relative">
                    <button
                      onClick={() => setIsDetailPeriodOpen((prev) => !prev)}
                      className="app-button-primary flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                    >
                      {periodLabel}
                      <ChevronDown size={14} className={isDetailPeriodOpen ? 'rotate-180' : ''} />
                    </button>

                    {isDetailPeriodOpen && (
                      <div
                        className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl"
                        style={{
                          background: 'var(--card-bg)',
                          border: '1px solid var(--border-default)',
                          boxShadow: '0 16px 28px rgba(58, 35, 23, 0.14)',
                        }}
                      >
                        {PERIOD_OPTIONS.map((option) => (
                          <button
                            key={option.key}
                            onClick={() => {
                              setPeriod(option.key);
                              setIsDetailPeriodOpen(false);
                            }}
                            className="block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--surface-subtle)]"
                            style={{
                              color: option.key === period ? 'var(--button-primary)' : 'var(--body-text)',
                              fontWeight: option.key === period ? 700 : 500,
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={detailTimelineData} margin={{ top: 6, right: 10, left: -10, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6F6F6F', fontWeight: 500 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6F6F6F', fontWeight: 500 }}
                        tickFormatter={(value) => formatCompact(Number(value))}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#FFFFFF',
                          border: '1px solid var(--border-default)',
                          borderRadius: 10,
                          boxShadow: 'var(--shadow-md)',
                        }}
                      />
                      <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, color: '#6F6F6F' }} />
                      <Line
                        type="monotone"
                        dataKey="clicks"
                        name="Clicks"
                        stroke={selectedRankedLink.colorStart}
                        strokeWidth={2.2}
                        dot={{ r: 4, fill: '#FFFFFF', stroke: selectedRankedLink.colorStart, strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="impressions"
                        name="Impressions"
                        stroke="#A1A1AA"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#FFFFFF', stroke: '#A1A1AA', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'geo' && (
        <section
          className="app-card mt-5 overflow-hidden p-3 sm:p-4 md:p-7"
          style={{
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--border-default)',
            background: 'linear-gradient(180deg, var(--card-bg) 0%, var(--surface-subtle) 100%)',
          }}
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--muted-text)' }}>Audience footprint</div>
              <h4 className="mt-2 text-[20px] font-bold tracking-tight" style={{ color: 'var(--heading-color)' }}>Geographic Data</h4>
              <p className="mt-1 text-[13px] font-medium" style={{ color: 'var(--muted-text)' }}>
                See where your audience clusters, which markets dominate, and how engagement is distributed.
              </p>
            </div>
            <div
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                color: 'var(--accent)',
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-medium)',
              }}
            >
              <Globe2 size={14} />
              {countryLeaderboard.length} countries reached
            </div>
          </div>

          {countryLeaderboard.length > 0 ? (
            <>
              <div
                className="rounded-[28px] p-3 sm:p-4 md:p-5"
                style={{
                  background: 'linear-gradient(180deg, var(--surface-subtle) 0%, var(--surface-hover) 100%)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div className="mb-3 sm:mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-[13px] font-semibold" style={{ color: 'var(--heading-color)' }}>Global audience map</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'High activity', color: '#7B4B2A' },
                      { label: 'Medium', color: '#C9793A' },
                      { label: 'Low', color: '#D4A574' },
                    ].map(({ label, color }) => (
                      <div
                        key={label}
                        className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                        style={{
                          color: 'var(--muted-text)',
                          background: 'var(--card-bg)',
                          border: '1px solid var(--border-default)',
                        }}
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }}></span>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="overflow-hidden rounded-[16px] sm:rounded-[24px] border"
                  style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border-default)' }}
                >
                  <ComposableMap
                    width={900}
                    height={500}
                    projectionConfig={{ scale: 160, center: [0, 5] }}
                    style={{ width: '100%', height: 'auto' }}
                  >
                    <Geographies geography={GEO_URL}>
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const isoId = Number(geo.id);
                          const match = realCountries.find(
                            (c) => COUNTRY_ISO[c.country] === isoId || c.country === geo.properties?.name,
                          );
                          let fill = '#ECE6E2';
                          if (match) {
                            if (match.activityPercentage >= 20) fill = '#7B4B2A';
                            else if (match.activityPercentage >= 8) fill = '#C9793A';
                            else fill = '#D4A574';
                          }
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={fill}
                              stroke="#FFFFFF"
                              strokeWidth={0.4}
                              style={{
                                default: { outline: 'none' },
                                hover: { outline: 'none', opacity: 0.8 },
                                pressed: { outline: 'none' },
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ComposableMap>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(280px,1fr)_repeat(3,minmax(0,0.6fr))]">
                <div
                  className="rounded-[24px] p-3 sm:p-3.5"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--card-bg) 56%, var(--surface-subtle) 100%)',
                    border: '1px solid var(--accent-medium)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--muted-text)' }}>
                      <MapPinned size={14} />
                      Market snapshot
                    </div>
                    <div
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: 'var(--accent)', background: 'var(--card-bg)' }}
                    >
                      Dominant market
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-start gap-3">
                    {dominantCountry?.countryCode && (
                      <img
                        src={`https://flagcdn.com/${dominantCountry.countryCode.toLowerCase()}.svg`}
                        alt={`${dominantCountry.country} flag`}
                        className="mt-1 h-[18px] w-[26px] shrink-0 rounded-[4px] border object-cover"
                        style={{ borderColor: 'var(--border-strong)' }}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-[24px] font-bold tracking-tight" style={{ color: 'var(--heading-color)' }}>{dominantCountry?.country ?? 'No data yet'}</div>
                      <div className="mt-1 text-[13px] font-medium" style={{ color: 'var(--muted-text)' }}>
                        {dominantCountry ? `${formatCompact(dominantCountry.clicks)} clicks and ${formatCompact(dominantCountry.uniqueVisitors)} unique visitors` : 'Waiting for audience data'}
                      </div>
                    </div>
                  </div>


                </div>

                {[
                  { label: 'Traffic share', value: formatPercentage(dominantCountryShare), note: 'of total clicks' },
                  { label: 'Activity score', value: `${dominantCountry?.activityPercentage ?? 0}%`, note: 'dominant market' },
                  { label: 'Avg activity', value: `${averageCountryActivity}%`, note: `${countryLeaderboard.length} markets tracked` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[16px] px-3 py-2.5 sm:rounded-[22px] sm:px-3.5 sm:py-3"
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-default)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted-text)' }}>{item.label}</div>
                    <div className="mt-1.5 sm:mt-2 text-[24px] font-bold leading-none" style={{ color: 'var(--heading-color)' }}>{item.value}</div>
                    <div className="mt-1 sm:mt-1.5 text-[11px] sm:text-[12px] font-medium" style={{ color: 'var(--muted-text)' }}>{item.note}</div>
                  </div>
                ))}
              </div>

              <div
                className="mt-4 overflow-hidden rounded-[16px] sm:rounded-[26px]"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[500px] sm:min-w-[720px]">
                    <div className="grid grid-cols-[minmax(0,1fr)_70px_80px_90px] sm:grid-cols-[minmax(0,1.4fr)_110px_140px_160px] gap-2 sm:gap-3 border-b px-3 py-2 sm:px-4 sm:py-3 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ borderColor: 'var(--border-default)', color: 'var(--muted-text)' }}>
                      <div>Country</div>
                      <div>Clicks</div>
                      <div>Visitors</div>
                      <div>Activity</div>
                    </div>
                    <div>
                      {countryLeaderboard.map((country) => {
                        const flagCode = (country.countryCode || 'US').toLowerCase();
                        return (
                          <div
                            key={country.country}
                            className="grid grid-cols-[minmax(0,1fr)_70px_80px_90px] sm:grid-cols-[minmax(0,1.4fr)_110px_140px_160px] gap-2 sm:gap-3 border-b px-3 py-2.5 sm:px-4 sm:py-3 last:border-b-0"
                            style={{ borderColor: 'var(--border-default)' }}
                          >
                            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                              <img
                                src={`https://flagcdn.com/${flagCode}.svg`}
                                alt={`${country.country} flag`}
                                className="h-[16px] w-[24px] shrink-0 rounded-[3px] border object-cover"
                                style={{ borderColor: 'var(--border-strong)' }}
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="min-w-0">
                                <div className="truncate text-[14px] font-semibold" style={{ color: 'var(--heading-color)' }}>{country.country}</div>
                                <div className="mt-0.5 text-[11px] font-medium" style={{ color: 'var(--muted-text)' }}>Audience cluster</div>
                              </div>
                            </div>
                            <div className="text-[13px] font-semibold" style={{ color: 'var(--heading-color)' }}>{formatCompact(country.clicks)}</div>
                            <div className="text-[13px] font-semibold" style={{ color: 'var(--heading-color)' }}>{formatCompact(country.uniqueVisitors)}</div>
                            <div>
                              <div className="text-[12px] font-semibold" style={{ color: 'var(--heading-color)' }}>{country.activityPercentage}%</div>
                              <div className="mt-2 h-1.5 w-full rounded-full" style={{ background: 'var(--border-strong)' }}>
                                <div
                                  className="h-1.5 rounded-full"
                                  style={{
                                    width: `${Math.max(8, Math.min(100, country.activityPercentage))}%`,
                                    background: 'linear-gradient(135deg, var(--accent-hover), var(--accent))',
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[24px] border px-5 py-10 text-center text-sm font-medium" style={{ borderColor: 'var(--border-default)', color: 'var(--muted-text)' }}>
              No geographic data available.
            </div>
          )}
        </section>
      )}

      {activeTab === 'suggestions' && (
        <section
          className="app-card mt-5 overflow-hidden p-3 sm:p-4 md:p-7"
          style={{
            boxShadow: '0 22px 48px -40px rgba(43, 26, 18, 0.3)',
            borderRadius: '28px',
            border: '1px solid #ECE6E2',
            background: 'rgba(255,255,255,0.98)',
          }}
        >
          <div className="mb-4 sm:mb-6 flex items-start gap-3 sm:gap-4">
            <div
              className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-[12px] sm:rounded-[14px]"
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                color: '#6366F1',
                border: '1px solid rgba(201, 121, 58, 0.12)',
              }}
            >
              <Lightbulb className="h-[18px] w-[18px] sm:h-[20px] sm:w-[20px]" />
            </div>
            <div>
              <h4 className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-slate-900">Optimization Suggestions</h4>
              <p className="mt-1 text-[13px] font-medium text-slate-500">
                Simple recommendations based on your current analytics signals.
              </p>
            </div>
          </div>

          {suggestionPlaybook.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {suggestionPlaybook.map((suggestion, index) => (
                <div
                  key={suggestion.title}
                  className="group relative rounded-[16px] sm:rounded-[20px] px-3 py-3 sm:px-4 sm:py-4 md:px-5 transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #ECE6E2',
                    boxShadow: '0 4px 12px -4px rgba(43, 26, 18, 0.03)',
                  }}
                >
                  {/* Subtle hover gradient border effect */}
                  <div 
                    className="absolute inset-0 rounded-[16px] sm:rounded-[20px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
                    style={{
                      boxShadow: `0 0 0 1px ${suggestion.accent}33, 0 12px 24px -8px ${suggestion.accent}15`,
                    }}
                  />

                  <div className="relative flex flex-col gap-2.5 sm:gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 items-start gap-2.5 sm:gap-3 md:gap-4">
                      <div
                        className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-[10px] sm:rounded-[12px] transition-transform duration-300 group-hover:scale-105"
                        style={{
                          color: suggestion.accent,
                          background: suggestion.soft,
                        }}
                      >
                        <Lightbulb className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-[14px] sm:text-[15px] font-semibold text-slate-900 group-hover:text-slate-900 transition-colors">{suggestion.title}</h5>
                          {suggestion.priority && (
                            <span 
                              className="hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide"
                              style={{ color: suggestion.accent, background: suggestion.soft }}
                            >
                              {suggestion.priority}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 sm:mt-1 text-[12px] sm:text-[13px] leading-relaxed text-slate-500">{suggestion.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:block md:min-w-[150px] md:text-right mt-1 sm:mt-0">
                      <div className="sm:hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Play #{String(index + 1).padStart(2, '0')}
                      </div>
                      <div
                        className="inline-flex w-fit items-center rounded-full px-2.5 py-1 sm:px-3.5 sm:py-1.5 transition-colors duration-300"
                        style={{
                          background: '#F8FAFC',
                          color: '#0F172A',
                          border: '1px solid #F1F5F9'
                        }}
                      >
                        <span className="text-[12px] sm:text-[14px] font-bold tracking-tight">
                          {suggestion.metric}
                        </span>
                      </div>
                      <div className="hidden sm:block mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Play #{String(index + 1).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border px-5 py-10 text-center text-sm font-medium text-slate-400" style={{ borderColor: '#ECE6E2' }}>
              No suggestions available right now.
            </div>
          )}
        </section>
      )}
    </div>
  );
}
