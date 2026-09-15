import React from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  label?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  className = '',
  label = 'Advertisement',
}) => {
  return (
    <div className={`w-full max-w-4xl mx-auto my-2 flex flex-col items-center justify-center ${className}`}>
      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">
        {label}
      </span>
      <div className="w-full bg-[#090e1a]/80 border border-slate-800/60 rounded-xl p-3 flex flex-col items-center justify-center text-center min-h-[90px] shadow-inner">
        <span className="text-xs font-semibold text-slate-500">
          Ad Space Reserved (Google AdSense / Ezoic Ready)
        </span>
        <span className="text-[10px] text-slate-600 mt-0.5">
          High-performance non-blocking ad slot
        </span>
      </div>
    </div>
  );
};
