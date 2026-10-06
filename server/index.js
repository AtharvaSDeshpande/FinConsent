import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors.js';
import { runSeed } from './db/seed.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import mandateRoutes from './routes/mandates.js';
import publicRoutes from './routes/public.js';
import billingRoutes from './routes/billing.js';

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FinConsent API',
    version: '1.0.0',
    dataResidency: 'AWS Mumbai (ap-south-1)',
    compliance: 'SEBI (IA) Regulations, 2013 | DPDP Act 2023',
  });
});

// Seed data on server initialize
runSeed().catch((err) => console.error('Error running seed:', err));

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`FinConsent Server listening on http://localhost:${PORT}`);
  });
}

export default app;
