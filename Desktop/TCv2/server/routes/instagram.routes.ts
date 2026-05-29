// /api/instagram/* — auth-required Meta/IG account connection endpoints.

import { Router } from 'express';
import { User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { encryptToken } from '../config/auth-config.js';
import { env } from '../config/env.js';

const router = Router();
router.use(authenticateToken);

// ── POST /api/instagram/connect ────────────────────────────────────────────
router.post('/connect', async (req, res) => {
  try {
    const user = (req as any).user;
    const { ig_user_id, username, page_token } = req.body;

    if (!ig_user_id || !username || !page_token) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const encryptedToken = encryptToken(page_token, env.ENCRYPTION_KEY);

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          'profile.instagramConnected': true,
          'profile.instagramHandle': `@${username}`,
          'profile.instagramAccountId': ig_user_id,
          'profile.instagramAccessToken': encryptedToken,
        },
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, message: 'Instagram account successfully connected' });
  } catch (err) {
    console.error('Instagram connect error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
