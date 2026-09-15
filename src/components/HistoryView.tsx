import React from 'react';
import { SpeedTestResult } from '../types';
import { Trash2, ArrowDown, ArrowUp, Zap, Calendar, ExternalLink } from 'lucide-react';

interface HistoryViewProps {
  history: SpeedTestResult[];
  onClearHistory: () => void;
  onDeleteResult: (id: string) => void;
  onSelectResult: (result: SpeedTestResult) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onDeleteResult,
  onSelectResult,
}) => {
  if (history.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 text-center bg-[#090e1a] border border-slate-800 rounded-3xl">
        <h3 className="text-lg font-bold text-slate-300">No Previous Test History</h3>
        <p className="text-xs text-slate-500 mt-1">Run your first speed test to store results locally.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2 flex flex-col gap-4">
      <div className="flex items-center justify-between bg-[#0e1726] border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Speed Test History</h3>
          <p className="text-xs text-slate-400">Stored locally in your browser ({history.length} records)</p>
        </div>
        <button
          onClick={onClearHistory}
          className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectResult(item)}
            className="group bg-[#0b1322] hover:bg-[#0f1b30] border border-slate-800 hover:border-cyan-800/60 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{item.formattedDate}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] text-cyan-300">{item.id}</span>
              </div>
              <span className="text-xs font-medium text-slate-300">{item.server.name} ({item.isp})</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-0.5">
                    <ArrowDown className="w-3 h-3 text-cyan-400" /> Download
                  </span>
                  <span className="text-base font-black text-white font-mono">{item.downloadMbps.toFixed(2)} Mbps</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-0.5">
                    <ArrowUp className="w-3 h-3 text-purple-400" /> Upload
                  </span>
                  <span className="text-base font-black text-white font-mono">{item.uploadMbps.toFixed(2)} Mbps</span>
                </div>
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-0.5">
                    <Zap className="w-3 h-3 text-amber-400" /> Ping
                  </span>
                  <span className="text-base font-black text-white font-mono">{item.pingMs} ms</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteResult(item.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
