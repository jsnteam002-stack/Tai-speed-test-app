import { SpeedTestServer } from '../types';

export const DEFAULT_SERVERS: SpeedTestServer[] = [
  {
    id: 'tsi-primary',
    name: 'TSI Primary Edge Node',
    country: 'Primary Host',
    city: 'Edge Cluster',
    countryCode: 'BD',
    sponsor: 'TSI High-Speed Edge Core',
    pingUrl: '/api/speedtest/ping',
    downloadUrl: '/api/speedtest/download',
    uploadUrl: '/api/speedtest/upload',
    isLocal: true,
    isConfigured: true,
    recommended: true,
  },
  {
    id: 'tsi-ctg',
    name: 'Chittagong Node',
    country: 'Bangladesh',
    city: 'Chittagong',
    countryCode: 'BD',
    sponsor: 'TSI Coastal Gateway',
    pingUrl: '/api/speedtest/ping',
    downloadUrl: '/api/speedtest/download',
    uploadUrl: '/api/speedtest/upload',
    isLocal: true,
    isConfigured: true,
    recommended: false,
  },
  {
    id: 'tsi-sylhet',
    name: 'Sylhet Node',
    country: 'Bangladesh',
    city: 'Sylhet',
    countryCode: 'BD',
    sponsor: 'TSI Northeast Hub',
    pingUrl: '/api/speedtest/ping',
    downloadUrl: '/api/speedtest/download',
    uploadUrl: '/api/speedtest/upload',
    isLocal: true,
    isConfigured: true,
    recommended: false,
  },
  {
    id: 'tsi-kolkata',
    name: 'Kolkata Node',
    country: 'India',
    city: 'Kolkata',
    countryCode: 'IN',
    sponsor: 'TSI South Asia Gateway',
    pingUrl: '/api/speedtest/ping',
    downloadUrl: '/api/speedtest/download',
    uploadUrl: '/api/speedtest/upload',
    isLocal: false,
    isConfigured: true,
    recommended: false,
  },
  {
    id: 'tsi-singapore',
    name: 'Singapore Node',
    country: 'Singapore',
    city: 'Singapore',
    countryCode: 'SG',
    sponsor: 'TSI APAC Equinix Core',
    pingUrl: '/api/speedtest/ping',
    downloadUrl: '/api/speedtest/download',
    uploadUrl: '/api/speedtest/upload',
    isLocal: false,
    isConfigured: true,
    recommended: false,
  },
  {
    id: 'tsi-frankfurt',
    name: 'Frankfurt Node',
    country: 'Germany',
    city: 'Frankfurt',
    countryCode: 'DE',
    sponsor: 'TSI Europe Central (DE-CIX)',
    pingUrl: '/api/speedtest/ping',
    downloadUrl: '/api/speedtest/download',
    uploadUrl: '/api/speedtest/upload',
    isLocal: false,
    isConfigured: true,
    recommended: false,
  },
];

export const SERVER_SETUP_GUIDE = `
### How to Deploy a TSI SpeedTest Edge Node
To add your own high-speed server to TSI SpeedTest:
1. Deploy an HTTP/2 or HTTP/3 web server (Nginx, Express, Caddy, or Go).
2. Configure 3 endpoints with CORS enabled (Access-Control-Allow-Origin: *):
   - **GET /ping**: Returns 204 No Content or minimal JSON payload.
   - **GET /download?bytes=15728640**: Streams random binary data with \`Cache-Control: no-store\`.
   - **POST /upload**: Accepts raw binary streams and responds with \`{ bytesReceived: number }\`.
3. In TSI SpeedTest "Add Custom Server", paste your server's base URL.
`;
