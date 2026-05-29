// /api/auth/* — register, verify, resend, login, refresh, forgot, reset, logout.

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { AUTH_CONFIG, generateSecureToken } from '../config/auth-config.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
} from '../config/rate-limits.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from '../services/email.service.js';
import {
  logSecurityEvent,
  logAPIError,
  SecurityEventType,
  getClientIP,
} from '../middleware/security.js';
import { DEFAULT_APPEARANCE } from '../config/constants.js';

const router = Router();

// ── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { username: rawUsername, email, password } = req.body;
    const username = rawUsername?.toLowerCase();

    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.AUTH_SUCCESS,
      ip: getClientIP(req),
      userAgent: req.get('user-agent') || 'unknown',
      endpoint: req.path,
      method: req.method,
      email,
      username,
      message: 'Registration attempt',
    });

    if (!username || username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, hyphens, and underscores' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    if (!password || password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters` });
    }
    if (password.length > AUTH_CONFIG.PASSWORD_MAX_LENGTH) {
      return res.status(400).json({ error: 'Password is too long' });
    }
    if (AUTH_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
    }
    if (AUTH_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one lowercase letter' });
    }
    if (AUTH_CONFIG.PASSWORD_REQUIRE_NUMBER && !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number' });
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      return res.status(400).json({ error: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(AUTH_CONFIG.BCRYPT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    const emailVerificationToken = generateSecureToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
      emailVerified: !AUTH_CONFIG.EMAIL_VERIFICATION_REQUIRED,
      emailVerificationToken: AUTH_CONFIG.EMAIL_VERIFICATION_REQUIRED ? emailVerificationToken : undefined,
      emailVerificationExpires: AUTH_CONFIG.EMAIL_VERIFICATION_REQUIRED ? emailVerificationExpires : undefined,
      profile: { name: username, bio: '', avatar: '', instagramConnected: false },
      appearance: DEFAULT_APPEARANCE,
    });

    if (AUTH_CONFIG.EMAIL_VERIFICATION_REQUIRED) {
      await sendVerificationEmail(newUser.email, newUser.username, emailVerificationToken);
    }

    const accessToken = signAccessToken(newUser._id.toString());
    const refreshToken = signRefreshToken(newUser._id.toString());

    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.AUTH_SUCCESS,
      ip: getClientIP(req),
      userAgent: req.get('user-agent') || 'unknown',
      endpoint: req.path,
      method: req.method,
      userId: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      message: 'Registration successful',
    });

    res.json({
      token: accessToken,
      refreshToken,
      user: { username: newUser.username, email: newUser.email, emailVerified: newUser.emailVerified },
      message: AUTH_CONFIG.EMAIL_VERIFICATION_REQUIRED
        ? 'Registration successful. Please check your email to verify your account.'
        : 'Registration successful.',
    });
  } catch (err) {
    console.error('Registration error:', err);
    logAPIError(req, err as Error, 500);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/verify-email ────────────────────────────────────────────
router.post('/verify-email', emailVerificationLimiter, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Verification token is required' });

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired verification token' });

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.EMAIL_VERIFIED,
      ip: getClientIP(req),
      userAgent: req.get('user-agent') || 'unknown',
      endpoint: req.path,
      method: req.method,
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      message: 'Email verified successfully',
    });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error('Email verification error:', err);
    logAPIError(req, err as Error, 500);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// ── POST /api/auth/resend-verification ─────────────────────────────────────
router.post('/resend-verification', emailVerificationLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal account existence
      return res.json({ success: true, message: 'If the email exists, a verification link has been sent.' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const emailVerificationToken = generateSecureToken();
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.username, emailVerificationToken);
    res.json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: SecurityEventType.AUTH_FAILURE,
        ip: getClientIP(req),
        userAgent: req.get('user-agent') || 'unknown',
        endpoint: req.path,
        method: req.method,
        email,
        message: 'Invalid credentials',
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Account lockout check
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: SecurityEventType.ACCOUNT_LOCKED,
        ip: getClientIP(req),
        userAgent: req.get('user-agent') || 'unknown',
        endpoint: req.path,
        method: req.method,
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
        message: `Account locked, ${minutesLeft} minutes remaining`,
      });
      return res.status(423).json({ error: `Account locked. Try again in ${minutesLeft} minutes.` });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: SecurityEventType.ACCOUNT_LOCKED,
          ip: getClientIP(req),
          userAgent: req.get('user-agent') || 'unknown',
          endpoint: req.path,
          method: req.method,
          userId: user._id.toString(),
          email: user.email,
          username: user.username,
          message: 'Account locked after 5 failed attempts',
        });
        return res.status(423).json({ error: 'Account locked due to too many failed login attempts. Try again in 15 minutes.' });
      }
      await user.save();
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: SecurityEventType.AUTH_FAILURE,
        ip: getClientIP(req),
        userAgent: req.get('user-agent') || 'unknown',
        endpoint: req.path,
        method: req.method,
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
        message: `Failed login attempt ${user.failedLoginAttempts}/5`,
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (AUTH_CONFIG.EMAIL_VERIFICATION_REQUIRED && !user.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your email address before logging in',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.AUTH_SUCCESS,
      ip: getClientIP(req),
      userAgent: req.get('user-agent') || 'unknown',
      endpoint: req.path,
      method: req.method,
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      message: 'Login successful',
    });

    res.json({
      token: accessToken,
      refreshToken,
      user: { username: user.username, email: user.email, emailVerified: user.emailVerified },
    });
  } catch (err) {
    console.error('Login error:', err);
    logAPIError(req, err as Error, 500);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── POST /api/auth/refresh ─────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    const verified = verifyRefreshToken(refreshToken);
    if (!verified) return res.status(403).json({ error: 'Invalid or expired refresh token' });

    const user = await User.findById(verified.id).select('_id username email emailVerified');
    if (!user) return res.status(401).json({ error: 'Invalid refresh token' });

    res.json({ token: signAccessToken(user._id.toString()) });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
});

// ── POST /api/auth/forgot-password ─────────────────────────────────────────
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.PASSWORD_RESET_REQUEST,
      ip: getClientIP(req),
      userAgent: req.get('user-agent') || 'unknown',
      endpoint: req.path,
      method: req.method,
      email,
      userId: user?._id.toString(),
      username: user?.username,
      message: 'Password reset requested',
    });

    if (!user) {
      return res.json({ success: true, message: 'If the email exists, a password reset link has been sent.' });
    }

    const passwordResetToken = generateSecureToken();
    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(user.email, user.username, passwordResetToken);
    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    logAPIError(req, err as Error, 500);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// ── POST /api/auth/reset-password ──────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

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

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

    const salt = await bcrypt.genSalt(AUTH_CONFIG.BCRYPT_ROUNDS);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    await user.save();

    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.PASSWORD_CHANGED,
      ip: getClientIP(req),
      userAgent: req.get('user-agent') || 'unknown',
      endpoint: req.path,
      method: req.method,
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      message: 'Password reset completed',
    });

    await sendPasswordChangedEmail(user.email, user.username);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    logAPIError(req, err as Error, 500);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ── POST /api/auth/logout ──────────────────────────────────────────────────
router.post('/logout', async (_req, res) => {
  // Stateless JWT — logout is primarily client-side. Add token-blacklist if needed.
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
