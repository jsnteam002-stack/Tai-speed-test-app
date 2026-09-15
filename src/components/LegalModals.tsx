import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Mail, Copy, Check, Send } from 'lucide-react';

interface ModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0b1322] border border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" /> Privacy Policy
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-300 space-y-4 leading-relaxed font-sans">
          <p className="text-slate-400">
            Last Updated: <span className="text-cyan-400 font-medium">September 2026</span>
          </p>

          <section className="bg-[#070c18] p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <h4 className="text-sm font-bold text-white">1. Information We Collect</h4>
            <p>
              <strong>TSI SpeedTest</strong> measures network metrics including Ping, Jitter, Download Speed, Upload Speed, and Packet Loss. To deliver these results, we detect transient technical data such as:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Your public IP address & Internet Service Provider (ISP) name.</li>
              <li>Browser user agent and connection type (Wi-Fi, Ethernet, Mobile).</li>
              <li>Diagnostic throughput samples generated during active speed tests.</li>
            </ul>
          </section>

          <section className="bg-[#070c18] p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <h4 className="text-sm font-bold text-white">2. Local Browser Storage</h4>
            <p>
              Your speed test history is saved locally inside your web browser via HTML5 <code className="text-cyan-400">localStorage</code>. This data never leaves your device unless you explicitly export or share a result card. You can clear your history anytime through the app settings.
            </p>
          </section>

          <section className="bg-[#070c18] p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <h4 className="text-sm font-bold text-white">3. Third-Party Ads & Google AdSense</h4>
            <p>
              We use third-party advertising partners, including <strong>Google AdSense</strong>, to serve non-intrusive advertisements when you visit <strong>TSI SpeedTest</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Google uses cookies (such as the DART cookie) to serve ads based on user visits to this website and other websites on the Internet.</li>
              <li>Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline hover:text-cyan-300">Google Ad Settings</a>.</li>
            </ul>
          </section>

          <section className="bg-[#070c18] p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <h4 className="text-sm font-bold text-white">4. Data Security & Contact</h4>
            <p>
              We prioritize data privacy and do not sell or trade your IP or network logs to third parties. If you have questions regarding this Privacy Policy, please email us at <a href="mailto:jsnteam002@gmail.com" className="text-cyan-400 font-bold underline">jsnteam002@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const TermsOfServiceModal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0b1322] border border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Terms of Service
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-300 space-y-4 leading-relaxed font-sans">
          <p className="text-slate-400">
            Welcome to <strong className="text-white">TSI SpeedTest</strong>. By using our website and edge nodes, you agree to these Terms of Service.
          </p>

          <section className="bg-[#070c18] p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <h4 className="text-sm font-bold text-white">1. Permitted Bandwidth Testing Usage</h4>
            <p>
              TSI SpeedTest provides real-time network throughput and latency benchmarks for personal and diagnostic utility. You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Launch denial-of-service (DoS) or automated script attacks against our edge server endpoints.</li>
              <li>Reverse-engineer or overwhelm testing endpoints outside of reasonable speed test frequencies.</li>
            </ul>
          </section>

          <section className="bg-[#070c18] p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <h4 className="text-sm font-bold text-white">2. Test Result Accuracy & Disclaimer</h4>
            <p>
              Speed test results depend on local Wi-Fi congestion, device hardware, ISP routing, and remote node loads. All measurements provided by <strong>TSI SpeedTest</strong> are for informational purposes only and do not constitute a legal SLA guarantee with your Internet Provider.
            </p>
          </section>

          <section className="bg-[#070c18] p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <h4 className="text-sm font-bold text-white">3. Limitation of Liability</h4>
            <p>
              TSI SpeedTest and its owners shall not be liable for any direct, indirect, incidental, or consequential damages resulting from network testing, bandwidth usage charges from your mobile carrier, or reliance on network quality scores.
            </p>
          </section>

          <section className="bg-[#070c18] p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <h4 className="text-sm font-bold text-white">4. Inquiries</h4>
            <p>
              For legal notice or terms inquiry, contact <a href="mailto:jsnteam002@gmail.com" className="text-cyan-400 font-bold underline">jsnteam002@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const ContactUsModal: React.FC<ModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const email = 'jsnteam002@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(mailtoUrl, '_blank');
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setSubject('');
      setMessage('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0b1322] border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" /> Contact Support & Feedback
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Email Block */}
        <div className="bg-[#070c18] p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col text-center sm:text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Email Support</span>
            <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{email}</span>
          </div>
          <button
            onClick={handleCopyEmail}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Email'}
          </button>
        </div>

        {/* Quick Message Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Subject</label>
            <input
              type="text"
              placeholder="e.g. Server Node Suggestion / Bug Report"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-[#070c18] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Message</label>
            <textarea
              rows={4}
              placeholder="Describe your inquiry or feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-[#070c18] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition resize-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Send className="w-4 h-4" /> Send Email Message
          </button>

          {sent && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs text-center rounded-xl font-medium animate-fade-in">
              Opening your default email client to send message...
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
