import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE } from '../../config/env';
import { validatePassword } from '../../lib/validation';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid reset link');
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <h2 className="text-[28px] font-bold tracking-tight mb-2" style={{ color: '#3E2723', fontFamily: "'Playfair Display', serif" }}>
              The Crumb
            </h2>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm text-center" style={{ border: '1px solid #E8E8EC' }}>
            <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#10B981' }} />
            <h3 className="text-[20px] font-semibold mb-2" style={{ color: '#3E2723' }}>Password Reset!</h3>
            <p className="text-[15px]" style={{ color: '#8D6E63' }}>
              Your password has been reset successfully. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h2 className="text-[28px] font-bold tracking-tight mb-2" style={{ color: '#3E2723', fontFamily: "'Playfair Display', serif" }}>
            The Crumb
          </h2>
        </div>

        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: '#3E2723' }}>Create New Password</h1>
          <p className="text-[15px] mt-2" style={{ color: '#8D6E63' }}>
            Enter your new password below.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#DC2626' }} />
            <span className="text-[13px] font-medium" style={{ color: '#DC2626' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold mb-2" style={{ color: '#5D4037' }}>New Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg text-[15px] outline-none transition-all"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E0E0E0',
                color: '#3E2723',
              }}
              onFocus={(e) => e.target.style.borderColor = '#CD853F'}
              onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
            />
            <p className="text-[12px] mt-1.5" style={{ color: '#999999' }}>
              Min 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          <div>
            <label className="block text-[13px] font-semibold mb-2" style={{ color: '#6B6B6B' }}>Confirm Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg text-[15px] outline-none transition-all"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E0E0E0',
                color: '#4A4A4A',
              }}
              onFocus={(e) => e.target.style.borderColor = '#D2691E'}
              onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#6B4E3D', color: '#FFFFFF' }}
            onMouseEnter={(e) => !loading && ((e.target as HTMLElement).style.background = '#5A3F30')}
            onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#6B4E3D'}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-[14px] font-semibold transition-colors" style={{ color: '#4A3429' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
