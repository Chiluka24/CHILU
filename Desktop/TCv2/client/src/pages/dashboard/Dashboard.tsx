import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  MousePointerClick,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Link2,
  BarChart3,
  ExternalLink,
  Plus,
  Loader2,
  Calendar,
} from 'lucide-react';
import CustomDropdown from '../../components/ui/CustomDropdown';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { chartTheme, chartTooltipItemStyle, chartTooltipLabelStyle, chartTooltipStyle } from '../../config/theme';
import { API_BASE } from '../../config/env';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [userName, setUserName] = useState<string>('Creator');
  const [timeRange, setTimeRange] = useState('14 Days');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let fromDate = '', toDate = todayStr;
    const daysMap: Record<string, number> = { 'Today': 0, '7 Days': 6, '14 Days': 13, '1 Month': 29, '3 Months': 89, '6 Months': 179, '1 Year': 364 };
    const days = daysMap[timeRange] ?? 13;
    const start = new Date(today); start.setDate(start.getDate() - days);
    fromDate = start.toISOString().split('T')[0];

    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/user`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/api/dashboard?from=${fromDate}&to=${toDate}`, { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(async ([userRes, dashRes]) => {
        if (userRes.status === 401 || userRes.status === 403 || dashRes.status === 401 || dashRes.status === 403) {
          localStorage.removeItem('token'); navigate('/login'); return;
        }
        const userText = await userRes.text();
        if (userText.trim().startsWith('<')) { localStorage.removeItem('token'); navigate('/login'); return; }
        const userData = JSON.parse(userText);
        let dashData = null;
        if (dashRes.ok) {
          const dashText = await dashRes.text();
          if (!dashText.trim().startsWith('<')) dashData = JSON.parse(dashText);
        }
        const ud = userData.data || userData; // handle both wrapped and cached response
        setUserName(ud?.profile?.name?.split(' ')[0] || ud?.username || 'Creator');
        if (dashData?.data) setDashboardData(dashData.data);
      })
      .catch(err => console.error('Failed to fetch dashboard data:', err))
      .finally(() => setLoading(false));
  }, [navigate, timeRange]);

  const chartData = dashboardData?.chartData || [];
  const recentLinks = dashboardData?.topLinks || [];


  const linkSummary = dashboardData?.linkSummary || { total: 0, active: 0 };

  const stats = (dashboardData?.stats || []).map((s: any) => ({
    ...s,
    icon: s.title === 'Total Views' ? Users :
      s.title === 'Total Clicks' ? MousePointerClick :
        s.title === 'CTR' ? TrendingUp : DollarSign
  }));

  // Skeleton loader
  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col h-[calc(100vh-2rem)] max-w-6xl mx-auto app-page overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 flex-shrink-0 mb-4 md:mb-5">
          <div className="flex-1 min-w-0">
            <div className="h-7 w-56 rounded-lg animate-pulse" style={{ background: 'var(--surface-subtle)' }} />
            <div className="h-4 w-72 rounded-lg animate-pulse mt-2" style={{ background: 'var(--surface-subtle)' }} />
          </div>
        </div>
        <div className="dashboard-cards-grid flex-shrink-0 mb-4 md:mb-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="dashboard-card app-card animate-pulse" style={{ background: 'var(--surface-subtle)' }} />
          ))}
        </div>
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--muted-text)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-6xl mx-auto app-page h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 flex-shrink-0 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="font-bold tracking-tight app-page-main-title">
            Welcome back, {userName}
          </h1>
          <p className="mt-1 text-sm app-page-subtitle font-medium">
            Here's what's happening with your links today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-auto md:min-w-[200px]">
            <CustomDropdown
              value={timeRange}
              onChange={setTimeRange}
              options={[
                { value: 'Today', label: 'Today' },
                { value: '7 Days', label: '7 Days' },
                { value: '14 Days', label: '14 Days' },
                { value: '1 Month', label: '1 Month' },
                { value: '3 Months', label: '3 Months' },
                { value: '6 Months', label: '6 Months' },
                { value: '1 Year', label: '1 Year' },
              ]}
              buttonIcon={Calendar}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-cards-grid flex-shrink-0 mb-3">
        {stats.map((stat: any, i: number) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="dashboard-card app-card app-card-hover"
          >
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">
                <stat.icon className="w-5 h-5" style={{ color: 'var(--icon-color)' }} />
              </div>
              <div
                className="dashboard-card-badge"
                style={{
                  color: stat.isPositive ? 'var(--success-600)' : 'var(--error-600)',
                  background: stat.isPositive ? 'var(--success-50)' : 'var(--error-50)',
                }}
              >
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span className="dashboard-card-change">{stat.change}</span>
              </div>
            </div>
            <div className="dashboard-card-content">
              <p className="dashboard-card-label">{stat.title}</p>
              <p className="dashboard-card-value">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart + Top Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 flex-1 min-h-0">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 app-card p-3 md:p-4 flex flex-col min-h-0"
        >
          <div className="flex items-center justify-between mb-2 md:mb-3 flex-shrink-0">
            <div>
              <h2 className="text-base lg:text-sm font-semibold app-heading">Performance</h2>
              <p className="text-xs app-muted mt-0.5">Views & clicks over time</p>
            </div>
            <button className="p-2 app-icon-button transition-all rounded-lg touch-target">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 w-full min-h-0 min-w-0">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="99%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartTheme.primary} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={chartTheme.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartTheme.secondary} stopOpacity={0.08} />
                      <stop offset="95%" stopColor={chartTheme.secondary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartTheme.tick, fontSize: 11, fontWeight: 500 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.tick, fontSize: 11, fontWeight: 500 }} />
                  <Tooltip contentStyle={chartTooltipStyle} itemStyle={chartTooltipItemStyle} labelStyle={chartTooltipLabelStyle} cursor={{ stroke: chartTheme.cursor, strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="views" stroke={chartTheme.primary} strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" activeDot={{ r: 4, fill: chartTheme.primary, stroke: '#FFFFFF', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="clicks" stroke={chartTheme.secondary} strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" activeDot={{ r: 4, fill: chartTheme.secondary, stroke: '#FFFFFF', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                <BarChart3 className="w-8 h-8" style={{ color: 'var(--muted-text)', opacity: 0.4 }} />
                <p className="text-sm app-muted">No data yet for this period</p>
                <p className="text-xs app-muted">Share your profile link to start tracking</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="app-card p-3 md:p-4 flex flex-col min-h-0"
        >
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div>
              <h2 className="text-base lg:text-sm font-semibold app-heading">Top Links</h2>
              <p className="text-xs app-muted mt-0.5">{linkSummary.total} links · {linkSummary.active} active</p>
            </div>
            <Link to="/analytics" className="text-xs font-semibold app-muted hover:text-[var(--heading-color)] transition-colors flex items-center gap-1">
              View all <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto min-h-0">
            {recentLinks.length > 0 ? recentLinks.slice(0, 6).map((link: any, idx: number) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.04 }}
                className="flex items-center p-2 rounded-lg transition-all group cursor-pointer touch-target w-full"
                style={{ background: 'var(--surface-subtle)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-subtle)')}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-default)' }}>
                    <Link2 className="w-3.5 h-3.5" style={{ color: 'var(--icon-color)' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm lg:text-xs font-semibold app-heading truncate">{link.title}</p>
                    <p className="text-xs lg:text-[11px] app-muted truncate">{link.url}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm lg:text-xs font-bold app-heading whitespace-nowrap">{link.clicks.toLocaleString()}</p>
                  <p className="text-[10px] app-muted font-medium uppercase tracking-wider whitespace-nowrap">clicks</p>
                </div>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-6">
                <Link2 className="w-7 h-7" style={{ color: 'var(--muted-text)', opacity: 0.4 }} />
                <p className="text-sm app-muted text-center">No links yet</p>
                <p className="text-xs app-muted text-center">Add your first link to get started</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/links')}
            className="w-full mt-2 py-2 app-button-primary text-sm font-semibold flex items-center justify-center gap-2 touch-target flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add New Link
          </button>
        </motion.div>
      </div>

    </div>
  );
}
