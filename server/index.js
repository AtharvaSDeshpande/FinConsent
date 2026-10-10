import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors.js';
import { generalApiLimiter } from './middleware/rateLimiter.js';
import { runSeed } from './db/seed.js';
import { connectDB, isDbConnected, isWriteReady, getDbStatus, isInMemoryAllowed } from './db/connection.js';
import { dbStore } from './db/store.js';
import { UserModel } from './db/models.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import mandateRoutes from './routes/mandates.js';
import publicRoutes from './routes/public.js';
import billingRoutes from './routes/billing.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import requestRoutes from './routes/requests.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Trust reverse proxy (AWS ALB / Cloudflare / Nginx / Render) for accurate IP and protocol detection
app.set('trust proxy', 1);

// Production HTTPS/TLS enforcement
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    if (!isHttps && !isLocal) {
      if (req.method === 'GET' || req.method === 'HEAD') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      return res.status(403).json({
        success: false,
        error: 'Insecure HTTP request rejected. Production requires HTTPS/TLS encryption.',
      });
    }
  }
  next();
});

// Security and utility middleware
app.use(
  helmet({
    hsts: {
      maxAge: 31536000, // 1 year Strict-Transport-Security
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
app.use(corsMiddleware);
app.use(express.json());
app.use('/api', generalApiLimiter);

// Database Write-Gating Middleware for Production Resilience
// Intercepts and rejects data-dependent write operations when MongoDB Atlas is disconnected in production.
// Prevents silent fallback to volatile in-memory storage.
app.use('/api', (req, res, next) => {
  const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!mutatingMethods.includes(req.method)) {
    return next();
  }

  // Allow writes if database is write-ready (live MongoDB Atlas connected or dev/test mode)
  if (isWriteReady()) {
    return next();
  }

  // Exempt non-persistent session auth calls
  const rawPath = req.originalUrl || req.path || '';
  if (rawPath.startsWith('/api/auth/login') || rawPath.startsWith('/api/auth/logout')) {
    return next();
  }

  return res.status(503).json({
    success: false,
    error: 'Service Unavailable: MongoDB Atlas persistent database is disconnected. Data-dependent writes are disabled in production until persistent storage is re-established.',
    code: 'DATABASE_UNAVAILABLE',
    databaseStatus: getDbStatus(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/mandates', mandateRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/requests', requestRoutes);

// Health check endpoint: reports 503 Unhealthy in production if persistent DB is disconnected
app.get('/api/health', (req, res) => {
  const ready = isWriteReady();
  const dbConnected = isDbConnected();
  const dbStatus = getDbStatus();

  if (!ready) {
    return res.status(503).json({
      status: 'unhealthy',
      service: 'FinConsent API',
      version: '1.0.0',
      dataResidency: 'AWS Mumbai (ap-south-1)',
      compliance: 'SEBI (IA) Regulations, 2013 | DPDP Act 2023',
      smsService: 'Disabled by policy (Email & In-App delivery only)',
      database: 'Disconnected (MongoDB Atlas required in production)',
      databaseStatus: dbStatus,
      writesBlocked: true,
      ready: false,
      error: 'Persistent MongoDB Atlas connection unavailable in production environment',
    });
  }

  res.status(200).json({
    status: 'healthy',
    service: 'FinConsent API',
    version: '1.0.0',
    dataResidency: 'AWS Mumbai (ap-south-1)',
    compliance: 'SEBI (IA) Regulations, 2013 | DPDP Act 2023',
    smsService: 'Disabled by policy (Email & In-App delivery only)',
    database: dbConnected ? 'MongoDB Atlas (AWS Mumbai)' : 'In-Memory Store',
    databaseStatus: dbStatus,
    writesBlocked: false,
    ready: true,
  });
});

// Dedicated Kubernetes / Render readiness probe endpoint
app.get('/api/ready', (req, res) => {
  const ready = isWriteReady();
  const dbStatus = getDbStatus();

  if (!ready) {
    return res.status(503).json({
      ready: false,
      status: 'not_ready',
      error: 'Persistent MongoDB Atlas connection unavailable in production environment',
      databaseStatus: dbStatus,
    });
  }

  res.status(200).json({
    ready: true,
    status: 'ready',
    databaseStatus: dbStatus,
  });
});

// Guaranteed pure JSON 404 response for any unmapped /api routes (prevents HTML)
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Guaranteed pure JSON error handler for all routes
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.message || err);
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  const safeMessage = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error. Request logged for security review.'
    : (err.message || 'Internal server error');
  res.status(status).json({
    success: false,
    error: safeMessage,
    code: err.code || undefined,
  });
});

// Serve frontend static build in production
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Initialize database connection & seed data
async function initServer() {
  const connected = await connectDB();
  if (connected) {
    const userCount = await UserModel.countDocuments().catch(() => 0);
    if (userCount >= 1000) {
      console.log(`[DB] Live MongoDB Atlas cluster already populated (${userCount} users). Syncing in-memory store.`);
      await dbStore.syncFromMongoDB();
    } else {
      console.log(`[DB] Live MongoDB Atlas cluster needs seeding (${userCount} users). Running seeder.`);
      await runSeed();
    }
  } else if (isInMemoryAllowed()) {
    console.log('[DB] Running with in-memory persistence store for development/test environment.');
    await runSeed();
  } else {
    console.warn('[DB] CRITICAL: Persistent storage unavailable in production. In-memory seeding skipped to prevent unpersisted state.');
  }
}

if (process.env.NODE_ENV !== 'test') {
  initServer().catch((err) => console.error('[Server Init Error]:', err));
}

// Start server if executed directly as main script
const isMainScript = process.argv[1] && (
  process.argv[1].endsWith('server/index.js') ||
  process.argv[1].endsWith('server\\index.js')
);

if (isMainScript && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    console.log(`FinConsent Server listening on http://${HOST}:${PORT} (bound to container interface ${HOST}; local preview: http://localhost:${PORT})`);
  });
}

export { app, initServer };
export default app;
