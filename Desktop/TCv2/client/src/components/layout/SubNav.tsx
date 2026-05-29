/**
 * Pill-style segmented sub-navigation used by section pages that have
 * multiple sibling routes (Monetization → Campaigns / Payouts, Links →
 * Links / Appearance / Crumb on mobile, etc.).
 *
 * Active item uses the dark heading-color fill to match PageHeader and the
 * sidebar's active state — no more "brown logo" tile look.
 */

import type { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { memo } from 'react';

export interface SubNavItem {
  /** Route path. Used both for matching and the underlying <Link to=...>. */
  path: string;
  /** Label shown on the segment. */
  label: string;
  /** Optional left icon. */
  icon?: LucideIcon;
}

interface SubNavProps {
  items: SubNavItem[];
  className?: string;
  /** When provided, this path is used for the active match instead of the
   *  live location.pathname (useful when the sub-nav lives above the routes
   *  it represents). */
  activePath?: string;
}

function SubNavInner({ items, className, activePath }: SubNavProps) {
  const location = useLocation();
  const current = activePath ?? location.pathname;

  return (
    <nav
      className={`flex items-center gap-1 p-1 rounded-2xl w-full sm:w-auto ${className ?? ''}`}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-default)',
      }}
      aria-label="Section navigation"
    >
      {items.map(({ path, label, icon: Icon }) => {
        const isActive = current === path || current.startsWith(`${path}/`);
        return (
          <Link
            key={path}
            to={path}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200"
            style={
              isActive
                ? { background: 'var(--heading-color)', color: 'white' }
                : { color: 'var(--heading-color)' }
            }
            aria-current={isActive ? 'page' : undefined}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

const SubNav = memo(SubNavInner);
export default SubNav;
