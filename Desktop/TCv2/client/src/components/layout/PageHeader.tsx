/**
 * Shared page header used by every authenticated page.
 *
 * Renders a uniform title / subtitle pair with an optional dark icon tile on
 * the left and an optional action area on the right. Centralizing this here
 * eliminates per-page bespoke headers that drifted in font sizes, paddings,
 * icon treatments, and subtitle indentation.
 *
 * Design notes:
 *  - Title uses Playfair Display (the brand display face) for editorial weight
 *    that matches the "The Crumb" logo in the sidebar.
 *  - The icon tile uses a dark heading-color gradient — the previous brown
 *    accent looked dated next to the rest of the UI.
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { memo } from 'react';

interface PageHeaderProps {
  /** Optional left-side icon (renders inside a dark gradient tile). */
  icon?: LucideIcon;
  /** Page title. */
  title: string;
  /** Optional subtitle / description shown under the title. */
  subtitle?: string;
  /** Optional right-side slot (typically a primary action button). */
  action?: ReactNode;
  /** Extra className for the wrapper (rarely needed). */
  className?: string;
}

function PageHeaderInner({ icon: Icon, title, subtitle, action, className }: PageHeaderProps) {
  return (
    <header
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 ${className ?? ''}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{
              background:
                'linear-gradient(135deg, var(--heading-color) 0%, color-mix(in srgb, var(--heading-color) 75%, var(--accent) 25%) 100%)',
            }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="min-w-0">
          <h1
            className="font-bold tracking-tight app-page-main-title leading-tight truncate"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="app-page-subtitle font-medium mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </header>
  );
}

const PageHeader = memo(PageHeaderInner);
export default PageHeader;
