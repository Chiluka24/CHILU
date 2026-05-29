/**
 * ColorDeriver Utility
 * 
 * Provides color space conversion functions for the Adaptive Color System.
 * Handles conversion between HEX, RGB, and HSL color spaces.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface DerivedColors {
  topBlock: string;
  primaryText: string;
  secondaryText: string;
  cardBackground: string;
  linkFooterBackground: string;
}

export interface ColorRGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface ColorHSL {
  h: number; // 0-360
  s: number; // 0-1
  l: number; // 0-1
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_COLOR = '#2665D6';

// ============================================================================
// Color Space Conversion Functions
// ============================================================================

/**
 * Converts a hexadecimal color string to RGB values.
 * Handles both 6-digit (#RRGGBB) and 3-digit (#RGB) hex formats.
 * 
 * @param hex - Hexadecimal color string (e.g., "#FF5733" or "#F57")
 * @returns RGB color object with r, g, b values (0-255)
 * @throws Error if hex format is invalid
 */
export function hexToRgb(hex: string): ColorRGB {
  try {
    // Remove # if present
    let cleanHex = hex.replace(/^#/, '');
    
    // Handle 3-digit hex shorthand (e.g., #F57 → #FF5577)
    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split('')
        .map(char => char + char)
        .join('');
    }
    
    // Validate hex format
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      throw new Error(`Invalid hex color format: ${hex}`);
    }
    
    // Parse RGB values
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    return { r, g, b };
  } catch (error) {
    console.error('Error parsing hex color:', error);
    // Fallback to default color
    return hexToRgb(DEFAULT_COLOR);
  }
}

/**
 * Converts RGB color values to HSL color space.
 * 
 * @param rgb - RGB color object with r, g, b values (0-255)
 * @returns HSL color object with h (0-360), s (0-1), l (0-1)
 */
export function rgbToHsl(rgb: ColorRGB): ColorHSL {
  try {
    // Normalize RGB values to 0-1 range
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    // Calculate lightness
    let l = (max + min) / 2;
    
    // Calculate saturation
    let s = 0;
    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    }
    
    // Calculate hue
    let h = 0;
    if (delta !== 0) {
      if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        h = ((b - r) / delta + 2) / 6;
      } else {
        h = ((r - g) / delta + 4) / 6;
      }
    }
    
    return {
      h: Math.round(h * 360),
      s: s,
      l: l,
    };
  } catch (error) {
    console.error('Error converting RGB to HSL:', error);
    // Fallback to neutral gray
    return { h: 0, s: 0, l: 0.5 };
  }
}

/**
 * Converts HSL color values to RGB color space.
 * 
 * @param hsl - HSL color object with h (0-360), s (0-1), l (0-1)
 * @returns RGB color object with r, g, b values (0-255)
 */
export function hslToRgb(hsl: ColorHSL): ColorRGB {
  try {
    const h = hsl.h / 360;
    const s = hsl.s;
    const l = hsl.l;
    
    let r: number, g: number, b: number;
    
    if (s === 0) {
      // Achromatic (gray)
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  } catch (error) {
    console.error('Error converting HSL to RGB:', error);
    // Fallback to neutral gray
    return { r: 128, g: 128, b: 128 };
  }
}

/**
 * Adjusts the lightness of a color by a specified percentage.
 * 
 * @param hex - Hexadecimal color string (e.g., "#FF5733")
 * @param adjustment - Lightness adjustment as a decimal (e.g., 0.15 for +15%, -0.15 for -15%)
 * @returns Adjusted hexadecimal color string
 */
function adjustLightness(hex: string, adjustment: number): string {
  try {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    
    // Adjust lightness and clamp to 0-1 range
    hsl.l = Math.max(0, Math.min(1, hsl.l + adjustment));
    
    return rgbToHex(hslToRgb(hsl));
  } catch (error) {
    console.error('Error adjusting lightness:', error);
    return hex; // Return original color on error
  }
}

/**
 * Converts RGB color values to hexadecimal color string.
 * 
 * @param rgb - RGB color object with r, g, b values (0-255)
 * @returns Hexadecimal color string (e.g., "#FF5733")
 */
export function rgbToHex(rgb: ColorRGB): string {
  try {
    // Clamp values to 0-255 range
    const r = Math.max(0, Math.min(255, Math.round(rgb.r)));
    const g = Math.max(0, Math.min(255, Math.round(rgb.g)));
    const b = Math.max(0, Math.min(255, Math.round(rgb.b)));
    
    // Convert to hex and pad with zeros if needed
    const toHex = (value: number): string => {
      const hex = value.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  } catch (error) {
    console.error('Error converting RGB to hex:', error);
    return DEFAULT_COLOR;
  }
}

// ============================================================================
// Luminance and Contrast Calculation Functions
// ============================================================================

/**
 * Calculates the relative luminance of a color according to WCAG 2.1 specification.
 * Uses the formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * where R, G, B are the linearized RGB values.
 * 
 * @param hex - Hexadecimal color string (e.g., "#FF5733")
 * @returns Luminance value between 0 (black) and 1 (white)
 */
export function calculateLuminance(hex: string): number {
  try {
    const rgb = hexToRgb(hex);
    
    // Normalize RGB values to 0-1 range
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    // Apply gamma correction (linearize RGB values)
    // WCAG formula: if value <= 0.03928, then value/12.92, else ((value+0.055)/1.055)^2.4
    const linearize = (value: number): number => {
      return value <= 0.03928
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4);
    };
    
    const rLinear = linearize(r);
    const gLinear = linearize(g);
    const bLinear = linearize(b);
    
    // Calculate relative luminance using WCAG coefficients
    const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    
    return luminance;
  } catch (error) {
    console.error('Error calculating luminance:', error);
    return 0.5; // Fallback to neutral gray luminance
  }
}

/**
 * Calculates the contrast ratio between two colors according to WCAG 2.1 specification.
 * Uses the formula: (L1 + 0.05) / (L2 + 0.05)
 * where L1 is the lighter color's luminance and L2 is the darker color's luminance.
 * 
 * @param fg - Foreground color (hexadecimal string)
 * @param bg - Background color (hexadecimal string)
 * @returns Contrast ratio as a positive number (e.g., 4.5, 21)
 */
export function calculateContrast(fg: string, bg: string): number {
  try {
    const luminance1 = calculateLuminance(fg);
    const luminance2 = calculateLuminance(bg);
    
    // Determine which is lighter
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    // Calculate contrast ratio using WCAG formula
    const contrast = (lighter + 0.05) / (darker + 0.05);
    
    return contrast;
  } catch (error) {
    console.error('Error calculating contrast:', error);
    return 1; // Fallback to minimum contrast (no contrast)
  }
}

/**
 * Ensures a foreground color meets the specified minimum contrast ratio against a background color.
 * Adjusts the foreground color's lightness iteratively until the target contrast is achieved.
 * 
 * @param foreground - Foreground color (hexadecimal string)
 * @param background - Background color (hexadecimal string)
 * @param minRatio - Minimum required contrast ratio (e.g., 4.5 for WCAG AA normal text)
 * @returns Adjusted foreground color that meets the minimum contrast ratio
 */
export function ensureContrast(
  foreground: string,
  background: string,
  minRatio: number
): string {
  try {
    // Calculate current contrast ratio
    let currentContrast = calculateContrast(foreground, background);
    
    // If contrast already meets requirement, return unchanged
    if (currentContrast >= minRatio) {
      return foreground;
    }
    
    // Convert foreground to HSL for lightness adjustment
    const fgRgb = hexToRgb(foreground);
    const fgHsl = rgbToHsl(fgRgb);
    
    // Determine adjustment direction based on background luminance
    const bgLuminance = calculateLuminance(background);
    const shouldLighten = bgLuminance < 0.5; // Lighten for dark backgrounds
    
    // Iteratively adjust lightness
    const maxIterations = 20;
    const step = 0.05;
    let iterations = 0;
    
    while (currentContrast < minRatio && iterations < maxIterations) {
      if (shouldLighten) {
        fgHsl.l = Math.min(1, fgHsl.l + step);
      } else {
        fgHsl.l = Math.max(0, fgHsl.l - step);
      }
      
      const adjustedFg = rgbToHex(hslToRgb(fgHsl));
      currentContrast = calculateContrast(adjustedFg, background);
      iterations++;
    }
    
    // If max iterations reached without achieving target, use fallback
    if (currentContrast < minRatio) {
      const fallback = bgLuminance > 0.5 ? '#000000' : '#FFFFFF';
      console.warn(
        `Could not achieve target contrast ratio ${minRatio}:1 after ${maxIterations} iterations. ` +
        `Using fallback color ${fallback}. ` +
        `Foreground: ${foreground}, Background: ${background}, Achieved: ${currentContrast.toFixed(2)}:1`
      );
      return fallback;
    }
    
    return rgbToHex(hslToRgb(fgHsl));
  } catch (error) {
    console.error('Error ensuring contrast:', error);
    // Fallback based on background luminance
    const bgLuminance = calculateLuminance(background);
    return bgLuminance > 0.5 ? '#000000' : '#FFFFFF';
  }
}

// ============================================================================
// WCAG Validation
// ============================================================================

/**
 * Validates that all color combinations in a DerivedColors set meet WCAG 2.1 Level AA
 * contrast requirements (4.5:1 for normal text).
 * 
 * Checks the following contrast ratios:
 * - primaryText vs cardBackground ≥ 4.5:1
 * - secondaryText vs cardBackground ≥ 4.5:1
 * - primaryText vs linkFooterBackground ≥ 4.5:1
 * 
 * @param colors - Complete set of derived UI element colors
 * @returns Object with valid flag and array of violation messages
 */
export function validateWCAG(colors: DerivedColors): {
  valid: boolean;
  violations: string[];
} {
  try {
    const violations: string[] = [];
    const minRatio = 4.5;
    
    // Check primaryText vs cardBackground contrast
    const primaryCardContrast = calculateContrast(colors.primaryText, colors.cardBackground);
    if (primaryCardContrast < minRatio) {
      violations.push(
        `Primary text vs card background contrast is ${primaryCardContrast.toFixed(2)}:1, ` +
        `which is below the required ${minRatio}:1 (WCAG AA)`
      );
    }
    
    // Check secondaryText vs cardBackground contrast
    const secondaryCardContrast = calculateContrast(colors.secondaryText, colors.cardBackground);
    if (secondaryCardContrast < minRatio) {
      violations.push(
        `Secondary text vs card background contrast is ${secondaryCardContrast.toFixed(2)}:1, ` +
        `which is below the required ${minRatio}:1 (WCAG AA)`
      );
    }
    
    // Check primaryText vs linkFooterBackground contrast
    const primaryFooterContrast = calculateContrast(colors.primaryText, colors.linkFooterBackground);
    if (primaryFooterContrast < minRatio) {
      violations.push(
        `Primary text vs link footer background contrast is ${primaryFooterContrast.toFixed(2)}:1, ` +
        `which is below the required ${minRatio}:1 (WCAG AA)`
      );
    }
    
    return {
      valid: violations.length === 0,
      violations,
    };
  } catch (error) {
    console.error('Error validating WCAG compliance:', error);
    return {
      valid: false,
      violations: ['Error occurred during WCAG validation'],
    };
  }
}

// ============================================================================
// Color Derivation Algorithm
// ============================================================================

/**
 * Derives a complete set of UI element colors from a base color.
 * Automatically generates complementary colors with WCAG contrast compliance.
 * 
 * Algorithm:
 * 1. Parse and validate baseColor (fallback to #2665D6 if invalid)
 * 2. Calculate luminance to determine light/dark theme (threshold 0.5)
 * 3. Generate topBlock: use baseColor directly for visual harmony (separation comes from card elevation)
 * 4. Generate primaryText: #000000 for light backgrounds, #FFFFFF for dark backgrounds
 * 5. Generate cardBackground: white (#FFFFFF) for light backgrounds, light gray (#F5F5F5) for dark backgrounds
 * 6. Ensure primaryText meets 4.5:1 contrast against cardBackground
 * 7. Generate secondaryText: adjust primaryText lightness by +30% (light) or -30% (dark)
 * 8. Ensure secondaryText meets 4.5:1 contrast against cardBackground
 * 9. Generate linkFooterBackground: adjust cardBackground lightness by -5%
 * 10. Wrap entire function in try-catch, return default colors on error
 * 
 * @param baseColor - Hexadecimal color string (e.g., "#2665D6")
 * @returns Complete set of derived UI element colors
 */
export function deriveColors(baseColor: string): DerivedColors {
  try {
    // Step 1: Parse and validate baseColor, use fallback if invalid
    let validBaseColor: string;
    
    // Validate hex format
    const cleanHex = baseColor.replace(/^#/, '');
    const isValid3Digit = /^[0-9A-Fa-f]{3}$/.test(cleanHex);
    const isValid6Digit = /^[0-9A-Fa-f]{6}$/.test(cleanHex);
    
    if (isValid3Digit || isValid6Digit) {
      validBaseColor = baseColor;
    } else {
      console.warn(`Invalid base color "${baseColor}", using fallback ${DEFAULT_COLOR}`);
      validBaseColor = DEFAULT_COLOR;
    }
    
    // Step 2: Calculate luminance to determine light/dark theme (threshold 0.5)
    const luminance = calculateLuminance(validBaseColor);
    const isLightBackground = luminance > 0.5;
    
    // Step 3: Generate topBlock - keep it the same as base color for visual harmony
    // The visual separation will come from card transparency/elevation, not color difference
    const topBlock = validBaseColor;
    
    // Step 4: Generate primaryText: #000000 for light backgrounds, #FFFFFF for dark backgrounds
    let primaryText = isLightBackground ? '#000000' : '#FFFFFF';
    
    // Step 5: Generate cardBackground with transparency for glass-morphism effect
    // Cards should appear to float above the background with subtle transparency
    let cardBackground: string;
    
    if (isLightBackground) {
      // For light backgrounds, use white with slight transparency for elevation
      cardBackground = '#FFFFFF';
    } else {
      // For dark backgrounds, use light cards for readability
      cardBackground = '#F5F5F5';
    }
    
    // Step 6: Ensure primaryText meets 4.5:1 contrast against cardBackground
    primaryText = ensureContrast(primaryText, cardBackground, 4.5);
    
    // Step 7: Generate secondaryText: adjust primaryText lightness by +30% (light) or -30% (dark)
    const secondaryLightnessAdjustment = isLightBackground ? 0.30 : -0.30;
    let secondaryText = adjustLightness(primaryText, secondaryLightnessAdjustment);
    
    // Step 8: Ensure secondaryText meets 4.5:1 contrast against cardBackground
    secondaryText = ensureContrast(secondaryText, cardBackground, 4.5);
    
    // Step 9: Generate linkFooterBackground: slightly darker than cardBackground
    const footerLightnessAdjustment = -0.05;
    const linkFooterBackground = adjustLightness(cardBackground, footerLightnessAdjustment);
    
    // Return complete set of derived colors
    return {
      topBlock,
      primaryText,
      secondaryText,
      cardBackground,
      linkFooterBackground,
    };
  } catch (error) {
    // Step 10: Wrap entire function in try-catch, return default colors on error
    console.error('Error deriving colors, returning defaults:', error);
    return {
      topBlock: DEFAULT_COLOR,
      primaryText: '#000000',
      secondaryText: '#666666',
      cardBackground: '#F5F7FA',
      linkFooterBackground: '#E8EBF0',
    };
  }
}
