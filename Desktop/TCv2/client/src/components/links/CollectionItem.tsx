import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  Trash2,
  Edit2,
  BarChart2,
  Share2,
  Plus,
  ChevronDown,
  ChevronRight,
  Link2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { getLinkIconClass } from '../../lib/icons';
import RegularLinkItem from './RegularLinkItem';

interface CollectionItemProps {
  collection: any;
  childrenItems: any[]; // Avoid reserved keyword 'children' since we'll use it
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (link: any) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onAddLink: (collectionId: string) => void;
  onShare: (link: any) => void;
  onInlineSave?: (link: any) => void;
  onUpdateLink?: (id: string, updates: any) => void;
  isDragOver?: boolean;
  onToggleLayout?: (id: string) => void;
}

export default function CollectionItem({
  collection,
  childrenItems,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  onAddLink,
  onShare,
  isDragOver = false,
  onToggleLayout,
}: CollectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: collection.id,
    data: { type: 'Collection', collection }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 40 : 'auto',
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`collection-item-mobile relative rounded-2xl p-3 md:p-5 overflow-hidden transition-all duration-200 ${
        isDragOver ? 'border-2 border-[var(--button-primary)]' : 'border border-[var(--border-default)]'
      }`}
    >
      {/* Animated glow effect when dragging over */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 rounded-2xl pointer-events-none z-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(38, 101, 214, 0.12) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Collection Header */}
      {/* Row 1: Drag + Expand + Title/Count + Toggle */}
      <div className="flex items-center gap-2 md:gap-3 relative z-10">
            <div 
              {...attributes} 
              {...listeners}
              className="app-reorder-handle cursor-grab active:cursor-grabbing p-0 app-muted hover:text-[var(--heading-color)] transition-colors shrink-0" 
              title="Drag to reorder collection"
            >
              <GripVertical className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            
            <button
              onClick={onToggleExpand}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl shrink-0 flex items-center justify-center transition-all hover:scale-105"
              style={{ 
                background: 'var(--button-primary)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-white" />
              ) : (
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="font-bold text-[14px] sm:text-[16px] md:text-[20px] app-heading p-0 w-full truncate cursor-default leading-tight">
                {collection.title || "Collection name"}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] md:text-[12px] app-muted font-medium">
                  {childrenItems.length} {childrenItems.length === 1 ? 'link' : 'links'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleActive(collection.id)}
              aria-pressed={collection.isActive}
              className="shrink-0"
            >
              <div
                className={`relative h-[20px] w-[36px] md:h-[20px] md:w-[36px] rounded-full overflow-hidden transition-colors duration-200 ${collection.isActive
                  ? 'bg-[var(--button-primary)]'
                  : 'bg-[#ccc]'
                  }`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] h-[16px] w-[16px] rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${collection.isActive
                    ? 'translate-x-[16px]'
                    : 'translate-x-0'
                    }`}
                />
              </div>
          </button>
        </div>

      {/* Row 2: Action Icons Strip */}
      <div className="collection-actions-strip flex items-center gap-3 md:gap-4 pt-2.5 md:pt-3 mt-2.5 md:mt-3 border-t border-[var(--border-default)] ml-6 md:ml-0 relative z-10">
            <button
              onClick={() => onAddLink(collection.id)}
              className="link-action-btn p-1.5 md:p-2 app-muted hover:text-[var(--heading-color)] transition-colors"
              title="Add Link"
            >
              <Plus className="w-4 h-4 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => onEdit(collection)}
              className="link-action-btn p-1.5 md:p-2 app-muted hover:text-[var(--heading-color)] transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => onShare(collection)}
              className="link-action-btn p-1.5 md:p-2 app-muted hover:text-[var(--heading-color)] transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4 md:w-4 md:h-4" />
            </button>
            {onToggleLayout && (
              <button
                onClick={() => onToggleLayout(collection.id)}
                className={`link-action-btn p-1.5 md:p-2 transition-colors ${collection.metadata?.layout === 'grid' ? 'text-[var(--button-primary)]' : 'app-muted hover:text-[var(--heading-color)]'}`}
                title={collection.metadata?.layout === 'grid' ? "Switch to List View" : "Switch to Grid View"}
              >
                {collection.metadata?.layout === 'grid' ? (
                  <LayoutGrid className="w-4 h-4 md:w-4 md:h-4" />
                ) : (
                  <List className="w-4 h-4 md:w-4 md:h-4" />
                )}
              </button>
            )}
            <button
              onClick={() => onDelete(collection.id)}
              className="link-action-btn p-1.5 md:p-2 text-red-400 hover:text-red-500 transition-colors ml-auto"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 md:w-4 md:h-4" />
            </button>
        </div>

      {/* Collection Links - Rendered as a Nested SortableContext */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="collection-nested-area mt-3 md:mt-4 relative z-10">
                <SortableContext items={childrenItems.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 md:space-y-2 pl-3 md:pl-2 ml-6 md:ml-0 border-l border-[var(--border-default)]" style={{ background: 'rgba(0,0,0,0.01)' }}>
                    {childrenItems.length === 0 ? (
                       <EmptyCollectionDropZone collectionId={collection.id} />
                    ) : (
                       childrenItems.map(childLink => (
                         <div key={childLink.id} className="relative">
                            <RegularLinkItem
                              link={childLink}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onToggleActive={onToggleActive}
                              onShare={onShare}
                              onToggleLayout={onToggleLayout}
                            />
                         </div>
                       ))
                    )}
                  </div>
                </SortableContext>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}

function EmptyCollectionDropZone({ collectionId }: { collectionId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `empty-dropZone-${collectionId}`,
    data: { type: 'EmptyCollection', collectionId }
  });

  return (
    <div 
      ref={setNodeRef}
      className="text-center py-6 px-4 border-2 border-dashed rounded-xl transition-all"
      style={{ 
        borderColor: isOver ? 'var(--button-primary)' : 'var(--border-default)', 
        background: isOver ? 'var(--surface-hover)' : 'var(--surface-subtle)' 
      }}
    >
      <p className="text-sm app-muted font-medium mb-3">No links in this collection yet. Drop a link here!</p>
    </div>
  );
}
