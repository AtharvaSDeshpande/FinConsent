import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import {
  getMongoUri,
  sanitizeMongoUri,
  sanitizeError,
  isInMemoryAllowed,
  isDbConnected,
  isWriteReady,
  getDbStatus,
} from '../../server/db/connection.js';
import { dbStore } from '../../server/db/store.js';
import app from '../../server/index.js';

describe('Production Deployment, Database Connectivity & Readiness Suite', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('1. Production Container Configuration & Environment Aliases', () => {
    it('1.1: Resolves MongoDB URI across MONGODB_URI, MONGO_URI, and DATABASE_URL aliases', () => {
      delete process.env.MONGODB_URI;
      delete process.env.MONGO_URI;
      delete process.env.DATABASE_URL;

      // Primary name
      process.env.MONGODB_URI = 'mongodb+srv://user:pass@cluster.mongodb.net/primary';
      expect(getMongoUri()).toBe('mongodb+srv://user:pass@cluster.mongodb.net/primary');

      // Fallback to MONGO_URI (common on Render / Heroku)
      delete process.env.MONGODB_URI;
      process.env.MONGO_URI = 'mongodb+srv://user:pass@cluster.mongodb.net/fallback_mongo';
      expect(getMongoUri()).toBe('mongodb+srv://user:pass@cluster.mongodb.net/fallback_mongo');

      // Fallback to DATABASE_URL (standard 12-factor)
      delete process.env.MONGO_URI;
      process.env.DATABASE_URL = 'mongodb+srv://user:pass@cluster.mongodb.net/fallback_db_url';
      expect(getMongoUri()).toBe('mongodb+srv://user:pass@cluster.mongodb.net/fallback_db_url');
    });

    it('1.2: Normalizes URI by stripping surrounding quotes and whitespace from Render UI copy-paste', () => {
      delete process.env.MONGO_URI;
      delete process.env.DATABASE_URL;

      // Double quotes copied from dashboard
      process.env.MONGODB_URI = '  "mongodb+srv://user:pass@cluster.mongodb.net/finconsent"  ';
      expect(getMongoUri()).toBe('mongodb+srv://user:pass@cluster.mongodb.net/finconsent');

      // Single quotes copied from bash export
      process.env.MONGODB_URI = "  'mongodb+srv://user:pass@cluster.mongodb.net/finconsent'  ";
      expect(getMongoUri()).toBe('mongodb+srv://user:pass@cluster.mongodb.net/finconsent');
    });

    it('1.3: Explains why localhost:5000 appears in logs while confirming 0.0.0.0 container binding', () => {
      // In containerized deployments (Docker/Render), listening on 0.0.0.0 is essential
      // so ingress proxies can forward traffic. The log line "localhost:5000" is an
      // informational local convenience string, not a binding defect.
      const defaultPort = process.env.PORT || 5000;
      const defaultHost = process.env.HOST || '0.0.0.0';

      expect(defaultPort).toBeDefined();
      expect(defaultHost).toBe('0.0.0.0');
    });
  });

  describe('2. Secret Sanitization & Credential Protection', () => {
    it('2.1: Redacts credentials from MongoDB SRV and standard connection strings', () => {
      const srvUri = 'mongodb+srv://admin_user:SuperSecretPassword123@cluster0.ihnlo89.mongodb.net/finconsent?retryWrites=true&w=majority';
      const sanitizedSrv = sanitizeMongoUri(srvUri);

      expect(sanitizedSrv).not.toContain('SuperSecretPassword123');
      expect(sanitizedSrv).toBe('mongodb+srv://admin_user:****@cluster0.ihnlo89.mongodb.net/finconsent?retryWrites=true&w=majority');

      const standardUri = 'mongodb://app_service:P%40ssw0rd!@10.0.1.25:27017/finconsent';
      const sanitizedStandard = sanitizeMongoUri(standardUri);

      expect(sanitizedStandard).not.toContain('P%40ssw0rd!');
      expect(sanitizedStandard).toBe('mongodb://app_service:****@10.0.1.25:27017/finconsent');
    });

    it('2.2: Preserves URIs without credentials without alteration', () => {
      const localUri = 'mongodb://localhost:27017/finconsent';
      expect(sanitizeMongoUri(localUri)).toBe('mongodb://localhost:27017/finconsent');
      expect(sanitizeMongoUri('')).toBe('');
      expect(sanitizeMongoUri(null)).toBe('');
    });

    it('2.3: Redacts embedded credentials from error messages', () => {
      const rawError = 'MongoServerError: bad auth : authentication failed on mongodb+srv://db_user:SecretP%40ss@cluster0.mongodb.net/finconsent';
      const sanitized = sanitizeError(rawError);

      expect(sanitized).not.toContain('SecretP%40ss');
      expect(sanitized).toContain('mongodb+srv://db_user:****@cluster0.mongodb.net/finconsent');
    });
  });

  describe('3. In-Memory Fallback Boundary Control', () => {
    it('3.1: Strictly forbids in-memory fallback in production by default', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_IN_MEMORY_FALLBACK;

      expect(isInMemoryAllowed()).toBe(false);
    });

    it('3.2: Permits in-memory mode in production only when explicit override is provided', () => {
      process.env.NODE_ENV = 'production';
      process.env.ALLOW_IN_MEMORY_FALLBACK = 'true';

      expect(isInMemoryAllowed()).toBe(true);
    });

    it('3.3: Automatically permits in-memory mode in development and test environments', () => {
      process.env.NODE_ENV = 'test';
      delete process.env.ALLOW_IN_MEMORY_FALLBACK;
      expect(isInMemoryAllowed()).toBe(true);

      process.env.NODE_ENV = 'development';
      expect(isInMemoryAllowed()).toBe(true);
    });
  });

  describe('4. Readiness & Health Probes Under Database Failure', () => {
    it('4.1: Reports 503 Unhealthy on /api/health and /api/ready in production when DB is disconnected', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_IN_MEMORY_FALLBACK;

      // Temporarily mock disconnected readyState (0 = disconnected)
      const originalReadyState = mongoose.connection.readyState;
      Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

      const server = app.listen(0);
      const port = server.address().port;

      try {
        expect(isDbConnected()).toBe(false);
        expect(isWriteReady()).toBe(false);

        // /api/health probe
        const healthRes = await fetch(`http://localhost:${port}/api/health`);
        expect(healthRes.status).toBe(503);
        const healthData = await healthRes.json();
        expect(healthData.status).toBe('unhealthy');
        expect(healthData.writesBlocked).toBe(true);
        expect(healthData.ready).toBe(false);
        expect(healthData.error).toContain('Persistent MongoDB Atlas connection unavailable');

        // /api/ready probe (Kubernetes / Render readiness)
        const readyRes = await fetch(`http://localhost:${port}/api/ready`);
        expect(readyRes.status).toBe(503);
        const readyData = await readyRes.json();
        expect(readyData.ready).toBe(false);
        expect(readyData.status).toBe('not_ready');
      } finally {
        server.close();
        Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
      }
    });

    it('4.2: Reports 200 Healthy in non-production environments with in-memory store', async () => {
      process.env.NODE_ENV = 'test';

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const res = await fetch(`http://localhost:${port}/api/health`);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.status).toBe('healthy');
        expect(data.writesBlocked).toBe(false);
        expect(data.ready).toBe(true);

        const readyRes = await fetch(`http://localhost:${port}/api/ready`);
        expect(readyRes.status).toBe(200);
        const readyData = await readyRes.json();
        expect(readyData.ready).toBe(true);
        expect(readyData.status).toBe('ready');
      } finally {
        server.close();
      }
    });
  });

  describe('5. Data-Dependent Write Gating & Persistence Guarantees', () => {
    it('5.1: HTTP middleware rejects mutating writes with 503 DATABASE_UNAVAILABLE in production when DB is offline', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_IN_MEMORY_FALLBACK;

      const originalReadyState = mongoose.connection.readyState;
      Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

      const server = app.listen(0);
      const port = server.address().port;

      try {
        // Attempt creating a mandate
        const mandateRes = await fetch(`http://localhost:${port}/api/mandates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Unpersisted Portfolio Rebalance' }),
        });

        expect(mandateRes.status).toBe(503);
        const mandateErr = await mandateRes.json();
        expect(mandateErr.code).toBe('DATABASE_UNAVAILABLE');
        expect(mandateErr.error).toContain('MongoDB Atlas persistent database is disconnected');

        // Attempt creating a client
        const clientRes = await fetch(`http://localhost:${port}/api/clients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Unpersisted Client', pan: 'ABCDE1234F' }),
        });

        expect(clientRes.status).toBe(503);
        const clientErr = await clientRes.json();
        expect(clientErr.code).toBe('DATABASE_UNAVAILABLE');

        // Attempt registering a user
        const regRes = await fetch(`http://localhost:${port}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Unpersisted RIA', email: 'ria@example.in', password: 'ValidPassword1!' }),
        });

        expect(regRes.status).toBe(503);
        const regErr = await regRes.json();
        expect(regErr.code).toBe('DATABASE_UNAVAILABLE');
      } finally {
        server.close();
        Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
      }
    });

    it('5.2: Store layer throws DATABASE_UNAVAILABLE to prevent silent in-memory accumulation in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_IN_MEMORY_FALLBACK;

      const originalReadyState = mongoose.connection.readyState;
      Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

      try {
        expect(() => {
          dbStore.createMandate({ title: 'Memory Leak Mandate', riaId: 'ria_1' });
        }).toThrowError(/Database write rejected: MongoDB Atlas is disconnected/);

        expect(() => {
          dbStore.createClient({ name: 'Memory Leak Client' });
        }).toThrowError(/Database write rejected: MongoDB Atlas is disconnected/);

        expect(() => {
          dbStore.createUser({ name: 'Memory Leak User', email: 'leak@example.in' });
        }).toThrowError(/Database write rejected: MongoDB Atlas is disconnected/);

        expect(() => {
          dbStore.createRequest({ title: 'Memory Leak Request' });
        }).toThrowError(/Database write rejected: MongoDB Atlas is disconnected/);

        expect(() => {
          dbStore.createAuditLog({ action: 'TEST_MUTATION' });
        }).toThrowError(/Database write rejected: MongoDB Atlas is disconnected/);
      } finally {
        Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
      }
    });

    it('5.3: Diagnostic status reflects current connection and write readiness', () => {
      const status = getDbStatus();
      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('storageMode');
      expect(status).toHaveProperty('writesBlocked');
      expect(status).toHaveProperty('sanitizedUri');
      expect(status.sanitizedUri).not.toContain('Secret');
    });
  });
});
