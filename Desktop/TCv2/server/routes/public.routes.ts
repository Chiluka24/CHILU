// /api/public/* — everything callable without auth: profile pages, click tracking,
// impression tracking, ad tracking, search, lead capture.

import { Router } from 'express';
import { User, Link, Ad, LinkClick, ProfileView, Lead } from '../models/index.js';
import {
  publicProfileLimiter,
  publicClickLimiter,
  publicSearchLimiter,
  leadCaptureLimiter,
} from '../config/rate-limits.js';
import { getCached, setCache } from '../services/cache.service.js';
import { parseUserAgent } from '../utils/user-agent.js';
import { escapeRegExp } from '../utils/validators.js';
import { getClientIP } from '../middleware/security.js';
import { sendSuccess } from '../utils/http.js';
import { PUBLIC_PROFILE_DEFAULT_COLORS, DISPOSABLE_EMAIL_DOMAINS } from '../config/constants.js';

const router = Router();

// ── GET /api/public/:username ──────────────────────────────────────────────
router.get('/:username', publicProfileLimiter, async (req, res) => {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  try {
    const usernameParam = req.params.username.toLowerCase();
    const cacheKey = `public:profile:${usernameParam}`;

    const cached = getCached(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=30, s-maxage=120');
      return res.json(cached);
    }

    // PERF: exact match first (hits index, ~10ms)
    let user: any = await User.findOne({ username: usernameParam })
      .select('username profile appearance')
      .lean();

    // Fallback for legacy mixed-case usernames
    if (!user && req.params.username !== usernameParam) {
      user = await User.findOne({ username: req.params.username })
        .collation({ locale: 'en', strength: 2 })
        .select('username profile appearance')
        .lean();
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    const [links, activeAd] = await Promise.all([
      Link.find({ user: user._id, isActive: true })
        .select('_id title url image keyword type parentId clicks order metadata isExpanded isActive')
        .sort({ order: 1 })
        .lean(),
      Ad.findOne({
        user: user._id,
        status: 'active',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      })
        .select('_id brand campaignName bannerImage clickUrl category')
        .lean(),
    ]);

    // Page-layout sorting
    let sortedLinks = links;
    const pageLayout = user.appearance?.pageLayout || 'default';
    if (pageLayout === 'mostRecent') {
      sortedLinks = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    } else if (pageLayout === 'custom' && user.appearance?.customLayoutLinks?.length) {
      const orderedIds = user.appearance.customLayoutLinks;
      const idSet = new Set(orderedIds);
      const filtered = links.filter((l: any) => idSet.has(l._id.toString()));
      filtered.sort(
        (a: any, b: any) => orderedIds.indexOf(a._id.toString()) - orderedIds.indexOf(b._id.toString())
      );
      sortedLinks = filtered;
    }

    const responseData = {
      profile: {
        name: user.profile?.name || user.username,
        bio: user.profile?.bio || '',
        avatar: user.profile?.avatar || '',
        socialIcons: user.profile?.socialIcons || [],
      },
      appearance: {
        theme: user.appearance?.theme || 1,
        colors: user.appearance?.colors || PUBLIC_PROFILE_DEFAULT_COLORS,
        customBackground: user.appearance?.customBackground,
        backgroundStyle: user.appearance?.backgroundStyle,
        linkLayout: user.appearance?.linkLayout || 'list',
        pageLayout: user.appearance?.pageLayout || 'default',
        profileImageLayout: user.appearance?.profileImageLayout || 'classic',
        buttonStyle: user.appearance?.buttonStyle || 'rounded',
        linkAnimation: user.appearance?.linkAnimation || 'fade',
        spacingMode: user.appearance?.spacingMode || 'comfortable',
        fontFamily: user.appearance?.fontFamily || 'inter',
        shadowIntensity: user.appearance?.shadowIntensity ?? 2,
        wallpaperMode: user.appearance?.wallpaperMode || 'colors',
      },
      links: sortedLinks.map((l: any) => ({
        id: l._id.toString(),
        title: l.title,
        url: l.url,
        image: l.image,
        keyword: l.keyword,
        type: l.type,
        parentId: l.parentId?.toString() || null,
        order: l.order,
        metadata: l.metadata,
        isExpanded: l.isExpanded,
        isActive: l.isActive !== false,
      })),
      socialIcons: user.profile?.socialIcons || [],
      activeAd: activeAd
        ? {
            id: activeAd._id.toString(),
            brand: activeAd.brand,
            campaignName: activeAd.campaignName,
            bannerImage: activeAd.bannerImage,
            clickUrl: activeAd.clickUrl,
            category: activeAd.category,
          }
        : null,
    };

    setCache(cacheKey, responseData);
    res.set('Cache-Control', 'public, max-age=30, s-maxage=120');
    return sendSuccess(res, responseData);
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).json({
      error: 'Unable to load profile at this time',
      details: process.env.NODE_ENV !== 'production' ? (err as Error).message : undefined,
    });
  }
});

// ── POST /api/public/click/:linkId ─────────────────────────────────────────
router.post('/click/:linkId', publicClickLimiter, async (req, res) => {
  try {
    const { linkId } = req.params;
    const { countryCode, countryName, sessionId } = req.body || {};

    if (!linkId || !linkId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid link ID format' });
    }

    const userAgent = req.get('user-agent') || '';
    const { deviceType, browser, os } = parseUserAgent(userAgent);
    const referrer = req.get('referer') || req.get('referrer') || '';
    const ipAddress = getClientIP(req);

    const link = await Link.findByIdAndUpdate(
      linkId,
      { $inc: { clicks: 1 } },
      { projection: { _id: 1, user: 1 } }
    );
    if (!link) return res.status(404).json({ error: 'Link not found' });

    res.json({ success: true });

    // Fire-and-forget click analytics
    LinkClick.create({
      link: link._id,
      user: link.user,
      countryCode: countryCode || 'US',
      countryName: countryName || 'United States',
      deviceType,
      browser,
      os,
      referrer,
      ipAddress,
      sessionId: sessionId || `${ipAddress}-${Date.now()}`,
    }).catch((err) => console.error('Click tracking error:', err));
  } catch (err) {
    console.error('Click recording error:', err);
    res.status(500).json({ error: 'Failed to record click' });
  }
});

// ── POST /api/public/track-impression ──────────────────────────────────────
router.post('/track-impression', publicClickLimiter, async (req, res) => {
  try {
    const {
      handle,
      eventType,
      deviceType: clientDeviceType,
      browser: clientBrowser,
      os: clientOs,
      timeSpent,
      sessionId,
      countryCode,
      countryName,
    } = req.body;

    const userAgent = req.get('user-agent') || '';
    const parsed = parseUserAgent(userAgent);
    const referrer = req.get('referer') || req.get('referrer') || '';
    const ipAddress = getClientIP(req);

    const finalDeviceType = clientDeviceType || parsed.deviceType;
    const finalBrowser = clientBrowser || parsed.browser;
    const finalOs = clientOs || parsed.os;

    res.json({ success: true });

    if (eventType === 'load' && handle) {
      User.findOne({ username: { $regex: new RegExp(`^${handle}$`, 'i') } })
        .select('_id username')
        .lean()
        .then((user) => {
          if (!user) return;
          ProfileView.create({
            user: user._id,
            username: user.username,
            countryCode: countryCode || 'US',
            countryName: countryName || 'United States',
            deviceType: finalDeviceType,
            browser: finalBrowser,
            os: finalOs,
            referrer,
            ipAddress,
            sessionId: sessionId || `${ipAddress}-${Date.now()}`,
            timeSpent: 0,
            linksViewed: 0,
            linksClicked: 0,
          }).catch((err) => console.error('Profile view error:', err));
        })
        .catch((err) => console.error('User lookup error:', err));
    }

    if (eventType === 'unload' && sessionId && timeSpent) {
      ProfileView.findOneAndUpdate(
        { sessionId, createdAt: { $gte: new Date(Date.now() - 3600000) } },
        { $set: { timeSpent } },
        { sort: { createdAt: -1 } }
      ).catch((err) => console.error('Profile view update error:', err));
    }
  } catch (err) {
    console.error('Track impression error:', err);
    res.status(500).json({
      error: 'Failed to track impression',
      details: process.env.NODE_ENV !== 'production' ? (err as Error).message : undefined,
    });
  }
});

// ── POST /api/public/ad/impression/:adId ───────────────────────────────────
router.post('/ad/impression/:adId', publicClickLimiter, async (req, res) => {
  try {
    const { adId } = req.params;
    if (!adId || !adId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid ad ID format' });
    }
    res.json({ success: true });
    Ad.findByIdAndUpdate(adId, { $inc: { impressions: 1 } }).catch((err) =>
      console.error('Ad impression tracking error:', err)
    );
  } catch (err) {
    console.error('Ad impression tracking error:', err);
    res.status(500).json({ error: 'Failed to track ad impression' });
  }
});

// ── POST /api/public/ad/click/:adId ────────────────────────────────────────
router.post('/ad/click/:adId', publicClickLimiter, async (req, res) => {
  try {
    const { adId } = req.params;
    if (!adId || !adId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid ad ID format' });
    }
    res.json({ success: true });
    Ad.findByIdAndUpdate(adId, { $inc: { clicks: 1 } }).catch((err) =>
      console.error('Ad click tracking error:', err)
    );
  } catch (err) {
    console.error('Ad click tracking error:', err);
    res.status(500).json({ error: 'Failed to track ad click' });
  }
});

// ── GET /api/public/:username/search ───────────────────────────────────────
router.get('/:username/search', publicSearchLimiter, async (req, res) => {
  try {
    const usernameRegex = new RegExp('^' + escapeRegExp(req.params.username) + '$', 'i');
    const user = await User.findOne({ username: usernameRegex });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const query = ((req.query.query as string) || '').trim().toLowerCase();
    if (!query) return res.json({ results: [] });

    const links = await Link.find({ user: user._id, isActive: true }).sort({ order: 1 });
    const results = links
      .filter((l: any) => {
        const title = (l.title || '').toLowerCase();
        const url = (l.url || '').toLowerCase();
        const keyword = (l.keyword || '').toLowerCase();
        return title.includes(query) || url.includes(query) || keyword.includes(query);
      })
      .map((l: any) => ({
        id: l._id.toString(),
        title: l.title,
        url: l.url,
        image: l.image,
        keyword: l.keyword,
        type: l.type,
        metadata: l.metadata,
      }));

    res.json({ results });
  } catch (err) {
    console.error('Public search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ── POST /api/public/leads ─────────────────────────────────────────────────
router.post('/leads', leadCaptureLimiter, async (req, res) => {
  try {
    const { linkId, name, email } = req.body;
    if (!linkId || !email) return res.status(400).json({ error: 'Link ID and email are required' });
    if (!linkId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid link ID format' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (email.length > 254) return res.status(400).json({ error: 'Email address is too long' });
    if (name && name.length > 100) return res.status(400).json({ error: 'Name must be 100 characters or less' });

    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
      return res.status(400).json({ error: 'Disposable email addresses are not allowed' });
    }

    const link = await Link.findById(linkId).select('_id user type');
    if (!link) return res.status(404).json({ error: 'Link not found' });

    if (link.type.toLowerCase() !== 'lead' && link.type.toLowerCase() !== 'email') {
      return res.status(400).json({ error: 'This link does not accept lead submissions' });
    }

    const existingLead = await Lead.findOne({ linkId: link._id, email: email.toLowerCase().trim() });
    if (existingLead) {
      return res.status(409).json({
        error: 'You have already submitted your email for this link',
        code: 'DUPLICATE_LEAD',
      });
    }

    await Lead.create({
      linkId: link._id,
      user: link.user,
      name: name?.trim() || '',
      email: email.toLowerCase().trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your information has been submitted successfully.',
    });
  } catch (err) {
    console.error('Lead capture error:', err);
    res.status(500).json({ error: 'Failed to submit your information. Please try again.' });
  }
});

export default router;
