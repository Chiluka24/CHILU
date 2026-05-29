import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { API_BASE } from '../../config/env';
import { validateEmail, validatePassword, validateUsername } from '../../lib/validation';
import { sessionManager } from '../../lib/sessionManager';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  };

  const validateForm = (): boolean => {
    const errors: { username?: string; email?: string; password?: string } = {};
    
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.error;
    }
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error;
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
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const response = await res.json();
      const data = response.data || response;

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('token', data.token);
      sessionManager.setSession(data.token, data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = {
    weak: '#EF4444',
    medium: '#F59E0B',
    strong: '#10B981',
  };

  const inputStyle = (hasError?: boolean) => ({
    background: '#FFFFFF',
    border: hasError ? '1.5px solid #FCA5A5' : '1.5px solid #E0E0E0',
    color: '#3E2723',
  });

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left side — Branding */}
      <div className="hidden md:flex md:w-[360px] lg:w-[480px] xl:w-[520px] flex-col justify-between p-8 lg:p-12 relative overflow-hidden" style={{ background: '#4A3429' }}>
        <div className="relative z-10">
          <h2 className="text-[28px] font-bold tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>The Crumb</h2>
          <p className="text-[15px] text-white/50 mt-1 font-medium">Your link-in-bio platform</p>
        </div>
        <div className="relative z-10">
          <p className="text-[22px] font-semibold text-white leading-snug tracking-tight">
            Build your page<br />in minutes.
          </p>
          <p className="text-[14px] text-white/40 mt-4 leading-relaxed max-w-sm">
            Create a stunning bio page, share links, and grow your audience — all from one place.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-[12px] text-white/30">© 2026 The Crumb. All rights reserved.</p>
        </div>
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
            <h1 className="text-[26px] font-bold tracking-tight" style={{ color: '#3E2723' }}>Create your account</h1>
            <p className="text-[15px] mt-2" style={{ color: '#8D6E63' }}>Get started with your free page today.</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#DC2626' }} />
              <span className="text-[13px] font-medium" style={{ color: '#DC2626' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold mb-2" style={{ color: '#3F3F46' }}>Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg text-[15px] outline-none transition-all"
                style={inputStyle(!!fieldErrors.username)}
                onFocus={(e) => e.target.style.borderColor = fieldErrors.username ? '#FCA5A5' : '#CD853F'}
                onBlur={(e) => {
                  e.target.style.borderColor = fieldErrors.username ? '#FCA5A5' : '#E0E0E0';
                  const validation = validateUsername(formData.username);
                  if (!validation.isValid) {
                    setFieldErrors({ ...fieldErrors, username: validation.error });
                  }
                }}
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  setFieldErrors({ ...fieldErrors, username: undefined });
                }}
                placeholder="johndoe"
              />
              {fieldErrors.username ? (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3 h-3" style={{ color: '#DC2626' }} />
                  <span className="text-[12px] font-medium" style={{ color: '#DC2626' }}>{fieldErrors.username}</span>
                </div>
              ) : (
                <p className="text-[12px] mt-1.5" style={{ color: '#A1A1AA' }}>3-30 characters, letters, numbers, hyphens, underscores</p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-semibold mb-2" style={{ color: '#3F3F46' }}>Email address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg text-[15px] outline-none transition-all"
                style={inputStyle(!!fieldErrors.email)}
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
                style={inputStyle(!!fieldErrors.password)}
                onFocus={(e) => e.target.style.borderColor = fieldErrors.password ? '#FCA5A5' : '#CD853F'}
                onBlur={(e) => {
                  e.target.style.borderColor = fieldErrors.password ? '#FCA5A5' : '#E0E0E0';
                  const validation = validatePassword(formData.password);
                  if (!validation.isValid) {
                    setFieldErrors({ ...fieldErrors, password: validation.error });
                  }
                }}
                value={formData.password}
                onChange={(e) => {
                  const newPassword = e.target.value;
                  setFormData({ ...formData, password: newPassword });
                  setFieldErrors({ ...fieldErrors, password: undefined });
                  if (newPassword.length > 0) {
                    setPasswordStrength(calculatePasswordStrength(newPassword));
                  } else {
                    setPasswordStrength(null);
                  }
                }}
                placeholder="••••••••"
              />
              {fieldErrors.password ? (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3 h-3" style={{ color: '#DC2626' }} />
                  <span className="text-[12px] font-medium" style={{ color: '#DC2626' }}>{fieldErrors.password}</span>
                </div>
              ) : passwordStrength ? (
                <div className="mt-2.5">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{
                          background: i <= (passwordStrength === 'weak' ? 1 : passwordStrength === 'medium' ? 2 : 3)
                            ? strengthColors[passwordStrength]
                            : '#E4E4E7',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[12px] mt-1.5 font-medium capitalize" style={{ color: strengthColors[passwordStrength] }}>
                    {passwordStrength} password
                  </p>
                </div>
              ) : (
                <p className="text-[12px] mt-1.5" style={{ color: '#A1A1AA' }}>Min 8 characters with uppercase, lowercase, and numbers</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#4A3429', color: '#FFFFFF' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#3E2723'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#4A3429'}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-[14px]" style={{ color: '#8D6E63' }}>Already have an account? </span>
            <Link to="/login" className="text-[14px] font-semibold transition-colors" style={{ color: '#4A3429' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
