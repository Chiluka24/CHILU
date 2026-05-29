// /api/automations — auth-required CRUD for Instagram keyword-DM automations.

import { Router } from 'express';
import { Automation } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { automationLimiter } from '../config/rate-limits.js';

const router = Router();
router.use(authenticateToken);
router.use(automationLimiter);

// ── GET /api/automations ───────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const user = (req as any).user;
    const automations = await Automation.find({ user: user._id }).lean();
    res.json(automations.map((a: any) => ({ ...a, id: a._id.toString() })));
  } catch (err) {
    console.error('Fetch automations error:', err);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
});

// ── POST /api/automations ──────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const user = (req as any).user;
    const newAutomation = await Automation.create({ ...req.body, user: user._id });
    res.json({ ...newAutomation.toObject(), id: newAutomation._id.toString() });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// ── PUT /api/automations/:id ───────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const user = (req as any).user;
    const automation = await Automation.findOne({ _id: req.params.id, user: user._id });
    if (!automation) return res.status(404).json({ error: 'Automation not found or access denied' });

    const updated = await Automation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// ── DELETE /api/automations/:id ────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const user = (req as any).user;
    const result = await Automation.findOneAndDelete({ _id: req.params.id, user: user._id });
    if (!result) return res.status(404).json({ error: 'Automation not found or access denied' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete automation error:', err);
    res.status(500).json({ error: 'Failed to delete automation' });
  }
});

export default router;
