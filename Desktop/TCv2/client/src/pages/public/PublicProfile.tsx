import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import MobilePreview from '../../components/appearance/MobilePreview';
import { API_BASE } from '../../config/env';
import './PublicProfile.css';

// ─── Types ───────────────────────────────────────────────

interface LinkItem {
  id: string;
  title: string;
  url: string;
  image?: string;
  keyword?: string;
  type: string;
  description?: string;
  metadata?: any;
}

interface SocialIcon {
  platform: string;
  url: string;
}

interface ProfileData {
  profile: {
    name: string;
    bio: string;
    avatar: string;
    socialIcons?: SocialIcon[];
  };
  appearance: {
    theme: number | 'custom' | 'customMedia';
    customBackground?: string;
    backgroundStyle?: any;
    linkLayout?: 'list' | 'grid';
    pageLayout?: 'default' | 'mostRecent' | 'custom';
    profileImageLayout?: 'classic' | 'square';
    buttonStyle?: 'rounded' | 'sharp' | 'pill';
    linkAnimation?: 'none' | 'fade' | 'slide' | 'scale' | 'bounce';
    spacingMode?: 'compact' | 'comfortable' | 'spacious';
    fontFamily?: any;
    shadowIntensity?: number;
    wallpaperMode?: 'colors' | 'fill' | 'gradient';
    colors: {
      topBlock: string;
      primaryText: string;
      secondaryText: string;
      cardBackground: string;
      linkFooterBackground: string;
    };
  };
  links: LinkItem[];
  socialIcons?: SocialIcon[];
  activeAd?: {
    id: string;
    brand: string;
    campaignName: string;
    bannerImage: string;
    clickUrl: string;
    category: string;
  } | null;
}

// ─── Component ───────────────────────────────────────────

interface PublicProfileProps {
  adVariant?: 'standard' | 'full-bleed';
}

export default function PublicProfile({ adVariant = 'standard' }: PublicProfileProps = {}) {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search state for MobilePreview
  const [searchQuery, setSearchQuery] = useState('');

  // Tracking
  const sessionStart = useRef(Date.now());
  const sessionId = useRef(`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const pageWasVisible = useRef(false);

  // ── Fetch profile ──
  useEffect(() => {
    if (!username) {
      setError('No username');
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/public/${username}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'User not found' : 'Failed to load profile');
        return res.json();
      })
      .then((response) => {
        const profileData: ProfileData = response.data || response;
        setData(profileData);
        
        const initialSearch = searchParams.get('search');
        if (initialSearch) {
          setSearchQuery(initialSearch);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username, searchParams]);

  // ── Track load ──
  useEffect(() => {
    if (!data || !username) return;
    trackImpression('load');
  }, [data, username]);

  // ── Track unload ──
  useEffect(() => {
    const handleUnload = () => {
      const time = Math.floor((Date.now() - sessionStart.current) / 1000);
      if (time < 5 || !pageWasVisible.current) return;
      trackImpression('unload', time);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') pageWasVisible.current = true;
      else if (document.visibilityState === 'hidden') handleUnload();
    };

    window.addEventListener('pagehide', handleUnload);
    document.addEventListener('visibilitychange', handleVisibility);
    if (document.visibilityState === 'visible') pageWasVisible.current = true;

    return () => {
      window.removeEventListener('pagehide', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [username]);

  const trackImpression = useCallback((eventType: string, timeSpent?: number) => {
    if (!username) return;
    fetch(`${API_BASE}/api/public/track-impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: username,
        eventType,
        sessionId: sessionId.current,
        deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent.split(' ').pop()?.split('/')[0] || 'unknown',
        os: navigator.platform || 'unknown',
        timeSpent: timeSpent || 0,
        countryCode: 'US',
        countryName: 'United States'
      }),
      keepalive: true,
    }).catch(() => {});
  }, [username]);

  const trackClick = useCallback((linkId: string) => {
    const safeReferrer = typeof document !== 'undefined' ? document.referrer : '';
    const safeDeviceType = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent || '') ? 'mobile' : 'desktop';

    fetch(`${API_BASE}/api/public/click/${linkId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId.current,
        referrer: safeReferrer,
        deviceType: safeDeviceType,
        countryCode: 'US',
        countryName: 'United States'
      })
    }).catch(() => {});
  }, []);

  // ─────────── RENDER ───────────

  if (loading) {
    return (
      <div className="public-profile-root">
        <div className="pp-desktop-preview">
          <div className="pp-profile-card">
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
              <p className="text-gray-500 font-medium">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="public-profile-root" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="pp-desktop-preview">
          <div className="pp-profile-card" style={{ justifyContent: 'center', alignItems: 'center', padding: 40, gap: 20 }}>
            <div style={{ fontSize: 64, opacity: 0.3 }}>🔍</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 8, textAlign: 'center' }}>Profile Not Found</h1>
            <p style={{ opacity: 0.7, textAlign: 'center', marginBottom: 16 }}>
              {error === 'User not found'
                ? `We couldn't find a page for @${username}.`
                : 'Something went wrong while loading this profile.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: '#111827',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-profile-root">
      <div className="pp-desktop-preview flex flex-col relative z-10 w-full min-h-screen">
        
        {/* ── Sponsored Ad Banner ── */}
        {data?.activeAd && (
          <div
            className="w-full relative overflow-hidden cursor-pointer shrink-0 z-50 bg-black"
            style={{ height: '160px' }}
            onClick={() => {
              fetch(`${API_BASE}/api/public/ad/click/${data.activeAd!.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              }).catch(() => { });
              window.open(data.activeAd!.clickUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            {/* Sponsored badge */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.65)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.4px',
                zIndex: 10,
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              Sponsored
            </div>

            {/* Ad banner image */}
            <img
              src={data.activeAd.bannerImage}
              alt={`${data.activeAd.brand} - ${data.activeAd.campaignName}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onLoad={() => {
                fetch(`${API_BASE}/api/public/ad/impression/${data.activeAd!.id}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                }).catch(() => { });
              }}
            />
          </div>
        )}

        {/* ── Exact Match MobilePreview ── */}
        <div className="flex-1 relative w-full h-full">
          <MobilePreview
            isPublicProfile={true}
            links={data.links}
            profile={data.profile}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            theme={data.appearance?.theme}
            appliedColors={data.appearance?.colors}
            customBackground={data.appearance?.customBackground}
            backgroundStyle={data.appearance?.backgroundStyle}
            onLinkClick={trackClick}
            linkLayout={data.appearance?.linkLayout}
            pageLayout={data.appearance?.pageLayout}
            socialIcons={data.socialIcons || data.profile.socialIcons}
            profileImageLayout={data.appearance?.profileImageLayout}
            buttonStyle={data.appearance?.buttonStyle}
            linkAnimation={data.appearance?.linkAnimation}
            spacingMode={data.appearance?.spacingMode}
            fontFamily={data.appearance?.fontFamily}
            shadowIntensity={data.appearance?.shadowIntensity}
            wallpaperMode={data.appearance?.wallpaperMode}
            activeAd={data.activeAd}
          />
        </div>

      </div>
    </div>
  );
}
