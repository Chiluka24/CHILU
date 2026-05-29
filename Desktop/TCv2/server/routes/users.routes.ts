// /api/user — GET, PUT (profile/appearance), PUT password, DELETE account.
// All routes here require auth (router-level middleware).

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User, Link, LinkClick, Lead, Automation, Ad } from '../models/index.js';
import { authenticateToken, invalidateAuthCache } from '../middleware/auth.js';
import { profileUpdateLimiter } from '../config/rate-limits.js';
import { AUTH_CONFIG } from '../config/auth-config.js';
import { sendPasswordChangedEmail } from '../services/email.service.js';
import { getCached, setCache, invalidateUserCache } from '../services/cache.service.js';
import { deleteOldFile } from '../services/upload.service.js';
import {
  logSecurityEvent,
  logAPIError,
  SecurityEventType,
  getClientIP,
} from '../middleware/security.js';
import { sendSuccess } from '../utils/http.js';

const router = Router();
router.use(authenticateToken);

// ── GET /api/user ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user || !user._id) return res.status(401).json({ error: 'User not authenticated' });

    const cacheKey = `${user._id}:user`;
    const cached = getCached(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'private, max-age=10');
      return res.json(cached);
    }

    const currentUser: any = await User.findById(user._id)
      .select('username email profile appearance monetizationApproved createdAt')
      .lean();
    if (!currentUser) return res.status(401).json({ error: 'User not found' });

    const responseData = {
      username: currentUser.username,
      email: currentUser.email,
      profile: currentUser.profile,
      appearance: currentUser.appearance,
      monetizationApproved: currentUser.monetizationApproved || false,
      createdAt: currentUser.createdAt,
    };

    setCache(cacheKey, responseData);
    res.set('Cache-Control', 'private, max-age=10');
    return sendSuccess(res, responseData);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: (err as Error).message || 'Failed to fetch user data' });
  }
});

// ── PUT /api/user ─────────────────────────────────────────────────────────
router.put('/', profileUpdateLimiter, async (req, res) => {
  try {
    const user = (req as any).user;
    const { username, email, profile, appearance, monetizationApproved } = req.body;

    // Username
    if (username && username !== user.username) {
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, hyphens, and underscores' });
      }
      if (await User.findOne({ username: username.toLowerCase() })) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Email
    if (email && email !== user.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Profile field validation
    if (profile) {
      if (profile.phoneNumber !== undefined && profile.phoneNumber) {
        if (!/^[\d\s\-\+\(\)]+$/.test(profile.phoneNumber)) {
          return res.status(400).json({ error: 'Invalid phone number format' });
        }
        if (profile.phoneNumber.replace(/\D/g, '').length < 10) {
          return res.status(400).json({ error: 'Phone number must be at least 10 digits' });
        }
      }
      if (profile.dateOfBirth !== undefined && profile.dateOfBirth) {
        const dob = new Date(profile.dateOfBirth);
        if (isNaN(dob.getTime())) return res.status(400).json({ error: 'Invalid date of birth format' });
        const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (age < 13) return res.status(400).json({ error: 'You must be at least 13 years old to use this service' });
        if (age > 120) return res.status(400).json({ error: 'Invalid date of birth' });
      }
      if (profile.website !== undefined && profile.website) {
        try { new URL(profile.website); } catch { return res.status(400).json({ error: 'Invalid website URL format' }); }
      }
      if (profile.socialProfiles) {
        for (const [platform, url] of Object.entries(profile.socialProfiles)) {
          if (url && typeof url === 'string') {
            try { new URL(url); } catch { return res.status(400).json({ error: `Invalid ${platform} URL format` }); }
          }
        }
      }
      if (profile.bio !== undefined && profile.bio.length > 500) {
        return res.status(400).json({ error: 'Bio must be 500 characters or less' });
      }
      if (profile.name !== undefined && profile.name.length > 100) {
        return res.status(400).json({ error: 'Name must be 100 characters or less' });
      }
    }

    // Old file cleanup (avatar / customBackground)
    if (profile && profile.avatar !== undefined && user.profile?.avatar && profile.avatar !== user.profile.avatar) {
      deleteOldFile(user.profile.avatar);
    }
    if (appearance && appearance.customBackground !== undefined && user.appearance?.customBackground && appearance.customBackground !== user.appearance.customBackground) {
      deleteOldFile(user.appearance.customBackground);
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          ...(username && { username: username.toLowerCase() }),
          ...(email && { email: email.toLowerCase() }),
          ...(monetizationApproved !== undefined && { monetizationApproved }),
          ...(profile && {
            ...(profile.name !== undefined && { 'profile.name': profile.name }),
            ...(profile.bio !== undefined && { 'profile.bio': profile.bio }),
            ...(profile.avatar !== undefined && { 'profile.avatar': profile.avatar }),
            ...(profile.socialIcons !== undefined && { 'profile.socialIcons': profile.socialIcons }),
            ...(profile.instagramConnected !== undefined && { 'profile.instagramConnected': profile.instagramConnected }),
            ...(profile.instagramHandle !== undefined && { 'profile.instagramHandle': profile.instagramHandle }),
            ...(profile.phoneNumber !== undefined && { 'profile.phoneNumber': profile.phoneNumber }),
            ...(profile.phoneCountryCode !== undefined && { 'profile.phoneCountryCode': profile.phoneCountryCode }),
            ...(profile.dateOfBirth !== undefined && { 'profile.dateOfBirth': profile.dateOfBirth }),
            ...(profile.gender !== undefined && { 'profile.gender': profile.gender }),
            ...(profile.location !== undefined && { 'profile.location': profile.location }),
            ...(profile.careerStatus !== undefined && { 'profile.careerStatus': profile.careerStatus }),
            ...(profile.industry !== undefined && { 'profile.industry': profile.industry }),
            ...(profile.website !== undefined && { 'profile.website': profile.website }),
            ...(profile.socialProfiles !== undefined && { 'profile.socialProfiles': profile.socialProfiles }),
          }),
          ...(appearance && Object.keys(appearance).reduce((acc: any, key) => {
            acc[`appearance.${key}`] = appearance[key];
            return acc;
          }, {})),
        },
      },
      { new: true }
    );

    invalidateAuthCache(user._id.toString());
    invalidateUserCache(user._id.toString());

    res.json({
      username: updatedUser?.username,
      email: updatedUser?.email,
      profile: updatedUser?.profile,
      appearance: updatedUser?.appearance,
      monetizationApproved: updatedUser?.monetizationApproved || false,
    });
  } catch (err) {
    console.error('Update user error:', err);
    logAPIError(req, err as Error, 500);
    res.status(500).json({ error: 'Failed to update profile. Please try again.' });
  }
});

// ── PUT /api/user/password ─────────────────────────────────────────────────
router.put('/password', profileUpdateLimiter, async (req, res) => {
  try {
    const user = (req as any).user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters` });
    }
    if (newPassword.length > AUTH_CONFIG.PASSWORD_MAX_LENGTH) {
      return res.status(400).json({ error: 'Password is too long' });
    }
    if (AUTH_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
    }
    if (AUTH_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one lowercase letter' });
    }
    if (AUTH_CONFIG.PASSWORD_REQUIRE_NUMBER && !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one number' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    const fullUser = await User.findById(user._id);
    if (!fullUser || !fullUser.passwordHash) {
      return res.status(400).json({ error: 'User not found or no password set' });
    }

    const isMatch = await bcrypt.compare(currentPassword, fullUser.passwordHash);
    if (!isMatch) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: SecurityEventType.PASSWORD_CHANGE_FAILED,
        ip: getClientIP(req),
        userAgent: req.get('user-agent') || 'unknown',
        endpoint: req.path,
        method: req.method,
        userId: user._id.toString(),
        email: fullUser.email,
        username: fullUser.username,
        message: 'Incorrect current password provided',
      });
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(AUTH_CONFIG.BCRYPT_ROUNDS);
    fullUser.passwordHash = await bcrypt.hash(newPassword, salt);
    await fullUser.save();

    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.PASSWORD_CHANGED,
      ip: getClientIP(req),
      userAgent: req.get('user-agent') || 'unknown',
      endpoint: req.path,
      method: req.method,
      userId: user._id.toString(),
      email: fullUser.email,
      username: fullUser.username,
      message: 'Password changed successfully from settings',
    });

    try {
      await sendPasswordChangedEmail(fullUser.email, fullUser.username);
    } catch (emailErr) {
      console.error('Failed to send password change email:', emailErr);
    }

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    logAPIError(req, err as Error, 500);
    res.status(500).json({ error: 'Failed to change password. Please try again.' });
  }
});

// ── DELETE /api/user (full account delete + cascade cleanup) ───────────────
router.delete('/', async (req, res) => {
  try {
    const user = (req as any).user;

    // Clean up files referenced from the user doc
    const fullUser = await User.findById(user._id);
    if (fullUser) {
      if (fullUser.profile?.avatar) deleteOldFile(fullUser.profile.avatar);
      if (fullUser.appearance?.customBackground) deleteOldFile(fullUser.appearance.customBackground);
    }

    // Clean up link images
    const links = await Link.find({ user: user._id });
    links.forEach((link) => {
      if (link.image) deleteOldFile(link.image);
    });

    await Promise.all([
      Link.deleteMany({ user: user._id }),
      LinkClick.deleteMany({ user: user._id }),
      Lead.deleteMany({ user: user._id }),
      Automation.deleteMany({ user: user._id }),
      Ad.deleteMany({ user: user._id }),
    ]);

    await User.findByIdAndDelete(user._id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
