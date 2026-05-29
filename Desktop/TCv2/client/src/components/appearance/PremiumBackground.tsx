import React from 'react';
import { motion } from 'framer-motion';

interface PremiumBackgroundProps {
  theme: number | 'custom' | 'customMedia';
}

export default function PremiumBackground({ theme }: PremiumBackgroundProps) {
  // Theme 3: Cosmic Vision - Futuristic Apple Vision Pro inspired
  if (theme === 3) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Deep space base - Blue/Cyan theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0c1e3a] to-[#020617]"></div>
        
        {/* Animated nebula gradients - Cyan/Blue/Turquoise */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at 20% 30%, rgba(6, 182, 212, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 30% 70%, rgba(6, 182, 212, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 20% 30%, rgba(6, 182, 212, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)',
            ]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Large nebula clouds with blur - Cyan theme */}
        <motion.div
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0.1) 30%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, rgba(14, 165, 233, 0.1) 30%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, rgba(34, 211, 238, 0.08) 30%, transparent 70%)',
            filter: 'blur(70px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
        />
        
        {/* Floating glowing particles - Cyan/Blue stars */}
        {[...Array(50)].map((_, i) => {
          const size = Math.random() * 3 + 1;
          const colors = ['#06B6D4', '#0EA5E9', '#22D3EE', '#67E8F9', '#3B82F6'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                backgroundColor: color,
                boxShadow: `0 0 ${size * 4}px ${color}`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 100 - 50, 0],
                x: [0, Math.random() * 50 - 25, 0],
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          );
        })}
        
        {/* Larger glowing orbs - Cyan theme */}
        {[...Array(8)].map((_, i) => {
          const colors = ['rgba(6, 182, 212, 0.4)', 'rgba(14, 165, 233, 0.4)', 'rgba(34, 211, 238, 0.4)'];
          const color = colors[i % 3];
          
          return (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full"
              style={{
                width: 20 + Math.random() * 30,
                height: 20 + Math.random() * 30,
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                filter: 'blur(10px)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -150, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: "easeInOut"
              }}
            />
          );
        })}
        
        {/* Subtle grid overlay for depth - Cyan */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)',
            backgroundSize: '100px 100px',
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Scanning line effect - Cyan */}
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
          }}
          animate={{
            top: ['0%', '100%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    );
  }

  // Theme 4: Aqua Flow - Water-inspired fluid UI
  if (theme === 4) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Deep ocean gradient base */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(180deg, #0A2463 0%, #1E3A8A 30%, #0EA5E9 60%, #06B6D4 100%)',
              'linear-gradient(180deg, #1E3A8A 0%, #0EA5E9 30%, #06B6D4 60%, #22D3EE 100%)',
              'linear-gradient(180deg, #0A2463 0%, #1E3A8A 30%, #0EA5E9 60%, #06B6D4 100%)',
            ]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Fluid wave layers - multiple overlapping waves */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.4)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(14, 165, 233, 0.3)" />
              <stop offset="100%" stopColor="rgba(14, 165, 233, 0)" />
            </linearGradient>
            <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.25)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
            </linearGradient>
          </defs>
          
          {/* Wave 1 - Slow deep wave */}
          <motion.path
            d="M0,100 Q150,80 300,100 T600,100 L600,0 L0,0 Z"
            fill="url(#wave-gradient-1)"
            animate={{
              d: [
                "M0,100 Q150,80 300,100 T600,100 L600,0 L0,0 Z",
                "M0,100 Q150,120 300,100 T600,100 L600,0 L0,0 Z",
                "M0,100 Q150,80 300,100 T600,100 L600,0 L0,0 Z",
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Wave 2 - Medium wave */}
          <motion.path
            d="M0,150 Q200,130 400,150 T800,150 L800,0 L0,0 Z"
            fill="url(#wave-gradient-2)"
            animate={{
              d: [
                "M0,150 Q200,130 400,150 T800,150 L800,0 L0,0 Z",
                "M0,150 Q200,170 400,150 T800,150 L800,0 L0,0 Z",
                "M0,150 Q200,130 400,150 T800,150 L800,0 L0,0 Z",
              ]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          {/* Wave 3 - Fast surface wave */}
          <motion.path
            d="M0,200 Q250,180 500,200 T1000,200 L1000,0 L0,0 Z"
            fill="url(#wave-gradient-3)"
            animate={{
              d: [
                "M0,200 Q250,180 500,200 T1000,200 L1000,0 L0,0 Z",
                "M0,200 Q250,220 500,200 T1000,200 L1000,0 L0,0 Z",
                "M0,200 Q250,180 500,200 T1000,200 L1000,0 L0,0 Z",
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </svg>
        
        {/* Floating bubbles - rising from bottom */}
        {[...Array(25)].map((_, i) => {
          const size = 4 + Math.random() * 12;
          const startX = Math.random() * 100;
          const drift = Math.random() * 40 - 20;
          
          return (
            <motion.div
              key={`bubble-${i}`}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${startX}%`,
                bottom: '-5%',
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(103, 232, 249, 0.4))',
                boxShadow: 'inset -2px -2px 4px rgba(0, 0, 0, 0.1), 0 0 8px rgba(103, 232, 249, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
              animate={{
                y: [0, -window.innerHeight - 50],
                x: [0, drift, -drift, 0],
                scale: [1, 1.1, 0.9, 1],
                opacity: [0, 0.8, 0.8, 0],
              }}
              transition={{
                duration: 8 + Math.random() * 6,
                repeat: Infinity,
                delay: Math.random() * 8,
                ease: "easeInOut"
              }}
            />
          );
        })}
        
        {/* Light reflections - shimmering light rays */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`light-${i}`}
            className="absolute top-0 w-1 h-full"
            style={{
              left: `${10 + i * 12}%`,
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.1) 100%)',
              filter: 'blur(2px)',
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scaleY: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
        
        {/* Underwater particles - floating debris */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-cyan-200"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.4,
            }}
            animate={{
              x: [0, Math.random() * 50 - 25, 0],
              y: [0, Math.random() * 30 - 15, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 6
            }}
          />
        ))}
        
        {/* Caustic light patterns - water surface reflections */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
            filter: 'blur(40px)',
          }}
          animate={{
            background: [
              'radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
              'radial-gradient(ellipse at 60% 40%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 40% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
              'radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    );
  }

  // Theme 5: Cyber Strike - Gaming/Esports HUD theme
  if (theme === 5) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Dark gaming background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27]"></div>
        
        {/* Animated grid - HUD style */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Glowing accent orbs - Cyan/Magenta gaming colors */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 255, 0.25) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 0, 255, 0.25) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Scanning lines - HUD effect */}
        <motion.div
          className="absolute left-0 right-0 h-0.5"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
          }}
          animate={{
            top: ['0%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute left-0 right-0 h-0.5"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.6), transparent)',
            boxShadow: '0 0 15px rgba(255, 0, 255, 0.6)',
          }}
          animate={{
            top: ['100%', '0%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
            delay: 1.5
          }}
        />
        
        {/* Corner brackets - HUD style */}
        {[
          { top: '10%', left: '10%', rotate: 0 },
          { top: '10%', right: '10%', rotate: 90 },
          { bottom: '10%', right: '10%', rotate: 180 },
          { bottom: '10%', left: '10%', rotate: 270 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-16 h-16"
            style={{
              ...pos,
              borderTop: '3px solid rgba(0, 255, 255, 0.4)',
              borderLeft: '3px solid rgba(0, 255, 255, 0.4)',
              transform: `rotate(${pos.rotate}deg)`,
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
        
        {/* Glowing particles - energy effects */}
        {[...Array(30)].map((_, i) => {
          const colors = ['rgba(0, 255, 255, 0.8)', 'rgba(255, 0, 255, 0.8)', 'rgba(255, 255, 0, 0.8)'];
          const color = colors[i % 3];
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: color,
                boxShadow: `0 0 10px ${color}`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          );
        })}
        
        {/* Hexagon pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%2300ffff' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>
    );
  }

  // Theme 6: Purple Haze - Flowing gradient waves
  if (theme === 6) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E] via-[#2d2640] to-[#1A1A2E]"></div>
        
        {/* Flowing gradient waves */}
        <motion.div
          className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[140px]"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-violet-500 rounded-full blur-[140px]"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-fuchsia-500 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Floating sparkles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-300 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    );
  }

  // Theme 7: Cream - Warm pulsing glow
  if (theme === 7) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(to bottom right, #FFF9F0, #FFF5E6, #FFF9F0)',
              'linear-gradient(to bottom right, #FFF5E6, #FFEDD5, #FFF5E6)',
              'linear-gradient(to bottom right, #FFF9F0, #FFF5E6, #FFF9F0)',
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Warm ambient glow */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-200 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-200 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
    );
  }

  // Theme 8: Slate - Geometric shapes moving
  if (theme === 8) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A]"></div>
        
        {/* Moving geometric shapes */}
        <motion.div
          className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-slate-400 rounded-full blur-[130px]"
          animate={{
            x: [0, 50, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
            opacity: [0.12, 0.18, 0.12],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-blue-400 rounded-full blur-[130px]"
          animate={{
            x: [0, -40, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
            opacity: [0.12, 0.18, 0.12],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Animated grid lines */}
        <motion.div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    );
  }

  // Theme 9: Gold - Shimmering particles
  if (theme === 9) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-[#334155] to-[#1E293B]"></div>
        
        {/* Gold shimmer effect */}
        <motion.div
          className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-yellow-500 rounded-full blur-[140px]"
          animate={{
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-[400px] h-[350px] bg-amber-500 rounded-full blur-[140px]"
          animate={{
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Gold particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -150, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>
    );
  }

  // Theme 17: Mint - Fresh flowing waves
  if (theme === 17) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(to bottom right, #ECFDF5, #D1FAE5, #ECFDF5)',
              'linear-gradient(to bottom right, #D1FAE5, #A7F3D0, #D1FAE5)',
              'linear-gradient(to bottom right, #ECFDF5, #D1FAE5, #ECFDF5)',
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Fresh mint waves */}
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-emerald-300 rounded-full blur-[120px]"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[450px] h-[300px] bg-teal-300 rounded-full blur-[100px]"
          animate={{
            x: [0, 30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Floating leaves */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, 100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 0.6, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8,
            }}
          />
        ))}
      </div>
    );
  }

  // Theme 18: Rose - Blooming petals
  if (theme === 18) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(to bottom right, #FFF1F2, #FFE4E6, #FFF1F2)',
              'linear-gradient(to bottom right, #FFE4E6, #FECDD3, #FFE4E6)',
              'linear-gradient(to bottom right, #FFF1F2, #FFE4E6, #FFF1F2)',
            ]
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Rose blooms */}
        <motion.div
          className="absolute top-0 right-1/3 w-[500px] h-[400px] bg-rose-300 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.35, 0.5, 0.35],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-[450px] h-[350px] bg-pink-300 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.5, 0.35],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
        
        {/* Falling petals */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-pink-400 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-5%',
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, Math.random() * 100 - 50],
              rotate: [0, 360],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "linear"
            }}
          />
        ))}
      </div>
    );
  }

  // Theme 20: Carbon - Tech grid animation
  if (theme === 20) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#18181B] via-[#27272A] to-[#18181B]"></div>
        
        {/* Subtle tech glow */}
        <motion.div
          className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-zinc-400 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-[450px] h-[450px] bg-gray-400 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        
        {/* Animated carbon fiber pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px), repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            backgroundSize: '30px 30px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '30px 30px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Tech particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-zinc-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}
