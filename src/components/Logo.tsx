import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer">
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-60 blur-sm group-hover:opacity-100 transition duration-300"></div>
        <div className="relative w-9 h-9 bg-slate-950 border border-cyan-500/40 rounded-xl flex items-center justify-center text-cyan-400">
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
            <path d="M12 14l3.5-5" className="origin-bottom transform transition-transform group-hover:rotate-45" />
            <path d="M3.34 19a10 10 0 1 1 17.32 0" />
            <circle cx="12" cy="14" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
          TSI <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-extrabold">SpeedTest</span>
        </span>
        <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase -mt-1">
          Fast • Accurate • Simple
        </span>
      </div>
    </div>
  );
};
