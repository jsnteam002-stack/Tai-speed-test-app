import React, { useState } from 'react';
import { SpeedTestServer } from '../types';
import { SERVER_SETUP_GUIDE } from '../data/servers';
import { X, Server, Plus, Check, Info } from 'lucide-react';

interface ServerModalProps {
  servers: SpeedTestServer[];
  selectedServer: SpeedTestServer | null;
  autoSelect: boolean;
  onSelectServer: (server: SpeedTestServer | null, auto: boolean) => void;
  onAddCustomServer: (server: SpeedTestServer) => void;
  onClose: () => void;
}

export const ServerModal: React.FC<ServerModalProps> = ({
  servers,
  selectedServer,
  autoSelect,
  onSelectServer,
  onAddCustomServer,
  onClose,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !baseUrl) return;
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const newServer: SpeedTestServer = {
      id: `custom-${Date.now()}`,
      name,
      country: 'Custom Server',
      city: 'User Node',
      countryCode: 'UN',
      sponsor: 'Custom Edge Server',
      pingUrl: `${cleanUrl}/api/speedtest/ping`,
      downloadUrl: `${cleanUrl}/api/speedtest/download`,
      uploadUrl: `${cleanUrl}/api/speedtest/upload`,
      isLocal: false,
      isConfigured: true,
      recommended: false,
    };
    onAddCustomServer(newServer);
    setName('');
    setBaseUrl('');
    setShowAdd(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1322] border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" /> Select Speed Test Server
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto Select Radio */}
        <div
          onClick={() => onSelectServer(null, true)}
          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
            autoSelect
              ? 'bg-cyan-950/40 border-cyan-500 text-white'
              : 'bg-[#070c18] border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold flex items-center gap-1.5">
              ⚡ Optimal Server (Auto-Select)
            </span>
            <span className="text-[11px] text-slate-400">Pings edge nodes and picks the lowest latency server.</span>
          </div>
          {autoSelect && <Check className="w-5 h-5 text-cyan-400" />}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Edge Servers</span>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-xs text-cyan-400 font-bold flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> {showAdd ? 'Cancel' : 'Add Custom'}
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} className="bg-[#070c18] p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Server Name (e.g. My Private Node)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
            <input
              type="url"
              placeholder="Base Endpoint URL (e.g. https://my-speed-node.com)"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
            <button
              type="submit"
              className="py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Add Server
            </button>
          </form>
        )}

        {/* Server List */}
        <div className="flex flex-col gap-2">
          {servers.map((srv) => {
            const isSelected = !autoSelect && selectedServer?.id === srv.id;
            return (
              <div
                key={srv.id}
                onClick={() => onSelectServer(srv, false)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 text-white'
                    : 'bg-[#070c18] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{srv.name}</span>
                  <span className="text-[11px] text-slate-400">{srv.city}, {srv.country} • {srv.sponsor}</span>
                </div>
                {isSelected && <Check className="w-5 h-5 text-cyan-400" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const GuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1322] border border-slate-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" /> Deploy Your Own Edge Node
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="prose prose-invert prose-xs text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed bg-[#070c18] p-4 rounded-2xl border border-slate-800">
          {SERVER_SETUP_GUIDE}
        </div>
      </div>
    </div>
  );
};
