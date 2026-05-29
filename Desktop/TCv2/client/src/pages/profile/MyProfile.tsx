import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Mail, MapPin, Phone, User, Briefcase, Building2, Cake, Pencil, Loader2 } from 'lucide-react';
import { API_BASE } from '../../config/env';
import { optimizeAvatar } from '../../lib/imageOptimizer';

type UserResponse = {
  username?: string;
  email?: string;
  createdAt?: string;
  profile?: {
    name?: string;
    avatar?: string;
    phoneNumber?: string;
    gender?: string;
    location?: string;
    dateOfBirth?: string;
    careerStatus?: string;
    industry?: string;
    bio?: string;
  };
};

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0] ?? ''}*@${domain}`;
  return `${local[0]}${'*'.repeat(Math.min(10, local.length - 2))}${local.slice(-1)}@${domain}`;
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'MMMM d, yyyy');
}

export default function MyProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/api/user`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => setUser(data.data || data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [navigate]);

  const displayName = user?.profile?.name || user?.username || 'My Profile';
  const memberSince = formatDate(user?.createdAt);

  const rows = useMemo(
    () => [
      { label: 'Name', value: displayName, icon: User },
      { label: 'Email address', value: user?.email || 'Not set', icon: Mail },
      { label: 'Phone number', value: user?.profile?.phoneNumber || 'Not set', icon: Phone },
      { label: 'Gender', value: user?.profile?.gender || 'Not set', icon: User },
      { label: 'Member since', value: memberSince || 'Not set', icon: Calendar },
      { label: 'Location', value: user?.profile?.location || 'Not set', icon: MapPin },
      { label: 'Date of birth', value: formatDate(user?.profile?.dateOfBirth) || 'Not set', icon: Cake },
      { label: 'Career status', value: user?.profile?.careerStatus || 'Not set', icon: Briefcase },
      { label: 'Industry', value: user?.profile?.industry || 'Not set', icon: Building2 },
      { label: 'Business description', value: user?.profile?.bio || 'Not set', icon: Pencil },
    ],
    [displayName, memberSince, user?.profile, user?.email],
  );

  return (
    <div className="max-w-5xl mx-auto app-page px-4 md:px-8 pb-16">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-6 pb-8"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-bold tracking-tight app-page-main-title">My Profile</h1>
            <p className="mt-2 text-sm md:text-base app-page-subtitle">
              Your account details and profile information.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 sm:gap-2 app-button-accent shrink-0 hover:scale-105"
          >
            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">Edit</span>
          </button>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="app-card overflow-hidden shadow-lg"
      >
        {/* Profile Header with Avatar */}
        <div className="p-6 sm:p-8 flex items-center gap-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 bg-[var(--card-bg)] flex items-center justify-center shrink-0 shadow-md"
            style={{ borderColor: 'var(--accent)' }}
          >
            {user?.profile?.avatar ? (
              <img
                src={optimizeAvatar(user.profile.avatar)}
                alt="Profile"
                loading="lazy"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-7 h-7 sm:w-10 sm:h-10 text-[var(--muted-text)]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg sm:text-xl font-bold app-heading truncate">{displayName}</div>
            <div className="mt-1 text-sm sm:text-base app-muted truncate">{user?.username ? `@${user.username}` : ''}</div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center gap-3 app-muted">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" style={{ color: 'var(--accent)' }} />
              <span className="text-sm">Loading profile…</span>
            </div>
          ) : (
            <div className="space-y-1">
              {rows.map((row, index) => {
                const Icon = row.icon;
                const isNotSet = row.value === 'Not set';
                return (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="px-3 sm:px-5 py-3 sm:py-5 rounded-lg sm:rounded-xl hover:bg-[var(--surface-subtle)] transition-all duration-200 cursor-default"
                  >
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-shrink-0">
                        <div 
                          className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-sm" 
                          style={{ background: 'var(--surface-subtle)', color: 'var(--accent)' }}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="text-sm sm:text-base font-semibold app-heading">{row.label}</div>
                      </div>
                      <div className={`text-xs sm:text-base font-medium text-right break-all ${isNotSet ? 'app-muted italic' : 'app-heading font-semibold'}`}>
                        {row.value}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
