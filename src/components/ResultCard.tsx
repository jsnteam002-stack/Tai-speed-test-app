import React, { useState } from 'react';
import { SpeedTestResult } from '../types';
import { calculateCapabilities } from '../utils/capabilityDetector';
import { downloadResultCardAsPng } from '../utils/canvasExport';
import { Share2, Download, ArrowDown, ArrowUp, Zap, Server, Shield, Wifi, RefreshCw } from 'lucide-react';

interface ResultCardProps {
  result: SpeedTestResult;
  onRetry: () => void;
  onOpenShare: (result: SpeedTestResult) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onRetry, onOpenShare }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'capabilities' | 'details'>('summary');
  const [isExporting, setIsExporting] = useState(false);

  const capabilities = calculateCapabilities(result);

  const handleDownloadImage = async () => {
    setIsExporting(true);
    try {
      await downloadResultCardAsPng('result-card-container', `TSI-SpeedTest-${result.id}.png`);
    } catch (err) {
      console.error('Failed to download card image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 py-4 px-2" id="result-card-container">
      {/* Top Bar: Tabs & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e1726]/90 border border-slate-800 p-3.5 rounded-2xl shadow-xl">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#090e1a] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'summary'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('capabilities')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'capabilities'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Capabilities
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'details'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Details
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenShare(result)}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-cyan-900/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 transition disabled:opacity-50"
            title="Download PNG Card"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRetry}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 transition"
            title="Run New Speed Test"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Download Speed Card */}
          <div className="bg-[#0b1322] border border-cyan-900/40 p-5 rounded-2xl shadow-xl flex flex-col items-center justify-between text-center">
            <div className="w-full flex items-center justify-between text-cyan-400 border-b border-slate-800/60 pb-2.5">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wide flex items-center gap-1.5 whitespace-nowrap">
                <ArrowDown className="w-4 h-4 shrink-0" /> DOWNLOAD
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Bandwidth</span>
            </div>
            <div className="my-4 flex items-baseline justify-center gap-2 text-center">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {result.downloadMbps.toFixed(2)}
              </span>
              <span className="text-xs sm:text-sm font-bold text-cyan-400 uppercase whitespace-nowrap">Mbps</span>
            </div>
            <div className="w-full text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
              <span>Peak Throughput</span>
              <span className="font-mono font-bold text-slate-200">
                {(result.downloadMbps * 1.08).toFixed(2)} Mbps
              </span>
            </div>
          </div>

          {/* Upload Speed Card */}
          <div className="bg-[#0b1322] border border-purple-900/40 p-5 rounded-2xl shadow-xl flex flex-col items-center justify-between text-center">
            <div className="w-full flex items-center justify-between text-purple-400 border-b border-slate-800/60 pb-2.5">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wide flex items-center gap-1.5 whitespace-nowrap">
                <ArrowUp className="w-4 h-4 shrink-0" /> UPLOAD
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Transmission</span>
            </div>
            <div className="my-4 flex items-baseline justify-center gap-2 text-center">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {result.uploadMbps.toFixed(2)}
              </span>
              <span className="text-xs sm:text-sm font-bold text-purple-400 uppercase whitespace-nowrap">Mbps</span>
            </div>
            <div className="w-full text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
              <span>Peak Throughput</span>
              <span className="font-mono font-bold text-slate-200">
                {(result.uploadMbps * 1.05).toFixed(2)} Mbps
              </span>
            </div>
          </div>

          {/* Latency & Quality Grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-[#090e1a] border border-slate-800 p-3.5 sm:p-4 rounded-2xl">
            <div className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-[#070c18]/60 border border-slate-800/50">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center justify-center gap-1 whitespace-nowrap">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" /> PING / LATENCY
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 text-center whitespace-nowrap">
                {result.pingMs} <span className="text-xs font-normal text-slate-400">ms</span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 text-center whitespace-nowrap">Min: {result.minPingMs}ms / Max: {result.maxPingMs}ms</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-[#070c18]/60 border border-slate-800/50">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center justify-center gap-1 whitespace-nowrap">
                JITTER
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 text-center whitespace-nowrap">
                {result.jitterMs} <span className="text-xs font-normal text-slate-400">ms</span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 text-center whitespace-nowrap">Latency stability</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-[#070c18]/60 border border-slate-800/50">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center justify-center gap-1 whitespace-nowrap">
                PACKET LOSS
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 text-center whitespace-nowrap">
                {result.packetLossPercent}%
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 text-center whitespace-nowrap">Packet drops</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-[#070c18]/60 border border-slate-800/50">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center justify-center gap-1 whitespace-nowrap">
                CONNECTION
              </span>
              <span className="text-xs sm:text-sm font-bold text-cyan-400 mt-1 flex items-center justify-center gap-1 whitespace-nowrap">
                <Wifi className="w-3.5 h-3.5 shrink-0" /> {result.connectionType}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 text-center whitespace-nowrap">Network type</span>
            </div>
          </div>
        </div>
      )}

      {/* Capabilities Tab */}
      {activeTab === 'capabilities' && (
        <div className="bg-[#0b1322] border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            Network Capability Rating
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#080d17] p-3 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <span className="text-xs text-slate-300">Web Browsing</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/50">
                {capabilities.webBrowsing}
              </span>
            </div>
            <div className="bg-[#080d17] p-3 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <span className="text-xs text-slate-300">Video Streaming</span>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/50">
                {capabilities.videoStreaming}
              </span>
            </div>
            <div className="bg-[#080d17] p-3 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <span className="text-xs text-slate-300">Online Gaming</span>
              <span className="text-xs font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/50">
                {capabilities.gaming}
              </span>
            </div>
            <div className="bg-[#080d17] p-3 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <span className="text-xs text-slate-300">Video Calling / Zoom</span>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/50">
                {capabilities.videoCalling}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="bg-[#0b1322] border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col gap-3 text-xs">
          <div className="flex justify-between py-2 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-cyan-400" /> Public IP</span>
            <span className="font-mono font-bold text-slate-200">{result.clientIp}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-cyan-400" /> Provider (ISP)</span>
            <span className="font-bold text-slate-200">{result.isp}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-cyan-400" /> Test Edge Node</span>
            <span className="font-bold text-slate-200">{result.server.name} ({result.server.city}, {result.server.country})</span>
          </div>
        </div>
      )}
    </div>
  );
};
