import React from 'react';
import { CheckCircle, ShieldCheck, Terminal } from 'lucide-react';

export default function CompletionOverlay({
  label = "SYSTEM ONLINE",
  message = "Protocol Successfully Bypassed",
  className = ""
}) {
  return (
    <div 
      className={`absolute inset-0 z-40 overflow-hidden rounded-xl pointer-events-none ${className}`}
    >
      {/* Background with Green Tint & Scanline */}
      <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px] border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
        {/* Animated Grid Background (Green) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
        
        {/* Success Scanline */}
        <div className="absolute inset-x-0 h-[2px] bg-emerald-400/30 shadow-[0_0_10px_#34d399] animate-scanline-fast top-0"></div>
      </div>

      {/* Status Badge (Top Right) */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-fade-in">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider">VERIFIED</span>
      </div>

      {/* Center Content (Optional - maybe just subtle indicators?) 
          Let's keep it subtle so the user can still see their work, 
          but clearly marked as "Done" 
      */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-emerald-950/90 to-transparent">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-emerald-100 font-mono tracking-wider">{label}</h4>
                <p className="text-[10px] text-emerald-300/80 font-mono">{message}</p>
            </div>
        </div>
      </div>

      {/* Decorative Corners (Green) */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-emerald-500/40 rounded-tl"></div>
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-emerald-500/40 rounded-tr"></div>
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-emerald-500/40 rounded-bl"></div>
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-emerald-500/40 rounded-br"></div>
    </div>
  );
}
