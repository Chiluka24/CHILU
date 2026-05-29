import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE } from '../../config/env';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to login...');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (err) {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-[28px] font-bold tracking-tight mb-2" style={{ color: '#3E2723', fontFamily: "'Playfair Display', serif" }}>
            The Crumb
          </h2>
          <p className="text-[15px]" style={{ color: '#71717A' }}>Email Verification</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm" style={{ border: '1px solid #E8E8EC' }}>
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#3E2723' }} />
              <p className="text-[15px]" style={{ color: '#8D6E63' }}>Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#10B981' }} />
              <h3 className="text-[20px] font-semibold mb-2" style={{ color: '#3E2723' }}>Success!</h3>
              <p className="text-[15px]" style={{ color: '#8D6E63' }}>{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <XCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#DC2626' }} />
              <h3 className="text-[20px] font-semibold mb-2" style={{ color: '#3E2723' }}>Verification Failed</h3>
              <p className="text-[15px] mb-6" style={{ color: '#8D6E63' }}>{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 rounded-lg font-semibold text-[14px] transition-all"
                style={{ background: '#4A3429', color: '#FFFFFF' }}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
