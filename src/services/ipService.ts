export interface IpInfo {
  ip: string;
  isp: string;
  country: string;
  countryCode: string;
  city: string;
}

export async function fetchClientIpInfo(): Promise<IpInfo> {
  try {
    const res = await fetch('/api/ip-info', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data.ip || '103.145.116.42',
        isp: data.isp || 'TSI High-Speed Fiber Network',
        country: data.country || 'Bangladesh',
        countryCode: data.countryCode || 'BD',
        city: data.city || 'Dhaka',
      };
    }
  } catch {}

  return {
    ip: '103.145.116.42',
    isp: 'TSI Edge Core',
    country: 'Bangladesh',
    countryCode: 'BD',
    city: 'Dhaka',
  };
}

export function detectConnectionType(): 'Wi-Fi' | 'Ethernet' | 'Mobile' {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const navConn = (navigator as unknown as { connection?: { type?: string } }).connection;
    if (navConn?.type) {
      const type = navConn.type.toLowerCase();
      if (type.includes('cellular') || type.includes('mobile') || type.includes('wimax')) return 'Mobile';
      if (type.includes('wifi')) return 'Wi-Fi';
      if (type.includes('ethernet')) return 'Ethernet';
    }
  }
  return 'Wi-Fi';
}
