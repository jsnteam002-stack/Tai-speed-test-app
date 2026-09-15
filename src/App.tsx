import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Speedometer } from './components/Speedometer';
import { ResultCard } from './components/ResultCard';
import { HistoryView } from './components/HistoryView';
import { ShareModal } from './components/ShareModal';
import { ServerModal, GuideModal } from './components/Modals';
import { PrivacyPolicyModal, TermsOfServiceModal, ContactUsModal } from './components/LegalModals';
import { Footer } from './components/Footer';
import { AdBanner } from './components/AdBanner';
import { DEFAULT_SERVERS } from './data/servers';
import { SpeedTestServer, SpeedTestResult, SpeedTestStage, SpeedTestSample } from './types';
import { speedTestService } from './services/speedTestEngine';
import { getHistory, saveResultToHistory, clearHistory, deleteResultFromHistory } from './services/historyService';
import { fetchClientIpInfo, detectConnectionType } from './services/ipService';
import { calculateCapabilities } from './utils/capabilityDetector';
import { Language, TRANSLATIONS } from './utils/translations';
import { ArrowDown, ArrowUp, Zap, Server, Shield, Wifi, AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('EN');
  const [activeTab, setActiveTab] = useState<'test' | 'history' | 'insights'>('test');

  // Server state
  const [servers, setServers] = useState<SpeedTestServer[]>(DEFAULT_SERVERS);
  const [selectedServer, setSelectedServer] = useState<SpeedTestServer | null>(DEFAULT_SERVERS[0]);
  const [autoSelectServer, setAutoSelectServer] = useState<boolean>(true);

  // Client IP & Provider state
  const [clientIp, setClientIp] = useState<string>('Loading IP...');
  const [isp, setIsp] = useState<string>('Detecting Provider...');
  const [connectionType, setConnectionType] = useState<'Wi-Fi' | 'Ethernet' | 'Mobile'>('Wi-Fi');

  // Test execution state
  const [stage, setStage] = useState<SpeedTestStage>('idle');
  const [stageMessage, setStageMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live measurement values
  const [liveMbps, setLiveMbps] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [livePing, setLivePing] = useState<number | null>(null);
  const [liveJitter, setLiveJitter] = useState<number | null>(null);
  const [liveDownload, setLiveDownload] = useState<number | null>(null);
  const [liveUpload, setLiveUpload] = useState<number | null>(null);

  // Results & History state
  const [currentResult, setCurrentResult] = useState<SpeedTestResult | null>(null);
  const [history, setHistory] = useState<SpeedTestResult[]>([]);

  // Modals
  const [showServerModal, setShowServerModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [shareResult, setShareResult] = useState<SpeedTestResult | null>(null);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS['EN'];

  // Initialize client IP info & load history
  useEffect(() => {
    setHistory(getHistory());
    setConnectionType(detectConnectionType());

    fetchClientIpInfo().then((info) => {
      setClientIp(info.ip);
      setIsp(info.isp);
    });
  }, []);

  // Run speed test
  const handleStartTest = useCallback(() => {
    setErrorMessage(null);
    setLiveMbps(0);
    setProgressPercent(0);
    setLivePing(null);
    setLiveJitter(null);
    setLiveDownload(null);
    setLiveUpload(null);

    speedTestService.runTest(
      servers,
      selectedServer,
      autoSelectServer,
      clientIp,
      isp,
      connectionType,
      {
        onStageChange: (newStage, msg) => {
          setStage(newStage);
          setStageMessage(msg || '');
        },
        onServerSelected: (server) => {
          setSelectedServer(server);
        },
        onDownloadProgress: (mbps, _bytes, percent, _samples) => {
          setLiveMbps(mbps);
          setLiveDownload(mbps);
          setProgressPercent(percent);
        },
        onUploadProgress: (mbps, _bytes, percent, _samples) => {
          setLiveMbps(mbps);
          setLiveUpload(mbps);
          setProgressPercent(percent);
        },
        onComplete: (result) => {
          setCurrentResult(result);
          setLivePing(result.pingMs);
          setLiveJitter(result.jitterMs);
          setLiveDownload(result.downloadMbps);
          setLiveUpload(result.uploadMbps);
          const updated = saveResultToHistory(result);
          setHistory(updated);
        },
        onError: (err) => {
          setErrorMessage(err);
        },
      }
    );
  }, [servers, selectedServer, autoSelectServer, clientIp, isp, connectionType]);

  const handleCancelTest = () => {
    speedTestService.cancel();
    setStage('idle');
    setLiveMbps(0);
    setProgressPercent(0);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleDeleteHistoryResult = (id: string) => {
    const updated = deleteResultFromHistory(id);
    setHistory(updated);
  };

  const handleAddCustomServer = (newServer: SpeedTestServer) => {
    setServers(prev => [newServer, ...prev]);
    setSelectedServer(newServer);
    setAutoSelectServer(false);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Header Navigation */}
      <Header
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        onOpenServerModal={() => setShowServerModal(true)}
        onOpenGuideModal={() => setShowGuideModal(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col items-center">
        {/* Ad Placement: Top Banner */}
        <AdBanner label="Advertisement" />

        {/* Tab 1: Speed Test Stage */}
        {activeTab === 'test' && (
          <div className="w-full flex flex-col items-center gap-6 mt-2">
            {/* Error Banner with Retry Button */}
            {stage === 'error' && errorMessage && (
              <div className="w-full max-w-xl bg-rose-950/80 border border-rose-800 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-200 shadow-xl animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={handleStartTest}
                  className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow transition shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t.retryTest || 'Retry Test'}
                </button>
              </div>
            )}

            {/* Network Info Strip */}
            <div className="w-full max-w-4xl bg-[#0e1626] border border-slate-800/80 p-3.5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shadow-lg">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.clientIp}</span>
                  <span className="font-mono font-bold text-slate-200 truncate">{clientIp}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.isp}</span>
                  <span className="font-bold text-slate-200 truncate">{isp}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.server}</span>
                  <span className="font-bold text-slate-200 truncate">
                    {autoSelectServer ? '⚡ Auto Optimal' : selectedServer?.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.connection}</span>
                  <span className="font-bold text-slate-200 truncate">{connectionType}</span>
                </div>
              </div>
            </div>

            {/* Live Metrics Row during test */}
            <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className={`p-2.5 sm:p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition ${stage === 'ping' ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/30' : 'bg-[#090e1a] border-slate-800'}`}>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-slate-400 flex items-center justify-center gap-1 whitespace-nowrap">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" /> PING
                </span>
                <span className="text-lg sm:text-2xl font-black text-white font-mono mt-1 text-center whitespace-nowrap">
                  {livePing !== null ? `${livePing} ms` : '—'}
                </span>
              </div>

              <div className={`p-2.5 sm:p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition ${stage === 'ping' ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/30' : 'bg-[#090e1a] border-slate-800'}`}>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-slate-400 flex items-center justify-center gap-1 whitespace-nowrap">
                  JITTER
                </span>
                <span className="text-lg sm:text-2xl font-black text-white font-mono mt-1 text-center whitespace-nowrap">
                  {liveJitter !== null ? `${liveJitter} ms` : '—'}
                </span>
              </div>

              <div className={`p-2.5 sm:p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition ${stage === 'download' ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/30' : 'bg-[#090e1a] border-slate-800'}`}>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-slate-400 flex items-center justify-center gap-1 whitespace-nowrap">
                  <ArrowDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> DOWNLOAD
                </span>
                <span className="text-lg sm:text-2xl font-black text-white font-mono mt-1 text-center whitespace-nowrap">
                  {liveDownload !== null ? `${liveDownload.toFixed(1)} Mbps` : '—'}
                </span>
              </div>

              <div className={`p-2.5 sm:p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition ${stage === 'upload' ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/30' : 'bg-[#090e1a] border-slate-800'}`}>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-slate-400 flex items-center justify-center gap-1 whitespace-nowrap">
                  <ArrowUp className="w-3.5 h-3.5 text-purple-400 shrink-0" /> UPLOAD
                </span>
                <span className="text-lg sm:text-2xl font-black text-white font-mono mt-1 text-center whitespace-nowrap">
                  {liveUpload !== null ? `${liveUpload.toFixed(1)} Mbps` : '—'}
                </span>
              </div>
            </div>

            {/* Animated Gauge or Active Result Card */}
            <AnimatePresence mode="wait">
              {stage !== 'complete' ? (
                <motion.div
                  key="speedometer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="flex flex-col items-center w-full"
                >
                  <Speedometer
                    value={liveMbps}
                    stage={stage}
                    stageMessage={stageMessage}
                    onStart={handleStartTest}
                    progressPercent={progressPercent}
                  />
                  {(stage === 'download' || stage === 'upload' || stage === 'ping') && (
                    <button
                      onClick={handleCancelTest}
                      className="mt-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
                    >
                      Cancel Test
                    </button>
                  )}
                </motion.div>
              ) : (
                currentResult && (
                  <motion.div
                    key="result-card"
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.97 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-4xl"
                  >
                    <ResultCard
                      result={currentResult}
                      onRetry={handleStartTest}
                      onOpenShare={(res) => setShareResult(res)}
                    />
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tab 2: History View */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteResult={handleDeleteHistoryResult}
            onSelectResult={(res) => {
              setCurrentResult(res);
              setActiveTab('test');
              setStage('complete');
            }}
          />
        )}

        {/* Tab 3: Insights View */}
        {activeTab === 'insights' && currentResult && (
          <div className="w-full max-w-4xl py-4 px-2 flex flex-col gap-4">
            <div className="bg-[#0e1726] border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col gap-3">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Network Quality & Capabilities Analysis
              </h3>
              <p className="text-xs text-slate-400">
                Calculated based on real throughput, jitter, and round-trip ping latency from your last speed test.
              </p>

              {(() => {
                const caps = calculateCapabilities(currentResult);
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div className="bg-[#080d17] p-4 rounded-xl border border-slate-800/80">
                      <span className="text-xs text-slate-400 block font-medium">Web Browsing & Social</span>
                      <span className="text-lg font-black text-emerald-400 mt-1 block">{caps.webBrowsing}</span>
                    </div>

                    <div className="bg-[#080d17] p-4 rounded-xl border border-slate-800/80">
                      <span className="text-xs text-slate-400 block font-medium">Video Streaming</span>
                      <span className="text-lg font-black text-cyan-400 mt-1 block">{caps.videoStreaming}</span>
                    </div>

                    <div className="bg-[#080d17] p-4 rounded-xl border border-slate-800/80">
                      <span className="text-xs text-slate-400 block font-medium">Online Gaming</span>
                      <span className="text-lg font-black text-purple-400 mt-1 block">{caps.gaming}</span>
                    </div>

                    <div className="bg-[#080d17] p-4 rounded-xl border border-slate-800/80">
                      <span className="text-xs text-slate-400 block font-medium">Video Conferencing</span>
                      <span className="text-lg font-black text-amber-400 mt-1 block">{caps.videoCalling}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Ad Placement: Bottom Banner */}
        <AdBanner label="Sponsored Banner" className="mt-6" />
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        onOpenTerms={() => setShowTermsModal(true)}
        onOpenContact={() => setShowContactModal(true)}
        onOpenServers={() => setShowServerModal(true)}
        onOpenGuide={() => setShowGuideModal(true)}
      />

      {/* Modals */}
      {showServerModal && (
        <ServerModal
          servers={servers}
          selectedServer={selectedServer}
          autoSelect={autoSelectServer}
          onSelectServer={(srv, auto) => {
            setSelectedServer(srv);
            setAutoSelectServer(auto);
            setShowServerModal(false);
          }}
          onAddCustomServer={handleAddCustomServer}
          onClose={() => setShowServerModal(false)}
        />
      )}

      {showGuideModal && <GuideModal onClose={() => setShowGuideModal(false)} />}
      {showPrivacyModal && <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />}
      {showTermsModal && <TermsOfServiceModal onClose={() => setShowTermsModal(false)} />}
      {showContactModal && <ContactUsModal onClose={() => setShowContactModal(false)} />}
      {shareResult && <ShareModal result={shareResult} onClose={() => setShareResult(null)} />}
    </div>
  );
}
