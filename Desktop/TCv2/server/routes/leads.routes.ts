// /api/leads — auth-required leads read/delete (public submit is in public.routes.ts).

import { Router } from 'express';
import { Lead } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// ── GET /api/leads ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const user = (req as any).user;
    // Safety: cap returned leads to 50 to prevent massive payloads.
    const leads = await Lead.find({ user: user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(leads.map((l) => ({ ...l.toObject(), id: l._id.toString() })));
  } catch (err) {
    console.error('Fetch leads error:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// ── DELETE /api/leads/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const user = (req as any).user;
    await Lead.findOneAndDelete({ _id: req.params.id, user: user._id });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete lead error:', err);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

export default router;
