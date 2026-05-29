import { useEffect, useState, useRef } from 'react';
import { Link as LinkIcon, Palette, Copy, Share2, Check, Smartphone } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import MobilePreview from '../../components/appearance/MobilePreview';
import Links from './Links';
import Appearance, { DEFAULT_COLORS, type AppearanceColors, type BackgroundStyle } from './Appearance';
import { API_BASE } from '../../config/env';

const PROFILE = {
  name: 'Vivek Boga',
  bio: 'Photographer & Filmmaker. Creating content about tech, cameras, and life.',
  avatar: '',
};

const TABS = [
  { key: 'links', label: 'Links', icon: LinkIcon },
  { key: 'appearance', label: 'Appearance', icon: Palette },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function LinksDesigns() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab: TabKey = location.pathname.endsWith('/appearance') ? 'appearance' : 'links';
  const [links, setLinks] = useState<any[]>([]);
  const [previewSearchQuery, setPreviewSearchQuery] = useState('');
  const [activeTheme, setActiveTheme] = useState<number | 'custom' | 'customMedia'>(1);
  const [appliedColors, setAppliedColors] = useState<AppearanceColors>({ ...DEFAULT_COLORS });
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>({ type: 'fill', color: '#D4A574', direction: 'up', noise: false });
  const [username, setUsername] = useState('username');
  const [profile, setProfile] = useState(PROFILE);
  const [copied, setCopied] = useState(false);
  const [linkLayout, setLinkLayout] = useState<'list' | 'grid'>('list');
  const [pageLayout, setPageLayout] = useState<'default' | 'mostRecent' | 'custom'>('default');
  const [customLayoutLinks, setCustomLayoutLinks] = useState<string[]>([]);
  const [socialIcons, setSocialIcons] = useState<{ platform: string; url: string }[]>([]);
  const [profileImageLayout, setProfileImageLayout] = useState<'classic' | 'square'>('classic');
  const [buttonStyle, setButtonStyle] = useState<'rounded' | 'sharp' | 'pill'>('rounded');
  const [linkAnimation, setLinkAnimation] = useState<'none' | 'fade' | 'slide' | 'scale' | 'bounce'>('fade');
  const [spacingMode, setSpacingMode] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [fontFamily, setFontFamily] = useState<'inter' | 'playfair' | 'poppins' | 'roboto' | 'montserrat' | 'lora' | 'raleway' | 'opensans' | 'merriweather' | 'nunito' | 'sourcesans' | 'worksans' | 'dmserif' | 'crimson' | 'cormorant' | 'spectral' | 'karla' | 'rubik' | 'spacegrotesk' | 'manrope'>('inter');
  const [shadowIntensity, setShadowIntensity] = useState<number>(2);
  const [wallpaperMode, setWallpaperMode] = useState<'colors' | 'fill' | 'gradient'>('colors');
  const [previewScale, setPreviewScale] = useState(1);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [activeAd, setActiveAd] = useState<{
    id: string;
    brand: string;
    campaignName: string;
    bannerImage: string;
    clickUrl: string;
    category: string;
  } | null>(null);

  const isFirstRender = useRef(true);
  const dataLoaded = useRef(false);
  const isUploadingMedia = useRef(false);
  const publicUrl = `${window.location.origin}/${username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `thecrumb.co/${username}`, url: publicUrl });
        return;
      }
      handleCopy();
    } catch {
      // Ignore share cancellation.
    }
  };

  useEffect(() => {
    const handleResize = () => {
      // 24px sticky top + ~60px buttons + 24px bottom buffer = 108px total reserved vertical space
      const availableHeight = window.innerHeight - 108;
      setPreviewScale(Math.min(1, availableHeight / 680));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile preview when tab changes
  useEffect(() => {
    setShowMobilePreview(false);
  }, [activeTab]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    Promise.all([
      fetch(`${API_BASE}/api/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_BASE}/api/links`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_BASE}/api/ads/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])
      .then(async ([userRes, linksRes, adsRes]) => {
        if (!userRes.ok) throw new Error('Failed to fetch user settings');
        if (!linksRes.ok) throw new Error('Failed to fetch links');

        const userResponse = await userRes.json();
        const linksResponse = await linksRes.json();

        // Unwrap data field from API responses
        const userData = userResponse.data || userResponse;
        const linksData = linksResponse.data || linksResponse;

        // Fetch active ads
        if (adsRes.ok) {
          const adsData = await adsRes.json();
          if (adsData.length > 0) {
            setActiveAd(adsData[0]); // Use the first active ad
          }
        }

        if (userData.appearance) {
          setActiveTheme(userData.appearance.theme);
          setAppliedColors(userData.appearance.colors);
          setCustomBackground(userData.appearance.customBackground || null);
          if (userData.appearance.backgroundStyle) {
            setBackgroundStyle(userData.appearance.backgroundStyle);
          }
          setLinkLayout(userData.appearance.linkLayout || 'list');
          setPageLayout(userData.appearance.pageLayout || 'default');
          setCustomLayoutLinks(userData.appearance.customLayoutLinks || []);
          setProfileImageLayout(userData.appearance.profileImageLayout || 'classic');
          setButtonStyle(userData.appearance.buttonStyle || 'rounded');
          setLinkAnimation(userData.appearance.linkAnimation || 'fade');
          setSpacingMode(userData.appearance.spacingMode || 'comfortable');
          setFontFamily(userData.appearance.fontFamily || 'inter');
          setShadowIntensity(userData.appearance.shadowIntensity ?? 2);
          setWallpaperMode(userData.appearance.wallpaperMode || 'colors');
        }
        if (userData.username) setUsername(userData.username);
        if (userData.profile) {
          setProfile({
            name: userData.profile.name || userData.username,
            bio: userData.profile.bio || '',
            avatar: userData.profile.avatar || ''
          });
          setSocialIcons(userData.profile.socialIcons || []);
        }

        setLinks(Array.isArray(linksData) ? linksData : []);
        // Delay setting dataLoaded to true to allow state updates to settle
        setTimeout(() => { dataLoaded.current = true; }, 500);
      })
      .catch(err => console.error('Failed to fetch links/appearance:', err));
  }, [navigate]);

  // Note: Auto-save removed - users must click "Save Changes" button
  // This prevents rate limiting and allows users to try multiple variations before saving

  // Mobile-only tab key. Drives which section the left column renders.
  // Distinct from the route-based `activeTab` so the "Crumb" view doesn't need
  // its own URL — selecting Crumb keeps the user on /links or /links/appearance
  // and swaps the content inline while the heading + tabs stay fixed.
  const mobileTab: 'links' | 'appearance' | 'crumb' = showMobilePreview
    ? 'crumb'
    : activeTab;

  return (
    <div className={`flex flex-col xl:flex-row gap-6 xl:gap-8 h-full min-w-0 ${activeTab === 'appearance' ? 'w-full' : 'max-w-[1400px] mx-auto w-full'}`}>
      {/* ═══ Mobile / Tablet hero + editorial tabs (hidden on xl) ═══
          A centered Playfair heading with a brown gradient accent bar, then
          an underline-style tab row below. The whole header sticks under the
          app header so it's always reachable while the list / preview scrolls
          beneath it. */}
      <div
        className="xl:hidden sticky top-14 z-20 -mx-3 sm:-mx-5 md:-mx-6 px-3 sm:px-5 md:px-6 pt-5 pb-0 mb-3"
        style={{
          background: 'color-mix(in srgb, var(--page-bg) 92%, transparent)',
          backdropFilter: 'saturate(140%) blur(10px)',
          WebkitBackdropFilter: 'saturate(140%) blur(10px)',
        }}
      >
        {/* Centered hero heading + brown gradient accent bar */}
        <div className="text-center mb-4">
          <h1
            className="font-bold leading-[1.05]"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 7vw, 40px)',
              color: 'var(--heading-color)',
              letterSpacing: '-0.02em',
            }}
          >
            Manage your links
          </h1>
          <div
            className="mx-auto mt-3 h-[3px] w-[72px] rounded-full"
            style={{
              background:
                'linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%)',
              boxShadow: '0 1px 2px rgba(201, 121, 58, 0.25)',
            }}
            aria-hidden="true"
          />
        </div>

        {/* Underline-style tab row. The active tab gets a matching brown
            gradient bar that visually connects to the container's bottom
            divider, giving a magazine-like editorial nav. */}
        <nav
          className="relative flex items-end justify-center gap-7 sm:gap-12"
          role="tablist"
          aria-label="Links sections"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          {(
            [
              { key: 'links',      label: 'Links',      icon: LinkIcon,   onClick: () => { setShowMobilePreview(false); if (activeTab !== 'links')      navigate('/links'); } },
              { key: 'appearance', label: 'Appearance', icon: Palette,    onClick: () => { setShowMobilePreview(false); if (activeTab !== 'appearance') navigate('/links/appearance'); } },
              { key: 'crumb',      label: 'Crumb',      icon: Smartphone, onClick: () => { setShowMobilePreview(true); } },
            ] as const
          ).map(({ key, label, icon: Icon, onClick }) => {
            const isActive = mobileTab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={onClick}
                className="relative flex items-center gap-2 pb-3 pt-1 px-0.5 text-[14px] font-semibold transition-colors duration-200 outline-none"
                style={{
                  color: isActive ? 'var(--heading-color)' : 'var(--muted-text)',
                  letterSpacing: '-0.005em',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Icon className="w-[15px] h-[15px]" strokeWidth={isActive ? 2.4 : 2} />
                <span>{label}</span>
                <span
                  className="absolute left-0 right-0 -bottom-px h-[2.5px] rounded-full transition-opacity duration-200"
                  style={{
                    background:
                      'linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%)',
                    opacity: isActive ? 1 : 0,
                  }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Left Column */}
      <div className="flex-1 min-w-0 flex flex-col app-page">
        {/* Active Tab Content */}
        {mobileTab === 'crumb' ? (
          // Mobile-only inline preview. Desktop keeps its right-rail preview.
          <div className="xl:hidden flex flex-col items-center pt-2 pb-12">
            <div className="w-full max-w-[420px] mb-4 px-1">
              <div className="w-full bg-white rounded-xl shadow-sm border border-stone-200 px-3 py-2.5 flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium app-heading truncate">
                  thecrumb.co/{username}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 transition-colors" title="Copy">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={handleShare} className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 transition-colors" title="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <MobilePreview
              links={links}
              profile={profile}
              searchQuery={previewSearchQuery}
              onSearchChange={setPreviewSearchQuery}
              theme={activeTheme}
              appliedColors={appliedColors}
              customBackground={customBackground}
              backgroundStyle={backgroundStyle}
              linkLayout={linkLayout}
              pageLayout={pageLayout}
              customLayoutLinks={customLayoutLinks}
              socialIcons={socialIcons}
              profileImageLayout={profileImageLayout}
              buttonStyle={buttonStyle}
              linkAnimation={linkAnimation}
              spacingMode={spacingMode}
              fontFamily={fontFamily}
              shadowIntensity={shadowIntensity}
              wallpaperMode={wallpaperMode}
              activeAd={activeAd}
            />
          </div>
        ) : activeTab === 'links' ? (
          <Links links={links} setLinks={setLinks} />
        ) : (
          <Appearance
            activeTheme={activeTheme}
            setActiveTheme={setActiveTheme}
            appliedColors={appliedColors}
            setAppliedColors={setAppliedColors}
            customBackground={customBackground}
            setCustomBackground={setCustomBackground}
            backgroundStyle={backgroundStyle}
            setBackgroundStyle={setBackgroundStyle}
            profile={profile}
            setProfile={setProfile}
            linkLayout={linkLayout}
            setLinkLayout={setLinkLayout}
            pageLayout={pageLayout}
            setPageLayout={setPageLayout}
            customLayoutLinks={customLayoutLinks}
            setCustomLayoutLinks={setCustomLayoutLinks}
            socialIcons={socialIcons}
            setSocialIcons={setSocialIcons}
            links={links}
            profileImageLayout={profileImageLayout}
            setProfileImageLayout={setProfileImageLayout}
            buttonStyle={buttonStyle}
            setButtonStyle={setButtonStyle}
            linkAnimation={linkAnimation}
            setLinkAnimation={setLinkAnimation}
            spacingMode={spacingMode}
            setSpacingMode={setSpacingMode}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            shadowIntensity={shadowIntensity}
            setShadowIntensity={setShadowIntensity}
            wallpaperMode={wallpaperMode}
            setWallpaperMode={setWallpaperMode}
            hidePreviewButton={true}
          />
        )}
      </div>

      {/* Right Column - Constant Preview (Hidden on Mobile) */}
      <div className="hidden xl:block w-[560px] shrink-0">
        <div className="sticky top-6 flex flex-col items-center justify-start h-[calc(100vh-48px)] max-h-[900px] border-l app-preview-divider pr-4 pl-6 pb-6 overflow-y-auto scrollbar-hide">
          <div className="w-full max-w-[420px] flex items-center justify-center gap-3 mb-6 px-1 shrink-0">
            <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
              <a href={`/${username}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium app-heading hover:underline flex items-center gap-1.5">
                thecrumb.co/{username}
              </a>
              <div className="flex items-center gap-1">
                <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors" title="Copy Link">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={handleShare} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors" title="Share Link">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div style={{
            transform: `scale(${previewScale})`,
            transformOrigin: 'top center',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: `-${680 * (1 - previewScale)}px`
          }}>
            <MobilePreview
              links={links}
              profile={profile}
              searchQuery={previewSearchQuery}
              onSearchChange={setPreviewSearchQuery}
              theme={activeTheme}
              appliedColors={appliedColors}
              customBackground={customBackground}
              backgroundStyle={backgroundStyle}
              linkLayout={linkLayout}
              pageLayout={pageLayout}
              customLayoutLinks={customLayoutLinks}
              socialIcons={socialIcons}
              profileImageLayout={profileImageLayout}
              buttonStyle={buttonStyle}
              linkAnimation={linkAnimation}
              spacingMode={spacingMode}
              fontFamily={fontFamily}
              shadowIntensity={shadowIntensity}
              wallpaperMode={wallpaperMode}
              activeAd={activeAd}
            />
          </div>
        </div>
      </div>

      {/* The previous fullscreen Crumb modal was removed — the Crumb tab now
          renders the preview inline above (inside the left column) so the
          sticky tab bar stays visible and the user can switch back to Links
          or Appearance without a separate close affordance. */}
    </div>
  );
}
