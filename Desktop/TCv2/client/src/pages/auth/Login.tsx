import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { API_BASE } from '../../config/env';
import { validateEmail } from '../../lib/validation';
import { sessionManager } from '../../lib/sessionManager';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const response = await res.json();
      const data = response.data || response;

      if (!res.ok) {
        // Check if error is due to unverified email
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setShowResendVerification(true);
        }
        throw new Error(typeof data.error === 'string'
    ? data.error
    : data.error?.message ||
      data.message ||
      'Login failed'
    );
      }

      localStorage.setItem('token', data.token);
      sessionManager.setSession(data.token, data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      
      if (res.ok) {
        setResendSuccess(true);
        setError('');
      }
    } catch (err) {
      console.error('Resend verification error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left side — Branding panel (hidden on mobile) */}
      <div className="hidden md:flex md:w-[360px] lg:w-[480px] xl:w-[520px] flex-col justify-between p-8 lg:p-12 relative overflow-hidden" style={{ background: '#4A3429' }}>
        <div className="relative z-10">
          <h2 className="text-[28px] font-bold tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>The Crumb</h2>
          <p className="text-[15px] text-white/50 mt-1 font-medium">Your link-in-bio platform</p>
        </div>
        <div className="relative z-10">
          <p className="text-[22px] font-semibold text-white leading-snug tracking-tight">
            One page to rule<br />all your links.
          </p>
          <p className="text-[14px] text-white/40 mt-4 leading-relaxed max-w-sm">
            Join thousands of creators sharing their content, products, and social profiles from a single, beautiful page.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-[12px] text-white/30">© 2026 The Crumb. All rights reserved.</p>
        </div>
        {/* Decorative gradient orb */}
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 -left-20 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Right side — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10" style={{ background: '#FAFAFA' }}>
        <div className="w-full max-w-[400px]">
          {/* Mobile brand */}
          <div className="md:hidden mb-10 text-center">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: '#3E2723', fontFamily: "'Playfair Display', serif" }}>The Crumb</h2>
          </div>

          <div className="mb-8">
            <h1 className="text-[26px] font-bold tracking-tight" style={{ color: '#3E2723' }}>Welcome back</h1>
            <p className="text-[15px] mt-2" style={{ color: '#8D6E63' }}>Sign in to your account to continue.</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#DC2626' }} />
              <div className="flex-1">
                <span className="text-[13px] font-medium" style={{ color: '#DC2626' }}>{error}</span>
                {showResendVerification && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="text-[12px] font-semibold underline"
                      style={{ color: '#DC2626' }}
                    >
                      {resendLoading ? 'Sending...' : 'Resend verification email'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#10B981' }} />
              <span className="text-[13px] font-medium" style={{ color: '#10B981' }}>Verification email sent! Check your inbox.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold mb-2" style={{ color: '#3F3F46' }}>Email address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg text-[15px] outline-none transition-all"
                style={{
                  background: '#FFFFFF',
                  border: fieldErrors.email ? '1.5px solid #FCA5A5' : '1.5px solid #E0E0E0',
                  color: '#3E2723',
                }}
                onFocus={(e) => e.target.style.borderColor = fieldErrors.email ? '#FCA5A5' : '#CD853F'}
                onBlur={(e) => {
                  e.target.style.borderColor = fieldErrors.email ? '#FCA5A5' : '#E0E0E0';
                  const validation = validateEmail(formData.email);
                  if (!validation.isValid) {
                    setFieldErrors({ ...fieldErrors, email: validation.error });
                  }
                }}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setFieldErrors({ ...fieldErrors, email: undefined });
                  setError('');
                }}
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3 h-3" style={{ color: '#DC2626' }} />
                  <span className="text-[12px] font-medium" style={{ color: '#DC2626' }}>{fieldErrors.email}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-2" style={{ color: '#3F3F46' }}>Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg text-[15px] outline-none transition-all"
                style={{
                  background: '#FFFFFF',
                  border: fieldErrors.password ? '1.5px solid #FCA5A5' : '1.5px solid #E0E0E0',
                  color: '#3E2723',
                }}
                onFocus={(e) => e.target.style.borderColor = fieldErrors.password ? '#FCA5A5' : '#CD853F'}
                onBlur={(e) => e.target.style.borderColor = fieldErrors.password ? '#FCA5A5' : '#E0E0E0'}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setFieldErrors({ ...fieldErrors, password: undefined });
                  setError('');
                }}
                placeholder="••••••••"
              />
              {fieldErrors.password && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3 h-3" style={{ color: '#DC2626' }} />
                  <span className="text-[12px] font-medium" style={{ color: '#DC2626' }}>{fieldErrors.password}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mb-5">
              <div></div>
              <Link to="/forgot-password" className="text-[13px] font-semibold transition-colors" style={{ color: '#4A3429' }}>
                Forgot password?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#4A3429', color: '#FFFFFF' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#3E2723'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#4A3429'}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-[14px]" style={{ color: '#8D6E63' }}>Don't have an account? </span>
            <Link to="/register" className="text-[14px] font-semibold transition-colors" style={{ color: '#4A3429' }}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
