import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors.js';
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

// Security and utility middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(corsMiddleware);
app.use(express.json());

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
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
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
