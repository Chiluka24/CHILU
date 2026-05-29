import type { CSSProperties } from 'react';

// ═══════════════════════════════════════════════════════════
// VERSION 1 CHART THEME (thecrumb.co)
// Warm Brown Tones - Primary & Highlight Lines
// ═══════════════════════════════════════════════════════════

export const chartTheme = {
  primary: '#3B2418',
  secondary: '#C9793A',
  tertiary: '#ECE6E2',
  primarySoft: 'rgba(59, 36, 24, 0.1)',
  secondarySoft: 'rgba(201, 121, 58, 0.08)',
  grid: '#F0EBE8',
  tick: '#6F6F6F',
  cursor: '#ECE6E2',
  hoverFill: '#FAF7F5',
};

export const chartTooltipStyle: CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '10px',
  border: '1px solid #ECE6E2',
  boxShadow: '0 4px 12px rgba(43, 26, 18, 0.16), 0 1px 4px rgba(43, 26, 18, 0.12)',
  padding: '10px 14px',
  fontSize: '13px',
};

export const chartTooltipItemStyle: CSSProperties = {
  color: '#2B1A12',
  fontWeight: 600,
};

export const chartTooltipLabelStyle: CSSProperties = {
  color: '#6F6F6F',
  fontWeight: 500,
  marginBottom: '4px',
};
