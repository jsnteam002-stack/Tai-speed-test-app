import { SpeedTestResult } from '../types';

const STORAGE_KEY = 'tsi_speedtest_history_v1';

export function getHistory(): SpeedTestResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveResultToHistory(result: SpeedTestResult): SpeedTestResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = getHistory();
    // Prevent duplicates
    const filtered = history.filter(h => h.id !== result.id);
    const updated = [result, ...filtered].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function deleteResultFromHistory(id: string): SpeedTestResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = getHistory();
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
