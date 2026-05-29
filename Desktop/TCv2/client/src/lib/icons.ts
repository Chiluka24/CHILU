export function getLinkIconClass(title: string, url: string): string {
  const name = (title || '').toLowerCase();
  const u = (url || '').toLowerCase();
  let domain = '';
  try {
    domain = u.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  } catch {
    domain = u;
  }

  // Social & Content Platforms
  if (name.includes('facebook') || domain.includes('facebook.com')) return 'fab fa-facebook';
  if (name.includes('instagram') || domain.includes('instagram.com')) return 'fab fa-instagram';
  if (name.includes('twitter') || domain.includes('twitter.com') || domain.includes('x.com')) return 'fab fa-twitter';
  if (name.includes('linkedin') || domain.includes('linkedin.com')) return 'fab fa-linkedin';
  if (name.includes('youtube') || domain.includes('youtube.com')) return 'fab fa-youtube';
  if (name.includes('tiktok') || domain.includes('tiktok.com')) return 'fab fa-tiktok';
  if (name.includes('snapchat') || domain.includes('snapchat.com')) return 'fab fa-snapchat';
  if (name.includes('pinterest') || domain.includes('pinterest.com')) return 'fab fa-pinterest';
  if (name.includes('spotify') || domain.includes('spotify.com')) return 'fab fa-spotify';
  if (name.includes('discord') || domain.includes('discord.com') || domain.includes('discord.gg')) return 'fab fa-discord';
  if (name.includes('twitch') || domain.includes('twitch.tv')) return 'fab fa-twitch';
  if (name.includes('github') || domain.includes('github.com')) return 'fab fa-github';
  if (name.includes('reddit') || domain.includes('reddit.com')) return 'fab fa-reddit';
  if (name.includes('whatsapp') || domain.includes('whatsapp.com') || domain.includes('wa.me')) return 'fab fa-whatsapp';
  if (name.includes('telegram') || domain.includes('telegram.org') || domain.includes('t.me')) return 'fab fa-telegram';
  if (name.includes('medium') || domain.includes('medium.com')) return 'fab fa-medium';
  if (name.includes('behance') || domain.includes('behance.net')) return 'fab fa-behance';
  if (name.includes('dribbble') || domain.includes('dribbble.com')) return 'fab fa-dribbble';
  if (name.includes('patreon') || domain.includes('patreon.com')) return 'fab fa-patreon';

  // Cloud & Files
  if (name.includes('drive') || domain.includes('drive.google.com')) return 'fab fa-google-drive';
  if (name.includes('dropbox') || domain.includes('dropbox.com')) return 'fab fa-dropbox';
  if (name.includes('notion') || domain.includes('notion.so') || domain.includes('notion.site')) return 'fas fa-book';
  if (name.includes('figma') || domain.includes('figma.com')) return 'fab fa-figma';
  
  // Generic Actions
  if (name.includes('portfolio') || name.includes('website')) return 'fas fa-briefcase';
  if (name.includes('email') || name.includes('contact') || u.includes('mailto:')) return 'fas fa-envelope';
  if (name.includes('phone') || u.includes('tel:')) return 'fas fa-phone';
  if (name.includes('calendar') || domain.includes('calendly.com') || domain.includes('cal.com')) return 'fas fa-calendar-alt';
  
  // E-commerce
  if (name.includes('shop') || name.includes('store') || domain.includes('shopify.com')) return 'fas fa-shopping-bag';
  if (name.includes('amazon') || domain.includes('amazon.com') || domain.includes('amzn.to')) return 'fab fa-amazon';
  
  // Documents
  if (name.includes('file') || name.includes('resume') || name.includes('cv')) return 'fas fa-file-alt';
  if (u.includes('.pdf')) return 'fas fa-file-pdf';
  
  // Fallback
  return 'fas fa-link';
}

export function getPlatformIcon(platform: string): string {
  const platformIcons: Record<string, string> = {
    instagram: 'fab fa-instagram',
    twitter: 'fab fa-twitter',
    linkedin: 'fab fa-linkedin',
    youtube: 'fab fa-youtube',
    tiktok: 'fab fa-tiktok',
    github: 'fab fa-github',
    facebook: 'fab fa-facebook',
    snapchat: 'fab fa-snapchat',
    pinterest: 'fab fa-pinterest',
    discord: 'fab fa-discord',
    twitch: 'fab fa-twitch',
    reddit: 'fab fa-reddit',
    whatsapp: 'fab fa-whatsapp',
    telegram: 'fab fa-telegram',
    medium: 'fab fa-medium',
    behance: 'fab fa-behance',
    dribbble: 'fab fa-dribbble',
    patreon: 'fab fa-patreon',
    spotify: 'fab fa-spotify'
  };
  
  return platformIcons[platform.toLowerCase()] || 'fas fa-link';
}

/**
 * Extracts the platform name from a link's title or URL
 * Returns the platform name if recognized, undefined otherwise
 */
export function getPlatformFromLink(title: string, url: string): string | undefined {
  const name = (title || '').toLowerCase();
  const u = (url || '').toLowerCase();
  let domain = '';
  try {
    domain = u.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  } catch {
    domain = u;
  }

  // Check for platforms that have brand colors
  if (name.includes('facebook') || domain.includes('facebook.com')) return 'facebook';
  if (name.includes('instagram') || domain.includes('instagram.com')) return 'instagram';
  if (name.includes('twitter') || domain.includes('twitter.com')) return 'twitter';
  if (domain.includes('x.com')) return 'x.com';
  if (name.includes('linkedin') || domain.includes('linkedin.com')) return 'linkedin';
  if (name.includes('youtube') || domain.includes('youtube.com')) return 'youtube';
  if (name.includes('tiktok') || domain.includes('tiktok.com')) return 'tiktok';
  if (name.includes('snapchat') || domain.includes('snapchat.com')) return 'snapchat';
  if (name.includes('pinterest') || domain.includes('pinterest.com')) return 'pinterest';
  if (name.includes('spotify') || domain.includes('spotify.com')) return 'spotify';
  if (name.includes('discord') || domain.includes('discord.com') || domain.includes('discord.gg')) return 'discord';
  if (name.includes('twitch') || domain.includes('twitch.tv')) return 'twitch';
  if (name.includes('github') || domain.includes('github.com')) return 'github';
  if (name.includes('reddit') || domain.includes('reddit.com')) return 'reddit';
  if (name.includes('whatsapp') || domain.includes('whatsapp.com') || domain.includes('wa.me')) return 'whatsapp';
  if (name.includes('telegram') || domain.includes('telegram.org') || domain.includes('t.me')) return 'telegram';
  if (name.includes('email') || name.includes('mail') || u.includes('mailto:')) return 'email';

  return undefined;
}
