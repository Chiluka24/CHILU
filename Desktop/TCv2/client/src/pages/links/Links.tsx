import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getLinkIconClass, getPlatformFromLink } from '../../lib/icons';
import { getBrandColor } from '../../lib/brandColors';
import {
  DndContext,
  closestCorners,
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
} from '@dnd-kit/sortable';
import {
  Plus,
  GripVertical,
  Trash2,
  Edit2,
  BarChart2,
  Image as ImageIcon,
  X,
  Search,
  Share2,
  Send,
  Link2,
  ChevronDown,
  ChevronRight,
  Type,
  ExternalLink as LinkIcon,
  Tag,
  Layers,
  Video,
  MessageSquare,
  Asterisk,
  Box,
  MousePointer,
  Play,
  Globe,
  Package,
  Zap,
  Youtube,
  LayoutTemplate
} from 'lucide-react';
import { API_BASE } from '../../config/env';
import CustomDropdown from '../../components/ui/CustomDropdown';
import CollectionItem from '../../components/links/CollectionItem';
import RegularLinkItem from '../../components/links/RegularLinkItem';
import { cacheManager } from '../../lib/cacheManager';

type LinkItem = { id: string; title: string; url: string; isActive: boolean; clicks: number; keyword?: string; image?: string; parentId: string | null; type: string; metadata?: any; };
const FALLBACK_LINKS: LinkItem[] = [];

interface LinksProps {
  links?: LinkItem[];
  setLinks?: React.Dispatch<React.SetStateAction<LinkItem[]>>;
}

const API_URL = `${API_BASE}/api/links`;

export default function Links({ links: externalLinks, setLinks: externalSetLinks }: LinksProps) {
  const navigate = useNavigate();
  const [internalLinks, setInternalLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const links = externalLinks ?? internalLinks;
  const setLinks = externalSetLinks ?? setInternalLinks;
  const [draggingLinkId, setDraggingLinkId] = useState<string | null>(null);
  const [activeItemData, setActiveItemData] = useState<any>(null);
  const [dragOverCollectionId, setDragOverCollectionId] = useState<string | null>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkData, setNewLinkData] = useState({
    title: '',
    url: '',
    image: '',
    keyword: '',
    type: 'Link',
    metadata: {} as any,
    parentId: null as string | null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  // Edit Link State
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkData, setEditLinkData] = useState({
    title: '',
    url: '',
    keyword: '',
    image: '',
    type: 'Link',
    metadata: {} as any,
    parentId: null as string | null
  });

  const [toastMessage, setToastMessage] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isAddingLink || isEditingLink) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // Dispatch modal state change event
      window.dispatchEvent(new CustomEvent('modalStateChange', { detail: { isOpen: true } }));
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      
      // Dispatch modal state change event
      window.dispatchEvent(new CustomEvent('modalStateChange', { detail: { isOpen: false } }));
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      
      // Cleanup modal state
      window.dispatchEvent(new CustomEvent('modalStateChange', { detail: { isOpen: false } }));
    };
  }, [isAddingLink, isEditingLink]);

  // Fetch links from backend on mount
  useEffect(() => {
    if (!externalLinks) {
      const token = localStorage.getItem('token');
      fetch(API_URL, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(data => {
          const payload = Array.isArray(data) ? data : data?.data;
          setInternalLinks(Array.isArray(payload) ? payload : []);
        })
        .catch(err => {
          console.error('Failed to fetch links:', err);
          setInternalLinks([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [externalLinks]);

  // Reusable toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Initialize expanded collections from links data
  useEffect(() => {
    const collections = links.filter(l => l.type?.toLowerCase() === 'collection');
    const expanded = new Set<string>();
    collections.forEach(c => {
      if ((c as any).isExpanded !== false) {
        expanded.add(c.id);
      }
    });
    setExpandedCollections(expanded);
  }, [links]);

  // Helper to get collection children
  const getCollectionChildren = (collectionId: string) => {
    return links.filter(l => (l as any).parentId === collectionId);
  };

  // Helper to get top-level items (no parent)
  const getTopLevelLinks = () => {
    return links.filter(l => !(l as any).parentId);
  };

  // Toggle collection expansion
  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev);
      const isCurrentlyExpanded = newSet.has(collectionId);
      if (isCurrentlyExpanded) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }

      // Save to backend
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${API_URL}/${collectionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isExpanded: !isCurrentlyExpanded })
        }).catch(console.error);
      }

      return newSet;
    });
  };

  // Helper to update a single link
  const updateLink = (id: string, updates: any) => {
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  // Highly efficient backend update triggered only when a drag-and-drop finishes
  const handleReorderEnd = async (newLinks: any[]) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Send order to backend. Note: we might also need to send parentId updates!
    // Since we handle moving between collections, parentId could be modified.
    const updates = newLinks.map(l => ({ id: l.id, parentId: l.parentId, order: newLinks.findIndex(i => i.id === l.id) }));
    try {
      await fetch(`${API_URL}/reorder/batch`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ updates })
      });
      // Invalidate dashboard cache after mutation
      cacheManager.invalidate('dashboardData');
    } catch (err) {
      console.error('Failed to save link order:', err);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (e: DragStartEvent) => {
    const { active } = e;
    setDraggingLinkId(active.id as string);
    const item = links.find(l => l.id === active.id);
    setActiveItemData(item);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) {
       setDragOverCollectionId(null);
       return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeItem = links.find(l => l.id === activeId);
    let overItem = links.find(l => l.id === overId);

    if (!activeItem) return;
    if (activeItem.type?.toLowerCase() === 'collection') return;

    // Highlight drop target collection if hovering over one
    if (overItem?.type?.toLowerCase() === 'collection') {
        setDragOverCollectionId(overItem.id);
    } else {
        setDragOverCollectionId(null);
    }

    // Handle empty drop zone
    if (String(overId).startsWith('empty-dropZone-')) {
       const targetCollectionId = String(overId).replace('empty-dropZone-', '');
       if (activeItem.parentId !== targetCollectionId) {
         setLinks((prev) => prev.map(l => 
           l.id === activeId ? { ...l, parentId: targetCollectionId } : l
         ));
       }
       return;
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setDraggingLinkId(null);
    setActiveItemData(null);
    setDragOverCollectionId(null);
    
    const { active, over } = e;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeItem = links.find(l => l.id === activeId);
    const overItem = links.find(l => l.id === overId);

    if (!activeItem) return;

    // Handle empty drop zone
    if (String(overId).startsWith('empty-dropZone-')) {
       const targetCollectionId = String(overId).replace('empty-dropZone-', '');
       const updatedLinks = links.map(l => 
         l.id === activeId ? { ...l, parentId: targetCollectionId } : l
       );
       setLinks(updatedLinks);
       handleReorderEnd(updatedLinks);
       return;
    }

    // Handle dropping onto collapsed collection
    if (activeItem && overItem && overItem.type?.toLowerCase() === 'collection' && overItem.id !== activeId && activeItem.type?.toLowerCase() !== 'collection' && !expandedCollections.has(overItem.id)) {
       const updatedLinks = links.map(l => l.id === activeId ? { ...l, parentId: overItem.id } : l);
       setLinks(updatedLinks);
       handleReorderEnd(updatedLinks);
       return;
    }

    // Reorder items
    if (activeId !== overId && overItem) {
      setLinks((prev) => {
        const activeContainerId = activeItem?.parentId || 'root';
        const overContainerId = overItem?.parentId || 'root';
        
        // Update parentId if moving between containers
        let updatedPrev = prev;
        if (activeContainerId !== overContainerId) {
          updatedPrev = prev.map(l => 
            l.id === activeId ? { ...l, parentId: overContainerId === 'root' ? null : overContainerId } : l
          );
        }
        
        // Reorder within target container
        const containerItems = updatedPrev.filter(l => (l.parentId || 'root') === overContainerId);
        const oldIndex = containerItems.findIndex(l => l.id === activeId);
        const newIndex = containerItems.findIndex(l => l.id === overId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
           const reorderedGroup = arrayMove(containerItems, oldIndex, newIndex);
           
           let containerPointer = 0;
           const newLinks = updatedPrev.map(l => {
              if ((l.parentId || 'root') === overContainerId) {
                 return reorderedGroup[containerPointer++];
              }
              return l;
           });
           handleReorderEnd(newLinks);
           return newLinks;
        }
        
        handleReorderEnd(updatedPrev);
        return updatedPrev;
      });
    } else {
        handleReorderEnd(links);
    }
  };

  // Handle dropping a link into a collection
  const handleDropIntoCollection = async (linkId: string, collectionId: string) => {
    const link = links.find(l => l.id === linkId);
    if (!link || link.type?.toLowerCase() === 'collection') return;

    // Update the link's parentId
    const updatedLinks = links.map(l => 
      l.id === linkId ? { ...l, parentId: collectionId } : l
    );
    setLinks(updatedLinks);

    // Save to backend
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_URL}/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ parentId: collectionId })
      });
      showToast('Link added to collection!');
    } catch (err) {
      console.error('Failed to add link to collection:', err);
      // Revert on error
      setLinks(links);
    }
  };

  // Save specific link data when a user clicks out of an inline text input
  const handleInlineSave = async (link: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    await fetch(`${API_URL}/${link.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: link.title, url: link.url, keyword: link.keyword || '' })
    }).catch(console.error);
  };

  const toggleLink = async (id: string) => {
    const link = links.find(l => l.id === id);
    if (!link) return;

    // Optimistic UI Update
    const newStatus = !link.isActive;
    setLinks(links.map(l => l.id === id ? { ...l, isActive: newStatus } : l));

    // API Update
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ isActive: newStatus })
    });
    // Invalidate dashboard cache after mutation
    cacheManager.invalidate('dashboardData');
  };

  const toggleLayout = async (id: string) => {
    const link = links.find(l => l.id === id);
    if (!link) return;

    let newLayout = 'classic';
    if (link.type?.toLowerCase() === 'collection') {
      const currentLayout = link.metadata?.layout || 'list';
      newLayout = currentLayout === 'grid' ? 'list' : 'grid';
    } else {
      const currentLayout = link.metadata?.layout || 'classic';
      newLayout = currentLayout === 'featured' ? 'classic' : 'featured';
    }

    const newMetadata = { ...link.metadata, layout: newLayout };

    // Optimistic UI Update
    setLinks(links.map(l => l.id === id ? { ...l, metadata: newMetadata } : l));

    // Show toast notification
    if (link.type?.toLowerCase() === 'collection') {
      showToast(`Layout changed to ${newLayout === 'grid' ? 'Grid view' : 'List view'}`);
    } else {
      showToast(`Layout changed to ${newLayout === 'featured' ? 'Featured view' : 'Classic view'}`);
    }

    // API Update
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ metadata: newMetadata })
    });
  };

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    setLinks(links.filter(l => l.id !== id));
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    // Invalidate dashboard cache after mutation
    cacheManager.invalidate('dashboardData');
  };

  const addLink = () => {
    setIsAddingLink(true);
  };

  const handleAddLinkSubmit = async () => {
    // Validation: Title is required
    if (!newLinkData.title || !newLinkData.title.trim()) {
      return alert('Title is required');
    }

    // Validation: For popup buttons, content is required
    if (newLinkData.type === 'button' && (!newLinkData.metadata?.content || !newLinkData.metadata.content.trim())) {
      return alert('Description is required for popup buttons');
    }

    // Validation: For video embeds, video URL is required
    if (newLinkData.type === 'video' && (!newLinkData.url || !newLinkData.url.trim())) {
      return alert('Video URL is required for video embeds');
    }

    // Validation: For standard links, URL is required
    if (newLinkData.type === 'Link' && (!newLinkData.url || !newLinkData.url.trim())) {
      return alert('URL is required for standard links');
    }

    let finalImageUrl = newLinkData.image || '';

    // Upload base64 image to Cloudinary if present
    if (finalImageUrl && finalImageUrl.startsWith('data:')) {
      const token = localStorage.getItem('token');
      if (!token) { alert('Please login again.'); return; }
      try {
        console.log('📤 Uploading link image to Cloudinary...');
        const res = await fetch(`${API_BASE}/api/user/appearance-media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dataUrl: finalImageUrl })
        });
        if (!res.ok) throw new Error(await res.text() || 'Failed to upload image');
        const payload = await res.json();
        finalImageUrl = payload.url;
        console.log('✅ Image uploaded:', finalImageUrl);
      } catch (err) {
        console.error('❌ Image upload failed:', err);
        alert('Failed to upload image. Please try again.');
        return;
      }
    }

    const payload = {
      title: newLinkData.title.trim(),
      url: newLinkData.url || '',
      image: finalImageUrl,
      keyword: newLinkData.keyword || '',
      type: newLinkData.type || 'Link',
      metadata: newLinkData.metadata || {},
      parentId: newLinkData.parentId || null,
      isActive: true
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add links');
        return;
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const response = await res.json();
      const savedLink = response.data || response;

      if (!res.ok) {
        console.error('❌ Failed to save link:', savedLink);
        throw new Error(savedLink.error || 'Failed to save link');
      }

      setLinks([...links, savedLink]); // Add to end or beginning depending on backend order logic
      setIsAddingLink(false);
      setNewLinkData({ title: '', url: '', keyword: '', image: '', type: 'Link', metadata: {}, parentId: null });
      
      // Invalidate dashboard cache after mutation
      cacheManager.invalidate('dashboardData');
      
      // Show appropriate success message
      const successMessage = newLinkData.type?.toLowerCase() === 'collection' 
        ? 'Collection created successfully!' 
        : newLinkData.type === 'button'
        ? 'Popup button created successfully!'
        : newLinkData.type === 'video'
        ? 'Video embed created successfully!'
        : 'Link added successfully!';
      
      showToast(successMessage);
    } catch (err) {
      console.error('❌ Error adding link:', err);
      alert(err instanceof Error ? err.message : 'An error occurred while saving.');
    }
  };

  const handleEditClick = (link: any) => {
    setEditingLinkId(link.id);
    setEditLinkData({
      title: link.title,
      url: link.url,
      keyword: link.keyword || '',
      image: link.image || '',
      type: link.type || 'Link',
      metadata: link.metadata || {},
      parentId: link.parentId || null
    });
    setIsEditingLink(true);
  };

  const handleEditLinkSubmit = async () => {
    if (!editingLinkId) return;
    
    // Validation: Title is required
    if (!editLinkData.title || !editLinkData.title.trim()) {
      return alert('Title is required');
    }

    // Validation: For popup buttons, content is required
    if (editLinkData.type === 'button' && (!editLinkData.metadata?.content || !editLinkData.metadata.content.trim())) {
      return alert('Description is required for popup buttons');
    }

    // Validation: For video embeds, video URL is required
    if (editLinkData.type === 'video' && (!editLinkData.url || !editLinkData.url.trim())) {
      return alert('Video URL is required for video embeds');
    }

    // Validation: For standard links, URL is required
    if (editLinkData.type === 'Link' && (!editLinkData.url || !editLinkData.url.trim())) {
      return alert('URL is required for standard links');
    }

    let finalImageUrl = editLinkData.image;

    // Upload base64 image to Cloudinary if present
    if (finalImageUrl && finalImageUrl.startsWith('data:')) {
      const token = localStorage.getItem('token');
      if (!token) { alert('Please login again.'); return; }
      try {
        console.log('📤 Uploading link image to Cloudinary...');
        const res = await fetch(`${API_BASE}/api/user/appearance-media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dataUrl: finalImageUrl })
        });
        if (!res.ok) throw new Error(await res.text() || 'Failed to upload image');
        const payload = await res.json();
        finalImageUrl = payload.url;
        console.log('✅ Image uploaded:', finalImageUrl);
      } catch (err) {
        console.error('❌ Image upload failed:', err);
        alert('Failed to upload image. Please try again.');
        return;
      }
    }

    const updates = {
      title: editLinkData.title.trim(),
      url: editLinkData.url || '',
      image: finalImageUrl,
      keyword: editLinkData.keyword,
      type: editLinkData.type,
      metadata: editLinkData.metadata,
      parentId: editLinkData.parentId || null
    };

    setLinks(links.map(l => l.id === editingLinkId ? { ...l, ...updates } : l));
    setIsEditingLink(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to update links');
        return;
      }

      const res = await fetch(`${API_URL}/${editingLinkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        const error = await res.text();
        console.error('Failed to update link:', error);
        throw new Error(error);
      }

      setEditingLinkId(null);
      showToast('Link updated successfully!');
      // Invalidate dashboard cache after mutation
      cacheManager.invalidate('dashboardData');
    } catch (err) {
      console.error('❌ Update link error:', err);
      alert('Failed to update link: ' + (err instanceof Error ? err.message : 'Unknown error'));
      // Revert optimistic update on error
      const token = localStorage.getItem('token');
      if (token) {
        fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(response => {
            const payload = Array.isArray(response) ? response : response?.data;
            setLinks(Array.isArray(payload) ? payload : []);
          })
          .catch(console.error);
      }
    }
  };

  const handleShareClick = async (link: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title,
          url: link.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(link.url);
      showToast('Link copied to clipboard!');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLinkData({ ...newLinkData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
    <div className="flex-1 flex flex-col min-w-0 app-card app-page overflow-hidden" data-page="links">
      <div className="px-4 pt-4 pb-3 md:px-5 md:pt-5 md:pb-3 lg:px-6 lg:pt-6 lg:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* On mobile/tablet the LinksDesigns top bar already owns the heading,
              so we hide this duplicate. Desktop still renders it. */}
          <div className="min-w-0 hidden xl:block">
            <h1 className="font-bold tracking-tight app-page-main-title mb-0 truncate">Links</h1>
            <p className="text-xs md:text-sm app-page-subtitle mt-1 font-medium">Manage your bio page content</p>
          </div>
          <div className="flex w-full sm:w-auto sm:ml-auto">
            <button
              onClick={addLink}
              className="group flex items-center justify-center gap-2 px-5 py-2.5 md:px-7 md:py-3 lg:px-8 lg:py-3.5 text-sm md:text-base font-semibold w-full sm:w-auto bg-[var(--heading-color)] text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:bg-[var(--button-primary-hover)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 rounded-full"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5] transition-transform group-hover:rotate-90 duration-300" />
              <span className="whitespace-nowrap">Add Link</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-24 lg:pb-0 scrollbar-hide px-4 md:px-5 lg:px-6">
        <div className="relative mb-4 md:mb-6 group">
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-2.5 md:py-2 app-input outline-none transition-all text-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'var(--muted-text)' }} />
        </div>

        {/* Editor Content */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-12 h-12 border-4 border-[var(--border-default)] border-t-[var(--button-primary)] rounded-full animate-spin mb-4"></div>
              <p className="app-body text-sm">Loading your links...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center relative">
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md mx-auto" style={{ background: 'var(--surface-subtle)' }}>
                  <Link2 className="w-10 h-10" style={{ color: 'var(--icon-color)' }} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold app-heading mb-3">Create your first link</h3>
                <p className="app-body text-sm max-w-sm mb-6 font-medium">Start building your link-in-bio page by adding your first link. Share your content, products, or social profiles.</p>
                <button
                  onClick={addLink}
                  className="flex items-center gap-2 app-button-primary px-8 py-3.5 text-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Your First Link</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                modifiers={[
                  ({ transform }) => ({
                    ...transform,
                    x: 0,
                  }),
                ]}
              >
                <SortableContext 
                  items={getTopLevelLinks().map(l => l.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {getTopLevelLinks().filter(link => 
                      link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      link.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (link.keyword || '').toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((link) => (
                      link.type?.toLowerCase() === 'collection' ? (
                        <CollectionItem
                          key={link.id}
                          collection={link}
                          childrenItems={getCollectionChildren(link.id)}
                          isExpanded={expandedCollections.has(link.id)}
                          onToggleExpand={() => toggleCollection(link.id)}
                          onEdit={handleEditClick}
                          onDelete={deleteLink}
                          onToggleActive={toggleLink}
                          onAddLink={(collectionId) => {
                            setNewLinkData({ title: '', url: '', keyword: '', image: '', type: 'Link', metadata: {}, parentId: collectionId });
                            setIsAddingLink(true);
                          }}
                          onShare={handleShareClick}
                          onInlineSave={handleInlineSave}
                          onUpdateLink={updateLink}
                          isDragOver={dragOverCollectionId === link.id}
                          onToggleLayout={toggleLayout}
                        />
                      ) : (
                        <RegularLinkItem
                          key={link.id}
                          link={link}
                          onEdit={handleEditClick}
                          onDelete={deleteLink}
                          onToggleActive={toggleLink}
                          onShare={handleShareClick}
                          onInlineSave={handleInlineSave}
                          onUpdateLink={updateLink}
                          onToggleLayout={toggleLayout}
                        />
                      )
                    ))}
                  </div>
                </SortableContext>
                
                {/* Drag Overlay for smooth preview */}
                <DragOverlay>
                  {activeItemData ? (
                     <div className="opacity-95 shadow-2xl scale-[1.02] cursor-grabbing rounded-2xl pointer-events-none w-full">
                       {activeItemData.type?.toLowerCase() === 'collection' ? (
                          <div className="rounded-2xl p-4 md:p-5 bg-gradient-to-br from-[var(--surface-subtle)] to-[var(--surface-hover)] border-[1.5px] border-[var(--button-primary)] shadow-[0_12px_32px_rgba(38,101,214,0.15)] flex items-center gap-3">
                             <div className="p-1.5 -ml-1 app-muted"><GripVertical className="w-4 h-4" /></div>
                             <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-[var(--button-primary)] shadow-md"><ChevronRight className="w-5 h-5 text-white" /></div>
                             <div className="flex-1 min-w-0">
                                <div className="font-bold text-[16px] md:text-[20px] app-heading p-0 w-full truncate">{activeItemData.title || "Collection name"}</div>
                             </div>
                          </div>
                       ) : (
                          <div className="app-card p-3 md:p-4 flex items-start group border-[1.5px] border-[var(--button-primary)] shadow-[0_12px_32px_rgba(38,101,214,0.15)] bg-[var(--surface-subtle)]">
                             <div className="p-1 -ml-1 app-muted mt-1"><GripVertical className="w-4 h-4" /></div>
                             <div className="flex-1 ml-2 space-y-1.5 md:space-y-3">
                               <div className="flex items-start justify-between">
                                 <div className="flex-1 flex items-center space-x-2.5 md:space-x-4 min-w-0">
                                    {activeItemData.image ? (
                                      <img src={activeItemData.image} alt="" className="w-9 h-9 md:w-11 md:h-11 rounded-lg object-cover shrink-0 border border-[var(--border-default)]" />
                                    ) : (
                                      <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg shrink-0 border border-[var(--border-default)] flex items-center justify-center" style={{ background: 'var(--surface-subtle)' }}>
                                        <i 
                                          className={`${getLinkIconClass(activeItemData.title, activeItemData.url)} text-[16px] md:text-[20px]`} 
                                          style={{ 
                                            color: (() => {
                                              const platform = getPlatformFromLink(activeItemData.title, activeItemData.url);
                                              return platform ? (getBrandColor(platform) || 'var(--icon-color)') : 'var(--icon-color)';
                                            })()
                                          }} 
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <div className="app-inline-title app-heading font-bold text-[13px] sm:text-[14px] md:text-[18px] leading-snug tracking-tight p-0 w-full text-ellipsis overflow-hidden whitespace-nowrap">{activeItemData.title}</div>
                                      <div className="app-inline-body app-muted text-[11px] md:text-[13px] font-medium p-0 w-full text-ellipsis overflow-hidden whitespace-nowrap">{activeItemData.url}</div>
                                    </div>
                                 </div>
                               </div>
                               <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-[var(--border-default)]">
                                 <div className="flex items-center gap-4 sm:gap-4 overflow-x-auto opacity-70">
                                    <div className="flex items-center gap-1.5 p-1 sm:p-0 text-[11px] sm:text-[12px] font-medium app-body"><Edit2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" /><span className="hidden sm:inline">Edit</span></div>
                                    <div className="flex items-center gap-1.5 p-1 sm:p-0 text-[11px] sm:text-[12px] font-medium app-body"><BarChart2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" /><span className="hidden sm:inline">{activeItemData.clicks || 0}</span></div>
                                 </div>
                               </div>
                             </div>
                          </div>
                       )}
                     </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
          </div>
          )}
        </div>
      </div>
    </div>

    {/* Add Link Modal */}
      {isAddingLink && createPortal(
        <>
          <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md" onClick={() => setIsAddingLink(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000 }}></div>
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 pointer-events-none" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10001 }}>
            <div className="relative w-full max-w-[500px] bg-[var(--card-bg)] rounded-[20px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-[var(--border-default)]/60 flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 overflow-hidden pointer-events-auto" style={{ maxHeight: '80vh', zIndex: 10002 }}>
            
            {/* Header */}
            <div className="px-6 py-5 flex items-start justify-between border-b border-[var(--border-default)]/40 bg-[var(--card-bg)] shrink-0 z-10">
              <div>
                <h2 className="text-[20px] font-bold text-[var(--heading-color)] tracking-tight">Create Block</h2>
                <p className="text-[13px] text-[var(--muted-text)] mt-1 font-medium">Add a new destination, collection, or media.</p>
              </div>
              <button onClick={() => setIsAddingLink(false)} className="p-2.5 bg-[var(--surface-subtle)] rounded-full hover:bg-[var(--surface-hover)] text-[var(--icon-color)] hover:text-[var(--heading-color)] transition-all focus:outline-none">
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-5 bg-[var(--page-bg)]/30">
              
              {/* Type Selection - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">
                    <Package className="w-4 h-4 text-[var(--button-primary)]" />
                    Block Type
                  </label>
                  <CustomDropdown
                    value={newLinkData.type}
                    onChange={(value) => setNewLinkData({ ...newLinkData, type: value, metadata: {} })}
                    options={[
                      { value: 'Link', label: 'Standard Link', icon: Globe },
                      { value: 'Collection', label: 'Collection Box', icon: Package },
                      { value: 'button', label: 'Popup Button', icon: Zap },
                      { value: 'video', label: 'YouTube Embed', icon: Youtube },
                    ]}
                  />
                </div>

                {newLinkData.type?.toLowerCase() !== 'collection' && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">
                      <Package className="w-4 h-4 text-[var(--icon-color)]" />
                      Collection
                    </label>
                    {links.filter(l => l.type?.toLowerCase() === 'collection').length > 0 ? (
                      <CustomDropdown
                        value={newLinkData.parentId || 'none'}
                        onChange={(value) => setNewLinkData({ ...newLinkData, parentId: value === 'none' ? null : value })}
                        options={[
                          { value: 'none', label: 'None (Top Level)', icon: Layers },
                          ...links.filter(l => l.type?.toLowerCase() === 'collection').map(c => ({ value: c.id, label: c.title, icon: Package }))
                        ]}
                      />
                    ) : (
                      <div className="text-xs text-[var(--muted-text)] p-3 bg-[var(--surface-subtle)] rounded-lg border border-[var(--border-default)]">
                        No collections available
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Core Inputs - Simplified */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">
                    <Type className="w-4 h-4 text-[var(--button-primary)]" />
                    Title 
                    <span className="inline-flex items-center gap-1 text-red-500">
                      <Asterisk className="w-3 h-3" />
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter block title"
                      value={newLinkData.title}
                      onChange={e => setNewLinkData({ ...newLinkData, title: e.target.value })}
                      className="w-full bg-[var(--card-bg)] border border-[var(--border-default)] rounded-[12px] pl-11 pr-4 py-3 text-[15px] font-medium text-[var(--heading-color)] placeholder-[var(--muted-text)] focus:border-[var(--button-primary)] focus:ring-[3px] focus:ring-[var(--button-primary)]/20 transition-all outline-none"
                    />
                    <Type className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                  </div>
                </div>

                {newLinkData.type === 'button' && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">
                      <Zap className="w-4 h-4 text-[var(--button-primary)]" />
                      Description 
                      <span className="inline-flex items-center gap-1 text-red-500">
                        <Asterisk className="w-3 h-3" />
                      </span>
                    </label>
                    <div className="relative">
                      <textarea 
                        placeholder="Enter popup content details..." 
                        value={newLinkData.metadata?.content || ''} 
                        onChange={e => setNewLinkData({ ...newLinkData, metadata: { ...newLinkData.metadata, content: e.target.value } })} 
                        className="w-full bg-[var(--card-bg)] border border-[var(--border-default)] rounded-[12px] pl-11 pr-4 py-3 text-[15px] font-medium text-[var(--heading-color)] placeholder-[var(--muted-text)] focus:border-[var(--button-primary)] focus:ring-[3px] focus:ring-[var(--button-primary)]/20 transition-all outline-none min-h-[100px] resize-y"
                      ></textarea>
                      <Zap className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--muted-text)]" />
                    </div>
                  </div>
                )}

                {newLinkData.type === 'video' && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">
                      <Youtube className="w-4 h-4 text-[var(--button-primary)]" />
                      Video URL 
                      <span className="inline-flex items-center gap-1 text-red-500">
                        <Asterisk className="w-3 h-3" />
                      </span>
                    </label>
                    <div className="relative">
                      <input 
                        type="url" 
                        placeholder="https://youtube.com/watch?v=..." 
                        value={newLinkData.metadata?.videoUrl || newLinkData.url} 
                        onChange={e => setNewLinkData({ ...newLinkData, url: e.target.value, metadata: { ...newLinkData.metadata, videoUrl: e.target.value } })} 
                        className="w-full bg-[var(--card-bg)] border border-[var(--border-default)] rounded-[12px] pl-11 pr-4 py-3 text-[15px] font-medium text-[var(--heading-color)] placeholder-[var(--muted-text)] focus:border-[var(--button-primary)] focus:ring-[3px] focus:ring-[var(--button-primary)]/20 transition-all outline-none"
                      />
                      <Youtube className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                    </div>
                  </div>
                )}

                {newLinkData.type !== 'button' && newLinkData.type !== 'video' && newLinkData.type !== 'Collection' && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">
                      <Globe className="w-4 h-4 text-[var(--button-primary)]" />
                      Destination URL 
                      <span className="inline-flex items-center gap-1 text-red-500">
                        <Asterisk className="w-3 h-3" />
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={newLinkData.url}
                        onChange={e => setNewLinkData({ ...newLinkData, url: e.target.value })}
                        className="w-full bg-[var(--card-bg)] border border-[var(--border-default)] rounded-[12px] pl-11 pr-4 py-3 text-[15px] font-medium text-[var(--heading-color)] placeholder-[var(--muted-text)] focus:border-[var(--button-primary)] focus:ring-[3px] focus:ring-[var(--button-primary)]/20 transition-all outline-none"
                      />
                      <Globe className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">
                      <Tag className="w-4 h-4 text-[var(--icon-color)]" />
                      Tags (Optional)
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. design, portfolio"
                      value={newLinkData.keyword}
                      onChange={e => setNewLinkData({ ...newLinkData, keyword: e.target.value })}
                      className="w-full bg-[var(--card-bg)] border border-[var(--border-default)] rounded-[12px] pl-11 pr-4 py-3 text-[15px] font-medium text-[var(--heading-color)] placeholder-[var(--muted-text)] focus:border-[var(--button-primary)] focus:ring-[3px] focus:ring-[var(--button-primary)]/20 transition-all outline-none"
                    />
                    <Tag className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                  </div>
                </div>

              </div>

              {/* Thumbnail - Collapsed by default */}
              <details className="space-y-3 group">
                <summary className="flex items-center gap-2 text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide cursor-pointer list-none">
                  <ImageIcon className="w-4 h-4 text-[var(--icon-color)]" />
                  Thumbnail Image (Optional)
                  <ChevronDown className="w-4 h-4 text-[var(--muted-text)] transition-transform group-open:rotate-180" />
                </summary>
                <div className="pt-2">
                  {!newLinkData.image ? (
                    <label className="flex flex-col items-center justify-center p-8 rounded-[20px] border-2 border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] hover:border-[var(--button-primary)] cursor-pointer transition-all group">
                      <div className="w-12 h-12 rounded-full bg-[var(--card-bg)] shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-5 h-5 text-[var(--icon-color)] group-hover:text-[var(--button-primary)] transition-colors" />
                      </div>
                      <p className="text-[15px] font-semibold text-[var(--heading-color)]">Click to browse</p>
                      <p className="text-[13px] text-[var(--muted-text)] mt-1">Recommended size: 100x100 (Max 5MB)</p>
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/gif, image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative w-full rounded-[20px] border border-[var(--border-default)] overflow-hidden bg-[var(--surface-subtle)] p-2 group">
                      <div className="relative w-full h-40 rounded-[16px] overflow-hidden bg-[var(--page-bg)]">
                        <img 
                          src={newLinkData.image} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                          <label className="cursor-pointer px-4 py-2.5 bg-white text-black text-sm font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                            <Edit2 className="w-4 h-4" /> Change
                            <input
                              type="file"
                              accept="image/jpeg, image/png, image/gif, image/webp"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setNewLinkData({ ...newLinkData, image: '' })}
                            className="px-4 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </details>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--border-default)]/40 bg-[var(--card-bg)] shrink-0 flex items-center justify-end gap-3 z-10">
              <button
                onClick={() => setIsAddingLink(false)}
                className="px-6 py-3 text-[14px] font-bold text-[var(--heading-color)] bg-transparent hover:bg-[var(--surface-subtle)] rounded-xl transition-colors focus:outline-none"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLinkSubmit}
                className="px-8 py-3 text-[14px] font-bold text-[var(--button-primary-text)] bg-[var(--button-primary)] rounded-xl hover:opacity-90 hover:scale-[0.98] transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-[var(--button-primary)]/30 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Block
              </button>
            </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Edit Link Modal */}
      {isEditingLink && createPortal(
        <>
          <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md" onClick={() => setIsEditingLink(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000 }}></div>
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 pointer-events-none" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10001 }}>
            <div className="relative w-full max-w-[540px] bg-[var(--card-bg)] rounded-[24px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-[var(--border-default)]/60 flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 overflow-hidden pointer-events-auto" style={{ zIndex: 10002 }}>
            
            {/* Header */}
            <div className="px-8 py-6 flex items-start justify-between border-b border-[var(--border-default)]/40 bg-[var(--card-bg)] shrink-0 z-10">
              <div>
                <h2 className="text-[22px] font-bold text-[var(--heading-color)] tracking-tight">Edit Block</h2>
                <p className="text-[14px] text-[var(--muted-text)] mt-1.5 font-medium">Modify your existing destination, collection, or media.</p>
              </div>
              <button onClick={() => setIsEditingLink(false)} className="p-2.5 bg-[var(--surface-subtle)] rounded-full hover:bg-[var(--surface-hover)] text-[var(--icon-color)] hover:text-[var(--heading-color)] transition-all focus:outline-none">
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-7 space-y-7 bg-[var(--page-bg)]/30">
              
              {/* Type Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">Block Type</label>
                  <CustomDropdown
                    value={editLinkData.type}
                    onChange={(value) => setEditLinkData({ ...editLinkData, type: value, metadata: {} })}
                    options={[
                      { value: 'Link', label: 'Standard Link', icon: Globe },
                      { value: 'Collection', label: 'Collection Box', icon: Package },
                      { value: 'button', label: 'Popup Button', icon: Zap },
                      { value: 'video', label: 'YouTube Embed', icon: Youtube },
                    ]}
                  />
                </div>

                {editLinkData.type?.toLowerCase() !== 'collection' && links.filter(l => l.type?.toLowerCase() === 'collection' && l.id !== editingLinkId).length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">Add to Collection (Optional)</label>
                    <CustomDropdown
                      value={editLinkData.parentId || 'none'}
                      onChange={(value) => setEditLinkData({ ...editLinkData, parentId: value === 'none' ? null : value })}
                      options={[
                        { value: 'none', label: 'None (Top Level)', icon: Layers },
                        ...links.filter(l => l.type?.toLowerCase() === 'collection' && l.id !== editingLinkId).map(c => ({ value: c.id, label: c.title, icon: Package }))
                      ]}
                    />
                  </div>
                )}
              </div>

              {/* Core Inputs */}
              <div className="space-y-5 bg-[var(--card-bg)] p-6 rounded-[20px] border border-[var(--border-default)]/60 shadow-sm">
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter block title"
                    value={editLinkData.title}
                    onChange={e => setEditLinkData({ ...editLinkData, title: e.target.value })}
                    className="w-full bg-[var(--page-bg)] border border-[var(--border-default)] rounded-[12px] px-4 py-3 text-[15px] font-medium text-[var(--heading-color)] placeholder-[var(--muted-text)] focus:border-[var(--button-primary)] focus:ring-[3px] focus:ring-[var(--button-primary)]/20 transition-all outline-none"
                  />
                </div>

                {editLinkData.type === 'button' && (
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">Description <span className="text-red-500">*</span></label>
                    <textarea 
                      placeholder="Enter popup content details..." 
                      value={editLinkData.metadata?.content || ''} 
                      onChange={e => setEditLinkData({ ...editLinkData, metadata: { ...editLinkData.metadata, content: e.target.value } })} 
                      className="w-full bg-[var(--page-bg)] border border-[var(--border-default)] rounded-[12px] px-4 py-3 text-[15px] font-medium text-[var(--heading-color)] placeholder-[var(--muted-text)] focus:border-[var(--button-primary)] focus:ring-[3px] focus:ring-[var(--button-primary)]/20 transition-all outline-none min-h-[100px] resize-y"
                    ></textarea>
                  </div>
                )}

                {editLinkData.type === 'video' && (
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">Video URL <span className="text-red-500">*</span></label>
                    <input 
                      type="url" 
                      placeholder="https://youtube.com/watch?v=..." 
                      value={editLinkData.metadata?.videoUrl || editLinkData.url} 
                      onChange={e => setEditLinkData({ ...editLinkData, url: e.target.value, metadata: { ...editLinkData.metadata, videoUrl: e.target.value } })} 
                      className="w-full bg-[var(--page-bg)] border border-[var(--border-default)] rounded-[12px] px-4 py-3 text-[15px] font-medium text-[var(--heading-color)] placeholder-[var(--muted-text)] focus:border-[var(--button-primary)] focus:ring-[3px] focus:ring-[var(--button-primary)]/20 transition-all outline-none"
                    />
                  </div>
                )}

                {editLinkData.type !== 'button' && editLinkData.type !== 'video' && editLinkData.type !== 'Collection' && (
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">Destination URL <span className="text-red-500">*</span></label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={editLinkData.url}
                      onChange={e => setEditLinkData({ ...editLinkData, url: e.target.value })}
                      className="w-full bg-[var(--page-bg)] border border-[var(--border-default)] rounded-[12px] px-4 py-3 text-[15px] font-medium text-[var(--heading-color)] placeholder-[var(--muted-text)] focus:border-[var(--button-primary)] focus:ring-[3px] focus:ring-[var(--button-primary)]/20 transition-all outline-none"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">Tags (Optional)</label>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. design, portfolio"
                    value={editLinkData.keyword}
                    onChange={e => setEditLinkData({ ...editLinkData, keyword: e.target.value })}
                    className="w-full bg-[var(--page-bg)] border border-[var(--border-default)] rounded-[12px] px-4 py-3 text-[15px] font-medium text-[var(--heading-color)] placeholder-[var(--muted-text)] focus:border-[var(--button-primary)] focus:ring-[3px] focus:ring-[var(--button-primary)]/20 transition-all outline-none"
                  />
                </div>


              </div>

              {/* Thumbnail */}
              <div className="space-y-3">
                <label className="block text-[13px] font-bold text-[var(--heading-color)] uppercase tracking-wide">Thumbnail Image</label>
                {!editLinkData.image ? (
                  <label className="flex flex-col items-center justify-center p-8 rounded-[20px] border-2 border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] hover:border-[var(--button-primary)] cursor-pointer transition-all group">
                    <div className="w-12 h-12 rounded-full bg-[var(--card-bg)] shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5 h-5 text-[var(--icon-color)] group-hover:text-[var(--button-primary)] transition-colors" />
                    </div>
                    <p className="text-[15px] font-semibold text-[var(--heading-color)]">Click to browse</p>
                    <p className="text-[13px] text-[var(--muted-text)] mt-1">Recommended size: 100x100 (Max 5MB)</p>
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/gif, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert("File size exceeds 5MB limit.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditLinkData({ ...editLinkData, image: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative w-full rounded-[20px] border border-[var(--border-default)] overflow-hidden bg-[var(--surface-subtle)] p-2 group">
                    <div className="relative w-full h-40 rounded-[16px] overflow-hidden bg-[var(--page-bg)]">
                      <img 
                        src={editLinkData.image} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                        <label className="cursor-pointer px-4 py-2.5 bg-white text-black text-sm font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                          <Edit2 className="w-4 h-4" /> Change
                          <input
                            type="file"
                            accept="image/jpeg, image/png, image/gif, image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  alert("File size exceeds 5MB limit.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setEditLinkData({ ...editLinkData, image: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditLinkData({ ...editLinkData, image: '' })}
                          className="px-4 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-[var(--border-default)]/40 bg-[var(--card-bg)] shrink-0 flex items-center justify-end gap-3 z-10">
              <button
                onClick={() => setIsEditingLink(false)}
                className="px-6 py-3 text-[14px] font-bold text-[var(--heading-color)] bg-transparent hover:bg-[var(--surface-subtle)] rounded-xl transition-colors focus:outline-none"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleEditLinkSubmit}
                className="px-8 py-3 text-[14px] font-bold text-[var(--button-primary-text)] bg-[var(--button-primary)] rounded-xl hover:opacity-90 hover:scale-[0.98] transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-[var(--button-primary)]/30cus:ring-[var(--button-primary)]/30"
              >
                Save Changes
              </button>
            </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Share Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--card-bg)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[var(--border-default)] rounded-full px-5 py-3 text-[13px] font-semibold text-[var(--heading-color)] z-50 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <div className="w-6 h-6 bg-[var(--accent-soft)] rounded-full flex items-center justify-center text-[var(--accent)]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {toastMessage}
        </div>
      )}
    </>
  );
}

function ExternalLink(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}
