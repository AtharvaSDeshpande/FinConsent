import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors.js';
import { generalApiLimiter } from './middleware/rateLimiter.js';
import { runSeed } from './db/seed.js';
import { connectDB } from './db/connection.js';
import { dbStore } from './db/store.js';
import { UserModel } from './db/models.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import mandateRoutes from './routes/mandates.js';
import publicRoutes from './routes/public.js';
import billingRoutes from './routes/billing.js';
import requestRoutes from './routes/requests.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (AWS ALB / Cloudflare / Nginx) for accurate IP and protocol detection
app.set('trust proxy', 1);

// Production HTTPS/TLS enforcement
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    if (!isHttps) {
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/mandates', mandateRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/requests', requestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FinConsent API',
    version: '1.0.0',
    dataResidency: 'AWS Mumbai (ap-south-1)',
    compliance: 'SEBI (IA) Regulations, 2013 | DPDP Act 2023',
    smsService: 'Disabled by policy (Email & In-App delivery only)',
    database: process.env.MONGODB_URI ? 'MongoDB Atlas (AWS Mumbai)' : 'In-Memory Store',
    googleOAuth: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Simulated',
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
  });
});

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
  } else {
    await runSeed();
  }
}

initServer().catch((err) => console.error('[Server Init Error]:', err));

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`FinConsent Server listening on http://localhost:${PORT}`);
  });
}

export default app;
