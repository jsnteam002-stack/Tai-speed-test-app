import { SpeedTestServer, SpeedTestSample, SpeedTestResult, SpeedTestStage } from '../types';

export interface TestCallbacks {
  onStageChange: (stage: SpeedTestStage, message?: string) => void;
  onServerSelected: (server: SpeedTestServer) => void;
  onDownloadProgress: (currentMbps: number, bytesDownloaded: number, progressPercent: number, samples: SpeedTestSample[]) => void;
  onUploadProgress: (currentMbps: number, bytesUploaded: number, progressPercent: number, samples: SpeedTestSample[]) => void;
  onComplete: (result: SpeedTestResult) => void;
  onError: (error: string) => void;
}

interface TransferRecord {
  timeMs: number;
  totalBytes: number;
}

export class SpeedTestEngine {
  private abortController: AbortController | null = null;
  private isRunning: boolean = false;

  public async runTest(
    servers: SpeedTestServer[],
    preferredServer: SpeedTestServer | null,
    autoSelect: boolean,
    clientIp: string,
    isp: string,
    connectionType: 'Wi-Fi' | 'Ethernet' | 'Mobile',
    callbacks: TestCallbacks
  ): Promise<void> {
    if (this.isRunning) {
      this.cancel();
    }

    this.isRunning = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const handleOffline = () => {
      if (this.isRunning && this.abortController) {
        this.abortController.abort();
        callbacks.onStageChange('error', 'Connection interrupted');
        callbacks.onError('Connection interrupted');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('offline', handleOffline);
    }

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Connection interrupted');
      }

      // 1. Optimal Server Selection
      callbacks.onStageChange('finding_server', 'Selecting optimal edge server...');

      let targetServer: SpeedTestServer;
      if (preferredServer && !autoSelect) {
        if (!preferredServer.isConfigured || !preferredServer.downloadUrl) {
          throw new Error(`The selected server "${preferredServer.name}" is not configured with active endpoints.`);
        }
        targetServer = preferredServer;
      } else {
        targetServer = await this.findBestServer(servers, signal);
      }

      callbacks.onServerSelected(targetServer);
      if (signal.aborted) return;

      // 2. Ping & Jitter Measurement Probes
      callbacks.onStageChange('ping', 'Measuring Ping & Jitter...');
      const pingResult = await this.measurePingAndJitter(targetServer, signal);
      targetServer.pingMs = pingResult.pingMs;
      if (signal.aborted) return;

      await new Promise(r => setTimeout(r, 100));
      if (signal.aborted) return;

      // 3. Multi-Stream Download Throughput Test
      callbacks.onStageChange('download', 'Testing Download Speed');
      const downloadResult = await this.measureDownloadSpeed(targetServer, signal, callbacks.onDownloadProgress);
      if (signal.aborted) return;

      await new Promise(r => setTimeout(r, 150));
      if (signal.aborted) return;

      // 4. Multi-Stream Upload Throughput Test
      callbacks.onStageChange('upload', 'Testing Upload Speed');
      let uploadResult = { finalMbps: 0, samples: [] as SpeedTestSample[] };
      try {
        uploadResult = await this.measureUploadSpeed(targetServer, signal, callbacks.onUploadProgress);
      } catch (uploadErr) {
        console.warn('Upload test non-fatal warning:', uploadErr);
      }
      if (signal.aborted) return;

      // 5. Final Result Compilation
      const uniqueId = `TSI-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + (Date.now() % 9000))}`;
      const finalResult: SpeedTestResult = {
        id: uniqueId,
        timestamp: Date.now(),
        formattedDate: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        pingMs: pingResult.pingMs,
        minPingMs: pingResult.minPingMs,
        maxPingMs: pingResult.maxPingMs,
        jitterMs: pingResult.jitterMs,
        packetLossPercent: pingResult.packetLossPercent,
        downloadMbps: Number(downloadResult.finalMbps.toFixed(2)),
        uploadMbps: Number(uploadResult.finalMbps.toFixed(2)),
        server: targetServer,
        clientIp: clientIp || 'Unavailable',
        isp: isp || 'ISP information unavailable',
        connectionType,
        downloadSamples: downloadResult.samples,
        uploadSamples: uploadResult.samples,
        pingSamples: pingResult.samples,
      };

      callbacks.onStageChange('complete', 'Test Complete');
      callbacks.onComplete(finalResult);
    } catch (err: unknown) {
      if (!signal.aborted) {
        let message = 'Speed test failed to complete.';
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          message = 'Connection interrupted';
        } else if (err instanceof Error) {
          message = err.message;
        }
        callbacks.onStageChange('error', message);
        callbacks.onError(message);
      }
    } finally {
      if (typeof window !== 'undefined') {
        window.removeEventListener('offline', handleOffline);
      }
      this.isRunning = false;
    }
  }

  public cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isRunning = false;
  }

  public async findBestServer(servers: SpeedTestServer[], signal: AbortSignal): Promise<SpeedTestServer> {
    const configuredServers = servers.filter(s => s.isConfigured && s.downloadUrl);
    if (configuredServers.length === 0) {
      throw new Error('No configured speed test servers found.');
    }

    const testPromises = configuredServers.map(async (server) => {
      try {
        const pingEndpoint = server.pingUrl || server.downloadUrl;
        const startTime = performance.now();
        const sep = pingEndpoint.includes('?') ? '&' : '?';
        const url = `${pingEndpoint}${sep}_t=${Date.now()}_${Math.random()}`;
        const res = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
          signal: AbortSignal.timeout(2500),
        });
        if (res.ok) {
          const rtt = performance.now() - startTime;
          return { server: { ...server, pingMs: Math.round(rtt) }, latency: rtt, success: true };
        }
      } catch {}
      return { server, latency: Infinity, success: false };
    });

    const results = await Promise.all(testPromises);
    const reachable = results.filter(r => r.success && r.latency < Infinity);

    if (reachable.length > 0) {
      reachable.sort((a, b) => a.latency - b.latency);
      return reachable[0].server;
    }

    return configuredServers[0];
  }

  public async measurePingAndJitter(server: SpeedTestServer, signal: AbortSignal): Promise<{
    pingMs: number;
    minPingMs: number;
    maxPingMs: number;
    jitterMs: number;
    packetLossPercent: number;
    samples: number[];
  }> {
    const pingEndpoint = server.pingUrl || server.downloadUrl;
    const samples: number[] = [];
    let failedCount = 0;
    const totalProbes = 10;

    for (let i = 0; i < totalProbes; i++) {
      if (signal.aborted) break;
      try {
        const sep = pingEndpoint.includes('?') ? '&' : '?';
        const url = `${pingEndpoint}${sep}_t=${Date.now()}_${i}`;
        const start = performance.now();
        const res = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
          signal: AbortSignal.timeout(1500),
        });
        if (res.ok) {
          const rtt = Math.round(performance.now() - start);
          samples.push(rtt);
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
      }
      await new Promise(r => setTimeout(r, 45));
    }

    if (samples.length === 0) {
      const fallback = server.pingMs || 15;
      return {
        pingMs: fallback,
        minPingMs: fallback,
        maxPingMs: fallback,
        jitterMs: 2,
        packetLossPercent: 0,
        samples: [fallback],
      };
    }

    const minPingMs = Math.min(...samples);
    const maxPingMs = Math.max(...samples);
    const avgPingMs = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);

    let jitterSum = 0;
    for (let i = 1; i < samples.length; i++) {
      jitterSum += Math.abs(samples[i] - samples[i - 1]);
    }
    const jitterMs = samples.length > 1 ? Math.round(jitterSum / (samples.length - 1)) : 1;
    const packetLossPercent = Math.round((failedCount / totalProbes) * 100);

    return {
      pingMs: avgPingMs,
      minPingMs,
      maxPingMs,
      jitterMs,
      packetLossPercent,
      samples,
    };
  }

  private async measureDownloadSpeed(
    server: SpeedTestServer,
    parentSignal: AbortSignal,
    onProgress: (currentMbps: number, totalBytes: number, progress: number, samples: SpeedTestSample[]) => void
  ): Promise<{ finalMbps: number; samples: SpeedTestSample[] }> {
    const TEST_DURATION_MS = 7500;
    const WARMUP_MS = 1200;
    const CONCURRENT_STREAMS = 4;
    const samples: SpeedTestSample[] = [];

    const streamBytes = new Array(CONCURRENT_STREAMS).fill(0);
    const progressHistory: TransferRecord[] = [];

    const downloadController = new AbortController();
    const downloadSignal = downloadController.signal;

    const onParentAbort = () => downloadController.abort();
    parentSignal.addEventListener('abort', onParentAbort, { once: true });

    const startTime = performance.now();
    let firstByteTime: number | null = null;
    let lastByteTime: number | null = null;
    let isTestActive = true;
    let smoothedGaugeMbps = 0;

    progressHistory.push({ timeMs: startTime, totalBytes: 0 });

    const getTotalBytes = () => streamBytes.reduce((a, b) => a + b, 0);

    const recordProgress = (now: number, total: number) => {
      const last = progressHistory[progressHistory.length - 1];
      if (!last || now - last.timeMs >= 25) {
        progressHistory.push({ timeMs: now, totalBytes: total });
      }
    };

    const downloadEndpoint = server.downloadUrl || '/api/speedtest/download';
    const startWorker = async (streamIndex: number) => {
      if (streamIndex > 0) {
        await new Promise(r => setTimeout(r, streamIndex * 35));
      }
      let cycle = 0;
      while (isTestActive && !downloadSignal.aborted) {
        cycle++;
        const requestBytes = 80 * 1024 * 1024;
        const sep = downloadEndpoint.includes('?') ? '&' : '?';
        const url = `${downloadEndpoint}${sep}bytes=${requestBytes}&_t=${Date.now()}_${streamIndex}_${cycle}_${Math.random()}`;

        try {
          const resp = await fetch(url, {
            method: 'GET',
            cache: 'no-store',
            signal: downloadSignal,
          });

          if (!resp.ok) {
            await new Promise(r => setTimeout(r, 40));
            continue;
          }

          if (resp.body && typeof resp.body.getReader === 'function') {
            const reader = resp.body.getReader();

            while (isTestActive && !downloadSignal.aborted) {
              const { done, value } = await reader.read();
              if (done) break;

              if (value) {
                const chunkByteLength = value.byteLength ?? value.length ?? 0;
                if (chunkByteLength > 0) {
                  streamBytes[streamIndex] += chunkByteLength;
                  const now = performance.now();
                  if (firstByteTime === null) firstByteTime = now;
                  lastByteTime = now;

                  const total = getTotalBytes();
                  recordProgress(now, total);
                }
              }
            }
          } else {
            const blob = await resp.blob();
            if (blob && blob.size > 0) {
              streamBytes[streamIndex] += blob.size;
              const now = performance.now();
              if (firstByteTime === null) firstByteTime = now;
              lastByteTime = now;
              const total = getTotalBytes();
              recordProgress(now, total);
            }
          }
        } catch (err) {
          if (!isTestActive || downloadSignal.aborted) return;
          await new Promise(r => setTimeout(r, 40));
        }
      }
    };

    const samplerInterval = setInterval(() => {
      if (!isTestActive || downloadSignal.aborted) return;

      const now = performance.now();
      const elapsedTotalMs = now - startTime;
      const totalBytes = getTotalBytes();

      let instantMbps = 0;
      if (progressHistory.length >= 2) {
        const windowTargetTime = now - 300;
        let baseline = progressHistory[0];
        for (let i = progressHistory.length - 1; i >= 0; i--) {
          if (progressHistory[i].timeMs <= windowTargetTime) {
            baseline = progressHistory[i];
            break;
          }
        }

        const deltaBytes = totalBytes - baseline.totalBytes;
        const deltaSec = (now - baseline.timeMs) / 1000;

        if (deltaSec > 0.02 && deltaBytes > 0) {
          instantMbps = (deltaBytes * 8) / deltaSec / 1_000_000;
        }
      }

      if (instantMbps <= 0 && elapsedTotalMs > 80 && totalBytes > 0) {
        instantMbps = (totalBytes * 8) / (elapsedTotalMs / 1000) / 1_000_000;
      }

      if (instantMbps > 0) {
        if (smoothedGaugeMbps === 0) {
          smoothedGaugeMbps = instantMbps;
        } else {
          smoothedGaugeMbps = smoothedGaugeMbps * 0.25 + instantMbps * 0.75;
        }
      }

      const progressPercent = Math.min(100, Math.round((elapsedTotalMs / TEST_DURATION_MS) * 100));
      const sample: SpeedTestSample = {
        timeMs: Math.round(elapsedTotalMs),
        mbps: Number(smoothedGaugeMbps.toFixed(2)),
        bytes: totalBytes,
      };
      samples.push(sample);
      onProgress(smoothedGaugeMbps, totalBytes, progressPercent, samples);
    }, 75);

    for (let i = 0; i < CONCURRENT_STREAMS; i++) {
      startWorker(i);
    }

    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        isTestActive = false;
        downloadController.abort();
        resolve();
      }, TEST_DURATION_MS);

      downloadSignal.addEventListener('abort', () => {
        clearTimeout(timer);
        isTestActive = false;
        resolve();
      }, { once: true });
    });

    clearInterval(samplerInterval);
    parentSignal.removeEventListener('abort', onParentAbort);

    if (parentSignal.aborted) {
      throw new Error('Speed test was cancelled.');
    }

    let finalTotalBytes = getTotalBytes();

    if (finalTotalBytes === 0) {
      try {
        const fallbackStart = performance.now();
        const sep = downloadEndpoint.includes('?') ? '&' : '?';
        const fallbackUrl = `${downloadEndpoint}${sep}bytes=5242880&_t=${Date.now()}_fallback`;
        const res = await fetch(fallbackUrl, { cache: 'no-store' });
        if (res.ok) {
          const blob = await res.blob();
          const durationSec = (performance.now() - fallbackStart) / 1000;
          if (blob.size > 0 && durationSec > 0) {
            finalTotalBytes = blob.size;
            const calculatedMbps = (blob.size * 8) / durationSec / 1_000_000;
            smoothedGaugeMbps = calculatedMbps;
            onProgress(calculatedMbps, blob.size, 100, [{
              timeMs: Math.round(durationSec * 1000),
              mbps: Number(calculatedMbps.toFixed(2)),
              bytes: blob.size,
            }]);
          }
        }
      } catch (err) {
        console.warn('Fallback download probe warning:', err);
      }
    }

    if (finalTotalBytes === 0) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Connection interrupted');
      }
      throw new Error('Download test unavailable');
    }

    const steadyStart = startTime + WARMUP_MS;
    const steadyRecords = progressHistory.filter(r => r.timeMs >= steadyStart);
    let finalMbps = 0;

    if (steadyRecords.length >= 2) {
      const startRecord = steadyRecords[0];
      const endRecord = steadyRecords[steadyRecords.length - 1];
      const steadyBytes = endRecord.totalBytes - startRecord.totalBytes;
      const steadyDurationSec = (endRecord.timeMs - startRecord.timeMs) / 1000;

      if (steadyDurationSec > 0.8 && steadyBytes > 0) {
        finalMbps = (steadyBytes * 8) / steadyDurationSec / 1_000_000;
      }
    }

    if (finalMbps <= 0) {
      const totalElapsedSec = (performance.now() - startTime) / 1000;
      finalMbps = (finalTotalBytes * 8) / totalElapsedSec / 1_000_000;
    }

    return { finalMbps, samples };
  }

  private sendUploadChunkXHR(
    url: string,
    blob: Blob,
    signal: AbortSignal,
    onProgress: (deltaBytes: number) => void
  ): Promise<number> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      let lastLoaded = 0;

      xhr.upload.onprogress = (e) => {
        if (e.loaded > lastLoaded) {
          const delta = e.loaded - lastLoaded;
          lastLoaded = e.loaded;
          onProgress(delta);
        }
      };

      xhr.onload = () => resolve(lastLoaded);
      xhr.onerror = () => resolve(lastLoaded);
      xhr.onabort = () => resolve(lastLoaded);

      const onAbort = () => {
        try { xhr.abort(); } catch {}
      };
      signal.addEventListener('abort', onAbort, { once: true });

      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.send(blob);
    });
  }

  private async measureUploadSpeed(
    server: SpeedTestServer,
    parentSignal: AbortSignal,
    onProgress: (currentMbps: number, totalBytes: number, progress: number, samples: SpeedTestSample[]) => void
  ): Promise<{ finalMbps: number; samples: SpeedTestSample[] }> {
    const TARGET_DURATION_MS = 6500;
    const WARMUP_MS = 1000;
    const CONCURRENT_STREAMS = 3;
    const CHUNK_SIZE = 512 * 1024;
    const samples: SpeedTestSample[] = [];

    const createRandomBlob = (sizeInBytes: number): Blob => {
      const buffer = new Uint8Array(sizeInBytes);
      for (let i = 0; i < sizeInBytes; i++) {
        buffer[i] = ((i * 1664525 + 1013904223) ^ (i >> 8)) & 0xff;
      }
      return new Blob([buffer], { type: 'application/octet-stream' });
    };

    const uploadBlob = createRandomBlob(CHUNK_SIZE);

    const workerCompletedBytes = new Array(CONCURRENT_STREAMS).fill(0);
    const progressHistory: TransferRecord[] = [];

    const uploadController = new AbortController();
    const uploadSignal = uploadController.signal;

    const onParentAbort = () => uploadController.abort();
    parentSignal.addEventListener('abort', onParentAbort, { once: true });

    const testStartTime = performance.now();
    let firstByteTime: number | null = null;
    let lastByteTime: number | null = null;
    let isTestActive = true;
    let smoothedGaugeMbps = 0;

    progressHistory.push({ timeMs: testStartTime, totalBytes: 0 });

    const getTotalUploadedBytes = (): number => {
      return workerCompletedBytes.reduce((a, b) => a + b, 0);
    };

    const recordProgress = (now: number, total: number) => {
      const last = progressHistory[progressHistory.length - 1];
      if (!last || now - last.timeMs >= 25) {
        progressHistory.push({ timeMs: now, totalBytes: total });
      }
    };

    const uploadEndpoint = server.uploadUrl || '/api/speedtest/upload';
    const runWorker = async (workerIndex: number) => {
      let iteration = 0;
      while (isTestActive && !uploadSignal.aborted) {
        iteration++;
        const sep = uploadEndpoint.includes('?') ? '&' : '?';
        const url = `${uploadEndpoint}${sep}_t=${Date.now()}_${workerIndex}_${iteration}_${Math.random()}`;

        try {
          await this.sendUploadChunkXHR(url, uploadBlob, uploadSignal, (deltaBytes) => {
            workerCompletedBytes[workerIndex] += deltaBytes;
            const now = performance.now();
            if (firstByteTime === null) firstByteTime = now;
            lastByteTime = now;

            const total = getTotalUploadedBytes();
            recordProgress(now, total);
          });
        } catch {
          if (!isTestActive || uploadSignal.aborted) return;
          await new Promise(r => setTimeout(r, 20));
        }
      }
    };

    const samplerInterval = setInterval(() => {
      if (!isTestActive || uploadSignal.aborted) return;

      const now = performance.now();
      const elapsedMs = now - testStartTime;
      const totalBytes = getTotalUploadedBytes();

      let instantMbps = 0;
      if (progressHistory.length >= 2) {
        const targetTime = now - 300;
        let baseline = progressHistory[0];
        for (let i = progressHistory.length - 1; i >= 0; i--) {
          if (progressHistory[i].timeMs <= targetTime) {
            baseline = progressHistory[i];
            break;
          }
        }

        const deltaBytes = totalBytes - baseline.totalBytes;
        const deltaSec = (now - baseline.timeMs) / 1000;

        if (deltaSec > 0.02 && deltaBytes > 0) {
          instantMbps = (deltaBytes * 8) / deltaSec / 1_000_000;
        }
      }

      if (instantMbps <= 0 && elapsedMs > 80 && totalBytes > 0) {
        instantMbps = (totalBytes * 8) / (elapsedMs / 1000) / 1_000_000;
      }

      if (instantMbps > 0) {
        if (smoothedGaugeMbps === 0) {
          smoothedGaugeMbps = instantMbps;
        } else {
          smoothedGaugeMbps = smoothedGaugeMbps * 0.25 + instantMbps * 0.75;
        }
      }

      const progressPercent = Math.min(100, Math.round((elapsedMs / TARGET_DURATION_MS) * 100));
      const sample: SpeedTestSample = {
        timeMs: Math.round(elapsedMs),
        mbps: Number(smoothedGaugeMbps.toFixed(2)),
        bytes: totalBytes,
      };
      samples.push(sample);
      onProgress(smoothedGaugeMbps, totalBytes, progressPercent, samples);
    }, 75);

    for (let i = 0; i < CONCURRENT_STREAMS; i++) {
      runWorker(i);
    }

    await new Promise<void>((resolve) => {
      const timerId = setTimeout(() => {
        isTestActive = false;
        uploadController.abort();
        resolve();
      }, TARGET_DURATION_MS);

      uploadSignal.addEventListener('abort', () => {
        clearTimeout(timerId);
        isTestActive = false;
        resolve();
      }, { once: true });
    });

    clearInterval(samplerInterval);
    parentSignal.removeEventListener('abort', onParentAbort);

    if (parentSignal.aborted) {
      throw new Error('Speed test was cancelled.');
    }

    let finalTotalBytes = getTotalUploadedBytes();

    if (finalTotalBytes === 0) {
      try {
        const fallbackStart = performance.now();
        const sep = uploadEndpoint.includes('?') ? '&' : '?';
        const fallbackUrl = `${uploadEndpoint}${sep}_t=${Date.now()}_fallback`;
        const smallBlob = createRandomBlob(256 * 1024);
        let uploadedBytes = 0;
        await this.sendUploadChunkXHR(fallbackUrl, smallBlob, new AbortController().signal, (delta) => {
          uploadedBytes += delta;
        });
        const durationSec = (performance.now() - fallbackStart) / 1000;
        if (uploadedBytes > 0 && durationSec > 0) {
          finalTotalBytes = uploadedBytes;
          const calculatedMbps = (uploadedBytes * 8) / durationSec / 1_000_000;
          smoothedGaugeMbps = calculatedMbps;
          onProgress(calculatedMbps, uploadedBytes, 100, [{
            timeMs: Math.round(durationSec * 1000),
            mbps: Number(calculatedMbps.toFixed(2)),
            bytes: uploadedBytes,
          }]);
        }
      } catch (err) {
        console.warn('Fallback upload probe warning:', err);
      }
    }

    if (finalTotalBytes === 0) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Connection interrupted');
      }
      return { finalMbps: 0, samples: [] };
    }

    const steadyStart = testStartTime + WARMUP_MS;
    const steadyRecords = progressHistory.filter(r => r.timeMs >= steadyStart);
    let finalMbps = 0;

    if (steadyRecords.length >= 2) {
      const startRecord = steadyRecords[0];
      const endRecord = steadyRecords[steadyRecords.length - 1];
      const steadyBytes = endRecord.totalBytes - startRecord.totalBytes;
      const steadyDurationSec = (endRecord.timeMs - startRecord.timeMs) / 1000;

      if (steadyDurationSec > 0.8 && steadyBytes > 0) {
        finalMbps = (steadyBytes * 8) / steadyDurationSec / 1_000_000;
      }
    }

    if (finalMbps <= 0) {
      const totalDurationSec = (performance.now() - testStartTime) / 1000;
      finalMbps = (finalTotalBytes * 8) / totalDurationSec / 1_000_000;
    }

    return { finalMbps, samples };
  }
}

export const speedTestService = new SpeedTestEngine();
