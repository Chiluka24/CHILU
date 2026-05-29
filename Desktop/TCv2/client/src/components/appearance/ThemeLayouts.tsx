import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { User, Search, X } from 'lucide-react';
import { getLinkIconClass, getPlatformFromLink } from '../../lib/icons';
import { getBrandColor, getAdaptiveBrandColor } from '../../lib/brandColors';
import { optimizeAvatar } from '../../lib/imageOptimizer';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  image?: string;
  keyword?: string;
  isActive: boolean;
}

interface ThemeLayoutProps {
  theme: number | 'custom' | 'customMedia';
  profile: { name: string; bio: string; avatar: string };
  links: LinkItem[];
  colors: any;
  searchQuery: string;
  onSearchChange?: (query: string) => void;
  onLinkClick?: (linkId: string) => void;
  socialIcons?: { platform: string; url: string }[];
  profileImageLayout?: 'classic' | 'square';
  hasMediaBg?: boolean;
  isPremiumTheme?: boolean;
}

// Theme 3: Cosmic Vision Layout - Futuristic glassmorphism with parallax
export function CosmicVisionLayout({ profile, links, colors, searchQuery, onSearchChange, onLinkClick, socialIcons, hasMediaBg }: ThemeLayoutProps) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const item: Variants = {
    hidden: { y: 40, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="flex flex-col h-full relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Glassmorphism Header with parallax */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          x: mousePosition.x * 0.5,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center pt-8 pb-6 px-6"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0 0 32px 32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Neon glow effect on avatar */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="inline-block relative"
        >
          {profile.avatar ? (
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-3xl blur-xl"
                animate={{
                  background: [
                    'linear-gradient(45deg, #06B6D4, #0EA5E9)',
                    'linear-gradient(45deg, #0EA5E9, #3B82F6)',
                    'linear-gradient(45deg, #3B82F6, #06B6D4)',
                    'linear-gradient(45deg, #06B6D4, #0EA5E9)',
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ opacity: 0.6 }}
              />
              <img 
                src={optimizeAvatar(profile.avatar)} 
                alt={profile.name} 
                loading="lazy"
                className="relative w-24 h-24 rounded-3xl mx-auto mb-4 object-cover" 
                style={{ 
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 0 40px rgba(6, 182, 212, 0.5)'
                }} 
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-3xl mx-auto mb-4 flex items-center justify-center relative"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 0 40px rgba(6, 182, 212, 0.5)'
              }}
            >
              <User size={40} style={{ color: '#06B6D4' }} />
            </div>
          )}
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-2"
          style={{ 
            color: '#FFFFFF',
            textShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
          }}
        >
          {profile.name}
        </motion.h1>
        {profile.bio && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm"
            style={{ color: '#A5F3FC' }}
          >
            {profile.bio}
          </motion.p>
        )}
      </motion.div>

      {/* Glassmorphism Search with neon glow */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-6 mt-4 mb-4"
      >
        <div className="relative group">
          <motion.div
            className="absolute inset-0 rounded-2xl blur-md"
            animate={{
              background: [
                'linear-gradient(90deg, rgba(6, 182, 212, 0.3), rgba(14, 165, 233, 0.3))',
                'linear-gradient(90deg, rgba(14, 165, 233, 0.3), rgba(59, 130, 246, 0.3))',
                'linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(6, 182, 212, 0.3))',
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ opacity: 0 }}
            whileHover={{ opacity: 0.5 }}
          />
          <input
            type="text"
            placeholder="Search in the cosmos..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="relative w-full px-4 py-3 rounded-2xl text-sm transition-all"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              outline: 'none'
            }}
          />
          <Search 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" 
            style={{ color: '#06B6D4' }} 
          />
        </div>
      </motion.div>

      {/* Glassmorphism Cards with parallax and neon glow */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 px-6 pb-6 overflow-y-auto"
      >
        {links.filter(l => l.isActive).map((link, index) => {
          if (link.type === 'collection') {
            return (
              <motion.div key={link.id} className="w-full text-center py-4 mb-2 mt-4" style={{ gridColumn: '1 / -1' }}>
                <h3 className="text-xl font-bold tracking-widest uppercase" style={{ color: colors.primaryText, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{link.title}</h3>
              </motion.div>
            );
          }
          return (
          <motion.a
            key={link.id}
            href={link.url}
            variants={item}
            whileHover={{ 
              scale: 1.02,
              y: -5,
            }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => { e.preventDefault(); onLinkClick?.(link.id); }}
            className="block mb-3 p-5 rounded-2xl relative overflow-hidden group"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transform: `translate(${mousePosition.x * (index % 2 === 0 ? 0.02 : -0.02)}px, ${mousePosition.y * 0.02}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            {/* Neon glow on hover */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(14, 165, 233, 0.2))',
                filter: 'blur(20px)',
              }}
            />
            
            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
              animate={{
                background: [
                  'linear-gradient(0deg, transparent, rgba(6, 182, 212, 0.5), transparent)',
                  'linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.5), transparent)',
                  'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.5), transparent)',
                  'linear-gradient(270deg, transparent, rgba(6, 182, 212, 0.5), transparent)',
                  'linear-gradient(0deg, transparent, rgba(6, 182, 212, 0.5), transparent)',
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            <div className="relative flex items-center gap-4 z-10">
              {link.image ? (
                <motion.img 
                  src={link.image} 
                  alt="" 
                  className="w-12 h-12 rounded-xl object-cover" 
                  whileHover={{ rotate: 5 }}
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
                  }}
                />
              ) : (
                <motion.div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center" 
                  whileHover={{ rotate: 5 }}
                  style={{ 
                    backgroundColor: 'rgba(6, 182, 212, 0.2)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
                  }}
                >
                  <i 
                    className={getLinkIconClass(link.title, link.url)} 
                    style={{ 
                      color: (() => {
                        const platform = getPlatformFromLink(link.title, link.url);
                        return platform ? (getBrandColor(platform) || '#06B6D4') : '#06B6D4';
                      })(),
                      fontSize: '20px' 
                    }} 
                  />
                </motion.div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>{link.title}</h3>
              </div>
              <motion.div 
                className="text-xl"
                animate={{
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ color: '#06B6D4' }}
              >
                →
              </motion.div>
            </div>
            
            {/* Soft pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(6, 182, 212, 0)',
                  '0 0 0 4px rgba(6, 182, 212, 0.1)',
                  '0 0 0 0 rgba(6, 182, 212, 0)',
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.a>
          );
        })}
      </motion.div>
    </div>
  );
}

// Theme 4: Aqua Flow Layout - Water-inspired fluid UI with ripple effects
export function AquaFlowLayout({ profile, links, colors, searchQuery, onSearchChange, onLinkClick, socialIcons, hasMediaBg }: ThemeLayoutProps) {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleIdRef = React.useRef(0);

  const createRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: rippleIdRef.current++, x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1500);
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item: Variants = {
    hidden: { y: 30, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12
      }
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
      {/* Floating header with water droplet effect */}
      <motion.div 
        initial={{ y: -80, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
        }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 20,
          delay: 0.2
        }}
        className="relative z-10 text-center pt-8 pb-6 px-6"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderTop: 'none',
          borderRadius: '0 0 32px 32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        }}
      >
        {/* Avatar with water reflection */}
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="inline-block relative"
        >
          {profile.avatar ? (
            <div className="relative">
              {/* Water reflection glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(14, 165, 233, 0.2)',
                    '0 0 30px rgba(14, 165, 233, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)',
                    '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(14, 165, 233, 0.2)',
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <img 
                src={optimizeAvatar(profile.avatar)} 
                alt={profile.name} 
                loading="lazy"
                className="relative w-24 h-24 rounded-full mx-auto mb-4 object-cover" 
                style={{ 
                  border: '3px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                }} 
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(14, 165, 233, 0.3))',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
              }}
            >
              <User size={40} style={{ color: '#FFFFFF' }} />
            </div>
          )}
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold mb-2"
          style={{ 
            color: '#FFFFFF',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          {profile.name}
        </motion.h1>
        {profile.bio && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            {profile.bio}
          </motion.p>
        )}
      </motion.div>

      {/* Floating search with water surface effect */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="px-6 mt-4 mb-4"
      >
        <div className="relative">
          <motion.div
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <input
              type="text"
              placeholder="Dive into search..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="relative w-full px-4 py-3 rounded-2xl text-sm transition-all"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(15px) saturate(180%)',
                WebkitBackdropFilter: 'blur(15px) saturate(180%)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                outline: 'none'
              }}
            />
          </motion.div>
          <Search 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" 
            style={{ color: 'rgba(255, 255, 255, 0.8)' }} 
          />
        </div>
      </motion.div>

      {/* Floating link cards with ripple effects */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 px-6 pb-6 overflow-y-auto"
        onClick={createRipple}
      >
        {/* Ripple effects container */}
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              border: '2px solid rgba(255, 255, 255, 0.6)',
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ 
              width: 200, 
              height: 200, 
              opacity: 0,
              x: -100,
              y: -100,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        ))}

        {links.filter(l => l.isActive).map((link, index) => {
          if (link.type === 'collection') {
            return (
              <motion.div key={link.id} className="w-full text-center py-4 mb-2 mt-4" style={{ gridColumn: '1 / -1' }}>
                <h3 className="text-xl font-bold tracking-widest uppercase" style={{ color: colors.primaryText, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{link.title}</h3>
              </motion.div>
            );
          }
          return (
          <motion.a
            key={link.id}
            href={link.url}
            variants={item}
            whileHover={{ 
              scale: 1.03,
              y: -8,
            }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => { e.preventDefault(); onLinkClick?.(link.id); }}
            className="block mb-3 p-5 rounded-3xl relative overflow-hidden group"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(15px) saturate(180%)',
              WebkitBackdropFilter: 'blur(15px) saturate(180%)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* Floating animation */}
            <motion.div
              className="absolute inset-0"
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 3 + (index % 3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2
              }}
            />
            
            {/* Water shimmer on hover */}
            <motion.div
              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(255, 255, 255, 0.2) 100%)',
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            <div className="relative flex items-center gap-4 z-10">
              {link.image ? (
                <motion.img 
                  src={link.image} 
                  alt="" 
                  className="w-12 h-12 rounded-2xl object-cover" 
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  style={{
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                />
              ) : (
                <motion.div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center" 
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(14, 165, 233, 0.4))',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  <i 
                    className={getLinkIconClass(link.title, link.url)} 
                    style={{ 
                      color: (() => {
                        const platform = getPlatformFromLink(link.title, link.url);
                        return platform ? (getBrandColor(platform) || '#FFFFFF') : '#FFFFFF';
                      })(),
                      fontSize: '20px' 
                    }} 
                  />
                </motion.div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold" style={{ color: '#FFFFFF', textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                  {link.title}
                </h3>
              </div>
              <motion.div 
                className="text-xl"
                animate={{
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                →
              </motion.div>
            </div>
            
            {/* Bubble effect on hover */}
            <motion.div
              className="absolute bottom-2 right-2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(103, 232, 249, 0.4))',
                boxShadow: 'inset -1px -1px 2px rgba(0, 0, 0, 0.1)',
              }}
              animate={{
                y: [0, -50],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </motion.a>
          );
        })}
      </motion.div>
    </div>
  );
}

// Theme 5: Cyber Strike Layout - Gaming/Esports HUD interface
export function CyberStrikeLayout({ profile, links, colors, searchQuery, onSearchChange, onLinkClick, socialIcons, hasMediaBg }: ThemeLayoutProps) {
  const [hoveredLink, setHoveredLink] = React.useState<string | null>(null);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const item: Variants = {
    hidden: { x: -50, opacity: 0 },
    show: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <div className="flex flex-col h-full relative" style={{ fontFamily: "'Rajdhani', 'Orbitron', sans-serif" }}>
      {/* HUD Header with corner brackets */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative z-10 text-center pt-6 pb-4 px-4"
        style={{
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 100%)',
          borderBottom: '2px solid rgba(0, 255, 255, 0.5)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 255, 255, 0.5)',
        }}
      >
        {/* Corner brackets */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-400" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }} />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-cyan-400" style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }} />
        
        {/* Avatar with hexagon frame */}
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="inline-block relative"
        >
          {profile.avatar ? (
            <div className="relative">
              {/* Glowing hexagon border */}
              <motion.div
                className="absolute inset-0"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0, 255, 255, 0.8), inset 0 0 20px rgba(0, 255, 255, 0.3)',
                    '0 0 40px rgba(255, 0, 255, 0.8), inset 0 0 20px rgba(255, 0, 255, 0.3)',
                    '0 0 20px rgba(0, 255, 255, 0.8), inset 0 0 20px rgba(0, 255, 255, 0.3)',
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <img 
                src={optimizeAvatar(profile.avatar)} 
                alt={profile.name} 
                loading="lazy"
                className="relative w-20 h-20 mx-auto mb-3 object-cover" 
                style={{ 
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  border: '3px solid rgba(0, 255, 255, 0.8)',
                }} 
              />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center relative"
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.3))',
                border: '3px solid rgba(0, 255, 255, 0.8)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
              }}
            >
              <User size={32} style={{ color: '#00FFFF' }} />
            </div>
          )}
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-1 uppercase tracking-wider"
          style={{ 
            color: '#00FFFF',
            textShadow: '0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.4)',
            letterSpacing: '0.1em'
          }}
        >
          {profile.name}
        </motion.h1>
        {profile.bio && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs uppercase tracking-wide"
            style={{ color: '#FF00FF', textShadow: '0 0 5px rgba(255, 0, 255, 0.5)' }}
          >
            {profile.bio}
          </motion.p>
        )}
        
        {/* Status bar */}
        <motion.div 
          className="mt-3 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#00FF00', boxShadow: '0 0 5px #00FF00' }}
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* HUD Search bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="px-4 mt-3 mb-3"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="SEARCH TARGETS..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full px-4 py-2 text-sm uppercase tracking-wide transition-all"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: '#00FFFF',
              border: '2px solid rgba(0, 255, 255, 0.5)',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)',
              outline: 'none'
            }}
          />
          <Search 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" 
            style={{ color: '#00FFFF' }} 
          />
        </div>
      </motion.div>

      {/* HUD Link cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 px-4 pb-4 overflow-y-auto"
      >
        {links.filter(l => l.isActive).map((link, index) => {
          if (link.type === 'collection') {
            return (
              <motion.div key={link.id} className="w-full text-center py-4 mb-2 mt-4" style={{ gridColumn: '1 / -1' }}>
                <h3 className="text-xl font-bold tracking-widest uppercase" style={{ color: colors.primaryText, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{link.title}</h3>
              </motion.div>
            );
          }
          return (
          <motion.a
            key={link.id}
            href={link.url}
            variants={item}
            whileHover={{ 
              scale: 1.05,
              x: 10,
            }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoveredLink(link.id)}
            onHoverEnd={() => setHoveredLink(null)}
            onClick={(e) => { e.preventDefault(); onLinkClick?.(link.id); }}
            className="block mb-2 p-4 relative overflow-hidden group"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: hoveredLink === link.id ? '2px solid rgba(255, 0, 255, 0.8)' : '2px solid rgba(0, 255, 255, 0.5)',
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              boxShadow: hoveredLink === link.id 
                ? '0 0 30px rgba(255, 0, 255, 0.6), inset 0 0 20px rgba(255, 0, 255, 0.2)' 
                : '0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Pulse effect on hover */}
            {hoveredLink === link.id && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.3), transparent)',
                }}
              />
            )}
            
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" 
              style={{ 
                borderColor: hoveredLink === link.id ? '#FF00FF' : '#00FFFF',
                boxShadow: hoveredLink === link.id ? '0 0 10px #FF00FF' : '0 0 5px #00FFFF'
              }} 
            />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" 
              style={{ 
                borderColor: hoveredLink === link.id ? '#FF00FF' : '#00FFFF',
                boxShadow: hoveredLink === link.id ? '0 0 10px #FF00FF' : '0 0 5px #00FFFF'
              }} 
            />
            
            <div className="relative flex items-center gap-3 z-10">
              {link.image ? (
                <motion.img 
                  src={link.image} 
                  alt="" 
                  className="w-10 h-10 object-cover" 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    border: '2px solid rgba(0, 255, 255, 0.6)',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.4)'
                  }}
                />
              ) : (
                <motion.div 
                  className="w-10 h-10 flex items-center justify-center" 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  style={{ 
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.3))',
                    border: '2px solid rgba(0, 255, 255, 0.6)',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.4)'
                  }}
                >
                  <i 
                    className={getLinkIconClass(link.title, link.url)} 
                    style={{ 
                      color: (() => {
                        const platform = getPlatformFromLink(link.title, link.url);
                        return platform ? (getBrandColor(platform) || '#00FFFF') : '#00FFFF';
                      })(),
                      fontSize: '16px' 
                    }} 
                  />
                </motion.div>
              )}
              <div className="flex-1">
                <h3 className="font-bold uppercase tracking-wide text-sm" 
                  style={{ 
                    color: hoveredLink === link.id ? '#FF00FF' : '#00FFFF',
                    textShadow: hoveredLink === link.id ? '0 0 10px rgba(255, 0, 255, 0.8)' : '0 0 5px rgba(0, 255, 255, 0.5)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {link.title}
                </h3>
              </div>
              <motion.div 
                className="text-lg font-bold"
                animate={{
                  x: hoveredLink === link.id ? [0, 5, 0] : 0,
                }}
                transition={{
                  duration: 0.5,
                  repeat: hoveredLink === link.id ? Infinity : 0,
                }}
                style={{ 
                  color: hoveredLink === link.id ? '#FFFF00' : '#00FFFF',
                  textShadow: hoveredLink === link.id ? '0 0 10px #FFFF00' : 'none'
                }}
              >
                ▶
              </motion.div>
            </div>
            
            {/* Energy bar at bottom */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5"
              style={{
                backgroundColor: hoveredLink === link.id ? '#FF00FF' : '#00FFFF',
                boxShadow: hoveredLink === link.id ? '0 0 10px #FF00FF' : '0 0 5px #00FFFF',
              }}
              initial={{ width: '0%' }}
              animate={{ width: hoveredLink === link.id ? '100%' : '30%' }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>
          );
        })}
      </motion.div>
      
      {/* Bottom HUD bar */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 px-4 py-2"
        style={{
          background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 100%)',
          borderTop: '2px solid rgba(0, 255, 255, 0.5)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 1px 0 rgba(0, 255, 255, 0.5)',
        }}
      >
        <div className="flex justify-between items-center text-xs uppercase tracking-wider">
          <span style={{ color: '#00FFFF', textShadow: '0 0 5px rgba(0, 255, 255, 0.5)' }}>
            ONLINE
          </span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-3"
                style={{ backgroundColor: '#00FF00', boxShadow: '0 0 5px #00FF00' }}
                animate={{
                  scaleY: [1, 0.5, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Theme 6: Bento Grid Layout - Modern grid with different sizes
export function BentoGridLayout({ profile, links, colors, searchQuery, onSearchChange, onLinkClick, hasMediaBg }: ThemeLayoutProps) {
  const visibleLinks = links.filter(l => l.isActive);

  return (
    <div className="h-full overflow-y-auto p-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Compact Header */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-4 mb-6"
      >
        {profile.avatar ? (
          <img src={optimizeAvatar(profile.avatar)} alt={profile.name} loading="lazy" className="w-16 h-16 rounded-full" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center"><User size={24} /></div>
        )}
        <div>
          <h1 className="text-xl font-bold" style={{ color: colors.primaryText }}>{profile.name}</h1>
          {profile.bio && <p className="text-xs opacity-70" style={{ color: colors.primaryText }}>{profile.bio}</p>}
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-3 auto-rows-[100px]">
        {visibleLinks.map((link, index) => {
          // Make some cards larger
          const isLarge = index % 5 === 0;
          const isTall = index % 7 === 0;
          
          return (
            <motion.a
              key={link.id}
              href={link.url}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.preventDefault(); onLinkClick?.(link.id); }}
              className={`rounded-2xl p-4 flex flex-col justify-between ${isLarge ? 'col-span-2' : ''} ${isTall ? 'row-span-2' : ''}`}
              style={{
                backgroundColor: hasMediaBg ? 'rgba(255,255,255,0.12)' : colors.linkFooterBackground,
                border: `1px solid ${hasMediaBg ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                backdropFilter: 'blur(10px)'
              }}
            >
              {link.image ? (
                <img src={link.image} alt="" className="w-10 h-10 rounded-lg object-cover mb-2" />
              ) : (
                <i 
                  className={getLinkIconClass(link.title, link.url)} 
                  style={{ 
                    color: (() => {
                      const platform = getPlatformFromLink(link.title, link.url);
                      return platform ? (getBrandColor(platform) || colors.secondaryText) : colors.secondaryText;
                    })(),
                    fontSize: '24px' 
                  }} 
                />
              )}
              <h3 className="font-semibold text-sm line-clamp-2" style={{ color: colors.primaryText }}>{link.title}</h3>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}

// Theme 7: Horizontal Scroll Layout - Swipeable cards
export function HorizontalScrollLayout({ profile, links, colors, onLinkClick, hasMediaBg }: ThemeLayoutProps) {
  return (
    <div className="h-full flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Top Profile Bar */}
      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-6 pb-4"
      >
        <div className="flex items-center gap-3">
          {profile.avatar ? (
            <img src={optimizeAvatar(profile.avatar)} alt={profile.name} loading="lazy" className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><User size={20} /></div>
          )}
          <div>
            <h1 className="font-bold" style={{ color: colors.primaryText }}>{profile.name}</h1>
            <p className="text-xs opacity-70" style={{ color: colors.primaryText }}>{profile.bio}</p>
          </div>
        </div>
      </motion.div>

      {/* Horizontal Scrolling Cards */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6">
        <div className="flex gap-4 h-full items-center" style={{ width: 'max-content' }}>
          {links.filter(l => l.isActive).map((link, index) => {
          if (link.type === 'collection') {
            return (
              <motion.div key={link.id} className="w-full text-center py-4 mb-2 mt-4" style={{ gridColumn: '1 / -1' }}>
                <h3 className="text-xl font-bold tracking-widest uppercase" style={{ color: colors.primaryText, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{link.title}</h3>
              </motion.div>
            );
          }
          return (
          <motion.a
              key={link.id}
              href={link.url}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.preventDefault(); onLinkClick?.(link.id); }}
              className="flex-shrink-0 w-64 h-80 rounded-3xl p-6 flex flex-col justify-between"
              style={{
                backgroundColor: hasMediaBg ? 'rgba(255,255,255,0.15)' : colors.linkFooterBackground,
                border: `2px solid ${hasMediaBg ? 'rgba(255,255,255,0.25)' : 'transparent'}`,
                backdropFilter: 'blur(15px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {link.image ? (
                <img src={link.image} alt="" className="w-full h-40 rounded-2xl object-cover mb-4" />
              ) : (
                <div className="w-full h-40 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: hasMediaBg ? 'rgba(255,255,255,0.1)' : colors.cardBackground }}>
                  <i 
                    className={getLinkIconClass(link.title, link.url)} 
                    style={{ 
                      color: (() => {
                        const platform = getPlatformFromLink(link.title, link.url);
                        return platform ? (getBrandColor(platform) || colors.secondaryText) : colors.secondaryText;
                      })(),
                      fontSize: '48px' 
                    }} 
                  />
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg mb-2" style={{ color: colors.primaryText }}>{link.title}</h3>
                <div className="text-sm opacity-70" style={{ color: colors.primaryText }}>Tap to open →</div>
              </div>
            </motion.a>
          );
        })}
        </div>
      </div>
    </div>
  );
}

// Theme 8: Masonry Layout - Pinterest-style
export function MasonryLayout({ profile, links, colors, searchQuery, onSearchChange, onLinkClick, hasMediaBg }: ThemeLayoutProps) {
  const visibleLinks = links.filter(l => l.isActive);

  return (
    <div className="h-full overflow-y-auto p-6" style={{ fontFamily: "'Lora', serif" }}>
      {/* Centered Profile */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        {profile.avatar ? (
          <motion.img 
            whileHover={{ rotate: 5 }}
            src={optimizeAvatar(profile.avatar)} 
            alt={profile.name} 
            loading="lazy"
            className="w-20 h-20 rounded-3xl mx-auto mb-3 shadow-lg" 
          />
        ) : (
          <div className="w-20 h-20 rounded-3xl mx-auto mb-3 bg-white/10 flex items-center justify-center"><User size={32} /></div>
        )}
        <h1 className="text-2xl font-bold mb-1" style={{ color: colors.primaryText }}>{profile.name}</h1>
        {profile.bio && <p className="text-sm opacity-80" style={{ color: colors.primaryText }}>{profile.bio}</p>}
      </motion.div>

      {/* Masonry Grid */}
      <div className="columns-2 gap-3">
        {visibleLinks.map((link, index) => {
          const heights = ['h-32', 'h-40', 'h-36', 'h-44', 'h-28'];
          const randomHeight = heights[index % heights.length];
          
          return (
            <motion.a
              key={link.id}
              href={link.url}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.preventDefault(); onLinkClick?.(link.id); }}
              className={`block mb-3 ${randomHeight} rounded-2xl p-4 break-inside-avoid`}
              style={{
                backgroundColor: hasMediaBg ? 'rgba(255,255,255,0.12)' : colors.linkFooterBackground,
                border: `1px solid ${hasMediaBg ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex flex-col h-full justify-between">
                {link.image && <img src={link.image} alt="" className="w-full h-20 rounded-xl object-cover mb-2" />}
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: colors.primaryText }}>{link.title}</h3>
                </div>
                {!link.image && (
                  <i 
                    className={getLinkIconClass(link.title, link.url)} 
                    style={{ 
                      color: (() => {
                        const platform = getPlatformFromLink(link.title, link.url);
                        return platform ? (getBrandColor(platform) || colors.secondaryText) : colors.secondaryText;
                      })(),
                      fontSize: '20px' 
                    }} 
                  />
                )}
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}

// Theme 9: Carousel Layout - Full-screen swipeable
export function CarouselLayout({ profile, links, colors, onLinkClick, hasMediaBg }: ThemeLayoutProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const visibleLinks = links.filter(l => l.isActive);

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: "'Roboto', sans-serif" }}>
      {/* Minimal Top Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {profile.avatar ? (
            <img src={optimizeAvatar(profile.avatar)} alt={profile.name} loading="lazy" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><User size={16} /></div>
          )}
          <span className="font-semibold text-sm" style={{ color: colors.primaryText }}>{profile.name}</span>
        </div>
        <div className="text-xs opacity-70" style={{ color: colors.primaryText }}>{currentIndex + 1} / {visibleLinks.length}</div>
      </div>

      {/* Full-Screen Carousel */}
      <div className="flex-1 relative overflow-hidden">
        {visibleLinks.map((link, index) => (
          <motion.div
            key={link.id}
            initial={{ x: index === 0 ? 0 : 300, opacity: index === 0 ? 1 : 0 }}
            animate={{ 
              x: index === currentIndex ? 0 : index < currentIndex ? -300 : 300,
              opacity: index === currentIndex ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 p-6 flex flex-col justify-center"
          >
            <motion.a
              href={link.url}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.preventDefault(); onLinkClick?.(link.id); }}
              className="rounded-3xl p-8 text-center"
              style={{
                backgroundColor: hasMediaBg ? 'rgba(255,255,255,0.15)' : colors.linkFooterBackground,
                border: `2px solid ${hasMediaBg ? 'rgba(255,255,255,0.25)' : 'transparent'}`,
                backdropFilter: 'blur(15px)'
              }}
            >
              {link.image ? (
                <img src={link.image} alt="" className="w-32 h-32 rounded-2xl object-cover mx-auto mb-6" />
              ) : (
                <div className="w-32 h-32 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: hasMediaBg ? 'rgba(255,255,255,0.1)' : colors.cardBackground }}>
                  <i 
                    className={getLinkIconClass(link.title, link.url)} 
                    style={{ 
                      color: (() => {
                        const platform = getPlatformFromLink(link.title, link.url);
                        return platform ? (getBrandColor(platform) || colors.secondaryText) : colors.secondaryText;
                      })(),
                      fontSize: '48px' 
                    }} 
                  />
                </div>
              )}
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primaryText }}>{link.title}</h2>
              <div className="text-sm opacity-70" style={{ color: colors.primaryText }}>Tap to open</div>
            </motion.a>
          </motion.div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 p-6">
        {visibleLinks.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              backgroundColor: index === currentIndex ? colors.primaryText : colors.secondaryText,
              opacity: index === currentIndex ? 1 : 0.3
            }}
          />
        ))}
      </div>
    </div>
  );
}
