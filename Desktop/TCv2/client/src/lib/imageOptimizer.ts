/**
 * Cloudinary image optimization utility
 * Automatically applies format conversion, quality optimization, and resizing
 */

export const optimizeCloudinaryUrl = (url: string, width?: number): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  const transforms = [
    'f_auto', // Auto format (WebP for supported browsers)
    'q_auto:good', // Auto quality optimization
    width ? `w_${width}` : 'w_800', // Max width (default 800px)
    'c_limit' // Don't upscale small images
  ].join(',');
  
  return `${parts[0]}/upload/${transforms}/${parts[1]}`;
};

/**
 * Optimize avatar images (small, circular)
 */
export const optimizeAvatar = (url: string): string => {
  return optimizeCloudinaryUrl(url, 200);
};

/**
 * Optimize banner/background images
 */
export const optimizeBanner = (url: string): string => {
  return optimizeCloudinaryUrl(url, 1200);
};

/**
 * Optimize link thumbnail images
 */
export const optimizeThumbnail = (url: string): string => {
  return optimizeCloudinaryUrl(url, 400);
};
