// Bot detection: blocks abusive user agents and high-volume request patterns.
// (Was at root in the monolith: ./bot-protection.ts)

import express from 'express';
import { logSecurityEvent, getClientIP, SecurityEventType } from './security.js';

interface RequestPattern {
  count: number;
  firstSeen: number;
  lastSeen: number;
  endpoints: Set<string>;
  userAgents: Set<string>;
}

const requestPatterns = new Map<string, RequestPattern>();
const blockedIPs = new Map<string, number>();

// Sweep old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  const cutoff = now - 10 * 60 * 1000;

  for (const [ip, pattern] of requestPatterns.entries()) {
    if (pattern.lastSeen < cutoff) requestPatterns.delete(ip);
  }
  for (const [ip, unblockTime] of blockedIPs.entries()) {
    if (now > unblockTime) {
      blockedIPs.delete(ip);
      console.log(`🔓 Unblocked IP: ${ip}`);
    }
  }
}, 10 * 60 * 1000);

const suspiciousBotPatterns = [
  /curl/i, /wget/i, /python-requests/i, /scrapy/i, /selenium/i, /phantomjs/i,
  /headless/i, /bot(?!omation)/i, /crawler/i, /spider/i, /scraper/i,
  /axios/i, /node-fetch/i, /go-http-client/i, /java\//i, /okhttp/i, /apache-httpclient/i,
];

const legitimateBotPatterns = [
  /googlebot/i, /bingbot/i, /slackbot/i, /twitterbot/i, /facebookexternalhit/i,
  /linkedinbot/i, /whatsapp/i, /telegrambot/i, /discordbot/i,
];

const isSuspiciousBot = (ua: string): boolean => {
  if (legitimateBotPatterns.some((p) => p.test(ua))) return false;
  return suspiciousBotPatterns.some((p) => p.test(ua));
};

const hasBotyBehavior = (_ip: string, pattern: RequestPattern): boolean => {
  const now = Date.now();
  const timeWindow = now - pattern.firstSeen;
  const requestsPerSecond = pattern.count / (timeWindow / 1000);

  if (requestsPerSecond > 5) return true;
  if (pattern.count > 100 && timeWindow < 60 * 1000) return true;
  if (pattern.endpoints.size > 20 && timeWindow < 60 * 1000) return true;
  if (pattern.userAgents.size > 3) return true;
  return false;
};

export const botProtection = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const ip = getClientIP(req);
  const userAgent = req.get('user-agent') || 'unknown';
  const now = Date.now();

  // Allow auth routes through (users need them)
  if (req.path.startsWith('/api/auth/')) return next();

  // Already blocked?
  const unblockTime = blockedIPs.get(ip);
  if (unblockTime && now < unblockTime) {
    const minutesLeft = Math.ceil((unblockTime - now) / 60000);
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
      ip,
      userAgent,
      endpoint: req.path,
      method: req.method,
      message: `Blocked bot attempt - ${minutesLeft} minutes remaining`,
    });
    res.status(403).json({ error: 'Access denied. Automated access detected.', retryAfter: minutesLeft * 60 });
    return;
  }

  // Allow legitimate bots on public GET routes
  const isPublicReadRoute = req.path.startsWith('/api/public/') && req.method === 'GET';
  const isLegitimateBot = legitimateBotPatterns.some((p) => p.test(userAgent));
  if (isPublicReadRoute && isLegitimateBot) return next();

  // Block obviously-bot user agents on non-public routes
  if (isSuspiciousBot(userAgent) && !isPublicReadRoute) {
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
      ip,
      userAgent,
      endpoint: req.path,
      method: req.method,
      message: 'Suspicious bot user agent detected',
    });
    blockedIPs.set(ip, now + 60 * 60 * 1000); // 1 hour
    res.status(403).json({ error: 'Automated access is not allowed.' });
    return;
  }

  // Track request pattern
  let pattern = requestPatterns.get(ip);
  if (!pattern) {
    pattern = { count: 0, firstSeen: now, lastSeen: now, endpoints: new Set(), userAgents: new Set() };
    requestPatterns.set(ip, pattern);
  }
  pattern.count++;
  pattern.lastSeen = now;
  pattern.endpoints.add(req.path);
  pattern.userAgents.add(userAgent);

  // Detect bot-like behavior
  if (hasBotyBehavior(ip, pattern)) {
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
      ip,
      userAgent,
      endpoint: req.path,
      method: req.method,
      message: `Bot-like behavior: ${pattern.count} requests, ${pattern.endpoints.size} endpoints`,
      metadata: {
        requestCount: pattern.count,
        endpointCount: pattern.endpoints.size,
        userAgentCount: pattern.userAgents.size,
        timeWindow: now - pattern.firstSeen,
      },
    });
    blockedIPs.set(ip, now + 30 * 60 * 1000); // 30 min
    res.status(429).json({ error: 'Too many requests. Automated behavior detected.', retryAfter: 1800 });
    return;
  }

  next();
};

// Honeypot — returns fake data to waste a bot's time and blocks them for 24h.
export const honeypotTrap = (req: express.Request, res: express.Response): void => {
  const ip = getClientIP(req);
  const userAgent = req.get('user-agent') || 'unknown';

  logSecurityEvent({
    timestamp: new Date().toISOString(),
    eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
    ip,
    userAgent,
    endpoint: req.path,
    method: req.method,
    message: 'Honeypot triggered - bot detected',
  });

  blockedIPs.set(ip, Date.now() + 24 * 60 * 60 * 1000);

  res.status(200).json({
    success: true,
    data: Array(100).fill(null).map((_, i) => ({
      id: `fake-${i}`,
      title: `Fake Link ${i}`,
      url: `https://example.com/fake-${i}`,
    })),
  });
};

// Placeholder — wire to reCAPTCHA / Turnstile when ready.
export const captchaVerification = (
  _req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  next();
};

export const shouldChallenge = (ip: string): boolean => {
  const pattern = requestPatterns.get(ip);
  if (!pattern) return false;
  const timeWindow = Date.now() - pattern.firstSeen;
  const requestsPerMinute = (pattern.count / (timeWindow / 1000)) * 60;
  return requestsPerMinute > 30;
};

export const getBotStats = () => ({
  trackedIPs: requestPatterns.size,
  blockedIPs: blockedIPs.size,
  patterns: Array.from(requestPatterns.entries()).map(([ip, p]) => ({
    ip,
    requests: p.count,
    endpoints: p.endpoints.size,
    userAgents: p.userAgents.size,
    duration: Date.now() - p.firstSeen,
  })),
});
