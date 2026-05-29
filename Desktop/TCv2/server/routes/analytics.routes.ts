// /api/dashboard + /api/analytics  — auth-required analytics endpoints.

import { Router } from 'express';
import { Link, LinkClick, ProfileView, Lead, Automation } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { analyticsLimiter } from '../config/rate-limits.js';
import { sendSuccess, sendError } from '../utils/http.js';
import { REVENUE_PER_CLICK } from '../config/constants.js';

const router = Router();
router.use(authenticateToken);

/**
 * Parse from/to query params as UTC dates, or fall back to a default window.
 * - Dashboard default = last 14 days
 * - Analytics default = last 30 days
 */
const parseRange = (req: any, defaultDays: number) => {
  const { from, to } = req.query;
  let startDate: Date;
  let endDate: Date;

  if (from && to) {
    const [fy, fm, fd] = (from as string).split('-').map(Number);
    const [ty, tm, td] = (to as string).split('-').map(Number);
    startDate = new Date(Date.UTC(fy, fm - 1, fd, 0, 0, 0, 0));
    endDate = new Date(Date.UTC(ty, tm - 1, td, 23, 59, 59, 999));
  } else {
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - (defaultDays - 1));
    startDate.setHours(0, 0, 0, 0);
  }

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const daysToFetch = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  return { startDate, endDate, daysToFetch };
};

const formatChartLabel = (d: Date, i: number, daysToFetch: number): string => {
  if (daysToFetch === 1) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (daysToFetch <= 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  if (daysToFetch <= 31) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (daysToFetch <= 90) return `Week ${Math.floor(i / 7) + 1}`;
  return d.toLocaleDateString('en-US', { month: 'short' });
};

const calcGrowth = (current: number, previous: number): string => {
  if (previous === 0) return current > 0 ? '+100.0' : '0.0';
  const growth = ((current - previous) / previous) * 100;
  return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}`;
};

// ── GET /api/dashboard ─────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const user = (req as any).user;
    const { startDate, endDate, daysToFetch } = parseRange(req, 14);

    const prevEndDate = new Date(startDate);
    prevEndDate.setMilliseconds(-1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - (daysToFetch - 1));
    prevStartDate.setHours(0, 0, 0, 0);

    const [
      links,
      clickSeries,
      viewSeries,
      profileViewsCount,
      prevProfileViewsCount,
      prevClicksCount,
      leadsCount,
      automationsCount,
    ] = await Promise.all([
      Link.find({ user: user._id })
        .select('_id title url clicks isActive type createdAt')
        .sort({ clicks: -1 })
        .lean(),
      LinkClick.aggregate([
        { $match: { user: user._id, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, clicks: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      ProfileView.aggregate([
        { $match: { user: user._id, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, views: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      ProfileView.countDocuments({ user: user._id, createdAt: { $gte: startDate, $lte: endDate } }),
      ProfileView.countDocuments({ user: user._id, createdAt: { $gte: prevStartDate, $lte: prevEndDate } }),
      LinkClick.countDocuments({ user: user._id, createdAt: { $gte: prevStartDate, $lte: prevEndDate } }),
      Lead.countDocuments({ user: user._id }),
      Automation.countDocuments({ user: user._id, isActive: true }),
    ]);

    const dailyClicksMap = new Map(clickSeries.map((item: any) => [item._id, item.clicks]));
    const dailyViewsMap = new Map(viewSeries.map((item: any) => [item._id, item.views]));
    const chartData: any[] = [];
    let totalClicksWindow = 0;

    for (let i = 0; i < daysToFetch; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = d.toISOString().split('T')[0];
      const clicks = (dailyClicksMap.get(key) as number) || 0;
      const views = (dailyViewsMap.get(key) as number) || 0;
      totalClicksWindow += clicks;
      chartData.push({ name: formatChartLabel(d, i, daysToFetch), views, clicks });
    }

    const totalViews = profileViewsCount;
    const ctr = totalViews > 0 ? ((totalClicksWindow / totalViews) * 100).toFixed(1) : '0.0';
    const revenue = totalClicksWindow * REVENUE_PER_CLICK;

    const viewsGrowth = calcGrowth(profileViewsCount, prevProfileViewsCount);
    const clicksGrowth = calcGrowth(totalClicksWindow, prevClicksCount);
    const prevCtr = prevProfileViewsCount > 0 ? (prevClicksCount / prevProfileViewsCount) * 100 : 0;
    const currentCtr = totalViews > 0 ? (totalClicksWindow / totalViews) * 100 : 0;
    const ctrGrowth = calcGrowth(currentCtr, prevCtr);
    const prevRevenue = prevClicksCount * REVENUE_PER_CLICK;
    const revenueGrowth = calcGrowth(revenue, prevRevenue);

    const stats = [
      { title: 'Total Views', value: totalViews.toLocaleString(), change: `${viewsGrowth}%`, isPositive: parseFloat(viewsGrowth) >= 0 },
      { title: 'Total Clicks', value: totalClicksWindow.toLocaleString(), change: `${clicksGrowth}%`, isPositive: parseFloat(clicksGrowth) >= 0 },
      { title: 'CTR', value: `${ctr}%`, change: `${ctrGrowth}%`, isPositive: parseFloat(ctrGrowth) >= 0 },
      { title: 'Revenue', value: `$${revenue.toFixed(2)}`, change: `${revenueGrowth}%`, isPositive: parseFloat(revenueGrowth) >= 0 },
    ];

    const linkClicksInPeriod = await LinkClick.aggregate([
      { $match: { user: user._id, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$link', clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
      { $limit: 5 },
    ]);

    const linkClicksMap = new Map(linkClicksInPeriod.map((item: any) => [item._id.toString(), item.clicks]));
    const topLinks = links.slice(0, 5).map((l: any) => {
      const periodClicks = (linkClicksMap.get(l._id.toString()) as number) || 0;
      return {
        id: l._id.toString(),
        title: l.title,
        url: l.url,
        clicks: periodClicks,
        totalClicks: l.clicks || 0,
        status: l.isActive ? 'Active' : 'Paused',
      };
    }).sort((a, b) => b.clicks - a.clicks || b.totalClicks - a.totalClicks);

    const totalLinks = links.length;
    const activeLinks = links.filter((l: any) => l.isActive).length;

    return sendSuccess(res, {
      chartData,
      stats,
      topLinks,
      linkSummary: { total: totalLinks, active: activeLinks },
      leadsCount,
      automationsCount,
    });
  } catch (err) {
    console.error('Dashboard API error:', err);
    return sendError(res, 500, 'Failed to fetch dashboard data', 'DASHBOARD_FETCH_FAILED', (err as Error).message);
  }
});

// ── GET /api/analytics ─────────────────────────────────────────────────────
router.get('/analytics', analyticsLimiter, async (req, res) => {
  try {
    const user = (req as any).user;
    const { startDate, endDate, daysToFetch } = parseRange(req, 30);

    const [links, countryData, clicksByLink, profileViewsByDay] = await Promise.all([
      Link.find({ user: user._id }).select('_id title url clicks').sort({ clicks: -1 }).lean(),
      LinkClick.aggregate([
        { $match: { user: user._id, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { code: '$countryCode', name: '$countryName' }, clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } },
        { $limit: 20 },
      ]),
      LinkClick.aggregate([
        { $match: { user: user._id, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: {
            _id: { link: '$link', date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
            count: { $sum: 1 },
          },
        },
      ]),
      ProfileView.aggregate([
        { $match: { user: user._id, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: {
            _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const clickMap = new Map<string, Map<string, number>>();
    clicksByLink.forEach((item: any) => {
      const linkId = item._id.link.toString();
      if (!clickMap.has(linkId)) clickMap.set(linkId, new Map());
      clickMap.get(linkId)!.set(item._id.date, item.count);
    });

    const definitions = links.map((link: any) => {
      const linkClickMap = clickMap.get(link._id.toString()) || new Map();
      const seed: number[] = [];
      for (let i = 0; i < daysToFetch; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        seed.push(linkClickMap.get(dateStr) || 0);
      }
      const halfPoint = Math.floor(daysToFetch / 2);
      const recent = seed.slice(halfPoint).reduce((a, b) => a + b, 0);
      const older = seed.slice(0, halfPoint).reduce((a, b) => a + b, 0);
      const momentum = older === 0 ? (recent > 0 ? 1 : 0) : (recent - older) / older;
      return {
        id: link._id.toString(),
        title: link.title,
        url: link.url,
        seed,
        momentum,
      };
    });

    const totalCountryClicks = countryData.reduce((acc: number, curr: any) => acc + curr.clicks, 0);
    const countries = countryData.map((c: any) => ({
      country: c._id.name || 'United States',
      countryCode: c._id.code || 'US',
      clicks: c.clicks,
      uniqueVisitors: Math.max(1, Math.round(c.clicks * 0.64)),
      activityPercentage: totalCountryClicks > 0 ? Math.round((c.clicks / totalCountryClicks) * 100) : 0,
    }));

    const totalPeriodClicks = clicksByLink.reduce((sum: number, item: any) => sum + item.count, 0);
    const totalPeriodViews = profileViewsByDay.reduce((sum: number, item: any) => sum + item.count, 0);
    const uniqueVisitors = Math.max(1, Math.round(totalPeriodClicks * 0.64));

    const stats = {
      totalClicks: totalPeriodClicks,
      totalViews: totalPeriodViews,
      uniqueVisitors,
      ctr: totalPeriodViews > 0 ? ((totalPeriodClicks / totalPeriodViews) * 100).toFixed(1) : '0.0',
    };

    res.json({ links: definitions, countries, stats });
  } catch (err) {
    console.error('Analytics API error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
