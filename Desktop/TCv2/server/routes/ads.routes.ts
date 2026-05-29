// /api/ads — auth-required ad endpoints. Only the active-ads reader currently exists.

import { Router } from 'express';
import { Ad } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { getCached, setCache } from '../services/cache.service.js';
import { sendSuccess } from '../utils/http.js';

const router = Router();
router.use(authenticateToken);

// ── GET /api/ads/active ────────────────────────────────────────────────────
router.get('/active', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user || !user._id) return res.status(401).json({ error: 'User not authenticated' });

    const cacheKey = `${user._id}:ads:active`;
    const cached = getCached(cacheKey);
    if (cached) return sendSuccess(res, cached);

    const now = new Date();
    const activeAds = await Ad.find({
      user: user._id,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();

    const responseData = activeAds.map((ad: any) => ({
      id: ad._id.toString(),
      brand: ad.brand,
      campaignName: ad.campaignName,
      category: ad.category,
      bannerImage: ad.bannerImage,
      startDate: ad.startDate,
      endDate: ad.endDate,
      impressions: ad.impressions,
      clicks: ad.clicks,
      status: ad.status,
    }));

    setCache(cacheKey, responseData);
    return sendSuccess(res, responseData);
  } catch (err) {
    console.error('/api/ads/active error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
