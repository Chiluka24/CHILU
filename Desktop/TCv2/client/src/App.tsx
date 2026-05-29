/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Top-level routing. Pages are grouped by feature folder under `pages/`,
 * and route guards live in `components/routing/`.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { ErrorBoundary } from './components/routing/ErrorBoundary';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicRoute from './components/routing/PublicRoute';

// ── Lazy-loaded pages (code splitting) ─────────────────────────────────────
// Each `import(...)` is captured as a factory so we can also call it during
// idle time to warm the module cache — that's what makes navigation feel
// instant (the chunk is already in memory by the time the user clicks).
const loadDashboard           = () => import('./pages/dashboard/Dashboard');
const loadLinksDesigns        = () => import('./pages/links/LinksDesigns');
const loadAnalytics           = () => import('./pages/analytics/Analytics');
const loadMonetizationPayouts = () => import('./pages/monetization/MonetizationPayouts');
const loadCampaigns           = () => import('./pages/monetization/Campaigns');
const loadPayouts             = () => import('./pages/monetization/Payouts');
const loadAutomation          = () => import('./pages/automation/Automation');
const loadSettings            = () => import('./pages/settings/Settings');
const loadMyProfile           = () => import('./pages/profile/MyProfile');
const loadHelpSupport         = () => import('./pages/help/HelpSupport');

const Dashboard           = lazy(loadDashboard);
const LinksDesigns        = lazy(loadLinksDesigns);
const Analytics           = lazy(loadAnalytics);
const MonetizationPayouts = lazy(loadMonetizationPayouts);
const Campaigns           = lazy(loadCampaigns);
const Payouts             = lazy(loadPayouts);
const Automation          = lazy(loadAutomation);
const Settings            = lazy(loadSettings);
const MyProfile           = lazy(loadMyProfile);
const HelpSupport         = lazy(loadHelpSupport);
const Login               = lazy(() => import('./pages/auth/Login'));
const Register            = lazy(() => import('./pages/auth/Register'));
const ForgotPassword      = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword       = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail         = lazy(() => import('./pages/auth/VerifyEmail'));
const PublicProfile       = lazy(() => import('./pages/public/PublicProfile'));

/**
 * Prefetch every authenticated route chunk during browser idle time so that
 * subsequent navigations don't pay the per-chunk download cost. The first
 * page the user lands on still loads on-demand (no waste), but every
 * follow-up click is instant.
 */
const APP_ROUTE_LOADERS = [
  loadDashboard,
  loadLinksDesigns,
  loadAnalytics,
  loadMonetizationPayouts,
  loadCampaigns,
  loadPayouts,
  loadAutomation,
  loadSettings,
  loadMyProfile,
  loadHelpSupport,
];

function usePrefetchAuthenticatedRoutes() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Skip on slow / data-saver connections so we don't burn the user's data.
    const conn = (navigator as any).connection;
    if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ''))) return;

    const ric: (cb: () => void) => number =
      (window as any).requestIdleCallback ||
      ((cb: () => void) => window.setTimeout(cb, 1500));

    const handles = APP_ROUTE_LOADERS.map((load, idx) =>
      ric(() => {
        // Stagger so we don't slam the network with 10 chunk requests at once.
        window.setTimeout(() => load().catch(() => {}), idx * 120);
      }),
    );

    return () => {
      const cancel: (h: number) => void =
        (window as any).cancelIdleCallback || window.clearTimeout;
      handles.forEach(cancel);
    };
  }, []);
}

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
  </div>
);

export default function App() {
  usePrefetchAuthenticatedRoutes();
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public profile pages (no auth required) */}
            <Route path="/:username"   element={<PublicProfile />} />
            <Route path="/p/:username" element={<PublicProfile />} />

            {/* Auth pages — bounced to /dashboard if already logged in */}
            <Route element={<PublicRoute />}>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Password reset & email verification (stateless, public) */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password"  element={<ResetPassword />} />
            <Route path="/verify-email"    element={<VerifyEmail />} />

            {/* Protected / authenticated app */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard"             element={<Dashboard />} />
                <Route path="links/*"               element={<LinksDesigns />} />
                <Route path="analytics"             element={<Analytics />} />
                <Route path="monetization"          element={<MonetizationPayouts />} />
                <Route path="monetization/campaigns" element={<Campaigns />} />
                <Route path="monetization/payouts"   element={<Payouts />} />
                <Route path="automation"            element={<Automation />} />
                <Route path="profile"               element={<MyProfile />} />
                <Route path="settings"              element={<Settings />} />
                <Route path="help"                  element={<HelpSupport />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
