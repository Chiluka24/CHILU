import { calculateContrast, ensureContrast } from './colorDeriver';

export const BRAND_COLORS: Record<string, string> = {
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  'x.com': '#000000',
  facebook: '#1877F2',
  youtube: '#FF0000',
  tiktok: '#000000',
  linkedin: '#0077B5',
  snapchat: '#FFFC00',
  pinterest: '#BD081C',
  spotify: '#1DB954',
  discord: '#5865F2',
  twitch: '#9146FF',
  github: '#181717',
  reddit: '#FF4500',
  whatsapp: '#25D366',
  telegram: '#26A5E4',
  email: '#EA4335',
  mail: '#EA4335',
};

export function getBrandColor(platform: string): string | undefined {
  const p = platform.toLowerCase();
  for (const [key, color] of Object.entries(BRAND_COLORS)) {
    if (p.includes(key)) return color;
  }
  return undefined;
}

/**
 * Gets an adaptive brand color that ensures visibility against the background.
 * If the brand color doesn't have sufficient contrast (< 3:1), it adjusts the color
 * to meet the minimum contrast requirement while preserving the brand identity as much as possible.
 * 
 * @param platform - Social platform name (e.g., 'instagram', 'whatsapp')
 * @param backgroundColor - Background color to check contrast against (hexadecimal string)
 * @param minContrast - Minimum contrast ratio (default: 3.0 for icons, which is WCAG AA for large text)
 * @returns Adjusted brand color with sufficient contrast, or undefined if no brand color exists
 */
export function getAdaptiveBrandColor(
  platform: string,
  backgroundColor: string,
  minContrast: number = 3.0
): string | undefined {
  const brandColor = getBrandColor(platform);
  
  if (!brandColor) {
    return undefined;
  }
  
  try {
    // Check current contrast ratio
    const currentContrast = calculateContrast(brandColor, backgroundColor);
    
    // If contrast is sufficient, return original brand color
    if (currentContrast >= minContrast) {
      return brandColor;
    }
    
    // Otherwise, adjust the color to meet minimum contrast
    const adjustedColor = ensureContrast(brandColor, backgroundColor, minContrast);
    
    return adjustedColor;
  } catch (error) {
    console.error('Error calculating adaptive brand color:', error);
    // Fallback to original brand color
    return brandColor;
  }
}
