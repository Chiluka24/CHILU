import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, UploadCloud, Check, Sparkles } from 'lucide-react';
import { optimizeAvatar } from '../../lib/imageOptimizer';

// ═══════════════════════════════════════════════════════════════
// Professional Avatar Presets — DiceBear Notionists Collection
// Each avatar is explicitly customized for maximum visual variety:
//   • Different body types, hairstyles, glasses, gestures
//   • Alternating flip direction so they don't all face one way
// ═══════════════════════════════════════════════════════════════

const AVATAR_PRESETS = [
  // Masculine
  {
    id: 'avatar-1',
    label: 'Photographer',
    url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Adrian&backgroundColor=transparent&flip=false',
    bgColor: '#EEF2FF',
    accentRing: '#6366F1',
  },
  {
    id: 'avatar-2',
    label: 'Designer',
    url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Mia&backgroundColor=transparent&flip=true',
    bgColor: '#FDF2F8',
    accentRing: '#DB2777',
  },
  {
    id: 'avatar-3',
    label: 'Writer',
    url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sophia&backgroundColor=transparent&flip=false',
    bgColor: '#ECFDF5',
    accentRing: '#059669',
  },
  // Masculine
  {
    id: 'avatar-4',
    label: 'Developer',
    url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=transparent&flip=true',
    bgColor: '#F1F5F9',
    accentRing: '#475569',
  },
  {
    id: 'avatar-5',
    label: 'Musician',
    url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Leo&backgroundColor=transparent&flip=false',
    bgColor: '#FFF7ED',
    accentRing: '#EA580C',
  },
  // Feminine
  {
    id: 'avatar-6',
    label: 'Filmmaker',
    url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Destiny&backgroundColor=transparent&flip=true',
    bgColor: '#EFF6FF',
    accentRing: '#2563EB',
  },
];

// URL is now pre-built per avatar — no generator function needed

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onSelectAvatar: (avatarUrl: string) => void;
  onUploadClick: () => void;
}

export default function ProfilePictureModal({
  isOpen,
  onClose,
  currentAvatar,
  onSelectAvatar,
  onUploadClick,
}: ProfilePictureModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [loadedAvatars, setLoadedAvatars] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Dispatch modal state change for sidebar blur effect
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modalStateChange', { detail: { isOpen: true } }));
      setSelectedPreset(null);
    }
    return () => {
      if (isOpen) {
        window.dispatchEvent(new CustomEvent('modalStateChange', { detail: { isOpen: false } }));
      }
    };
  }, [isOpen]);

  // Mark avatar images as loaded for smooth fade-in
  const handleAvatarLoad = (id: string) => {
    setLoadedAvatars(prev => new Set(prev).add(id));
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirmPreset = () => {
    if (selectedPreset) {
      const preset = AVATAR_PRESETS.find(a => a.id === selectedPreset);
      if (preset) {
        onSelectAvatar(preset.url);
        onClose();
      }
    }
  };

  const previewAvatar = selectedPreset ? AVATAR_PRESETS.find(a => a.id === selectedPreset)?.url : currentAvatar;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-[480px] rounded-[24px] border bg-white flex flex-col shadow-2xl overflow-hidden"
        style={{
          maxHeight: '85vh',
          borderColor: 'var(--border-default)',
          background: 'var(--card-bg)',
          animation: 'profilePicModalIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)' }}
            >
              <Sparkles className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold" style={{ color: 'var(--heading-color)', letterSpacing: '-0.02em' }}>
                Profile Picture
              </h3>
              <p className="text-[12px] font-medium mt-0.5" style={{ color: 'var(--muted-text)' }}>
                Upload a photo or choose an avatar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-all"
            style={{ background: 'var(--surface-subtle)', color: 'var(--icon-color)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--heading-color)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-subtle)'; e.currentTarget.style.color = 'var(--icon-color)'; }}
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* ─── Body ─── */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ background: 'var(--page-bg)' }}>

          {/* Upload Section */}
          <div
            className="relative group cursor-pointer rounded-2xl border-2 border-dashed p-6 mb-6 transition-all"
            style={{
              borderColor: 'var(--border-default)',
              background: 'var(--card-bg)',
            }}
            onClick={() => { onUploadClick(); onClose(); }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.background = 'var(--accent-soft)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.background = 'var(--card-bg)';
            }}
          >
            <div className="flex flex-col items-center gap-3">
              {/* Current avatar preview or upload icon */}
              <div className="relative">
                {previewAvatar ? (
                  <div className="relative">
                    <img
                      src={optimizeAvatar(previewAvatar)}
                      alt="Current avatar"
                      loading="lazy"
                      className="w-20 h-20 rounded-full object-cover border-2 shadow-md"
                      style={{ borderColor: 'var(--border-default)' }}
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all"
                    style={{
                      borderColor: 'var(--border-default)',
                      background: 'linear-gradient(135deg, var(--surface-subtle) 0%, var(--surface-hover) 100%)',
                    }}
                  >
                    <Camera className="w-8 h-8 transition-colors" style={{ color: 'var(--muted-text)' }} />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold" style={{ color: 'var(--heading-color)' }}>
                  <UploadCloud className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                  Upload Photo
                </p>
                <p className="text-[12px] mt-1" style={{ color: 'var(--muted-text)' }}>
                  JPG, PNG or GIF • Max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Divider with "or" */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-[1px]" style={{ background: 'var(--border-default)' }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--muted-text)' }}>
              or choose an avatar
            </span>
            <div className="flex-1 h-[1px]" style={{ background: 'var(--border-default)' }} />
          </div>

          {/* Avatar Grid */}
          <div className="grid grid-cols-3 gap-4">
            {AVATAR_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              const isHovered = hoveredId === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  onMouseEnter={() => setHoveredId(preset.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="relative flex flex-col items-center gap-1.5 group outline-none"
                  title={preset.label}
                >
                  {/* Avatar Container */}
                  <div
                    className="relative w-16 h-16 rounded-full transition-all duration-200"
                    style={{
                      background: preset.bgColor,
                      boxShadow: isSelected
                        ? `0 0 0 3px var(--card-bg), 0 0 0 5px ${preset.accentRing}`
                        : isHovered
                          ? `0 0 0 3px var(--card-bg), 0 0 0 5px ${preset.accentRing}40`
                          : '0 2px 8px rgba(0,0,0,0.06)',
                      transform: isSelected ? 'scale(1.08)' : isHovered ? 'scale(1.04)' : 'scale(1)',
                    }}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full rounded-full p-1 transition-opacity duration-300"
                      style={{
                        opacity: loadedAvatars.has(preset.id) ? 1 : 0,
                      }}
                      onLoad={() => handleAvatarLoad(preset.id)}
                      loading="lazy"
                    />

                    {/* Loading shimmer */}
                    {!loadedAvatars.has(preset.id) && (
                      <div
                        className="absolute inset-0 rounded-full animate-pulse"
                        style={{ background: preset.bgColor }}
                      />
                    )}

                    {/* Selected checkmark */}
                    {isSelected && (
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2"
                        style={{
                          background: preset.accentRing,
                          borderColor: 'var(--card-bg)',
                        }}
                      >
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Label removed per request */}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="px-6 py-4 border-t flex items-center gap-3" style={{ borderColor: 'var(--border-default)', background: 'var(--card-bg)' }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-[14px] font-semibold rounded-xl transition-all"
            style={{
              color: 'var(--heading-color)',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border-default)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-subtle)'; }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmPreset}
            disabled={!selectedPreset}
            className="flex-1 py-2.5 text-[14px] font-semibold rounded-xl transition-all text-white disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: selectedPreset
                ? `linear-gradient(135deg, ${AVATAR_PRESETS.find(a => a.id === selectedPreset)?.accentRing || 'var(--accent)'} 0%, var(--accent-hover) 100%)`
                : 'var(--button-primary)',
            }}
          >
            <Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            Apply Avatar
          </button>
        </div>
      </div>

      {/* Modal entrance animation */}
      <style>{`
        @keyframes profilePicModalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
