// Honeypot endpoints — these look like admin paths but only bots ever hit them.
// Triggering one returns fake data and blocks the caller's IP for 24 hours.

import { Router } from 'express';
import { honeypotTrap } from '../middleware/bot-protection.js';

const router = Router();

router.get('/admin/users', honeypotTrap);
router.get('/internal/data', honeypotTrap);

export default router;
