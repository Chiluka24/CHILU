import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export const InstagramIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-instagram ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const TwitterIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-twitter ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const LinkedInIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-linkedin ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const YouTubeIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-youtube ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const TikTokIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-tiktok ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const GitHubIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-github ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const FacebookIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-facebook ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const SnapchatIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-snapchat ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const PinterestIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-pinterest ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const DiscordIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-discord ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const TwitchIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-twitch ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const RedditIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-reddit ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const WhatsAppIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-whatsapp ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const TelegramIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-telegram ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const MediumIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-medium ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const BehanceIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-behance ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const DribbbleIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-dribbble ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const PatreonIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-patreon ${className}`} style={{ fontSize: size, color, ...style }} />
);

export const SpotifyIcon: React.FC<IconProps> = ({ className = '', size = 16, color, style }) => (
  <i className={`fab fa-spotify ${className}`} style={{ fontSize: size, color, ...style }} />
);