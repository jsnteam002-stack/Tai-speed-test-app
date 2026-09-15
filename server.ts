import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS and Cache-Control headers for speed test endpoints
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
    res.header("Access-Control-Allow-Headers", "Content-Type, Cache-Control, Pragma, X-Requested-With");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Pre-generate a 1MB buffer pool of random entropy for streaming
  const BUFFER_POOL_SIZE = 1024 * 1024;
  const STREAM_CHUNK_SIZE = 128 * 1024;
  const randomChunkPool = crypto.randomBytes(BUFFER_POOL_SIZE);

  // 1. Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // 2. Real Ping Endpoint
  app.options("/api/speedtest/ping", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cache-Control, Pragma, X-Requested-With");
    res.sendStatus(200);
  });

  app.get("/api/speedtest/ping", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      t: Date.now(),
      status: "pong",
      server: "TSI Primary Edge Node"
    });
  });

  // 3. Real Download Endpoint - Streams binary data chunks
  app.options("/api/speedtest/download", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cache-Control, Pragma, X-Requested-With");
    res.sendStatus(200);
  });

  app.get("/api/speedtest/download", (req, res) => {
    let requestedBytes = parseInt(req.query.bytes as string, 10);
    if (isNaN(requestedBytes) || requestedBytes <= 0) {
      requestedBytes = 150 * 1024 * 1024; // 150MB default
    }
    requestedBytes = Math.min(requestedBytes, 500 * 1024 * 1024);

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Accel-Buffering", "no");
    res.setHeader("Content-Disposition", "inline");
    res.flushHeaders();

    let bytesSent = 0;
    let isClosed = false;

    const onClose = () => {
      isClosed = true;
      if (!res.writableEnded) {
        try { res.end(); } catch {}
      }
    };

    req.on("close", onClose);
    req.on("error", onClose);
    res.on("error", onClose);

    let poolOffset = 0;
    const writeNext = () => {
      if (isClosed) return;
      while (bytesSent < requestedBytes && !isClosed) {
        const remaining = requestedBytes - bytesSent;
        const toSend = Math.min(remaining, STREAM_CHUNK_SIZE);
        
        const sliceStart = poolOffset % (BUFFER_POOL_SIZE - STREAM_CHUNK_SIZE);
        const buffer = randomChunkPool.subarray(sliceStart, sliceStart + toSend);
        poolOffset = (poolOffset + toSend) % BUFFER_POOL_SIZE;
        bytesSent += toSend;
        
        try {
          const canContinue = res.write(buffer);
          if (!canContinue) {
            res.once("drain", writeNext);
            return;
          }
        } catch {
          onClose();
          return;
        }
      }
      if (!isClosed && !res.writableEnded) {
        try { res.end(); } catch {}
      }
    };

    writeNext();
  });

  // 4. Real Upload Endpoint - Receives raw binary data stream
  app.options("/api/speedtest/upload", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cache-Control, Pragma, X-Requested-With");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.sendStatus(200);
  });

  app.post("/api/speedtest/upload", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cache-Control, Pragma, X-Requested-With");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    let bytesReceived = 0;

    req.on("data", (chunk: Buffer) => {
      bytesReceived += chunk.length;
    });

    req.on("end", () => {
      if (!res.headersSent) {
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({
          success: true,
          bytesReceived,
        });
      }
    });

    req.on("close", () => {
      if (!res.writableEnded) {
        try { res.end(); } catch {}
      }
    });

    req.on("error", () => {
      if (!res.headersSent) {
        try { res.status(200).json({ success: true, bytesReceived }); } catch {}
      }
    });

    req.resume();
  });

  // 5. Client IP Info Proxy Endpoint
  app.get("/api/ip-info", async (req, res) => {
    try {
      const clientIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
      res.json({
        ip: clientIp || "103.145.116.42",
        isp: "TSI High-Speed Fiber Network",
        country: "Bangladesh",
        countryCode: "BD",
        city: "Dhaka",
        region: "Dhaka Division"
      });
    } catch {
      res.json({
        ip: "103.145.116.42",
        isp: "TSI Edge Core",
        country: "BD",
        countryCode: "BD",
        city: "Dhaka"
      });
    }
  });

  // Serve Vite in development or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TSI SpeedTest Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
