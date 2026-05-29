// Meta / Instagram webhook endpoints (GET verify + POST event).
// The POST handler also accepts dashboard test payloads with a Bearer token.

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User, Automation, Link } from '../models/index.js';
import { env } from '../config/env.js';
import { decryptToken } from '../config/auth-config.js';
import { webhookLimiter } from '../config/rate-limits.js';

const router = Router();

// ── GET /api/webhooks/instagram (Meta verification) ────────────────────────
router.get('/instagram', (req, res) => {
  const VERIFY_TOKEN = env.META_VERIFY_TOKEN || 'crumb_meta_secret_123';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Meta Webhook Verified!');
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }
  res.status(400).send('Missing parameters');
});

// ── POST /api/webhooks/instagram (live event OR dashboard test) ────────────
router.post('/instagram', webhookLimiter, async (req, res) => {
  try {
    let commentText = '';
    let followerHandle = '';
    let searchHandle = '';
    let isMetaWebhook = false;
    let igAccountId = '';
    let commentId = '';
    let postId = '';

    // 1) Real Meta payload vs Dashboard test
    if (req.body.object === 'instagram') {
      isMetaWebhook = true;
      res.status(200).send('EVENT_RECEIVED'); // Meta needs 200 immediately

      const entry = req.body.entry?.[0];
      const change = entry?.changes?.[0];
      if (change?.field !== 'comments') return;

      commentText = change.value.text;
      followerHandle = change.value.from?.username || 'follower';
      igAccountId = entry.id;
      commentId = change.value.id;
      postId = change.value.media?.id || '';
    } else {
      const { instagramHandle, commentText: ct, followerHandle: fh, postId: pid } = req.body;
      if (!instagramHandle || !ct) return res.status(400).json({ error: 'Missing required fields' });
      commentText = ct;
      followerHandle = fh || 'test_follower';
      searchHandle = instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`;
      postId = pid || '';
    }

    // 2) Resolve owner user
    let user: any;
    if (!isMetaWebhook) {
      // Dashboard test — try token first
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const decoded = jwt.verify(authHeader.split(' ')[1], env.JWT_SECRET) as { id: string };
          user = await User.findById(decoded.id);
        } catch {
          /* ignore */
        }
      }
      if (!user) {
        const cleanHandle = searchHandle.replace('@', '');
        user = await User.findOne({
          'profile.instagramHandle': { $regex: new RegExp(`^@?${cleanHandle}$`, 'i') },
        });
      }
    } else {
      user = await User.findOne({ 'profile.instagramAccountId': igAccountId });
      console.log(`🔔 [META WEBHOOK] Comment from @${followerHandle}: "${commentText}"`);
      if (!user) {
        console.error(`User not found for igAccountId: ${igAccountId}`);
        return;
      }
    }

    if (!user && !isMetaWebhook) {
      return res.status(404).json({ error: 'User not found or Instagram not connected' });
    }

    // 3) Find matching automation
    const automations = await Automation.find({ user: user._id, isActive: true });
    let matchedAutomation: any = null;
    let fallbackAutomation: any = null;

    for (const auto of automations) {
      if (auto.keyword && commentText.toUpperCase().includes(auto.keyword.trim().toUpperCase())) {
        if (auto.postId && auto.postId === postId) {
          matchedAutomation = auto;
          break;
        } else if (!auto.postId) {
          fallbackAutomation = auto;
        }
      }
    }
    if (!matchedAutomation) matchedAutomation = fallbackAutomation;

    if (!matchedAutomation) {
      const availableKeywords = automations.map((a) => `"${a.keyword || 'NO_KEYWORD_SAVED'}"`).join(', ');
      if (!isMetaWebhook) {
        return res.json({
          success: true,
          message: `No match found.\n\nComment Simulated: "${commentText}"\nActive DB Keywords: [${availableKeywords}]`,
        });
      }
      return;
    }

    // 4) Build the DM
    const link = await Link.findById(matchedAutomation.linkId);
    const linkUrl = link ? link.url : 'https://thecrumb.co';
    const finalMessage = `${matchedAutomation.message} ${linkUrl}`;

    console.log(`🚀 [INSTAGRAM DM] From: ${searchHandle || igAccountId} → @${followerHandle}`);
    console.log(`   "${finalMessage}"`);

    // 5) Real Meta API call (only when this came from a Meta webhook)
    if (isMetaWebhook && user.profile.instagramAccessToken) {
      try {
        const decryptedToken = decryptToken(user.profile.instagramAccessToken, env.ENCRYPTION_KEY);
        const fbRes = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${decryptedToken}`,
          },
          body: JSON.stringify({
            recipient: { comment_id: commentId },
            message: { text: finalMessage },
          }),
        });
        const fbData: any = await fbRes.json();
        if (fbData.error) console.error('Meta API Error:', fbData.error);
        else console.log('✅ DM sent via Meta API');
      } catch (fbErr) {
        console.error('Meta API call failed:', fbErr);
      }
    }

    // 6) Track DM count
    await Automation.findByIdAndUpdate(matchedAutomation._id, { $inc: { dmsSent: 1 } });

    if (!isMetaWebhook) {
      res.json({ success: true, message: 'DM sent successfully', sentMessage: finalMessage });
    }
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
