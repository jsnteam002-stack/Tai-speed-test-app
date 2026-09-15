export type SpeedTestStage = 'idle' | 'finding_server' | 'ping' | 'download' | 'upload' | 'complete' | 'error';

export interface SpeedTestServer {
  id: string;
  name: string;
  country: string;
  city: string;
  countryCode: string;
  sponsor: string;
  pingUrl: string;
  downloadUrl: string;
  uploadUrl: string;
  isLocal: boolean;
  isConfigured: boolean;
  recommended: boolean;
  pingMs?: number;
}

export interface SpeedTestSample {
  timeMs: number;
  mbps: number;
  bytes: number;
}

export interface SpeedTestResult {
  id: string;
  timestamp: number;
  formattedDate: string;
  pingMs: number;
  minPingMs: number;
  maxPingMs: number;
  jitterMs: number;
  packetLossPercent: number;
  downloadMbps: number;
  uploadMbps: number;
  server: SpeedTestServer;
  clientIp: string;
  isp: string;
  connectionType: 'Wi-Fi' | 'Ethernet' | 'Mobile';
  downloadSamples: SpeedTestSample[];
  uploadSamples: SpeedTestSample[];
  pingSamples: number[];
}

export interface NetworkCapabilities {
  webBrowsing: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  videoStreaming: '4K Ultra HD' | '1080p Full HD' | '720p HD' | 'Buffer Prone';
  gaming: 'Pro Esports' | 'Smooth Online' | 'Casual' | 'High Latency';
  videoCalling: '4K Multi-party' | 'HD Call' | 'Standard SD' | 'Laggy';
  fileTransfer: 'Ultra Fast' | 'Fast' | 'Moderate' | 'Slow';
}
