import React, { useEffect, useState } from 'react';
import { Lock, ShieldAlert, Cpu } from 'lucide-react';

export default function SecurityOverlay({
  isLocked = true,
  label = "SYSTEM LOCKED",
  message = "Access Restricted",
  forceOpen = false,
  className = ""
}) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsGlitching(true);
    }
  }, [forceOpen]);

  if (!isLocked && !forceOpen) return null;

  return (
    <div 
      className={`absolute inset-0 z-50 overflow-hidden rounded-xl transition-all duration-500 ${className} ${
        isGlitching ? 'animate-glitch-dissolve pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background with Blur and Grid */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>
        
        {/* Scanning Line */}
        <div className="absolute inset-x-0 h-[2px] bg-cyan-400/50 shadow-[0_0_10px_#22d3ee] animate-scanline top-0"></div>
      </div>

      {/* Content Container */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
        
        {/* Lock Icon with Pulse */}
        <div className={`relative mb-6 ${isGlitching ? 'animate-shake' : 'animate-pulse-slow'}`}>
          <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
          <div className="relative bg-slate-950/50 p-4 rounded-full border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2 max-w-[80%]">
          <h3 className="text-xl font-bold text-cyan-100 tracking-widest uppercase font-mono drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
            {label}
          </h3>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent my-2"></div>
          <p className="text-sm text-cyan-300/80 font-mono">
            {message}
          </p>
        </div>

        {/* Decorative Corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-lg"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30 rounded-br-lg"></div>

        {/* Status Indicators */}
        <div className="absolute bottom-6 flex gap-2">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
           <span className="text-[10px] text-red-400 font-mono tracking-wider">ENCRYPTION ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
