import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors.js';
import { runSeed } from './db/seed.js';
import { connectDB } from './db/connection.js';
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

// Initialize database connection & seed data
async function initServer() {
  await connectDB();
  await runSeed();
}

initServer().catch((err) => console.error('[Server Init Error]:', err));

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`FinConsent Server listening on http://localhost:${PORT}`);
  });
}

export default app;
