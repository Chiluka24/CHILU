import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Smartphone,
  User,
  AlignLeft,
  Square,
  Link2,
  RotateCcw,
  Palette,
  Plus,
  List,
  Grid,
  X,
  Trash2,
  Save,
  Maximize2,
  Eye,
  UploadCloud,
  Layout,
  TrendingUp,
  Settings,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Github,
  LayoutGrid,
  Sparkles,
  Wrench,
  Music,
  MessageCircle,
  Camera,
  Mail,
  Phone,
  Globe,
  Target
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import ImageCropperModal from '../../components/ui/ImageCropperModal';
import ProfilePictureModal from '../../components/appearance/ProfilePictureModal';
import MobilePreview from '../../components/appearance/MobilePreview';
import { API_BASE } from '../../config/env';
import { optimizeAvatar } from '../../lib/imageOptimizer';
import CustomDropdown from '../../components/ui/CustomDropdown';
import {
  InstagramIcon,
  TwitterIcon,
  LinkedInIcon,
  YouTubeIcon,
  TikTokIcon,
  GitHubIcon,
  FacebookIcon,
  SnapchatIcon,
  PinterestIcon,
  DiscordIcon,
  TwitchIcon,
  RedditIcon,
  WhatsAppIcon,
  TelegramIcon,
  SpotifyIcon
} from '../../components/icons/PlatformIcons';
import { getBrandColor } from '../../lib/brandColors';
import { deriveColors, validateWCAG, type DerivedColors } from '../../lib/colorDeriver';

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

export const DEFAULT_COLORS = {
  topBlock: '#FFFFFF',
  primaryText: '#1A0F08',
  secondaryText: '#3D2817',
  cardBackground: '#FFFFFF',
  linkFooterBackground: '#F6F7F9',
};

export type AppearanceColors = typeof DEFAULT_COLORS;

export const THEME_PRESETS: Record<number, AppearanceColors> = {
  1: { topBlock: '#E8E8E8', primaryText: '#1A0F08', secondaryText: '#3D2817', cardBackground: '#FFFFFF', linkFooterBackground: '#F6F7F9' }, // Clean (Default)
  2: { topBlock: '#1A0F08', primaryText: '#1A0F08', secondaryText: '#3D2817', cardBackground: '#F8F8F5', linkFooterBackground: '#F0EFE8' }, // Dark Coffee
  3: { topBlock: '#1a1a2e', primaryText: '#FFFFFF', secondaryText: '#67E8F9', cardBackground: 'rgba(255,255,255,0.05)', linkFooterBackground: 'rgba(255,255,255,0.08)' }, // Cosmic Vision
  4: { topBlock: '#0f4c75', primaryText: '#FFFFFF', secondaryText: 'rgba(255,255,255,0.9)', cardBackground: 'rgba(255,255,255,0.15)', linkFooterBackground: 'rgba(255,255,255,0.15)' }, // Aqua Flow
  5: { topBlock: '#0a0a0a', primaryText: '#00FFFF', secondaryText: '#FF00FF', cardBackground: 'rgba(0,0,0,0.5)', linkFooterBackground: 'rgba(0,0,0,0.6)' }, // Cyber Strike
  6: { topBlock: '#2d1b4e', primaryText: '#FFFFFF', secondaryText: '#E9D5FF', cardBackground: 'rgba(255,255,255,0.04)', linkFooterBackground: 'rgba(255,255,255,0.06)' }, // Purple Haze
  7: { topBlock: '#F0F0F0', primaryText: '#1A0F08', secondaryText: '#3D2817', cardBackground: '#FFFFFF', linkFooterBackground: '#F6F7F9' }, // Light
  8: { topBlock: '#1e293b', primaryText: '#F1F5F9', secondaryText: '#94A3B8', cardBackground: 'rgba(255,255,255,0.04)', linkFooterBackground: 'rgba(255,255,255,0.06)' }, // Slate
  9: { topBlock: '#1A0F08', primaryText: '#FFFFFF', secondaryText: '#D4A574', cardBackground: 'rgba(255,255,255,0.05)', linkFooterBackground: 'rgba(255,255,255,0.07)' }, // Coffee Gold
  17: { topBlock: '#10b981', primaryText: '#065F46', secondaryText: '#059669', cardBackground: '#FFFFFF', linkFooterBackground: '#F0FDF4' }, // Mint
  18: { topBlock: '#fb7185', primaryText: '#881337', secondaryText: '#E11D48', cardBackground: '#FFFFFF', linkFooterBackground: '#FFE4E6' }, // Rose
  20: { topBlock: '#27272a', primaryText: '#FAFAFA', secondaryText: '#A1A1AA', cardBackground: 'rgba(255,255,255,0.05)', linkFooterBackground: 'rgba(255,255,255,0.07)' }, // Carbon
  21: { topBlock: '#D4D4D4', primaryText: '#1A0F08', secondaryText: '#3D2817', cardBackground: '#FFFFFF', linkFooterBackground: '#F6F7F9' }, // Canvas
};

const COLOR_SWATCHES: Record<keyof AppearanceColors, string[]> = {
  topBlock: [
    '#FFFFFF', // Pure White (Default)
    '#F9FAFB', // Off White
    '#F3F4F6', // Light Gray
    '#E5E7EB', // Gray
    '#D1D5DB', // Medium Gray
    '#9CA3AF', // Dark Gray
    '#6B7280', // Charcoal
    '#000000', // Black
  ],
  primaryText: [
    '#000000', // Black (Default)
    '#111827', // Near Black
    '#1F2937', // Dark Gray
    '#374151', // Medium Dark
    '#4B5563', // Medium
    '#6B7280', // Gray
    '#9CA3AF', // Light Gray
    '#FFFFFF', // White (for dark backgrounds)
  ],
  secondaryText: [
    '#666666', // Medium Gray (Default)
    '#6B7280', // Gray
    '#9CA3AF', // Light Gray
    '#D1D5DB', // Lighter Gray
    '#4B5563', // Dark Gray
    '#374151', // Darker Gray
    '#1F2937', // Very Dark
    '#E5E7EB', // Very Light
  ],
  cardBackground: [
    '#FFFFFF', // Pure White (Default)
    '#F9FAFB', // Off White
    '#F3F4F6', // Light Gray
    '#F6F7F9', // Subtle Gray
    '#E5E7EB', // Gray
    '#FAFAFA', // Warm White
    '#F8F9FA', // Cool White
    '#F5F5F5', // Smoke White
  ],
  linkFooterBackground: [
    '#F6F7F9', // Light Gray (Default)
    '#F3F4F6', // Subtle Gray
    '#F9FAFB', // Off White
    '#E5E7EB', // Gray
    '#FFFFFF', // White
    '#F8F9FA', // Cool White
    '#FAFAFA', // Warm White
    '#D1D5DB', // Medium Gray
  ],
};

const SOCIAL_PLATFORMS = [
  'Instagram', 'Twitter', 'LinkedIn', 'YouTube', 'TikTok', 'Facebook',
  'Snapchat', 'Pinterest', 'Spotify', 'Discord', 'Twitch', 'GitHub',
  'Reddit', 'WhatsApp', 'Telegram', 'Email',
];

// Function to get icon for social platform
const getSocialPlatformIcon = (platform: string) => {
  const iconMap: Record<string, any> = {
    'Instagram': InstagramIcon,
    'Twitter': TwitterIcon,
    'LinkedIn': LinkedInIcon,
    'YouTube': YouTubeIcon,
    'Facebook': FacebookIcon,
    'GitHub': GitHubIcon,
    'TikTok': TikTokIcon,
    'Snapchat': SnapchatIcon,
    'Pinterest': PinterestIcon,
    'Spotify': SpotifyIcon,
    'Discord': DiscordIcon,
    'Twitch': TwitchIcon,
    'Reddit': RedditIcon,
    'WhatsApp': WhatsAppIcon,
    'Telegram': TelegramIcon,
    'Email': Mail,
  };
  return iconMap[platform] || Globe; // Default to Globe for unknown platforms
};

const TYPOGRAPHY_OPTIONS = [
  {
    id: 'inter',
    name: 'Inter',
    category: 'Modern Sans',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Clean and versatile for all content types'
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    category: 'Elegant Serif',
    fontFamily: "'Playfair Display', Georgia, serif",
    description: 'Sophisticated and luxurious feel'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'Geometric Sans',
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Friendly and approachable design'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    category: 'Modern Sans',
    fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Professional and highly readable'
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'Geometric Sans',
    fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Bold and contemporary style'
  },
  {
    id: 'lora',
    name: 'Lora',
    category: 'Classic Serif',
    fontFamily: "'Lora', Georgia, serif",
    description: 'Warm and editorial aesthetic'
  },
  {
    id: 'raleway',
    name: 'Raleway',
    category: 'Elegant Sans',
    fontFamily: "'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Refined and minimalist'
  },
  {
    id: 'opensans',
    name: 'Open Sans',
    category: 'Humanist Sans',
    fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Neutral and highly legible'
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    category: 'Classic Serif',
    fontFamily: "'Merriweather', Georgia, serif",
    description: 'Traditional and trustworthy'
  },
  {
    id: 'nunito',
    name: 'Nunito',
    category: 'Rounded Sans',
    fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Soft and welcoming appearance'
  },
  {
    id: 'sourcesans',
    name: 'Source Sans Pro',
    category: 'Humanist Sans',
    fontFamily: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Clear and professional'
  },
  {
    id: 'worksans',
    name: 'Work Sans',
    category: 'Modern Sans',
    fontFamily: "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Technical and precise'
  },
  {
    id: 'dmserif',
    name: 'DM Serif Display',
    category: 'Display Serif',
    fontFamily: "'DM Serif Display', Georgia, serif",
    description: 'High-contrast and dramatic'
  },
  {
    id: 'crimson',
    name: 'Crimson Text',
    category: 'Classic Serif',
    fontFamily: "'Crimson Text', Georgia, serif",
    description: 'Literary and scholarly'
  },
  {
    id: 'cormorant',
    name: 'Cormorant',
    category: 'Display Serif',
    fontFamily: "'Cormorant', Georgia, serif",
    description: 'Graceful and artistic'
  },
  {
    id: 'spectral',
    name: 'Spectral',
    category: 'Modern Serif',
    fontFamily: "'Spectral', Georgia, serif",
    description: 'Contemporary and elegant'
  },
  {
    id: 'karla',
    name: 'Karla',
    category: 'Grotesque Sans',
    fontFamily: "'Karla', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Simple and straightforward'
  },
  {
    id: 'rubik',
    name: 'Rubik',
    category: 'Rounded Sans',
    fontFamily: "'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Playful and modern'
  },
  {
    id: 'spacegrotesk',
    name: 'Space Grotesk',
    category: 'Geometric Sans',
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Tech-forward and distinctive'
  },
  {
    id: 'manrope',
    name: 'Manrope',
    category: 'Modern Sans',
    fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Balanced and versatile'
  },
];

const THEME_PREVIEW_DATA = [
  { id: 1, light: true, name: 'Clean' },
  { id: 2, light: true, name: 'Crumb' },
  { id: 17, light: true, name: 'Mint' },
  { id: 18, light: true, name: 'Rose' },
  { id: 20, light: false, name: 'Carbon' },
  { id: 21, light: true, name: 'Canvas' },
];

export type BackgroundStyle = {
  type: 'fill' | 'gradient';
  color: string;
  direction: 'up' | 'down' | 'radial';
  noise: boolean;
};

export type ButtonStyle = 'rounded' | 'sharp' | 'pill';
export type LinkAnimation = 'none' | 'fade' | 'slide' | 'scale' | 'bounce';
export type SpacingMode = 'compact' | 'comfortable' | 'spacious';
export type FontFamily =
  | 'inter'
  | 'playfair'
  | 'poppins'
  | 'roboto'
  | 'montserrat'
  | 'lora'
  | 'raleway'
  | 'opensans'
  | 'merriweather'
  | 'nunito'
  | 'sourcesans'
  | 'worksans'
  | 'dmserif'
  | 'crimson'
  | 'cormorant'
  | 'spectral'
  | 'karla'
  | 'rubik'
  | 'spacegrotesk'
  | 'manrope';

interface AppearanceProps {
  activeTheme: number | 'custom' | 'customMedia';
  setActiveTheme: (theme: number | 'custom' | 'customMedia') => void;
  appliedColors: AppearanceColors;
  setAppliedColors: (colors: AppearanceColors) => void;
  customBackground?: string | null;
  setCustomBackground?: (bg: string | null) => void;
  backgroundStyle?: BackgroundStyle;
  setBackgroundStyle?: (style: BackgroundStyle) => void;
  profile: { name: string; bio: string; avatar: string };
  setProfile: (profile: { name: string; bio: string; avatar: string }) => void;
  linkLayout?: 'list' | 'grid'; // keep as optional for backward compatibility if needed, but we won't use it
  setLinkLayout?: (layout: 'list' | 'grid') => void;
  pageLayout: 'default' | 'mostRecent' | 'custom';
  setPageLayout: (layout: 'default' | 'mostRecent' | 'custom') => void;
  customLayoutLinks: string[];
  setCustomLayoutLinks: (links: string[]) => void;
  socialIcons: { platform: string; url: string }[];
  setSocialIcons: (icons: { platform: string; url: string }[]) => void;
  links: any[];
  profileImageLayout: 'classic' | 'square';
  setProfileImageLayout: (layout: 'classic' | 'square') => void;
  buttonStyle?: ButtonStyle;
  setButtonStyle?: (style: ButtonStyle) => void;
  linkAnimation?: LinkAnimation;
  setLinkAnimation?: (animation: LinkAnimation) => void;
  spacingMode?: SpacingMode;
  setSpacingMode?: (mode: SpacingMode) => void;
  fontFamily?: FontFamily;
  setFontFamily?: (font: FontFamily) => void;
  shadowIntensity?: number;
  setShadowIntensity?: (intensity: number) => void;
  wallpaperMode?: 'colors' | 'fill' | 'gradient';
  setWallpaperMode?: (mode: 'colors' | 'fill' | 'gradient') => void;
  hidePreviewButton?: boolean;
}

export default function Appearance({
  activeTheme,
  setActiveTheme,
  appliedColors,
  setAppliedColors,
  customBackground,
  setCustomBackground,
  backgroundStyle = { type: 'fill', color: '#2665D6', direction: 'up', noise: false },
  setBackgroundStyle,
  profile,
  setProfile,
  linkLayout,
  setLinkLayout,
  pageLayout,
  setPageLayout,
  customLayoutLinks,
  setCustomLayoutLinks,
  socialIcons,
  setSocialIcons,
  links,
  profileImageLayout,
  setProfileImageLayout,
  buttonStyle = 'rounded',
  setButtonStyle,
  linkAnimation = 'fade',
  setLinkAnimation,
  spacingMode = 'comfortable',
  setSpacingMode,
  fontFamily = 'inter',
  setFontFamily,
  shadowIntensity = 2,
  setShadowIntensity,
  wallpaperMode: externalWallpaperMode,
  setWallpaperMode: setExternalWallpaperMode,
  hidePreviewButton = false,
}: AppearanceProps) {
  const [customColors, setCustomColors] = useState<AppearanceColors>({ ...appliedColors });
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // State for derived colors from ColorDeriver (auto-generated base colors)
  const [derivedColors, setDerivedColors] = useState<DerivedColors | null>(null);

  // State for manual color overrides (tracks which colors user manually changed)
  const [manualColorOverrides, setManualColorOverrides] = useState<Partial<AppearanceColors>>({});

  // Social icon modal state
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState('Instagram');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // Typography modal state
  const [showTypographyModal, setShowTypographyModal] = useState(false);

  // Customize Colors modal state
  const [showCustomColorsModal, setShowCustomColorsModal] = useState(false);

  // Modal state management for sidebar blur effect
  useEffect(() => {
    if (showTypographyModal || showCustomColorsModal || showSocialModal || showMediaPicker) {
      window.dispatchEvent(new CustomEvent('modalStateChange', { detail: { isOpen: true } }));
    } else {
      window.dispatchEvent(new CustomEvent('modalStateChange', { detail: { isOpen: false } }));
    }
  }, [showTypographyModal, showCustomColorsModal, showSocialModal, showMediaPicker]);

  // Wallpaper mode state ('colors' | 'fill' | 'gradient')
  const [wallpaperMode, setWallpaperMode] = useState<'colors' | 'fill' | 'gradient'>(externalWallpaperMode || 'colors');

  // Active ad state - passed from parent or fetched if needed
  const [activeAd, setActiveAd] = useState<{
    id: string;
    brand: string;
    campaignName: string;
    bannerImage: string;
    clickUrl: string;
    category: string;
  } | null>(null);

  // NOTE: activeAd fetch removed - data is already fetched by parent LinksDesigns.tsx

  // Sync internal wallpaperMode with external prop
  useEffect(() => {
    if (externalWallpaperMode) {
      setWallpaperMode(externalWallpaperMode);
    }
  }, [externalWallpaperMode]);

  // Sync external wallpaperMode when internal changes
  const updateWallpaperMode = (mode: 'colors' | 'fill' | 'gradient') => {
    setWallpaperMode(mode);
    setExternalWallpaperMode?.(mode);
  };

  // Debounce utility function
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Debounced color derivation function
  const debouncedDeriveColors = useMemo(
    () => debounce((color: string) => {
      try {
        const derived = deriveColors(color);
        setDerivedColors(derived);

        // Merge auto-derived colors with manual overrides
        const mergedColors = { ...derived, ...manualColorOverrides };
        setAppliedColors(mergedColors);
        setCustomColors(mergedColors);
      } catch (error) {
        console.error('Color derivation failed:', error);
      }
    }, 100),
    [manualColorOverrides]
  );

  // Handle background color change with color derivation
  const handleBackgroundColorChange = (newColor: string) => {
    if (wallpaperMode === 'fill' || wallpaperMode === 'gradient') {
      // Trigger debounced color derivation
      debouncedDeriveColors(newColor);
    }

    // Update background style
    setBackgroundStyle?.({
      ...backgroundStyle,
      color: newColor,
    });
  };

  // Handle wallpaper mode change with color derivation
  const handleWallpaperModeChange = (mode: 'colors' | 'fill' | 'gradient') => {
    updateWallpaperMode(mode);

    if (mode === 'colors') {
      // Restore theme preset colors and clear manual overrides
      const themeColors = THEME_PRESETS[activeTheme as number] || DEFAULT_COLORS;
      setAppliedColors(themeColors);
      setCustomColors(themeColors);
      setDerivedColors(null);
      setManualColorOverrides({});
    } else {
      // Derive colors from current background color
      const baseColor = backgroundStyle?.color || '#2665D6';
      try {
        const derived = deriveColors(baseColor);
        setDerivedColors(derived);

        // Merge auto-derived colors with existing manual overrides
        const mergedColors = { ...derived, ...manualColorOverrides };
        setAppliedColors(mergedColors);
        setCustomColors(mergedColors);
      } catch (error) {
        console.error('Color derivation failed:', error);
      }
    }
  };

  // Mobile preview modal state
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [username, setUsername] = useState<string>('');

  // PERF: Get username from localStorage cache instead of extra API call
  // Parent LinksDesigns.tsx already fetches /api/user and has the username
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      // Decode JWT to get a basic identifier, or use cached value
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.username) setUsername(payload.username);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpenPicker(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setCustomColors({ ...appliedColors });
  }, [appliedColors]);

  const handleThemeSelect = (themeId: number) => {
    setActiveTheme(themeId);
    handleWallpaperModeChange('colors'); // Reset to default background style when switching themes
    const themeColors = THEME_PRESETS[themeId] || DEFAULT_COLORS;
    setAppliedColors(themeColors);
    setCustomColors(themeColors);
    if (setCustomBackground && themeId < 7) {
      // Clear custom background when selecting a non-media theme
      setCustomBackground(null);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('File size exceeds 20MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setCustomBackground?.(dataUrl);
        setActiveTheme('customMedia');
        setShowMediaPicker(false);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const saveToBackend = (updates: {
    profile?: Partial<typeof profile> & { socialIcons?: typeof socialIcons },
    appearance?: Partial<{
      theme: typeof activeTheme,
      colors: typeof appliedColors,
      customBackground: typeof customBackground,
      linkLayout?: 'list' | 'grid',
      pageLayout: typeof pageLayout,
      customLayoutLinks: typeof customLayoutLinks,
      wallpaperMode: typeof wallpaperMode
    }>
  }) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    console.log('💾 Saving to backend:', updates);
    fetch(`${API_BASE}/api/user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.text();
          console.error('❌ Save failed:', error);
          throw new Error(error);
        }
        const data = await res.json();
        console.log('✅ Saved successfully:', data);
        window.dispatchEvent(new Event('profileUpdated'));
      })
      .catch(err => {
        console.error('❌ Save error:', err);
        alert('Failed to save changes: ' + err.message);
      });
  };

  const handleSaveAll = async () => {
    let finalCustomBgUrl = customBackground;

    if (finalCustomBgUrl && finalCustomBgUrl.startsWith('data:')) {
      const token = localStorage.getItem('token');
      if (!token) { alert('Please login again.'); return; }
      try {
        const res = await fetch(`${API_BASE}/api/user/appearance-media`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ dataUrl: finalCustomBgUrl }) });
        if (!res.ok) throw new Error(await res.text() || 'Failed to upload background');
        const payload = await res.json();
        finalCustomBgUrl = payload.url;
        setCustomBackground?.(finalCustomBgUrl);
      } catch (err) {
        console.error(err);
        alert('Failed to save custom background.');
        return;
      }
    }

    // Determine which colors to save based on wallpaper mode
    let colorsToSave: AppearanceColors;

    if (wallpaperMode === 'fill' || wallpaperMode === 'gradient') {
      // For fill/gradient mode: merge auto-derived colors with manual overrides
      // Only manual overrides are explicitly saved, auto-derived colors are regenerated on load
      colorsToSave = derivedColors
        ? { ...derivedColors, ...manualColorOverrides }
        : (activeTheme === 'custom' ? customColors : (THEME_PRESETS[activeTheme as number] || DEFAULT_COLORS));
    } else {
      // For colors mode: save the selected theme colors or custom colors
      colorsToSave = activeTheme === 'custom'
        ? customColors
        : (THEME_PRESETS[activeTheme as number] || DEFAULT_COLORS);
    }

    const appearanceUpdates = {
      theme: activeTheme,
      colors: colorsToSave,
      customBackground: finalCustomBgUrl,
      backgroundStyle,
      pageLayout,
      customLayoutLinks,
      profileImageLayout,
      buttonStyle,
      linkAnimation,
      spacingMode,
      fontFamily,
      shadowIntensity,
      wallpaperMode,
    };
    saveToBackend({ profile: { ...profile, socialIcons }, appearance: appearanceUpdates });
    alert('Changes saved!');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert('File size exceeds 5MB limit.'); return; }
      const reader = new FileReader();
      reader.onload = () => setCropImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile: File) => {
    setCropImageUrl(null);
    const token = localStorage.getItem('token');
    if (!token) return;
    const fd = new FormData();
    fd.append('media', croppedFile);
    fetch(`${API_BASE}/api/user/appearance-media-file`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
    })
      .then(res => { if (!res.ok) throw new Error('Upload failed'); return res.json(); })
      .then(payload => {
        const up = { ...profile, avatar: payload.url };
        setProfile(up);
        saveToBackend({ profile: up });
      })
      .catch(err => { console.error(err); alert('Failed to upload image.'); });
  };

  const handlePresetAvatarSelect = (avatarUrl: string) => {
    const up = { ...profile, avatar: avatarUrl };
    setProfile(up);
    saveToBackend({ profile: up });
  };

  const handleAddSocialIcon = () => {
    if (!newSocialUrl.trim()) return;
    const updated = [...socialIcons, { platform: newSocialPlatform, url: newSocialUrl.trim() }];
    setSocialIcons(updated);
    setNewSocialPlatform('Instagram');
    setNewSocialUrl('');
    setShowSocialModal(false);
  };

  const handleRemoveSocialIcon = (index: number) => {
    setSocialIcons(socialIcons.filter((_, i) => i !== index));
  };

  // Copy URL handler
  const handleCopyUrl = async () => {
    try {
      if (username) {
        const profileUrl = `https://thecrumb.co/${username}`;
        await navigator.clipboard?.writeText(profileUrl);
      }
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  // Share URL handler
  const handleShareUrl = async () => {
    try {
      if (username) {
        const profileUrl = `https://thecrumb.co/${username}`;

        if (navigator.share) {
          await navigator.share({
            title: 'The Crumb Profile',
            url: profileUrl
          });
        } else {
          await navigator.clipboard?.writeText(profileUrl);
        }
      }
    } catch (error) {
      console.error('Failed to share URL:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 app-card app-page overflow-hidden" data-page="appearance">
      {/* Desktop-only title; the mobile/tablet top bar in LinksDesigns
          renders the heading on smaller breakpoints. */}
      <div className="hidden xl:block px-4 pt-4 pb-3 md:px-5 md:pt-5 md:pb-3 lg:px-6 lg:pt-6 lg:pb-4">
        <h1 className="font-bold tracking-tight app-page-main-title mb-0">Appearance</h1>
        <p className="text-xs md:text-sm app-page-subtitle mt-1 font-medium">
          Customize the look and feel of your public page
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-24 lg:pb-0 scrollbar-hide px-4 md:px-5 lg:px-6">
        <div className="flex flex-col gap-3 md:gap-4">

          {/* ═══ Profile ═══ */}
          <div className="app-card p-3 md:p-4">
            <h3 className="text-base font-semibold app-heading mb-0">Profile</h3>

            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-8 mt-3 md:mt-4">
              {/* Left: Profile Image Section */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="relative mb-8">
                  {profile.avatar ? (
                    <img
                      src={optimizeAvatar(profile.avatar)}
                      alt="Avatar"
                      loading="lazy"
                      className="w-32 h-32 rounded-full border-4 border-[var(--page-bg)] shadow-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-[var(--page-bg)] shadow-lg bg-[var(--surface-hover)] flex items-center justify-center text-[var(--muted-text)]">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 w-full max-w-[140px]">
                  {/* Hidden file input for the modal's upload flow */}
                  <input ref={avatarFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  {profile.avatar ? (
                    <>
                      <button
                        onClick={() => setShowProfilePicModal(true)}
                        className="app-button-primary px-4 py-2 text-sm font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-2 touch-target"
                      >
                        <UploadCloud className="w-4 h-4" />
                        Change
                      </button>
                      <button
                        onClick={() => { const up = { ...profile, avatar: '' }; setProfile(up); saveToBackend({ profile: up }); }}
                        className="app-button-secondary px-4 py-2 text-sm font-medium transition-colors inline-flex items-center justify-center gap-2 touch-target"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowProfilePicModal(true)}
                      className="app-button-primary px-4 py-2 text-sm font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-2 touch-target whitespace-nowrap"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Upload Image
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Profile Image Layout & Details */}
              <div className="space-y-5">
                {/* Profile Image Layout */}
                <div>
                  <label className="block text-sm font-medium app-body mb-3">Profile Image Layout</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setProfileImageLayout('classic')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${profileImageLayout === 'classic'
                        ? 'border-[var(--button-primary)] bg-[var(--surface-subtle)] shadow-sm'
                        : 'border-[var(--border-default)] hover:border-[var(--button-primary-hover)]'
                        }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--surface-hover)] border-2 border-[var(--border-default)] flex items-center justify-center">
                        <User className="w-5 h-5 app-body" />
                      </div>
                      <span className={`text-xs font-medium ${profileImageLayout === 'classic' ? 'app-primary' : 'app-body'}`}>
                        Classic
                      </span>
                    </button>

                    <button
                      onClick={() => setProfileImageLayout('square')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${profileImageLayout === 'square'
                        ? 'border-[var(--button-primary)] bg-[var(--surface-subtle)] shadow-sm'
                        : 'border-[var(--border-default)] hover:border-[var(--button-primary-hover)]'
                        }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--surface-hover)] border-2 border-[var(--border-default)] flex items-center justify-center">
                        <User className="w-5 h-5 app-body" />
                      </div>
                      <span className={`text-xs font-medium ${profileImageLayout === 'square' ? 'app-primary' : 'app-body'}`}>
                        Square
                      </span>
                    </button>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium app-body mb-1.5 ml-1">Profile Title</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full p-2.5 text-sm app-input outline-none transition-all touch-target"
                      placeholder="Your name or brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium app-body mb-1.5 ml-1">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                      className="w-full p-2.5 text-sm app-textarea outline-none transition-all resize-none touch-target"
                      placeholder="Tell your audience about yourself"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Themes ═══ */}
          <div className="app-card p-3 md:p-4">
            <h3 className="text-base font-semibold app-heading mb-0">Themes</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 mt-3 md:mt-4">
              {THEME_PREVIEW_DATA.map(({ id, light, name }) => {
                const themeColors = THEME_PRESETS[id];
                const gradientStart = themeColors.topBlock;
                const gradientEnd = shiftColor(gradientStart, 0, -15);

                return (
                  <div key={id} onClick={() => handleThemeSelect(id)} className={`aspect-[9/16] rounded-xl border-2 cursor-pointer transition-all duration-200 relative overflow-hidden group ${activeTheme === id ? 'border-[var(--button-primary)] shadow-sm' : 'border-[var(--border-default)] hover:border-[var(--button-primary-hover)]'}`}>
                    <div
                      className="absolute inset-0 z-10"
                      style={{ background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)` }}
                    ></div>
                    <div className="absolute inset-x-4 top-8 space-y-2.5 z-20 pointer-events-none">
                      <div className={`h-2.5 w-14 rounded-full mx-auto ${light ? 'bg-black/10' : 'bg-white/50'}`}></div>
                      <div className={`h-7 rounded-lg w-full ${light ? 'bg-white shadow-sm border border-black/5' : 'bg-white/20'}`}></div>
                      <div className={`h-7 rounded-lg w-full ${light ? 'bg-white shadow-sm border border-black/5' : 'bg-white/20'}`}></div>
                      <div className={`h-7 rounded-lg w-full ${light ? 'bg-white shadow-sm border border-black/5' : 'bg-white/20'}`}></div>
                    </div>
                    {activeTheme === id && (
                      <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-[var(--button-primary)] rounded-full flex items-center justify-center z-20 shadow-md transform scale-100 transition-transform">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-0 right-0 text-center z-30">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${light ? 'bg-black/10 text-black/70' : 'bg-white/20 text-white/90'}`}>{name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══ Typography ═══ */}
          <div className="app-card p-3 md:p-4">
            <h3 className="text-base font-semibold app-heading mb-0">Typography</h3>

            <div className="grid grid-cols-2 gap-3 md:gap-4 mt-3 md:mt-4">
              {/* Left Card - Typography Details */}
              <div className="app-card p-3 border-2 border-[var(--border-default)] flex flex-col justify-center" style={{ background: 'var(--surface-subtle)' }}>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold app-muted uppercase tracking-wider">Selected</p>
                  <h2 className="text-sm font-bold app-heading truncate" style={{ fontFamily: TYPOGRAPHY_OPTIONS.find(t => t.id === fontFamily)?.fontFamily }}>
                    {TYPOGRAPHY_OPTIONS.find(t => t.id === fontFamily)?.name || 'Inter'}
                  </h2>
                  <p className="text-[10px] font-medium app-primary truncate">
                    {TYPOGRAPHY_OPTIONS.find(t => t.id === fontFamily)?.category || 'Modern Sans'}
                  </p>
                </div>
              </div>

              {/* Right Card - Selection Button */}
              <div className="app-card p-3 bg-[var(--card-bg)] border-2 border-[var(--border-default)] flex flex-col items-center justify-center text-center">
                <h4 className="text-xs font-bold app-heading mb-1.5">Choose Font</h4>

                <button
                  onClick={() => setShowTypographyModal(true)}
                  className="w-full px-3 py-1.5 app-button-primary rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-98 touch-target"
                >
                  Select
                </button>
              </div>
            </div>
          </div>

          {/* ═══ Button Style ═══ */}
          <div className="app-card p-3 md:p-4">
            <h3 className="text-base font-semibold app-heading mb-0">Button Style</h3>
            <div className="grid grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
              {[
                { id: 'rounded', label: 'Rounded', radius: '12px' },
                { id: 'sharp', label: 'Sharp', radius: '4px' },
                { id: 'pill', label: 'Pill', radius: '999px' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setButtonStyle?.(style.id as ButtonStyle)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${buttonStyle === style.id
                    ? 'border-[var(--button-primary)] bg-[var(--surface-subtle)]'
                    : 'border-[var(--border-default)] hover:border-[var(--button-primary-hover)]'
                    }`}
                >
                  <div
                    className="w-full h-10 bg-[var(--button-primary)]"
                    style={{ borderRadius: style.radius }}
                  ></div>
                  <span className="text-sm font-medium app-body">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ═══ Link Animations ═══ */}
          <div className="app-card p-3 md:p-4">
            <h3 className="text-base font-semibold app-heading mb-0">Link Animations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mt-3 md:mt-4">
              {[
                { id: 'none', label: 'None', icon: X },
                { id: 'fade', label: 'Fade In', icon: Maximize2 },
                { id: 'slide', label: 'Slide Up', icon: AlignLeft },
                { id: 'scale', label: 'Scale', icon: Maximize2 },
                { id: 'bounce', label: 'Bounce', icon: Maximize2 },
              ].map((anim) => {
                const Icon = anim.icon;
                return (
                  <button
                    key={anim.id}
                    onClick={() => setLinkAnimation?.(anim.id as LinkAnimation)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${linkAnimation === anim.id
                      ? 'border-[var(--button-primary)] bg-[var(--surface-subtle)]'
                      : 'border-[var(--border-default)] hover:border-[var(--button-primary-hover)]'
                      }`}
                  >
                    <Icon className="w-5 h-5 app-body" />
                    <span className="text-xs font-medium app-body">{anim.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ Spacing & Layout ═══ */}
          <div className="app-card p-3 md:p-4">
            <h3 className="text-base font-semibold app-heading mb-0">Spacing & Layout</h3>
            <div className="grid grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
              {[
                { id: 'compact', label: 'Compact', spacing: '6px' },
                { id: 'comfortable', label: 'Balanced', spacing: '10px' },
                { id: 'spacious', label: 'Spacious', spacing: '16px' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSpacingMode?.(mode.id as SpacingMode)}
                  className={`flex flex-col items-center justify-between p-3 rounded-xl border-2 transition-all min-h-[100px] ${spacingMode === mode.id
                    ? 'border-[var(--button-primary)] bg-[var(--surface-subtle)]'
                    : 'border-[var(--border-default)] hover:border-[var(--button-primary-hover)]'
                    }`}
                >
                  <div className="w-full flex flex-col items-center justify-center flex-1">
                    <div className="w-full max-w-[80px] space-y-0">
                      <div className="h-2 rounded bg-[var(--border-default)]" style={{ marginBottom: mode.spacing }}></div>
                      <div className="h-2 rounded bg-[var(--border-default)]" style={{ marginBottom: mode.spacing }}></div>
                      <div className="h-2 rounded bg-[var(--border-default)]"></div>
                    </div>
                  </div>
                  <span className="text-xs md:text-sm font-medium app-body mt-2 text-center leading-tight">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ═══ Wallpaper Styles ═══ */}
          <div className={`app-card p-3 md:p-4 relative ${activeTheme !== 'custom' && activeTheme !== 1 && activeTheme !== 17 && activeTheme !== 21 ? 'opacity-60' : ''}`}>
            <h3 className="text-base font-semibold app-heading mb-0">Wallpaper Style</h3>
            {activeTheme !== 'custom' && activeTheme !== 1 && activeTheme !== 17 && activeTheme !== 21 && (
              <div className="mt-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs font-medium text-yellow-800 text-center">Available only for Custom Theme. <button onClick={() => { setActiveTheme('custom'); setCustomColors(THEME_PRESETS[activeTheme as number] || DEFAULT_COLORS); }} className="underline font-bold hover:opacity-80">Switch to Custom</button></p>
              </div>
            )}

            {/* Style Type Selector */}
            <div className="mt-4">
              <label className="block text-sm font-medium app-body mb-2">Background Type</label>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {[
                  { id: 'custom', label: 'Customize Colors', icon: Palette },
                  { id: 'fill', label: 'Solid Fill', icon: Square },
                  { id: 'gradient', label: 'Gradient', icon: Palette },
                ].map((style) => {
                  const Icon = style.icon;
                  const isDisabled = activeTheme !== 'custom' && activeTheme !== 1 && activeTheme !== 17 && activeTheme !== 21;
                  return (
                    <button
                      key={style.id}
                      disabled={isDisabled}
                      onClick={() => {
                        if (activeTheme !== 'custom' && activeTheme !== 1 && activeTheme !== 17 && activeTheme !== 21) return; // Prevent action if not allowed theme

                        if (style.id === 'custom') {
                          // Open customize colors modal and set mode
                          handleWallpaperModeChange('colors');
                          setShowCustomColorsModal(true);
                        } else {
                          const currentColor = backgroundStyle?.color || '#2665D6';
                          const currentDirection = backgroundStyle?.direction || 'up';
                          const currentNoise = backgroundStyle?.noise || false;

                          // Stay on current theme when using wallpaper styles
                          setActiveTheme(activeTheme);
                          handleWallpaperModeChange(style.id as 'fill' | 'gradient');
                          setBackgroundStyle?.({
                            type: style.id as any,
                            color: currentColor,
                            direction: currentDirection,
                            noise: currentNoise
                          });
                        }
                      }}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${isDisabled
                        ? 'cursor-not-allowed border-[var(--border-default)] bg-[var(--surface-hover)]'
                        : (style.id === 'custom' && wallpaperMode === 'colors') ||
                          (style.id === 'fill' && wallpaperMode === 'fill') ||
                          (style.id === 'gradient' && wallpaperMode === 'gradient')
                          ? 'border-[var(--button-primary)] bg-[var(--surface-subtle)] shadow-sm'
                          : 'border-[var(--border-default)] hover:border-[var(--button-primary-hover)]'
                        }`}
                    >
                      {/* Preview */}
                      <div className="w-full h-16 rounded-lg overflow-hidden relative">
                        {style.id === 'custom' && (
                          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
                            <div style={{ backgroundColor: appliedColors.topBlock }}></div>
                            <div style={{ backgroundColor: appliedColors.primaryText }}></div>
                            <div style={{ backgroundColor: appliedColors.secondaryText }}></div>
                            <div style={{ backgroundColor: appliedColors.cardBackground }}></div>
                          </div>
                        )}
                        {style.id === 'fill' && (
                          <div
                            className="w-full h-full transition-colors"
                            style={{ backgroundColor: backgroundStyle?.color || '#2665D6' }}
                          />
                        )}
                        {style.id === 'gradient' && (
                          <div
                            className="w-full h-full transition-all"
                            style={{
                              background: `linear-gradient(to top, ${backgroundStyle?.color || '#2665D6'}, ${shiftColor(backgroundStyle?.color || '#2665D6', -30, 8)})`
                            }}
                          />
                        )}
                        {/* Checkmark for selected */}
                        {!isDisabled && ((style.id === 'custom' && wallpaperMode === 'colors') ||
                          (style.id === 'fill' && wallpaperMode === 'fill') ||
                          (style.id === 'gradient' && wallpaperMode === 'gradient')) && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--button-primary)] rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                      </div>

                      {/* Icon and Label */}
                      <div className="flex flex-col items-center gap-1">
                        <Icon className="w-5 h-5 app-body" />
                        <span className="text-xs font-medium app-body text-center">{style.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditional Controls based on selected style type */}
            {(wallpaperMode === 'fill' || wallpaperMode === 'gradient') && (
              <div className="space-y-6 pt-6 border-t border-[var(--border-default)]">

                {/* Gradient Direction (only for gradient type) */}
                {wallpaperMode === 'gradient' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium app-heading">Gradient Direction</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          id: 'up',
                          label: 'Linear Up',
                          preview: `linear-gradient(to top, ${backgroundStyle?.color || '#2665D6'}, ${shiftColor(backgroundStyle?.color || '#2665D6', -30, 8)})`
                        },
                        {
                          id: 'down',
                          label: 'Linear Down',
                          preview: `linear-gradient(to bottom, ${backgroundStyle?.color || '#2665D6'}, ${shiftColor(backgroundStyle?.color || '#2665D6', -30, 8)})`
                        },
                        {
                          id: 'radial',
                          label: 'Radial',
                          preview: `radial-gradient(ellipse at top, ${shiftColor(backgroundStyle?.color || '#2665D6', -30, 8)} 0%, ${backgroundStyle?.color || '#2665D6'} 100%)`
                        }
                      ].map(dir => (
                        <button
                          key={dir.id}
                          onClick={() => setBackgroundStyle?.({ ...backgroundStyle, direction: dir.id as any })}
                          className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${backgroundStyle.direction === dir.id
                            ? 'border-[var(--button-primary)] bg-[var(--surface-subtle)]'
                            : 'border-[var(--border-default)] hover:border-[var(--button-primary-hover)]'
                            }`}
                        >
                          {/* Preview */}
                          <div
                            className="w-full h-12 rounded-md"
                            style={{ background: dir.preview }}
                          />
                          <span className="text-xs font-medium app-body">{dir.label}</span>
                          {backgroundStyle.direction === dir.id && (
                            <div className="absolute top-2 right-2 w-4 h-4 bg-[var(--button-primary)] rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Picker */}
                <div className="space-y-3 relative">
                  <label className="text-sm font-medium app-heading">
                    {wallpaperMode === 'gradient' ? 'Base Color' : 'Background Color'}
                  </label>
                  <div
                    className="flex items-center justify-between p-4 border-2 border-[var(--border-default)] rounded-xl cursor-pointer hover:border-[var(--button-primary-hover)] transition-all bg-[var(--surface-hover)]"
                    onClick={() => setOpenPicker(openPicker === 'bgColor' ? null : 'bgColor')}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg shadow-md border-2 border-white"
                        style={{ backgroundColor: backgroundStyle.color }}
                      ></div>
                      <div>
                        <p className="text-sm font-semibold app-heading">{backgroundStyle.color.toUpperCase()}</p>
                        <p className="text-xs app-muted">Click to change color</p>
                      </div>
                    </div>
                    <Palette className="w-5 h-5 app-muted" />
                  </div>

                  {openPicker === 'bgColor' && (
                    <div ref={pickerRef} className="absolute z-50 left-0 sm:left-auto right-0 sm:right-auto w-full sm:w-[320px] top-[calc(100%+12px)] p-5 app-card shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)]/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 origin-top">
                      <div className="mb-5 bg-[var(--surface-subtle)] p-1 rounded-xl">
                        <HexColorPicker
                          color={backgroundStyle.color}
                          onChange={(h) => {
                            setActiveTheme('custom');
                            handleBackgroundColorChange(h);
                          }}
                          style={{ width: '100%', height: '180px' }}
                        />
                      </div>

                      {/* Default Colors */}
                      <div className="pt-4 border-t border-[var(--border-subtle)]">
                        <p className="text-[11px] font-bold text-[var(--muted-text)] mb-3 uppercase tracking-wider">Default Colors</p>
                        <div className="grid grid-cols-8 gap-2.5">
                          {[
                            '#1A0F08', '#2C1810', '#D4A574', '#C19A5B',
                            '#3D2817', '#5D4037', '#8D6E63', '#F8FAFC'
                          ].map(color => {
                            const isSelected = backgroundStyle.color.toLowerCase() === color.toLowerCase();
                            return (
                              <button
                                key={color}
                                onClick={() => {
                                  setActiveTheme('custom');
                                  handleBackgroundColorChange(color);
                                }}
                                className={`relative w-full aspect-square rounded-full transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center shadow-sm ${isSelected ? 'ring-2 ring-offset-2 ring-[var(--button-primary)] ring-offset-[var(--card-bg)]' : 'ring-1 ring-[var(--border-subtle)] hover:ring-[var(--border-strong)]'}`}
                                style={{ backgroundColor: color }}
                              >
                                {isSelected && (
                                  <div className={`w-2 h-2 rounded-full ${color.toLowerCase() === '#f8fafc' ? 'bg-gray-900' : 'bg-white'}`} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Close button */}
                      <button
                        onClick={() => setOpenPicker(null)}
                        className="w-full mt-5 py-3 text-sm font-semibold rounded-xl transition-all app-button-primary shadow-md hover:shadow-lg active:scale-[0.98]"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                {/* Noise Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--surface-subtle)] flex items-center justify-center">
                      <svg className="w-5 h-5 app-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold app-heading">Grain Texture</h4>
                      <p className="text-xs app-muted">Add subtle noise overlay</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBackgroundStyle?.({ ...backgroundStyle, noise: !backgroundStyle.noise })}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${backgroundStyle.noise ? 'bg-[var(--accent)]' : 'bg-[var(--border-default)]'
                      }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${backgroundStyle.noise ? 'translate-x-8' : 'translate-x-1'
                      }`}></div>
                  </button>
                </div>
              </div>
            )}

          </div>



          {/* ═══ Social Icons ═══ */}
          <div className="app-card p-3 md:p-4">
            <h3 className="text-base font-semibold app-heading mb-0">Social Icons</h3>
            {socialIcons.length > 0 && (
              <div className="flex flex-col gap-3 mt-3 md:mt-4">
                {socialIcons.map((icon, i) => (
                  <div key={i} className="flex items-center justify-between p-4 app-card border border-[var(--border-default)] shadow-sm bg-[var(--card-bg)] rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center" style={{ color: getBrandColor(icon.platform) || 'var(--text-primary)' }}>
                        <i className={`fab fa-${icon.platform.toLowerCase().replace(' ', '-')} text-2xl`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight mb-0.5">{icon.platform}</span>
                        <span className="text-[13px] text-[var(--muted-text)] font-medium">{icon.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveSocialIcon(i)} className="p-2.5 text-[var(--muted-text)] hover:text-[var(--danger-text)] hover:bg-[var(--danger-surface)] border border-[var(--border-default)] rounded-xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowSocialModal(true)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium app-button-secondary transition-colors ${socialIcons.length > 0 ? 'mt-3' : 'mt-3 md:mt-4'}`}><Plus className="w-4 h-4" />Add Social Icon</button>
          </div>

          {/* ═══ Page Layout ═══ */}
          <div className="app-card p-3 md:p-4">
            <h3 className="text-base font-semibold app-heading mb-0">Page Layout</h3>
            <div className="mt-3 md:mt-4">
              <CustomDropdown
                value={pageLayout}
                onChange={(value) => setPageLayout(value as any)}
                options={[
                  { value: 'default', label: 'Default', icon: LayoutGrid },
                  { value: 'mostRecent', label: 'Most Recent, Most Clicked', icon: Sparkles },
                  { value: 'custom', label: 'Custom', icon: Wrench },
                ]}
              />
              {pageLayout === 'custom' && (
                <div className="mt-5">
                  <h4 className="text-sm font-semibold app-heading mb-3">Custom Layout Links</h4>
                  {customLayoutLinks.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {customLayoutLinks.map((linkId) => {
                        const link = links.find((l: any) => (l.id || l._id) === linkId);
                        return link ? (
                          <div key={linkId} className="flex items-center justify-between p-2.5 app-panel rounded-lg">
                            <span className="text-sm font-medium app-body truncate">{link.title}</span>
                            <button onClick={() => setCustomLayoutLinks(customLayoutLinks.filter(id => id !== linkId))} className="p-1 text-[var(--danger-text)] hover:bg-[var(--danger-surface)] rounded transition-colors flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <CustomDropdown
                      value=""
                      onChange={(id) => {
                        if (id && !customLayoutLinks.includes(id)) {
                          setCustomLayoutLinks([...customLayoutLinks, id]);
                        }
                      }}
                      options={[
                        { value: '', label: 'Select a link...', icon: Target },
                        ...links
                          .filter((l: any) => l.isActive && !customLayoutLinks.includes(l.id || l._id))
                          .map((l: any) => ({ value: l.id || l._id, label: l.title, icon: Globe }))
                      ]}
                      className="flex-1"
                    />
                    <button onClick={() => setCustomLayoutLinks(links.filter((l: any) => l.isActive).map((l: any) => l.id || l._id))} className="px-4 py-2.5 text-sm font-medium app-button-secondary transition-colors whitespace-nowrap">Add All</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ Save All Changes ═══ */}
          <div className="flex justify-center">
            <button onClick={handleSaveAll} className="flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold app-button-primary transition-colors w-full md:w-auto"><Save className="w-4 h-4" />Save All Changes</button>
          </div>

        </div>
      </div>

      {/* ═══ Social Icon Modal ═══ */}
      {showSocialModal && createPortal(
        <div className="fixed inset-0 app-backdrop z-[10000] flex items-center justify-center p-4" onClick={() => setShowSocialModal(false)}>
          <div className="app-modal p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg lg:text-base font-semibold app-heading">Add Social Icon</h3>
              <button onClick={() => setShowSocialModal(false)} className="p-1.5 app-icon-button transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <hr className="border-[var(--border-default)] mb-5" />
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold app-heading mb-2">Platform</label>
                <CustomDropdown
                  value={newSocialPlatform}
                  onChange={setNewSocialPlatform}
                  options={SOCIAL_PLATFORMS.map((p) => ({
                    value: p,
                    label: p,
                    icon: getSocialPlatformIcon(p)
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold app-heading mb-2">URL</label>
                <input type="text" value={newSocialUrl} onChange={(e) => setNewSocialUrl(e.target.value)} placeholder="https://example.com/yourprofile" className="w-full p-3 text-sm app-input outline-none transition-all" onKeyDown={(e) => { if (e.key === 'Enter') handleAddSocialIcon(); }} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={handleAddSocialIcon} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium app-button-primary transition-colors">Add Social Icon</button>
              <button onClick={() => setShowSocialModal(false)} className="px-5 py-2.5 text-sm font-medium app-button-secondary transition-colors">Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {cropImageUrl && <ImageCropperModal imageUrl={cropImageUrl} onCrop={handleCropComplete} onCancel={() => setCropImageUrl(null)} />}

      {/* ═══ Profile Picture Modal ═══ */}
      <ProfilePictureModal
        isOpen={showProfilePicModal}
        onClose={() => setShowProfilePicModal(false)}
        currentAvatar={profile.avatar}
        onSelectAvatar={handlePresetAvatarSelect}
        onUploadClick={() => avatarFileInputRef.current?.click()}
      />

      {/* ═══ Typography Modal ═══ */}
      {showTypographyModal && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6" style={{ background: 'var(--modal-overlay)' }} onClick={() => setShowTypographyModal(false)}>
          <div
            className="w-full max-w-[92vw] sm:max-w-md m-auto rounded-[24px] border border-[var(--border-default)] bg-[var(--card-bg)] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden relative isolate"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header (Fixed) */}
            <div className="flex items-start justify-between p-5 md:p-6 border-b border-[var(--border-default)] bg-[var(--card-bg)] shrink-0 z-10 w-full rounded-t-[24px] relative">
              <div>
                <h3 className="text-lg lg:text-base font-bold app-heading leading-tight mb-1">Choose Typography</h3>
                <p className="text-xs app-muted pr-4">Select a font that matches your brand</p>
              </div>
              <button
                onClick={() => setShowTypographyModal(false)}
                className="p-2 rounded-full bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] transition-colors app-muted shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 md:p-6 overflow-y-auto flex-1 scrollbar-hide bg-[var(--card-bg)] w-full">
              <div className="flex flex-col gap-3 pb-2">
                {TYPOGRAPHY_OPTIONS.map((typo) => (
                  <button
                    key={typo.id}
                    onClick={() => {
                      setFontFamily?.(typo.id as FontFamily);
                      setShowTypographyModal(false);
                    }}
                    className={`relative p-4 rounded-xl border-[1.5px] transition-all touch-target w-full group flex flex-col items-center justify-center text-center ${fontFamily === typo.id
                      ? 'border-[var(--button-primary)] bg-[rgba(38,101,214,0.04)] shadow-sm'
                      : 'border-[var(--border-default)] hover:border-[rgba(38,101,214,0.4)] hover:bg-[var(--surface-subtle)]'
                      }`}
                  >
                    {/* Centered Content */}
                    <div className="px-8 w-full max-w-[80%]">
                      <h4 className="text-base font-bold app-heading mb-1 truncate" style={{ fontFamily: typo.fontFamily }}>
                        {typo.name}
                      </h4>
                      <p className="text-[10px] font-bold app-muted uppercase tracking-widest opacity-80 truncate">
                        {typo.category}
                      </p>
                    </div>

                    {/* Absolute Right-Aligned Radio Button */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {fontFamily === typo.id ? (
                        <div className="w-6 h-6 rounded-full bg-[var(--button-primary)] flex items-center justify-center shadow-md">
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-[2px] border-[var(--border-default)] group-hover:border-[var(--button-primary)] transition-colors"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ═══ Customize Colors Modal ═══ */}
      {showCustomColorsModal && createPortal(
        <>
          <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md" onClick={() => setShowCustomColorsModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000 }}></div>
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 pointer-events-none" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10001 }}>
            <div
              className="relative w-full max-w-[500px] bg-[var(--card-bg)] rounded-[20px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-[var(--border-default)]/60 flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 overflow-hidden pointer-events-auto"
              style={{ maxHeight: '80vh', zIndex: 10002 }}
              onClick={(e) => e.stopPropagation()}
            >

              {/* Header */}
              <div className="px-6 py-5 flex items-start justify-between border-b border-[var(--border-default)]/40 bg-[var(--card-bg)] shrink-0 z-10">
                <div>
                  <h3 className="text-[20px] md:text-lg font-bold text-[var(--heading-color)] tracking-tight">Customize Colors</h3>
                  <p className="text-[13px] text-[var(--muted-text)] mt-1 font-medium">Personalize your brand colors</p>
                </div>
                <button
                  onClick={() => setShowCustomColorsModal(false)}
                  className="p-2.5 bg-[var(--surface-subtle)] rounded-full hover:bg-[var(--surface-hover)] text-[var(--icon-color)] hover:text-[var(--heading-color)] transition-all focus:outline-none"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 bg-[var(--page-bg)]/30">
                <div className="space-y-4 pb-2">
                  {([
                    { key: 'topBlock', label: 'Top Block', Icon: Smartphone },
                    { key: 'primaryText', label: 'Primary Text', Icon: User },
                    { key: 'secondaryText', label: 'Secondary Text', Icon: AlignLeft },
                    { key: 'cardBackground', label: 'Screen Background', Icon: Square },
                    { key: 'linkFooterBackground', label: 'Link/Footer Background', Icon: Link2 },
                  ] as { key: keyof typeof customColors; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => {
                    const isManuallyOverridden = key in manualColorOverrides;
                    const autoColor = derivedColors?.[key];
                    const currentColor = customColors[key];

                    return (
                      <div key={key} className="relative">
                        <button
                          onClick={() => setOpenPicker(openPicker === key ? null : key)}
                          className="w-full flex items-center gap-4 p-4 md:p-5 app-button-secondary group hover:shadow-sm transition-all touch-target rounded-xl"
                        >
                          {/* Icon on the left */}
                          <div className="flex-shrink-0">
                            <Icon className="w-5 h-5 app-body" />
                          </div>

                          {/* Text in the center */}
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold app-heading">{label}</span>
                              {isManuallyOverridden && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                  CUSTOM
                                </span>
                              )}
                            </div>
                            {autoColor && (
                              <span className="text-xs app-muted">
                                Auto: {autoColor.toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Color box on the right */}
                          <div className="flex-shrink-0">
                            <div
                              className="w-12 h-12 rounded-xl border-2 border-[var(--border-default)] shadow-sm transition-transform group-hover:scale-105"
                              style={{ backgroundColor: currentColor }}
                            />
                          </div>
                        </button>

                        {/* Reset to Auto button (only show if manually overridden and auto color exists) */}
                        {isManuallyOverridden && autoColor && (
                          <button
                            onClick={() => {
                              // Remove manual override for this color
                              const newOverrides = { ...manualColorOverrides };
                              delete newOverrides[key];
                              setManualColorOverrides(newOverrides);

                              // Update customColors to use auto-derived color
                              setCustomColors(prev => ({ ...prev, [key]: autoColor }));
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                            title="Reset to auto-derived color"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                          </button>
                        )}

                        {openPicker === key && (
                          <div ref={pickerRef} className="absolute z-50 top-full mt-3 left-0 right-0 sm:left-auto sm:right-0 sm:w-[320px] p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)]/95 backdrop-blur-2xl">
                            <div className="mb-5 bg-[var(--surface-subtle)] p-1 rounded-xl">
                              <HexColorPicker
                                color={customColors[key]}
                                onChange={(color) => {
                                  // Update customColors
                                  setCustomColors(prev => ({ ...prev, [key]: color }));

                                  // Mark as manually overridden
                                  setManualColorOverrides(prev => ({ ...prev, [key]: color }));
                                }}
                                style={{ width: '100%', height: '180px' }}
                              />
                            </div>

                            {/* Auto-derived color reference (if available) */}
                            {autoColor && (
                              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-bold text-blue-900 mb-1">Auto-Derived</p>
                                    <p className="text-xs text-blue-700 font-mono">{autoColor.toUpperCase()}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setCustomColors(prev => ({ ...prev, [key]: autoColor }));
                                      // Remove manual override
                                      const newOverrides = { ...manualColorOverrides };
                                      delete newOverrides[key];
                                      setManualColorOverrides(newOverrides);
                                    }}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                  >
                                    Use Auto
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Default Colors */}
                            <div className="pt-4 border-t border-[var(--border-subtle)]">
                              <p className="text-[11px] font-bold text-[var(--muted-text)] mb-3 uppercase tracking-wider">Default Colors</p>
                              <div className="grid grid-cols-8 gap-2.5">
                                {COLOR_SWATCHES[key].map(swatch => {
                                  const isSelected = customColors[key].toLowerCase() === swatch.toLowerCase();
                                  return (
                                    <button
                                      key={swatch}
                                      onClick={() => {
                                        setCustomColors(prev => ({ ...prev, [key]: swatch }));
                                        // Mark as manually overridden
                                        setManualColorOverrides(prev => ({ ...prev, [key]: swatch }));
                                      }}
                                      className={`relative w-full aspect-square rounded-full transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center shadow-sm ${isSelected ? 'ring-2 ring-offset-2 ring-[var(--button-primary)] ring-offset-[var(--card-bg)]' : 'ring-1 ring-[var(--border-subtle)] hover:ring-[var(--border-strong)]'}`}
                                      style={{ backgroundColor: swatch }}
                                    >
                                      {isSelected && (
                                        <div className={`w-2 h-2 rounded-full ${['#ffffff', '#f9fafb', '#f3f4f6', '#f6f7f9', '#fafafa', '#f8f9fa', '#f5f5f5', '#e5e7eb', '#d1d5db', '#f8fafc'].includes(swatch.toLowerCase()) ? 'bg-gray-900' : 'bg-white'}`} />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Done button */}
                            <button
                              onClick={() => setOpenPicker(null)}
                              className="w-full mt-5 py-3 text-sm font-semibold rounded-xl transition-all app-button-primary shadow-md hover:shadow-lg active:scale-[0.98]"
                            >
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[var(--border-default)]/40 bg-[var(--card-bg)] shrink-0 flex items-center justify-between gap-3 z-10">
                <button
                  onClick={() => {
                    // Reset all manual overrides
                    setManualColorOverrides({});

                    // If we have auto-derived colors, use them; otherwise use defaults
                    const resetColors = derivedColors || DEFAULT_COLORS;
                    setCustomColors(resetColors);
                    setAppliedColors(resetColors);
                  }}
                  className="px-6 py-3 text-[14px] font-bold text-[var(--heading-color)] bg-transparent hover:bg-[var(--surface-subtle)] rounded-xl transition-colors focus:outline-none flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All
                </button>
                <button
                  onClick={() => {
                    // Apply the merged colors (auto-derived + manual overrides)
                    setAppliedColors({ ...customColors });
                    setActiveTheme('custom');
                    handleWallpaperModeChange('colors');
                    setShowCustomColorsModal(false);
                  }}
                  className="px-8 py-3 text-[14px] font-bold text-[var(--button-primary-text)] bg-[var(--button-primary)] rounded-xl hover:opacity-90 hover:scale-[0.98] transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-[var(--button-primary)]/30 flex items-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ═══ Floating Preview Button (Mobile Only) ═══ */}
      {!hidePreviewButton && (
        <button
          onClick={() => setShowMobilePreview(true)}
          className="lg:hidden fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#2B1408] text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-200 active:scale-95 z-40"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label="Preview Your Crumb"
        >
          <Eye className="w-5 h-5" strokeWidth={2} />
        </button>
      )}

      {/* ═══ Mobile Preview Modal ═══ */}
      {showMobilePreview && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-[var(--page-bg)] flex flex-col"
        >
          {/* Header with hamburger menu and URL bar */}
          <div className="px-4 py-3 flex-shrink-0 z-10 relative">
            {/* Top row: Menu and Title */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <button className="p-1 text-gray-600">
                  <i className="fas fa-bars text-xl" />
                </button>
                <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  The Crumb
                </h1>
              </div>
              <button
                onClick={() => setShowMobilePreview(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* URL Bar */}
            {username && (
              <div className="flex justify-center w-full">
                <div className="flex items-center gap-2 bg-gray-50 rounded-[16px] px-3 py-2.5 border border-gray-200 w-full max-w-[340px] shadow-sm">
                  <i className="fas fa-link text-gray-400 text-sm" />
                  <span className="flex-1 text-[13px] text-gray-700 truncate font-medium tracking-tight">
                    thecrumb.co/{username}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors active:scale-95 text-gray-500 hover:text-gray-900"
                    title="Copy URL"
                  >
                    <i className="far fa-copy text-base" />
                  </button>
                  <div className="w-[1px] h-4 bg-gray-300 mx-0.5"></div>
                  <button
                    onClick={handleShareUrl}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors active:scale-95 text-gray-500 hover:text-gray-900"
                    title="Share"
                  >
                    <i className="fas fa-share-alt text-base" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Preview - Centered Container */}
          <div className="flex-1 flex items-start justify-center pt-2 pb-12 px-4 overflow-y-auto">
            <MobilePreview
              links={links}
              profile={profile}
              searchQuery=""
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
              fullScreenOnMobile={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
