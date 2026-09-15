import React from 'react';
import { ShieldCheck, FileText, Mail, Server, Info } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
  onOpenServers: () => void;
  onOpenGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact,
  onOpenServers,
  onOpenGuide,
}) => {
  return (
    <footer className="w-full bg-[#050810] border-t border-slate-800/80 py-8 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <span className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
            TSI <span className="text-cyan-400 font-extrabold">SpeedTest</span>
          </span>
          <span className="text-[11px] text-slate-500">
            © 2026 TSI SpeedTest Engine • Fast, Accurate & Simple Network Diagnostics
          </span>
        </div>

        {/* Center/Right Side: Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold">
          <button
            onClick={onOpenPrivacy}
            className="hover:text-cyan-400 flex items-center gap-1 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> Privacy Policy
          </button>

          <button
            onClick={onOpenTerms}
            className="hover:text-cyan-400 flex items-center gap-1 transition"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" /> Terms of Service
          </button>

          <button
            onClick={onOpenContact}
            className="hover:text-cyan-400 flex items-center gap-1 transition"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" /> Contact Us
          </button>

          <span className="text-slate-800 hidden sm:inline">•</span>

          <button
            onClick={onOpenServers}
            className="hover:text-cyan-400 flex items-center gap-1 transition"
          >
            <Server className="w-3.5 h-3.5 text-slate-500" /> Edge Servers
          </button>

          <button
            onClick={onOpenGuide}
            className="hover:text-cyan-400 flex items-center gap-1 transition"
          >
            <Info className="w-3.5 h-3.5 text-slate-500" /> Node Guide
          </button>
        </div>
      </div>
    </footer>
  );
};
