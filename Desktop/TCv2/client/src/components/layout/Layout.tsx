
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  CreditCard,
  Settings,
  Menu,
  ChevronRight,
  Palette,
  LogOut,
  User,
  UploadCloud,
  Trash2,
  Sparkles,
  TrendingUp,
  DollarSign,
  Zap,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import ImageCropperModal from './ImageCropperModal';
import { API_BASE } from '../../config/env';
import { optimizeAvatar } from '../../lib/imageOptimizer';
import { sessionManager } from '../../lib/sessionManager';

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface NavSection {
  label?: string;
  collapsible?: boolean;
  labelIcon?: LucideIcon;
  items: NavItem[];
}

// Function to generate nav sections based on monetization approval status
const getNavSections = (monetizationApproved: boolean): NavSection[] => [
  {
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Links & Designs',
    labelIcon: Layers,
    collapsible: true,
    items: [
      { name: 'Links', path: '/links', icon: Link2 },
      { name: 'Appearance', path: '/links/appearance', icon: Palette },
    ],
  },
  // Monetization section changes based on approval status
  ...(monetizationApproved
    ? [
      {
        label: 'Monetization',
        labelIcon: DollarSign,
        collapsible: true,
        items: [
          { name: 'Campaigns', path: '/monetization/campaigns', icon: TrendingUp },
          { name: 'Payouts', path: '/monetization/payouts', icon: CreditCard },
        ],
      },
    ]
    : [
      {
        items: [
          { name: 'Monetization', path: '/monetization', icon: DollarSign },
        ],
      },
    ]),
  {
    items: [
      { name: 'Insights', path: '/analytics', icon: BarChart3 },
      { name: 'Auto DM', path: '/automation', icon: Zap },
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

function SidebarNav({
  location,
  onNavigate,
  hideHelpSupport,
  monetizationApproved,
}: {
  location: ReturnType<typeof useLocation>;
  onNavigate?: () => void;
  hideHelpSupport?: boolean;
  monetizationApproved?: boolean;
}) {
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const NAV_SECTIONS = getNavSections(monetizationApproved || false);

  const toggleSection = (label: string, fallbackOpen: boolean) => {
    setSectionOpen((prev) => ({
      ...prev,
      [label]: !(prev[label] ?? fallbackOpen),
    }));
  };

  const handleSectionLabelClick = (section: NavSection, sectionItems: NavItem[]) => {
    if (!section.label) {
      return;
    }

    // Navigate to the first item in the section
    if (sectionItems.length > 0) {
      navigate(sectionItems[0].path);
      if (onNavigate) {
        onNavigate(); // Close mobile menu if open
      }
    }
  };

  const handleChevronClick = (e: React.MouseEvent, section: NavSection, sectionItems: NavItem[]) => {
    e.stopPropagation(); // Prevent the parent button click

    if (!section.label) {
      return;
    }

    // Only toggle the section open/closed state, don't navigate
    const hasActiveItem = sectionItems.some((item) =>
      location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
    );
    const currentlyOpen = sectionOpen[section.label] ?? hasActiveItem;

    setSectionOpen((prev) => ({ ...prev, [section.label]: !currentlyOpen }));
  };

  return (
    <>
      {NAV_SECTIONS.map((section, si) => {
        const sectionItems = hideHelpSupport ? section.items.filter((item) => item.path !== '/help') : section.items;
        if (sectionItems.length === 0) return null;

        const hasActiveItem = sectionItems.some((item) =>
          location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
        );
        const isOpen = section.label ? (sectionOpen[section.label] ?? hasActiveItem) : true;
        return (
          <div key={si}>
            {section.label && (
              <button
                type="button"
                onClick={() => handleSectionLabelClick(section, sectionItems)}
                className="app-sidebar-section-trigger flex w-full items-center gap-3 px-3 py-2.5 text-left mb-1"
              >
                {section.labelIcon && <section.labelIcon className="w-[18px] h-[18px] shrink-0 app-sidebar-link-icon" />}
                <span className="text-[14.5px] font-medium tracking-[-0.01em] app-sidebar-section-label flex-1">
                  {section.label}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleChevronClick(e, section, sectionItems)}
                  className="shrink-0 p-1 -m-1 rounded hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className={`w-[18px] h-[18px] app-sidebar-chevron transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                </button>
              </button>
            )}
            {isOpen && (
              <div className={`space-y-1 ${section.label ? 'app-sidebar-children' : ''}`}>
                {sectionItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 w-full group app-sidebar-link mb-1 ${isActive
                        ? 'app-sidebar-link-active'
                        : ''
                        }`}
                    >
                      <Icon className="w-[19px] h-[19px] shrink-0 transition-colors app-sidebar-link-icon" />
                      <span className="text-[14.5px] font-medium tracking-[-0.01em]">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string, username: string, avatar: string } | null>(null);
  const [monetizationApproved, setMonetizationApproved] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mainEl = mainContentRef.current;
    if (!mainEl) return;

    const handleScroll = () => {
      // Set scrolled state if user scrolls more than 10px
      setIsScrolled(mainEl.scrollTop > 10);
    };

    mainEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainEl.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Fetch the sidebar profile ONCE on mount and whenever a child page
    // dispatches `profileUpdated`. Previously this effect ran on every
    // location change, which produced a wasted `/api/user` request on every
    // navigation and made the sidebar feel reactive-but-slow.
    const fetchProfile = () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      fetch(`${API_BASE}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (res.status === 401 || res.status === 403) {
            sessionManager.clearSession();
            window.location.href = '/login';
            throw new Error('Unauthorized');
          }
          return res.json();
        })
        .then(data => {
          const userData = data.data || data;
          setUserProfile({
            name: userData.profile?.name || userData.username,
            username: userData.username,
            avatar: userData.profile?.avatar || '',
          });
          const approved = true; // Temporarily force to true to test APPROVED scenario
          setMonetizationApproved(approved);
        })
        .catch(console.error);
    };

    fetchProfile();

    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, []);

  // Reset the main scroll position on every route change so pages always
  // open at the top rather than retaining the previous page's offset.
  useEffect(() => {
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileProfileMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (mobileProfileMenuRef.current && !mobileProfileMenuRef.current.contains(target)) {
        setIsMobileProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileProfileMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileProfileMenuOpen]);

  useEffect(() => {
    setIsMobileProfileMenuOpen(false);
  }, [location.pathname]);

  const profileUrl = userProfile ? `thecrumb.co/${userProfile.username}` : 'thecrumb.co/...';

  const handleCopy = () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const urlToCopy = isLocal ? `${window.location.origin}/${userProfile?.username || ''}` : `https://${profileUrl}`;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSidebarAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile: File) => {
    setCropImageUrl(null);
    const token = localStorage.getItem('token');
    if (!token) return;

    const formDataUpload = new FormData();
    formDataUpload.append('media', croppedFile);

    fetch(`${API_BASE}/api/user/appearance-media-file`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formDataUpload,
    })
      .then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      })
      .then(payload => {
        fetch(`${API_BASE}/api/user`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ profile: { avatar: payload.url } })
        }).then(res => {
          if (res.ok) window.dispatchEvent(new Event('profileUpdated'));
        });
      })
      .catch(console.error);
  };

  const handleSidebarAvatarDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_BASE}/api/user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ profile: { avatar: '' } })
    }).then(res => {
      if (res.ok) window.dispatchEvent(new Event('profileUpdated'));
    });
  };

  return (
    <div className="flex h-screen app-shell">
      {/* Sidebar (Desktop Only - Fixed) */}
      <aside className={`hidden lg:flex flex-col w-[240px] app-sidebar-shell fixed left-0 top-0 bottom-0 z-30 transition-all duration-300`}>
        <div className="p-6 pb-4 flex items-center justify-center">
          <span className="text-[22px] font-bold tracking-tight app-sidebar-brand" style={{ fontFamily: "'Playfair Display', serif" }}>The Crumb</span>
        </div>

        <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide">
          <SidebarNav location={location} monetizationApproved={monetizationApproved} />
        </nav>

        <div className="p-4 app-sidebar-divider mx-3 mb-3">
          <div className="flex items-center space-x-3">
            <div className="relative group w-10 h-10 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="w-full h-full rounded-full border border-[var(--sidebar-divider)] overflow-hidden bg-[var(--surface-hover)] flex items-center justify-center text-[var(--muted-text)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                title="View My Profile"
              >
                {userProfile?.avatar ? (
                  <img
                    src={optimizeAvatar(userProfile.avatar)}
                    alt="Profile"
                    loading="lazy"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>
              <label
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white z-10"
                title="Upload profile picture"
                onClick={(e) => e.stopPropagation()}
              >
                <UploadCloud className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleSidebarAvatarUpload} />
              </label>
              {userProfile?.avatar && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSidebarAvatarDelete(e);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                  title="Delete profile picture"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="text-sm font-medium truncate app-sidebar-profile-name text-left hover:text-[var(--accent)] transition-colors"
                title="View My Profile"
              >
                {userProfile?.name || 'Loading...'}
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionManager.clearSession();
                  window.location.href = '/login';
                }}
                className="mt-1 inline-flex items-center gap-1.5 text-xs app-sidebar-profile-handle hover:text-[var(--sidebar-text)] transition-colors w-fit"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Responsive margin */}
      <div ref={mainContentRef} className="flex-1 overflow-y-auto scrollbar-hide app-main lg:ml-[240px]">

        <header className={`lg:hidden sticky top-0 h-14 app-header backdrop-blur-xl flex items-center justify-between px-4 z-30 transition-shadow duration-200 relative ${isScrolled ? 'shadow-sm' : ''}`}>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-xl transition-all duration-200 active:scale-95 hover:bg-[var(--surface-subtle)]"
            style={{ color: 'var(--heading-color)' }}
            aria-label="Open menu"
          >
            {/* Refined three-line glyph — the middle line is shorter for an editorial
                "asymmetric" feel that pairs with the Playfair wordmark. */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="14" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>

          <span
            className="absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-tight app-page-title pointer-events-none select-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            The Crumb
          </span>

          <div ref={mobileProfileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMobileProfileMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={isMobileProfileMenuOpen}
              aria-label="Open profile menu"
              className="w-11 h-11 rounded-full overflow-hidden border-2 flex items-center justify-center bg-[var(--card-bg)] shadow-sm"
              style={{ borderColor: 'var(--heading-color)' }}
            >
              {userProfile?.avatar ? (
                <img
                  src={optimizeAvatar(userProfile.avatar)}
                  alt="Profile"
                  loading="lazy"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-6 h-6 text-[var(--muted-text)]" />
              )}
            </button>

            <AnimatePresence>
              {isMobileProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl p-2 z-50"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)' }}
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      navigate('/profile');
                      setIsMobileProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold app-heading hover:bg-[var(--surface-subtle)] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      navigate('/help');
                      setIsMobileProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold app-heading hover:bg-[var(--surface-subtle)] transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help &amp; Support
                  </button>

                  <div className="my-1.5 h-px" style={{ background: 'var(--border-default)' }} />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      sessionManager.clearSession();
                      window.location.href = '/login';
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                    style={{ color: 'var(--error-600)' }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>



        {/* Page Content
            Note: we deliberately do NOT key by pathname here. Forcing a
            framer-motion remount on every navigation triggered a fade plus
            re-mount of the destination page (and all of its data fetches),
            which made navigation feel laggy. The fade is now CSS-only inside
            the Outlet, which is cheaper and feels instant. */}
        <main className="app-main-content p-3 sm:px-5 md:px-6 lg:px-5 lg:py-4 pb-20 lg:pb-4 relative z-0">
          <div className="h-full max-w-full mx-auto w-full app-route-fade">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile/Tablet Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[300px] app-sidebar-shell z-50 flex flex-col lg:hidden shadow-2xl app-sidebar-mobile"
            >
              <div className="px-6 pt-7 pb-5 flex items-center justify-between">
                <span
                  className="text-[24px] font-bold tracking-tight app-sidebar-brand"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  The Crumb
                </span>
              </div>

              {/* User identity row — makes the drawer feel like a real navigation
                  surface instead of a bare menu. */}
              {userProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="mx-4 mb-4 flex items-center gap-3 p-3 rounded-2xl text-left transition-colors hover:bg-white/5"
                  style={{ border: '1px solid var(--sidebar-divider)' }}
                >
                  <div
                    className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                    style={{ background: 'var(--surface-hover)', border: '1px solid var(--sidebar-divider)' }}
                  >
                    {userProfile.avatar ? (
                      <img
                        src={optimizeAvatar(userProfile.avatar)}
                        alt="Profile"
                        loading="lazy"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-5 h-5 app-sidebar-link-icon" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold app-sidebar-profile-name truncate">{userProfile.name}</p>
                    <p className="text-[12px] app-sidebar-profile-handle truncate">@{userProfile.username}</p>
                  </div>
                </button>
              )}

              <nav className="flex-1 px-4 py-2 overflow-y-auto scrollbar-hide">
                <SidebarNav
                  location={location}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                  hideHelpSupport
                  monetizationApproved={monetizationApproved}
                />
              </nav>

              <div className="px-4 py-4 app-sidebar-divider">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/help');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl app-sidebar-link transition-all"
                >
                  <HelpCircle className="w-[18px] h-[18px] app-sidebar-link-icon" />
                  <span className="text-[14.5px] font-medium tracking-[-0.01em]">Help &amp; Support</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sessionManager.clearSession();
                    window.location.href = '/login';
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mt-1 app-sidebar-link transition-all"
                  style={{ color: 'var(--error-600)' }}
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  <span className="text-[14.5px] font-medium tracking-[-0.01em]">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {cropImageUrl && (
        <ImageCropperModal
          imageUrl={cropImageUrl}
          onCrop={handleCropComplete}
          onCancel={() => setCropImageUrl(null)}
        />
      )}
    </div>
  );
}
