import { describe, it, expect } from 'vitest';
import app from '../../server/index.js';

describe('FinConsent Server API Endpoints', () => {
  it('Criterion 9: Health endpoint certifies AWS Mumbai (ap-south-1) data residency and SEBI compliance', async () => {
    // Spin up an ephemeral listener to test HTTP response
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/api/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('healthy');
      expect(data.dataResidency).toBe('AWS Mumbai (ap-south-1)');
      expect(data.compliance).toContain('SEBI (IA) Regulations, 2013');
    } finally {
      server.close();
    }
  });

  it('Rejects unauthorized client and mandate access without JWT', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/api/mandates`);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Authorization token required');
    } finally {
      server.close();
    }
  });
});
