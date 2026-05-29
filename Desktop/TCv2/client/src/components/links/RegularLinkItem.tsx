import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  Edit2,
  BarChart2,
  Share2,
  LayoutTemplate,
} from 'lucide-react';
import { getLinkIconClass, getPlatformFromLink } from '../../lib/icons';
import { getBrandColor } from '../../lib/brandColors';

interface RegularLinkItemProps {
  link: any;
  onEdit: (link: any) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onShare: (link: any) => void;
  onInlineSave?: (link: any) => void;
  onUpdateLink?: (id: string, updates: any) => void;
  onToggleLayout?: (id: string) => void;
}

export default function RegularLinkItem({
  link,
  onEdit,
  onDelete,
  onToggleActive,
  onShare,
  onToggleLayout,
}: RegularLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: link.id,
    data: { type: 'Link', link }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="link-item-mobile app-card p-3 md:p-4 flex flex-col group duration-200 app-card-hover"
    >
      {/* Row 1: Drag + Icon + Title/URL + Toggle */}
      <div className="flex items-center gap-2 md:gap-3">
        <div 
          {...attributes} 
          {...listeners}
          className="app-reorder-handle cursor-grab active:cursor-grabbing p-0 app-muted hover:text-[var(--heading-color)] transition-colors shrink-0" 
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 md:w-5 md:h-5" />
        </div>

        {link.image ? (
          <img src={link.image} alt="" className="w-10 h-10 md:w-11 md:h-11 rounded-lg object-cover shrink-0 border border-[var(--border-default)]" />
        ) : (
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg shrink-0 border border-[var(--border-default)] flex items-center justify-center" style={{ background: 'var(--surface-subtle)' }}>
            <i 
              className={`${getLinkIconClass(link.title, link.url)} text-[18px] md:text-[20px]`} 
              style={{ 
                color: (() => {
                  const platform = getPlatformFromLink(link.title, link.url);
                  return platform ? (getBrandColor(platform) || 'var(--icon-color)') : 'var(--icon-color)';
                })()
              }} 
            />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="app-inline-title app-heading font-bold text-[13px] sm:text-[14px] md:text-[18px] leading-tight tracking-tight p-0 w-full text-ellipsis overflow-hidden whitespace-nowrap cursor-default">
            {link.title}
          </div>
          <div className="app-inline-body app-muted text-[11px] md:text-[13px] font-medium p-0 w-full text-ellipsis overflow-hidden whitespace-nowrap cursor-default">
            {link.url}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleActive(link.id)}
          aria-pressed={link.isActive}
          className="shrink-0"
        >
          <div
            className={`relative h-[20px] w-[36px] md:h-[20px] md:w-[36px] rounded-full overflow-hidden transition-colors duration-200 ${link.isActive
              ? 'bg-[var(--button-primary)]'
              : 'bg-[#ccc]'
              }`}
          >
            <div
              className={`absolute top-[2px] left-[2px] h-[16px] w-[16px] rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${link.isActive
                ? 'translate-x-[16px]'
                : 'translate-x-0'
                }`}
            />
          </div>
        </button>
      </div>

      {/* Row 2: Action Icons Strip */}
      <div className="link-actions-strip flex items-center gap-3 md:gap-4 pt-2.5 md:pt-3 mt-2.5 md:mt-3 border-t border-[var(--border-default)] ml-6 md:ml-0">
        <button
          onClick={() => onEdit(link)}
          className="link-action-btn p-1.5 md:p-2 app-muted hover:text-[var(--heading-color)] transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4 md:w-4 md:h-4" />
        </button>
        <button 
          className="link-action-btn p-1.5 md:p-2 app-muted hover:text-[var(--heading-color)] transition-colors"
          title={`${link.clicks} clicks`}
        >
          <BarChart2 className="w-4 h-4 md:w-4 md:h-4" />
        </button>
        <button
          onClick={() => onShare(link)}
          className="link-action-btn p-1.5 md:p-2 app-muted hover:text-[var(--heading-color)] transition-colors"
          title="Share"
        >
          <Share2 className="w-4 h-4 md:w-4 md:h-4" />
        </button>
        {onToggleLayout && (
          <button
            onClick={() => onToggleLayout(link.id)}
            className={`link-action-btn p-1.5 md:p-2 transition-colors ${link.metadata?.layout === 'featured' ? 'text-[var(--button-primary)]' : 'app-muted hover:text-[var(--heading-color)]'}`}
            title="Toggle Layout"
          >
            <LayoutTemplate className="w-4 h-4 md:w-4 md:h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(link.id)}
          className="link-action-btn p-1.5 md:p-2 text-red-400 hover:text-red-500 transition-colors ml-auto"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 md:w-4 md:h-4" />
        </button>
      </div>
    </div>
  );
}
