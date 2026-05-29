import React, { useState } from 'react';
import { User, Search, X, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmicVisionLayout, AquaFlowLayout, CyberStrikeLayout, BentoGridLayout, HorizontalScrollLayout, MasonryLayout, CarouselLayout } from './ThemeLayouts';
import { API_BASE, APP_BASE } from '../../config/env';
import { getBrandColor, getAdaptiveBrandColor } from '../../lib/brandColors';
import { optimizeAvatar, optimizeThumbnail } from '../../lib/imageOptimizer';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  image?: string;
  keyword?: string;
  isActive: boolean;
  type?: string;
  metadata?: any;
}

interface AppliedColors {
  topBlock: string;
  primaryText: string;
  secondaryText: string;
  cardBackground: string;
  linkFooterBackground: string;
}

export type BackgroundStyle = {
  type: 'fill' | 'gradient' | 'blur';
  color: string;
  direction: 'up' | 'down' | 'radial';
  noise: boolean;
  blurStyle?: 'soft' | 'vibrant' | 'aurora' | 'mesh';
};

interface MobilePreviewProps {
  links: LinkItem[];
  profile: {
    name: string;
    bio: string;
    avatar: string;
  };
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  theme?: number | 'custom' | 'customMedia';
  appliedColors?: AppliedColors;
  customBackground?: string | null;
  backgroundStyle?: BackgroundStyle;
  onLinkClick?: (linkId: string) => void;
  fullScreenOnMobile?: boolean;
  linkLayout?: 'list' | 'grid';
  pageLayout?: 'default' | 'mostRecent' | 'custom';
  customLayoutLinks?: string[];
  socialIcons?: { platform: string; url: string; }[];
  profileImageLayout?: 'classic' | 'square';
  buttonStyle?: 'rounded' | 'sharp' | 'pill';
  linkAnimation?: 'none' | 'fade' | 'slide' | 'scale' | 'bounce';
  spacingMode?: 'compact' | 'comfortable' | 'spacious';
  fontFamily?: 'inter' | 'playfair' | 'poppins' | 'roboto' | 'montserrat' | 'lora' | 'raleway' | 'opensans' | 'merriweather' | 'nunito' | 'sourcesans' | 'worksans' | 'dmserif' | 'crimson' | 'cormorant' | 'spectral' | 'karla' | 'rubik' | 'spacegrotesk' | 'manrope';
  shadowIntensity?: number;
  wallpaperMode?: 'colors' | 'fill' | 'gradient';
  activeAd?: {
    id: string;
    brand: string;
    campaignName: string;
    bannerImage: string;
    clickUrl: string;
    category: string;
  } | null;
  isPublicProfile?: boolean;
}

import { THEME_PRESETS } from '../../pages/links/Appearance';
import PremiumBackground from './PremiumBackground';
import { getLinkIconClass, getPlatformFromLink } from '../../lib/icons';

function shiftColor(hex: string, hueShift: number, lightShift: number): string {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = (h * 360 + hueShift) % 360;
  if (h < 0) h += 360;
  l = Math.max(0, Math.min(1, l + lightShift / 100));

  let r1 = l, g1 = l, b1 = l;
  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r1 = hue2rgb(p, q, h / 360 + 1 / 3);
    g1 = hue2rgb(p, q, h / 360);
    b1 = hue2rgb(p, q, h / 360 - 1 / 3);
  }

  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}

// Font family mapping
const getFontFamily = (font: string): string => {
  const fontMap: Record<string, string> = {
    inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    playfair: "'Playfair Display', Georgia, serif",
    poppins: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    roboto: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    montserrat: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    lora: "'Lora', Georgia, serif",
    raleway: "'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    opensans: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    merriweather: "'Merriweather', Georgia, serif",
    nunito: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    sourcesans: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    worksans: "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    dmserif: "'DM Serif Display', Georgia, serif",
    crimson: "'Crimson Text', Georgia, serif",
    cormorant: "'Cormorant', Georgia, serif",
    spectral: "'Spectral', Georgia, serif",
    karla: "'Karla', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    rubik: "'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    spacegrotesk: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    manrope: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };
  return fontMap[font] || fontMap.inter;
};

// Button border radius mapping
const getButtonRadius = (style: string): string => {
  const radiusMap: Record<string, string> = {
    rounded: '10px',
    sharp: '4px',
    pill: '999px',
  };
  return radiusMap[style] || radiusMap.rounded;
};

// Spacing mapping
const getSpacing = (mode: string): { linkGap: number; contentPadding: string } => {
  const spacingMap: Record<string, { linkGap: number; contentPadding: string }> = {
    compact: { linkGap: 6, contentPadding: '0 12px 6px' },
    comfortable: { linkGap: 10, contentPadding: '0 16px 8px' },
    spacious: { linkGap: 16, contentPadding: '0 20px 12px' },
  };
  return spacingMap[mode] || spacingMap.comfortable;
};

// Shadow mapping
const getShadow = (intensity: number): string => {
  const shadows: Record<number, string> = {
    0: 'none',
    1: '0 1px 2px rgba(0,0,0,0.05)',
    2: '0 1px 4px rgba(0,0,0,0.08)',
    3: '0 2px 8px rgba(0,0,0,0.12)',
    4: '0 4px 12px rgba(0,0,0,0.15)',
    5: '0 8px 24px rgba(0,0,0,0.2)',
  };
  return shadows[intensity] || shadows[2];
};

// Animation keyframes
const getAnimationStyle = (animation: string, index: number): React.CSSProperties => {
  const delay = index * 0.05;

  switch (animation) {
    case 'fade':
      return {
        animation: `fadeIn 0.4s ease-out ${delay}s both`,
      };
    case 'slide':
      return {
        animation: `slideUp 0.4s ease-out ${delay}s both`,
      };
    case 'scale':
      return {
        animation: `scaleIn 0.4s ease-out ${delay}s both`,
      };
    case 'bounce':
      return {
        animation: `bounceIn 0.6s ease-out ${delay}s both`,
      };
    default:
      return {};
  }
};

const MobilePreview = React.memo(function MobilePreview({
  links,
  profile,
  searchQuery = '',
  onSearchChange,
  theme = 1,
  appliedColors,
  customBackground,
  backgroundStyle = { type: 'fill', color: '#2665D6', direction: 'up', noise: false },
  onLinkClick,
  fullScreenOnMobile = false,
  linkLayout = 'list',
  pageLayout = 'default',
  customLayoutLinks = [],
  socialIcons = [],
  profileImageLayout = 'classic',
  buttonStyle = 'rounded',
  linkAnimation = 'fade',
  spacingMode = 'comfortable',
  fontFamily = 'inter',
  shadowIntensity = 2,
  wallpaperMode = 'colors',
  activeAd = null,
  isPublicProfile = false,
}: MobilePreviewProps) {

  const [selectedButtonModal, setSelectedButtonModal] = useState<LinkItem | null>(null);

  // CSS transition styles for smooth color changes
  const colorTransitionStyle: React.CSSProperties = {
    transition: 'color 300ms ease-in-out, background-color 300ms ease-in-out, border-color 300ms ease-in-out',
  };

  // ── Share functionality for preview ──
  const handleShare = async (link: any) => {
    try {
      // Get current user's username
      const token = localStorage.getItem('token');
      if (!token) {
        // Fallback to just copying the link URL if no token
        if (navigator.share) {
          navigator.share({
            title: link.title || 'Link',
            text: `Check out this link: ${link.title}`,
            url: link.url || '#'
          });
        } else {
          navigator.clipboard?.writeText(link.url || '#');
        }
        return;
      }

      // Fetch user data to get username
      const response = await fetch(`${API_BASE}/api/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        const username = userData.username || userData.handle;

        if (username) {
          // Create the shareable profile URL with search parameter
          const profileUrl = `${APP_BASE}/${username}?search=${encodeURIComponent(link.title)}`;

          if (navigator.share) {
            navigator.share({
              title: link.title || 'The Crumb',
              url: profileUrl
            }).catch(() => {
              navigator.clipboard?.writeText(profileUrl);
            });
          } else {
            navigator.clipboard?.writeText(profileUrl);
          }
        } else {
          // Fallback if no username found
          navigator.clipboard?.writeText(link.url || '#');
        }
      } else {
        // Fallback if API call fails
        navigator.clipboard?.writeText(link.url || '#');
      }
    } catch (error) {
      // Fallback on any error
      navigator.clipboard?.writeText(link.url || '#');
    }
  };

  // ── Resolve colors ──
  const isCustom = theme === 'custom' && appliedColors;
  const isCustomMedia = theme === 'customMedia';
  // Note: Themes 1 and 19 are DEFAULT themes with wallpaper customization, not premium themes
  // Premium themes (3-9, 17-18, 20) have special layouts and always use transparent backgrounds
  const isPremiumTheme = [3, '3', 4, '4', 5, '5', 6, '6', 7, '7', 8, '8', 9, '9', 17, '17', 18, '18', 20, '20'].includes(theme as any);

  const colors: AppliedColors = isCustom
    ? appliedColors
    : isCustomMedia
      ? (appliedColors || THEME_PRESETS[7])
      : (THEME_PRESETS[theme as number] || THEME_PRESETS[1]);

  const gradientStart = colors.topBlock;
  const gradientEnd = shiftColor(colors.topBlock, 0, -15);

  // ── Video / Image backgrounds for preset themes 7-9 and customMedia ──
  const presetVideos: Record<number, string> = {
    7: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    8: 'https://res.cloudinary.com/demo/video/upload/ocean_waves.mp4',
    9: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  };

  const isCustomMediaVideo = !!customBackground && (
    customBackground.startsWith('data:video') ||
    /\.(mp4|webm|mov|avi|mkv|ogg)(\?|#|$)/i.test(customBackground)
  );
  const isCustomMediaImage = !!customBackground && (
    customBackground.startsWith('data:image') ||
    /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|#|$)/i.test(customBackground)
  );

  const videoSrc = isCustomMedia && isCustomMediaVideo
    ? customBackground
    : (!isCustom && !isCustomMedia && presetVideos[theme as number])
      ? presetVideos[theme as number]
      : undefined;

  const imageSrc = isCustomMedia && isCustomMediaImage ? customBackground : undefined;
  const hasMediaBg = !!(videoSrc || imageSrc);

  // ── Filter visible links ──
  let filtered = links.filter(l =>
    l.isActive &&
    (l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.keyword || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Apply page layout sorting (match server-side logic)
  if (pageLayout === 'mostRecent') {
    filtered = filtered.sort((a, b) => ((b as any).clicks || 0) - ((a as any).clicks || 0));
  } else if (pageLayout === 'custom' && customLayoutLinks.length > 0) {
    filtered = filtered.filter(l => customLayoutLinks.includes(l.id));
    // Sort to match customLayoutLinks order
    filtered.sort((a, b) => customLayoutLinks.indexOf(a.id) - customLayoutLinks.indexOf(b.id));
  }
  // else: default order (already sorted by order field from API)

  // --- Reorder to group children under parents ---
  const topLevelLinks = filtered.filter(l => !l.parentId).sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : 999999;
    const orderB = typeof b.order === 'number' ? b.order : 999999;
    return orderA - orderB;
  });

  const childrenMap = new Map<string, typeof links>();
  filtered.filter(l => l.parentId).forEach(l => {
    const pId = l.parentId as string;
    if (!childrenMap.has(pId)) childrenMap.set(pId, []);
    childrenMap.get(pId)!.push(l);
  });

  // Sort children within each collection by order field
  childrenMap.forEach((children, parentId) => {
    children.sort((a, b) => {
      // Use order field if available, otherwise maintain array order
      const orderA = typeof a.order === 'number' ? a.order : 999999;
      const orderB = typeof b.order === 'number' ? b.order : 999999;
      return orderA - orderB;
    });
  });

  const structuredLinks: any[] = [];
  topLevelLinks.forEach(parent => {
    if (parent.type === 'Collection' || parent.type === 'collection') {
      structuredLinks.push({ ...parent, childrenLinks: childrenMap.get(parent.id) || [] });
    } else {
      structuredLinks.push(parent);
    }
  });

  // Handle orphaned children (parents not active/found, but child is active)
  filtered.filter(l => l.parentId && !topLevelLinks.find(p => p.id === l.parentId)).forEach(orphan => {
    structuredLinks.push(orphan);
  });

  const visibleLinks = structuredLinks;

  // ── Get computed styles ──
  const spacing = getSpacing(spacingMode);
  const borderRadius = getButtonRadius(buttonStyle);
  const shadow = getShadow(shadowIntensity);
  const font = getFontFamily(fontFamily);

  // ── Container class ──
  const containerClass = isPublicProfile
    ? 'relative w-full min-h-screen bg-transparent mx-auto flex flex-col'
    : fullScreenOnMobile
      ? 'relative w-full max-w-[420px] h-[85vh] max-h-[820px] sm:w-[420px] sm:h-[780px] bg-white rounded-[36px] sm:rounded-[36px] border border-gray-200/60 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden shrink-0 mx-auto'
      : 'relative w-full max-w-[420px] sm:w-[420px] h-[680px] sm:h-[780px] bg-white rounded-[32px] sm:rounded-[36px] border border-gray-200/60 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden shrink-0 mx-auto';

  const renderBackgroundStyle = () => {
    // If theme is 1 (Warm Taupe), 17 (Mint), 19 (Sky), 21 (Canvas), or custom/customMedia, check wallpaperMode
    if (theme === 1 || theme === 17 || theme === 19 || theme === 21 || theme === 'custom' || theme === 'customMedia') {
      // If wallpaperMode is 'colors', don't render any background style
      // Let the default layout use colors.cardBackground
      if (wallpaperMode === 'colors') {
        return null;
      }

      // Otherwise, use the backgroundStyle for fill/gradient
      const { type, color, direction, noise } = backgroundStyle || { type: 'fill', color: '#2665D6', direction: 'up', noise: false };

      // Ensure color is never undefined
      const safeColor = color || '#2665D6';

      let bgStyle: any = {};

      if (type === 'gradient') {
        // For gradient, use the background property
        if (direction === 'up') bgStyle.background = `linear-gradient(to top, ${safeColor}, ${shiftColor(safeColor, -30, 8)})`;
        else if (direction === 'down') bgStyle.background = `linear-gradient(to bottom, ${safeColor}, ${shiftColor(safeColor, -30, 8)})`;
        else if (direction === 'radial') bgStyle.background = `radial-gradient(ellipse at top, ${shiftColor(safeColor, -30, 8)} 0%, ${safeColor} 100%)`;
      } else {
        // For solid fill, use backgroundColor only
        bgStyle.backgroundColor = safeColor;
      }

      return (
        <div className={`${isPublicProfile ? 'fixed' : 'absolute'} inset-0 pointer-events-none z-0 overflow-hidden`}>
          <div className="absolute inset-0 z-0 transition-all duration-300" style={bgStyle}></div>
          {noise && <div className="absolute inset-0 z-30 mix-blend-overlay opacity-60 pointer-events-none" style={{ backgroundImage: `url("/noise.svg")`, backgroundRepeat: 'repeat', backgroundSize: '150px' }} />}
        </div>
      );
    }

    // For preset themes, show their backgrounds
    return (
      <div className={`${isPublicProfile ? 'fixed' : 'absolute'} inset-0 w-full h-full z-0 pointer-events-none`} style={{ backgroundColor: colors.cardBackground }}>
        {videoSrc && (
          <video
            key={videoSrc}
            src={videoSrc}
            autoPlay muted loop playsInline preload="auto"
            onCanPlay={(e) => { e.currentTarget.play().catch(() => { }); }}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}
        {imageSrc && (
          <img src={imageSrc} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
        )}
        {hasMediaBg && <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />}
        {isPremiumTheme && <PremiumBackground theme={theme} />}
      </div>
    );
  };

  return (
    <div className={containerClass}>
      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Video / Image background layer */}
      {renderBackgroundStyle()}

      {/* Check if theme uses special layout */}
      {theme === 3 ? (
        <div className="absolute inset-0 z-20">
          <CosmicVisionLayout
            theme={theme}
            profile={profile}
            links={visibleLinks}
            colors={colors}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onLinkClick={onLinkClick}
            socialIcons={socialIcons}
            profileImageLayout={profileImageLayout}
            hasMediaBg={hasMediaBg}
            isPremiumTheme={isPremiumTheme}
          />
        </div>
      ) : theme === 4 ? (
        <div className="absolute inset-0 z-20">
          <AquaFlowLayout
            theme={theme}
            profile={profile}
            links={visibleLinks}
            colors={colors}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onLinkClick={onLinkClick}
            socialIcons={socialIcons}
            profileImageLayout={profileImageLayout}
            hasMediaBg={hasMediaBg}
            isPremiumTheme={isPremiumTheme}
          />
        </div>
      ) : theme === 5 ? (
        <div className="absolute inset-0 z-20">
          <CyberStrikeLayout
            theme={theme}
            profile={profile}
            links={visibleLinks}
            colors={colors}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onLinkClick={onLinkClick}
            socialIcons={socialIcons}
            profileImageLayout={profileImageLayout}
            hasMediaBg={hasMediaBg}
            isPremiumTheme={isPremiumTheme}
          />
        </div>
      ) : theme === 6 ? (
        <div className="absolute inset-0 z-20">
          <BentoGridLayout
            theme={theme}
            profile={profile}
            links={visibleLinks}
            colors={colors}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onLinkClick={onLinkClick}
            socialIcons={socialIcons}
            profileImageLayout={profileImageLayout}
            hasMediaBg={hasMediaBg}
            isPremiumTheme={isPremiumTheme}
          />
        </div>
      ) : theme === 7 ? (
        <div className="absolute inset-0 z-20">
          <HorizontalScrollLayout
            theme={theme}
            profile={profile}
            links={visibleLinks}
            colors={colors}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onLinkClick={onLinkClick}
            socialIcons={socialIcons}
            profileImageLayout={profileImageLayout}
            hasMediaBg={hasMediaBg}
            isPremiumTheme={isPremiumTheme}
          />
        </div>
      ) : theme === 8 ? (
        <div className="absolute inset-0 z-20">
          <MasonryLayout
            theme={theme}
            profile={profile}
            links={visibleLinks}
            colors={colors}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onLinkClick={onLinkClick}
            socialIcons={socialIcons}
            profileImageLayout={profileImageLayout}
            hasMediaBg={hasMediaBg}
            isPremiumTheme={isPremiumTheme}
          />
        </div>
      ) : theme === 9 ? (
        <div className="absolute inset-0 z-20">
          <CarouselLayout
            theme={theme}
            profile={profile}
            links={visibleLinks}
            colors={colors}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onLinkClick={onLinkClick}
            socialIcons={socialIcons}
            profileImageLayout={profileImageLayout}
            hasMediaBg={hasMediaBg}
            isPremiumTheme={isPremiumTheme}
          />
        </div>
      ) : (
        /* Default layout for themes 1, 17, 18, 20, 21 */
        <div
          className="absolute inset-0 overflow-y-auto scrollbar-hide z-20 flex flex-col"
          style={{
            background: (hasMediaBg || isPremiumTheme || ((theme === 1 || theme === 17 || theme === 19 || theme === 21 || theme === 'custom') && wallpaperMode !== 'colors') || theme === 'customMedia') ? 'transparent' : colors.cardBackground,
            fontFamily: font,
          }}
        >


          {/* ── Header Section ── */}
          {theme === 21 ? (
            // Canvas theme
            <>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 0.5,
                marginTop: 24,
                marginBottom: 24,
                textAlign: 'center',
                color: colors.primaryText,
                ...colorTransitionStyle,
              }}>
                The Crumb
              </h1>

              {/* Profile Image */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                {profile.avatar ? (
                  <img
                    src={optimizeAvatar(profile.avatar)}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: profileImageLayout === 'square' ? '24px' : '50%',
                      objectFit: 'cover',
                      border: '4px solid white',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                      background: 'white',
                    }}
                  />
                ) : (
                  <div style={{
                    width: 90,
                    height: 90,
                    borderRadius: profileImageLayout === 'square' ? '24px' : '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    border: '4px solid white',
                    color: '#ccc',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                  }}>
                    <User size={36} />
                  </div>
                )}
              </div>
            </>
          ) : (
            // All other themes: Normal banner with subtle gradient
            <div
              style={{
                background: `linear-gradient(to bottom, ${colors.topBlock}, ${shiftColor(colors.topBlock, 0, -8)})`,
                padding: '24px 20px 0',
                textAlign: 'center',
                color: 'white',
                flexShrink: 0,
                ...colorTransitionStyle,
              }}
            >
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 0.5,
                marginBottom: 24,
                color: '#FFFFFF',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                ...colorTransitionStyle,
              }}>
                The Crumb
              </h1>

              {/* Profile Image - Negative margin automatically bisects the avatar into the boundary! */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: -40 }}>
                {profile.avatar ? (
                  <img
                    src={optimizeAvatar(profile.avatar)}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: profileImageLayout === 'square' ? '24px' : '50%',
                      objectFit: 'cover',
                      border: '4px solid white',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                      background: 'white',
                      position: 'relative',
                      zIndex: 10,
                    }}
                  />
                ) : (
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: profileImageLayout === 'square' ? '24px' : '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    border: '4px solid white',
                    color: '#ccc',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                    position: 'relative',
                    zIndex: 10,
                  }}>
                    <User size={36} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Profile Info ── */}
          <div style={{
            padding: theme === 21 ? '16px 16px 6px' : '64px 16px 6px', // No overlap for theme 21, normal overlap for others
            textAlign: 'center',
            backgroundColor: (hasMediaBg || isPremiumTheme || ((theme === 1 || theme === 17 || theme === 19 || theme === 21 || theme === 'custom') && wallpaperMode !== 'colors') || theme === 'customMedia') ? 'transparent' : colors.cardBackground,
            ...colorTransitionStyle,
          }}>
            <h2 style={{
              fontFamily: font,
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 4,
              color: colors.primaryText,
              ...colorTransitionStyle,
            }}>
              {profile.name}
            </h2>
            {profile.bio && (
              <p style={{
                fontFamily: font,
                fontSize: 13,
                color: colors.secondaryText,
                opacity: 0.85,
                lineHeight: 1.5,
                maxWidth: 260,
                margin: '0 auto 6px',
                ...colorTransitionStyle,
              }}>
                {profile.bio}
              </p>
            )}

            {socialIcons && socialIcons.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 16,
                flexWrap: 'wrap',
                margin: '10px 0 0',
              }}>
                {socialIcons.map((icon, i) => {
                  // Get the original brand color without any adaptation
                  const iconColor = getBrandColor(icon.platform) || '#666666';

                  return (
                    <a
                      key={i}
                      href={icon.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        color: iconColor,
                        fontSize: 32,
                        textDecoration: 'none',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      onClick={(e) => { e.preventDefault(); }}
                    >
                      <i className={getLinkIconClass(icon.platform, icon.url)} style={{ fontSize: 'inherit' }} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Content ── */}
          <div style={{
            padding: spacing.contentPadding,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: (hasMediaBg || isPremiumTheme || ((theme === 1 || theme === 17 || theme === 19 || theme === 21 || theme === 'custom') && wallpaperMode !== 'colors') || theme === 'customMedia') ? 'transparent' : colors.cardBackground,
            ...colorTransitionStyle,
          }}>
            {/* Search */}
            <div style={{
              position: 'sticky',
              top: 0,
              zIndex: 5,
              padding: '10px 0 8px',
              backgroundColor: (hasMediaBg || isPremiumTheme || ((theme === 1 || theme === 17 || theme === 19 || theme === 21 || theme === 'custom') && wallpaperMode !== 'colors') || theme === 'customMedia') ? 'transparent' : colors.cardBackground,
              ...colorTransitionStyle,
            }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 36px 10px 14px',
                    borderRadius: 10,
                    border: `1.5px solid ${colors.primaryText}1F`,
                    fontSize: 13,
                    backgroundColor: hasMediaBg ? 'rgba(255,255,255,0.12)' : colors.cardBackground,
                    color: colors.primaryText,
                    outline: 'none',
                    backdropFilter: hasMediaBg ? 'blur(8px)' : (isPremiumTheme ? 'blur(4px)' : 'none'),
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    ...colorTransitionStyle,
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: 12,
                  color: colors.primaryText,
                  opacity: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  ...colorTransitionStyle,
                }}>
                  {searchQuery ? (
                    <button
                      onClick={() => onSearchChange?.('')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  ) : (
                    <Search style={{ width: 14, height: 14 }} />
                  )}
                </div>
              </div>
            </div>

            {/* Header separator */}
            {visibleLinks.length > 0 && !searchQuery && (
              <div style={{ textAlign: 'center', marginTop: '8px', marginBottom: '12px' }}>
                <h3 style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  color: colors.primaryText,
                  ...colorTransitionStyle,
                }}>
                  Recently Added
                </h3>
              </div>
            )}

            {/* Links */}
            <div style={{
              display: linkLayout === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: linkLayout === 'grid' ? 'repeat(2, 1fr)' : undefined,
              flexDirection: linkLayout === 'grid' ? undefined : 'column',
              gap: linkLayout === 'grid' ? 12 : spacing.linkGap,
              marginTop: 4,
              flexGrow: 1,
            }}>
              {visibleLinks.length > 0 ? visibleLinks.map(function renderPreviewLink(link: any, index: number, passedLayout?: any): any {
                // Use linkLayout as default if no passedLayout is provided
                const currentLayout = typeof passedLayout === 'string' ? passedLayout : linkLayout;
                // Same rendering behavior as PublicProfile for specific blocks
                if (link.type === 'Collection' || link.type === 'collection') {
                  const children = link.childrenLinks || [];
                  return (
                    <div
                      key={link.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        gridColumn: linkLayout === 'grid' ? '1 / -1' : undefined,
                        marginBottom: children.length > 0 ? 12 : 0,
                        ...getAnimationStyle(linkAnimation, index),
                      }}
                    >
                      <h3 style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: colors.primaryText,
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        textAlign: 'center',
                        padding: '16px 0 12px',
                        ...colorTransitionStyle,
                      }}>
                        {link.title}
                      </h3>
                      {children.length > 0 && (() => {
                        const childLayout = link.metadata?.layout === 'grid' ? 'grid' : 'list';
                        return (
                          <div style={{
                            display: childLayout === 'grid' ? 'grid' : 'flex',
                            gridTemplateColumns: childLayout === 'grid' ? 'repeat(2, 1fr)' : undefined,
                            flexDirection: childLayout === 'grid' ? undefined : 'column',
                            gap: childLayout === 'grid' ? 12 : spacing.linkGap,
                            width: '100%',
                          }}>
                            {children.map((child: any, cIndex: number) => renderPreviewLink(child, index + cIndex + 1, childLayout))}
                          </div>
                        );
                      })()}
                    </div>
                  );
                }

                if (link.type === 'text') {
                  return (
                    <div
                      key={link.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: 20,
                        background: hasMediaBg ? 'rgba(255,255,255,0.12)' : colors.linkFooterBackground,
                        borderRadius: borderRadius,
                        color: colors.primaryText,
                        border: hasMediaBg ? '1px solid rgba(255,255,255,0.15)' : `1.5px solid ${colors.primaryText}1F`,
                        boxShadow: shadow,
                        backdropFilter: hasMediaBg ? 'blur(8px)' : (isPremiumTheme ? 'blur(4px)' : 'none'),
                        ...getAnimationStyle(linkAnimation, index),
                        ...colorTransitionStyle,
                      }}
                    >
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, ...colorTransitionStyle }}>
                        {link.title}
                      </h3>
                      <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8, whiteSpace: 'pre-wrap', ...colorTransitionStyle }}>
                        {link.metadata?.content || ''}
                      </p>
                    </div>
                  );
                }

                if (link.type === 'video') {
                  const videoUrl = link.metadata?.videoUrl || link.url || '';
                  let videoId = '';
                  try {
                    const urlObj = new URL(videoUrl);
                    videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop() || '';
                  } catch {
                    videoId = '';
                  }

                  return (
                    <div
                      key={link.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        padding: 0,
                        overflow: 'hidden',
                        background: hasMediaBg ? 'rgba(255,255,255,0.12)' : colors.linkFooterBackground,
                        borderRadius: '10px', // Always use rounded corners for video embeds
                        color: colors.primaryText,
                        border: hasMediaBg ? '1px solid rgba(255,255,255,0.15)' : `1.5px solid ${colors.primaryText}1F`,
                        boxShadow: shadow,
                        backdropFilter: hasMediaBg ? 'blur(8px)' : (isPremiumTheme ? 'blur(4px)' : 'none'),
                        ...getAnimationStyle(linkAnimation, index),
                        ...colorTransitionStyle,
                      }}
                    >
                      {videoId && (
                        <iframe
                          width="100%"
                          height="200"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={link.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ border: 'none' }}
                        />
                      )}
                      <div style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, ...colorTransitionStyle }}>{link.title}</span>
                      </div>
                    </div>
                  );
                }

                if (link.type === 'lead') {
                  return (
                    <div
                      key={link.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        padding: 20,
                        background: hasMediaBg ? 'rgba(255,255,255,0.12)' : colors.linkFooterBackground,
                        borderRadius: borderRadius,
                        color: colors.primaryText,
                        border: hasMediaBg ? '1px solid rgba(255,255,255,0.15)' : `1.5px solid ${colors.primaryText}1F`,
                        boxShadow: shadow,
                        backdropFilter: hasMediaBg ? 'blur(8px)' : (isPremiumTheme ? 'blur(4px)' : 'none'),
                        ...getAnimationStyle(linkAnimation, index),
                        ...colorTransitionStyle,
                      }}
                    >
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, ...colorTransitionStyle }}>
                        {link.title}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input
                          type="text"
                          placeholder="Your name (optional)"
                          disabled
                          style={{
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: `1px solid ${colors.primaryText}33`,
                            fontSize: 14,
                            background: colors.cardBackground,
                            color: colors.primaryText,
                            ...colorTransitionStyle,
                          }}
                        />
                        <input
                          type="email"
                          placeholder="Your email"
                          disabled
                          style={{
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: `1px solid ${colors.primaryText}33`,
                            fontSize: 14,
                            background: colors.cardBackground,
                            color: colors.primaryText,
                            ...colorTransitionStyle,
                          }}
                        />
                        <button
                          disabled
                          style={{
                            padding: '12px',
                            borderRadius: 8,
                            border: 'none',
                            fontSize: 14,
                            fontWeight: 600,
                            backgroundColor: colors.primaryText,
                            color: colors.cardBackground,
                            cursor: 'not-allowed',
                            opacity: 0.8,
                            ...colorTransitionStyle,
                          }}
                        >
                          {link.metadata?.submitText || 'Subscribe'}
                        </button>
                      </div>
                    </div>
                  );
                }

                // Handle generic links, email bounds, etc.
                let linkHref = link.url || '#';

                // If it's an email link, properly attach the subject and body to the href!
                if (link.type === 'email') {
                  const subject = link.metadata?.subject || '';
                  const body = link.metadata?.body || '';
                  // Make sure url contains mailto:
                  const baseEmail = link.url?.startsWith('mailto:') ? link.url : `mailto:${link.url}`;
                  linkHref = `${baseEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }

                if (link.type === 'button') {
                  linkHref = '#';
                }

                // Check if this is a video platform link to avoid pill styling on video thumbnails
                const isVideoLink = (link.url || '').toLowerCase().includes('youtube.com') ||
                  (link.url || '').toLowerCase().includes('tiktok.com') ||
                  (link.url || '').toLowerCase().includes('twitch.tv') ||
                  (link.title || '').toLowerCase().includes('youtube') ||
                  (link.title || '').toLowerCase().includes('tiktok') ||
                  (link.title || '').toLowerCase().includes('twitch');
                const shouldUsePillRadius = buttonStyle === 'pill' && !isVideoLink;
                const linkBorderRadius = shouldUsePillRadius ? '999px' : borderRadius;

                if (link.metadata?.layout === 'featured') {
                  return (
                    <a
                      key={link.id}
                      href={linkHref}
                      target={link.type === 'email' ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (link.type === 'button') {
                          e.preventDefault();
                          setSelectedButtonModal(link);
                        } else if (onLinkClick) {
                          e.preventDefault();
                          onLinkClick(link.id);
                        }
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        padding: 0,
                        background: hasMediaBg ? 'rgba(255,255,255,0.12)' : colors.linkFooterBackground,
                        borderRadius: linkBorderRadius === '999px' ? '24px' : linkBorderRadius, // Pill doesn't work well for large cards
                        textDecoration: 'none',
                        color: colors.primaryText,
                        border: hasMediaBg ? '1px solid rgba(255,255,255,0.15)' : `1.5px solid ${colors.primaryText}1F`,
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: shadow,
                        transition: 'all 0.2s ease',
                        backdropFilter: hasMediaBg ? 'blur(8px)' : (isPremiumTheme ? 'blur(4px)' : 'none'),
                        gridColumn: currentLayout === 'grid' ? '1 / -1' : undefined,
                        ...getAnimationStyle(linkAnimation, index),
                        ...colorTransitionStyle,
                      }}
                    >
                      {/* Full width image banner */}
                      {link.image ? (
                        <div style={{ width: '100%', height: 140, overflow: 'hidden' }}>
                          <img
                            src={link.image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)' }}>
                          <i
                            className={getLinkIconClass(link.title, link.url)}
                            style={{
                              fontSize: 32,
                              color: (() => {
                                const platform = getPlatformFromLink(link.title, link.url);
                                if (platform) {
                                  return getBrandColor(platform) || colors.secondaryText;
                                }
                                return colors.secondaryText;
                              })(),
                              opacity: 0.5,
                              ...colorTransitionStyle
                            }}
                          />
                        </div>
                      )}

                      {/* Title & URL section */}
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: colors.secondaryText, textAlign: 'center', marginBottom: 4, ...colorTransitionStyle }}>
                          {link.title}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: colors.secondaryText, opacity: 0.7, textAlign: 'center', ...colorTransitionStyle }}>
                          {linkHref.replace('mailto:', '').replace('https://', '').replace('http://', '').split('/')[0]}
                        </span>
                      </div>
                    </a>
                  );
                }

                return (
                  <a
                    key={link.id}
                    href={linkHref}
                    target={link.type === 'email' ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (link.type === 'button') {
                        e.preventDefault();
                        setSelectedButtonModal(link);
                      } else if (onLinkClick) {
                        e.preventDefault();
                        onLinkClick(link.id);
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: currentLayout === 'grid' ? 'column' : 'row',
                      alignItems: currentLayout === 'grid' ? 'stretch' : 'center',
                      justifyContent: currentLayout === 'grid' ? 'flex-start' : undefined,
                      height: currentLayout === 'grid' ? '180px' : 66,
                      padding: currentLayout === 'grid' ? 0 : '0 14px',
                      background: hasMediaBg ? 'rgba(255,255,255,0.12)' : colors.linkFooterBackground,
                      borderRadius: currentLayout === 'grid' ? '16px' : linkBorderRadius,
                      textDecoration: 'none',
                      color: colors.primaryText,
                      border: hasMediaBg ? '1px solid rgba(255,255,255,0.15)' : `1.5px solid ${colors.primaryText}1F`,
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: shadow,
                      transition: 'all 0.2s ease',
                      backdropFilter: hasMediaBg ? 'blur(8px)' : (isPremiumTheme ? 'blur(4px)' : 'none'),
                      gap: currentLayout === 'grid' ? 0 : undefined,
                      ...getAnimationStyle(linkAnimation, index),
                      ...colorTransitionStyle,
                    }}
                  >
                    {currentLayout === 'grid' ? (
                      <>
                        {/* Grid Card Layout */}
                        {/* Image Section - 80% of card height */}
                        <div style={{
                          width: '100%',
                          height: '80%',
                          overflow: 'hidden',
                          borderRadius: '16px 16px 0 0',
                          position: 'relative',
                          backgroundColor: link.image ? 'transparent' : 'rgba(0,0,0,0.03)',
                        }}>
                          {link.image ? (
                            <img
                              src={link.image}
                              alt=""
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: `linear-gradient(135deg, ${colors.primaryText}15, ${colors.primaryText}05)`,
                            }}>
                              <i
                                className={getLinkIconClass(link.title, link.url)}
                                style={{
                                  fontSize: 36,
                                  color: (() => {
                                    const platform = getPlatformFromLink(link.title, link.url);
                                    if (platform) {
                                      return getBrandColor(platform) || colors.secondaryText;
                                    }
                                    return colors.secondaryText;
                                  })(),
                                  opacity: 0.4,
                                  ...colorTransitionStyle,
                                }}
                              />
                            </div>
                          )}

                          {/* Share Button Overlay */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleShare(link);
                            }}
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              background: 'rgba(255,255,255,0.95)',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 8,
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              fontSize: 12,
                              color: colors.primaryText,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 5,
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              ...colorTransitionStyle,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <i className="fas fa-share-alt" />
                          </button>
                        </div>

                        {/* Content Section - 20% of card height, only name centered */}
                        <div style={{
                          height: '20%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          padding: '0 8px',
                        }}>
                          <span style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: colors.primaryText,
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '100%',
                            ...colorTransitionStyle,
                          }}>
                            {link.title}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* List Layout (Original) */}
                        {/* Icon or Image */}
                        {link.image ? (
                          <img
                            src={link.image}
                            alt=""
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 4,
                              objectFit: 'cover',
                              position: 'absolute' as const,
                              left: 14,
                              top: '50%',
                              transform: 'translateY(-50%)',
                            }}
                          />
                        ) : (
                          <i
                            className={getLinkIconClass(link.title, link.url)}
                            style={{
                              fontSize: 14,
                              color: (() => {
                                const platform = getPlatformFromLink(link.title, link.url);
                                if (platform) {
                                  return getBrandColor(platform) || colors.secondaryText;
                                }
                                return colors.secondaryText;
                              })(),
                              width: 20,
                              textAlign: 'center',
                              position: 'absolute' as const,
                              left: 14,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              ...colorTransitionStyle,
                            }}
                          />
                        )}

                        {/* Title */}
                        <span style={{
                          position: 'absolute' as const,
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '60%',
                          fontSize: 12,
                          fontWeight: 600,
                          textAlign: 'center',
                          color: colors.secondaryText,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          ...colorTransitionStyle,
                        }}>
                          {link.title}
                        </span>

                        {/* Share Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShare(link);
                          }}
                          style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 8,
                            borderRadius: 6,
                            fontSize: 14,
                            color: colors.secondaryText,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 5,
                            transition: 'all 0.2s ease',
                            ...colorTransitionStyle,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                          }}
                        >
                          <i className="fas fa-share-alt" />
                        </button>
                      </>
                    )}
                  </a>
                );
              }) : (
                <div style={{
                  textAlign: 'center',
                  padding: 16,
                  fontSize: 13,
                  color: colors.secondaryText,
                  opacity: 0.7,
                  gridColumn: linkLayout === 'grid' ? 'span 2' : undefined,
                  ...colorTransitionStyle,
                }}>
                  {searchQuery ? 'No matching links found.' : 'No links yet'}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: '16px',
            textAlign: 'center',
            fontSize: 12,
            color: colors.secondaryText,
            borderTop: hasMediaBg ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${colors.primaryText}0F`,
            backgroundColor: hasMediaBg ? 'rgba(0,0,0,0.1)' : '#F6F7F9',
            flexShrink: 0,
            fontWeight: 500,
            ...colorTransitionStyle,
          }}>
            <p>Report • Privacy</p>
          </div>
        </div>
      )}

      {/* Button Popup Modal */}
      <AnimatePresence>
        {selectedButtonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedButtonModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl w-full max-w-[340px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
              onClick={e => e.stopPropagation()}
              style={{ fontFamily: font }}
            >
              <div className="p-8 flex flex-col items-center text-center">
                <h3 className="text-2xl font-bold mb-5 tracking-tight" style={{ color: colors.primaryText, ...colorTransitionStyle }}>
                  {selectedButtonModal.title}
                </h3>

                {selectedButtonModal.image && (
                  <div className="w-full aspect-video mb-6 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
                    <img
                      src={selectedButtonModal.image}
                      alt={selectedButtonModal.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                  </div>
                )}

                {selectedButtonModal.metadata?.content && (
                  <p
                    className="text-base font-medium mb-8 whitespace-pre-wrap flex-1 overflow-y-auto max-h-[35vh] w-full px-2"
                    style={{ color: colors.primaryText, opacity: 0.9, lineHeight: 1.6, ...colorTransitionStyle }}
                  >
                    {selectedButtonModal.metadata.content}
                  </p>
                )}

                <button
                  onClick={() => {
                    const textToCopy = selectedButtonModal.metadata?.content || selectedButtonModal.url || selectedButtonModal.title;
                    if (textToCopy) {
                      navigator.clipboard.writeText(textToCopy);
                      alert('Description copied to clipboard!');
                    }
                  }}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-[17px] shadow-md transition-all active:scale-[0.98] hover:shadow-lg hover:brightness-110"
                  style={{
                    backgroundColor: colors.primaryText || '#111',
                    color: colors.cardBackground || '#fff',
                    border: 'none',
                    ...colorTransitionStyle,
                  }}
                >
                  Copy to Clipboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo to prevent unnecessary re-renders
  return (
    prevProps.appliedColors === nextProps.appliedColors &&
    prevProps.backgroundStyle === nextProps.backgroundStyle &&
    prevProps.wallpaperMode === nextProps.wallpaperMode &&
    prevProps.theme === nextProps.theme &&
    prevProps.links === nextProps.links &&
    prevProps.profile === nextProps.profile &&
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.customBackground === nextProps.customBackground &&
    prevProps.linkLayout === nextProps.linkLayout &&
    prevProps.pageLayout === nextProps.pageLayout &&
    prevProps.profileImageLayout === nextProps.profileImageLayout &&
    prevProps.buttonStyle === nextProps.buttonStyle &&
    prevProps.linkAnimation === nextProps.linkAnimation &&
    prevProps.spacingMode === nextProps.spacingMode &&
    prevProps.fontFamily === nextProps.fontFamily &&
    prevProps.shadowIntensity === nextProps.shadowIntensity &&
    prevProps.activeAd === nextProps.activeAd
  );
});

export default MobilePreview;
