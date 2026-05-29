import React, { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, Link as LinkIcon, ExternalLink as ExternalIcon, ChevronDown, ChevronRight, Share2, FolderOpen } from 'lucide-react';
import { getLinkIconClass } from '../../lib/icons';

interface DNDLinksListProps {
  links: any[];
  setLinks: (links: any[]) => void;
  onEdit: (link: any) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onReorderEnd: () => void;
}

export default function DNDLinksList({ links, setLinks, onEdit, onDelete, onToggle, onReorderEnd }: DNDLinksListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const rootItems = links.filter(l => !l.parentId).sort((a, b) => a.order - b.order);
  
  const getChildren = (parentId: string) => {
    return links.filter(l => l.parentId === parentId).sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    // We can swap items within containers visually instantly
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    let oldLinks = links.map(link => ({ ...link }));

    const activeItem = oldLinks.find(l => l.id === activeId);
    const overItem = oldLinks.find(l => l.id === overId);
    
    if (!activeItem || !overItem) return;

    if (activeId !== overId) {
      if (overItem.type === 'collection' && activeItem.type === 'link') {
        const overChildren = getChildren(overId as string);
        
        // If dropping exactly on a collection 
        activeItem.parentId = overItem.id;
        activeItem.order = overChildren.length;
        
      } else {
        // Normal reorder
        activeItem.parentId = overItem.parentId;
        const activeGroup = oldLinks.filter(l => l.parentId === activeItem.parentId).sort((a, b) => a.order - b.order);
        const oldIndex = activeGroup.findIndex(l => l.id === activeId);
        const newIndex = activeGroup.findIndex(l => l.id === overId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedGroup = arrayMove(activeGroup, oldIndex, newIndex);
            reorderedGroup.forEach((item, index) => {
                 const original = oldLinks.find(l => l.id === item.id);
                 if (original) original.order = index;
            });
        }
      }

      setLinks(oldLinks);
      onReorderEnd();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={rootItems.map(l => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {rootItems.map((link) => (
             link.type === 'collection' ? (
                <SortableCollectionCard 
                    key={link.id} 
                    collection={link} 
                    childrenLinks={getChildren(link.id)}
                    expanded={!!expandedFolders[link.id]}
                    onToggleExpand={() => setExpandedFolders(prev => ({...prev, [link.id]: !prev[link.id]}))}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleActive={onToggle}
                />
             ) : (
                <SortableLinkCard 
                    key={link.id} 
                    link={link} 
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleActive={onToggle}
                />
             )
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// Subcomponents: SortableCollectionCard (Fallback implementation to prevent crash)
function SortableCollectionCard({ collection, childrenLinks, expanded, onToggleExpand, onEdit, onDelete, onToggleActive }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: collection.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  
  return (
    <div ref={setNodeRef} style={style} className="app-card p-3 border-2 border-dashed border-[var(--border-default)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab p-1">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <span className="font-bold">{collection.title} (Collection)</span>
          <span className="text-xs app-muted">{childrenLinks.length} items</span>
        </div>
        <div className="flex gap-2">
          <button onClick={onToggleExpand} className="text-sm">{expanded ? 'Collapse' : 'Expand'}</button>
          <button onClick={() => onEdit(collection)}><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => onDelete(collection.id)}><Trash2 className="w-4 h-4" /></button>
          <button onClick={() => onToggleActive(collection.id)}>{collection.isActive ? 'On' : 'Off'}</button>
        </div>
      </div>
      {expanded && childrenLinks.length > 0 && (
         <div className="pl-6 mt-3 border-l-2 space-y-2">
            <SortableContext items={childrenLinks.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
              {childrenLinks.map((child: any) => (
                 <SortableLinkCard 
                     key={child.id} 
                     link={child} 
                     onEdit={onEdit}
                     onDelete={onDelete}
                     onToggleActive={onToggleActive}
                 />
              ))}
            </SortableContext>
         </div>
      )}
    </div>
  );
}

// Subcomponents: SortableLinkCard
function SortableLinkCard({ link, onEdit, onDelete, onToggleActive }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-gray-100 rounded text-gray-400">
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
           <div>
               <h3 className="font-bold text-gray-900">{link.title}</h3>
               <p className="text-gray-500 text-sm mt-0.5">{link.url}</p>
           </div>
           <div className="flex items-center gap-2">
              <button onClick={() => onEdit(link)}><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(link.id)}><Trash2 className="w-4 h-4" /></button>
              <button onClick={() => onToggleActive(link.id)}>{link.isActive ? 'Active' : 'Inactive'}</button>
           </div>
        </div>
      </div>
    </div>
  );
}

// SortableCollectionCard (Includes nested SortableContext)
// ... I will build this directly in Links.tsx with drag logic simply manually written bypassing heavy dndkit bugs for nesting
