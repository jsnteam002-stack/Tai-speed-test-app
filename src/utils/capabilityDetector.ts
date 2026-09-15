import { NetworkCapabilities, SpeedTestResult } from '../types';

export function calculateCapabilities(result: SpeedTestResult): NetworkCapabilities {
  const { downloadMbps, uploadMbps, pingMs, jitterMs } = result;

  // 1. Web Browsing
  let webBrowsing: NetworkCapabilities['webBrowsing'] = 'Poor';
  if (downloadMbps >= 25 && pingMs < 50) webBrowsing = 'Excellent';
  else if (downloadMbps >= 10 && pingMs < 100) webBrowsing = 'Good';
  else if (downloadMbps >= 3) webBrowsing = 'Fair';

  // 2. Video Streaming
  let videoStreaming: NetworkCapabilities['videoStreaming'] = 'Buffer Prone';
  if (downloadMbps >= 40 && pingMs < 80) videoStreaming = '4K Ultra HD';
  else if (downloadMbps >= 15) videoStreaming = '1080p Full HD';
  else if (downloadMbps >= 5) videoStreaming = '720p HD';

  // 3. Gaming
  let gaming: NetworkCapabilities['gaming'] = 'High Latency';
  if (pingMs <= 25 && jitterMs <= 10 && downloadMbps >= 25) gaming = 'Pro Esports';
  else if (pingMs <= 55 && jitterMs <= 20 && downloadMbps >= 10) gaming = 'Smooth Online';
  else if (pingMs <= 100 && downloadMbps >= 4) gaming = 'Casual';

  // 4. Video Calling
  let videoCalling: NetworkCapabilities['videoCalling'] = 'Laggy';
  if (downloadMbps >= 20 && uploadMbps >= 10 && pingMs < 40) videoCalling = '4K Multi-party';
  else if (downloadMbps >= 8 && uploadMbps >= 4 && pingMs < 80) videoCalling = 'HD Call';
  else if (downloadMbps >= 2 && uploadMbps >= 1) videoCalling = 'Standard SD';

  // 5. File Transfer
  let fileTransfer: NetworkCapabilities['fileTransfer'] = 'Slow';
  if (downloadMbps >= 100 && uploadMbps >= 30) fileTransfer = 'Ultra Fast';
  else if (downloadMbps >= 35 && uploadMbps >= 10) fileTransfer = 'Fast';
  else if (downloadMbps >= 10 && uploadMbps >= 3) fileTransfer = 'Moderate';

  return {
    webBrowsing,
    videoStreaming,
    gaming,
    videoCalling,
    fileTransfer,
  };
}
