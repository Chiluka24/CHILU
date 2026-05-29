// /api/links — full CRUD + bulk reorder. All routes require auth.

import { Router } from 'express';
import { Link } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { getCached, setCache, invalidateUserCache } from '../services/cache.service.js';
import { deleteOldFile } from '../services/upload.service.js';
import { sendSuccess } from '../utils/http.js';

const router = Router();
router.use(authenticateToken);

// Lazy import processBase64Image — depends on multer upload dir
import { processBase64Image } from '../services/upload.service.js';

// ── GET /api/links ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const user = (req as any).user;
  const cacheKey = `${user._id}:links`;

  const cached = getCached(cacheKey);
  if (cached) return sendSuccess(res, cached);

  const links = await Link.find({ user: user._id })
    .select('_id title url type parentId isActive order clicks image keyword metadata isExpanded')
    .sort({ order: 1 })
    .lean();

  const responseData = links.map((l: any) => ({
    ...l,
    id: l._id.toString(),
    parentId: l.parentId?.toString() || null,
  }));
  setCache(cacheKey, responseData);
  return sendSuccess(res, responseData);
});

// ── POST /api/links ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const user = (req as any).user;

    if (req.body.image && req.body.image.startsWith('data:')) {
      const result = processBase64Image(req.body.image, user._id.toString());
      if (result) req.body.image = result.url;
    }

    const lastLink = await Link.findOne({ user: user._id }).sort({ order: -1 });
    const newOrder = lastLink ? lastLink.order + 1 : 0;

    const newLink = await Link.create({
      ...req.body,
      user: user._id,
      order: newOrder,
      clicks: 0,
    });

    invalidateUserCache(user._id.toString());
    res.json({ ...newLink.toObject(), id: newLink._id.toString() });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// ── PUT /api/links/reorder/batch ──────────────────────────────────────────
// Important: this MUST be declared before PUT /:id so Express routes the static
// path correctly instead of treating "reorder" as an id.
router.put('/reorder/batch', async (req, res) => {
  try {
    const { updates } = req.body;
    const user = (req as any).user;
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Invalid updates format' });
    }

    const bulkOps = updates.map((update: any) => ({
      updateOne: {
        filter: { _id: update.id, user: user._id },
        update: { $set: { order: update.order, parentId: update.parentId || null } },
      },
    }));

    await Link.bulkWrite(bulkOps);
    invalidateUserCache(user._id.toString());
    res.json({ success: true });
  } catch (err) {
    console.error('Batch reorder error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── PUT /api/links/:id ─────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const user = (req as any).user;
    const { image } = req.body;

    // Ownership check
    const existingLink = await Link.findOne({ _id: req.params.id, user: user._id });
    if (!existingLink) return res.status(404).json({ error: 'Link not found or access denied' });

    if (image && image.startsWith('data:')) {
      if (existingLink.image) deleteOldFile(existingLink.image);
      const result = processBase64Image(image, user._id.toString());
      if (result) req.body.image = result.url;
    } else if (image !== undefined && existingLink.image && existingLink.image !== image) {
      deleteOldFile(existingLink.image);
    }

    const updated = await Link.findByIdAndUpdate(req.params.id, req.body, { new: true });
    invalidateUserCache(user._id.toString());
    res.json(updated ? { ...updated.toObject(), id: updated._id.toString() } : null);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// ── DELETE /api/links/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const user = (req as any).user;

    const link = await Link.findOne({ _id: req.params.id, user: user._id });
    if (!link) return res.status(404).json({ error: 'Link not found or access denied' });

    if (link.image) deleteOldFile(link.image);
    await Link.findByIdAndDelete(req.params.id);

    invalidateUserCache(user._id.toString());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
