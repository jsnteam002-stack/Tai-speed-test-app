import React, { useState } from 'react';
import { SpeedTestResult } from '../types';
import { X, Copy, Check, Share2, Facebook, Twitter } from 'lucide-react';

interface ShareModalProps {
  result: SpeedTestResult | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const shareText = `⚡ My TSI SpeedTest Results:\n⬇️ Download: ${result.downloadMbps} Mbps\n⬆️ Upload: ${result.uploadMbps} Mbps\n⏱️ Ping: ${result.pingMs} ms (Jitter: ${result.jitterMs}ms)\nProvider: ${result.isp}\nTested via TSI SpeedTest: ${window.location.origin}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(tweetUrl, '_blank');
  };

  const shareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`;
    window.open(fbUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1322] border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" /> Share Test Result
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#070c18] p-4 rounded-2xl border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
          {shareText}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleCopy}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Summary Text'}
          </button>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={shareTwitter}
              className="py-2 bg-sky-950/80 hover:bg-sky-900 border border-sky-800/50 text-sky-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Twitter className="w-4 h-4" /> Share on X
            </button>
            <button
              onClick={shareFacebook}
              className="py-2 bg-blue-950/80 hover:bg-blue-900 border border-blue-800/50 text-blue-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Facebook className="w-4 h-4" /> Share on Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
