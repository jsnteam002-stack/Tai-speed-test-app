import React from 'react';
import { Logo } from './Logo';
import { Globe, Server, Info, History, BarChart2 } from 'lucide-react';
import { Language } from '../utils/translations';

interface HeaderProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  onOpenServerModal: () => void;
  onOpenGuideModal: () => void;
  activeTab: 'test' | 'history' | 'insights';
  onSelectTab: (tab: 'test' | 'history' | 'insights') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSelectLang,
  onOpenServerModal,
  onOpenGuideModal,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="w-full bg-[#090e1a]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div onClick={() => onSelectTab('test')}>
          <Logo />
        </div>

        {/* Center Nav for Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0e1626] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectTab('test')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'test'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Speed Test
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>
          <button
            onClick={() => onSelectTab('insights')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'insights'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Insights
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Server Selector Modal Trigger */}
          <button
            onClick={onOpenServerModal}
            className="p-2 bg-[#0e1626] hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-cyan-400 text-xs flex items-center gap-1.5 transition"
            title="Select Edge Server"
          >
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline font-medium">Servers</span>
          </button>

          {/* Guide Modal Trigger */}
          <button
            onClick={onOpenGuideModal}
            className="p-2 bg-[#0e1626] hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-cyan-400 text-xs flex items-center gap-1.5 transition"
            title="Deploy Node Guide"
          >
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline font-medium">Guide</span>
          </button>

          {/* Language Switcher */}
          <div className="relative flex items-center bg-[#0e1626] border border-slate-800 rounded-xl px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
            <select
              value={currentLang}
              onChange={(e) => onSelectLang(e.target.value as Language)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="EN" className="bg-slate-900 text-white">EN</option>
              <option value="BN" className="bg-slate-900 text-white">BN (বাংলা)</option>
              <option value="ES" className="bg-slate-900 text-white">ES</option>
              <option value="AR" className="bg-slate-900 text-white">AR</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
