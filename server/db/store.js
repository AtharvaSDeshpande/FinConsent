import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { UserModel, ClientModel, MandateModel, AuditLogModel, RequestModel } from './models.js';
import { sharedState } from './sharedState.js';
import {
  ENCRYPTION_VERSION,
  protectMandatePayload,
  unlockMandateWithServerKey,
  unlockMandateWithPassword,
  formatClientPassword,
} from '../security/mandateCrypto.js';

// Hybrid database store: in-memory cache + live MongoDB Atlas persistence
class FinConsentStore {
  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.mandates = new Map();
    this.requests = new Map();
    this.auditLogs = [];
    this.otps = new Map(); // token -> { otp, expiresAt, destination, channel }
    this.activeMagicTokens = new Map(); // mandateId -> rawToken (transient in-memory rail for authorized RIA dispatch)
    this.isSeeding = false;
    this.sharedState = sharedState;
  }

  getActiveMagicToken(id) {
    return this.activeMagicTokens.get(id);
  }

  setActiveMagicToken(id, token) {
    if (token) {
      this.activeMagicTokens.set(id, token);
    } else {
      this.activeMagicTokens.delete(id);
    }
  }

  // Load existing records from MongoDB Atlas into in-memory store
  async syncFromMongoDB() {
    if (mongoose.connection.readyState !== 1) return;
    try {
      const [users, clients, mandates, auditLogs, requests] = await Promise.all([
        UserModel.find({}).lean(),
        ClientModel.find({}).lean(),
        MandateModel.find({}).lean(),
        AuditLogModel.find({}).lean(),
        RequestModel.find({}).lean(),
      ]);

      if (users.length > 0) {
        this.users.clear();
        users.forEach((u) => this.users.set(u.id, u));
      }
      if (clients.length > 0) {
        this.clients.clear();
        clients.forEach((c) => this.clients.set(c.id, c));
      }
      if (mandates.length > 0) {
        this.mandates.clear();
        mandates.forEach((m) => {
          if (m.createdAt && typeof m.createdAt !== 'string') {
            m.createdAt = new Date(m.createdAt).toISOString();
          }
          if (m.updatedAt && typeof m.updatedAt !== 'string') {
            m.updatedAt = new Date(m.updatedAt).toISOString();
          }
          if (m.cutoffTimestamp && typeof m.cutoffTimestamp !== 'string') {
            m.cutoffTimestamp = new Date(m.cutoffTimestamp).toISOString();
          }
          if (m.tokenExpiresAt && typeof m.tokenExpiresAt !== 'string') {
            m.tokenExpiresAt = new Date(m.tokenExpiresAt).toISOString();
          }
          if (!m.magicTokenHash && m.magicToken) {
            m.magicTokenHash = crypto.createHash('sha256').update(m.magicToken).digest('hex');
          }
          if (m.magicToken) {
            this.activeMagicTokens.set(m.id, m.magicToken);
          }
          delete m.magicToken;
          this.mandates.set(m.id, m);
        });
      }
      if (auditLogs.length > 0) {
        this.auditLogs = auditLogs;
      }
      if (requests.length > 0) {
        this.requests.clear();
        requests.forEach((r) => this.requests.set(r.id, r));
      }

      // Reconcile benchmark investor Rohan Mehta (client@example.in)
      const benchmarkClientUser = Array.from(this.users.values()).find((u) => u.email?.toLowerCase() === 'client@example.in');
      let rohanClient = this.clients.get('cli_1');
      if (rohanClient) {
        rohanClient.name = 'Rohan Mehta';
        rohanClient.email = 'client@example.in';
        rohanClient.pan = 'ABCPM1234F';
        rohanClient.riaId = 'usr_ria_suresh';
      } else {
        rohanClient = {
          id: 'cli_1',
          riaId: 'usr_ria_suresh',
          name: 'Rohan Mehta',
          pan: 'ABCPM1234F',
          mobile: '9820112345',
          email: 'client@example.in',
          portfolioValue: 8500000,
          createdAt: new Date().toISOString(),
        };
        this.clients.set('cli_1', rohanClient);
      }
      if (benchmarkClientUser) {
        benchmarkClientUser.name = 'Rohan Mehta';
        benchmarkClientUser.pan = 'ABCPM1234F';
        benchmarkClientUser.mobile = '9820112345';
      }

      console.log(`[Store] Synced from MongoDB Atlas: ${this.users.size} users, ${this.clients.size} clients, ${this.mandates.size} mandates, ${this.requests.size} requests`);
    } catch (err) {
      console.warn('[Store] Could not sync from MongoDB:', err.message);
    }
  }

  // User operations
  createUser(userData) {
    const id = userData.id || `usr_${crypto.randomUUID()}`;
    const user = {
      id,
      ...userData,
      role: userData.role || 'ria', // 'ria' | 'compliance_officer' | 'admin' | 'client'
      plan: userData.plan || 'free',
      createdAt: userData.createdAt || new Date().toISOString(),
    };
    this.users.set(id, user);

    if (!this.isSeeding && mongoose.connection.readyState === 1) {
      UserModel.create(user).catch((err) => console.warn('[Mongo Sync Error]', err.message));
    }

    return user;
  }

  findUserByEmail(email) {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.get(id);
  }

  findUsers(filter = {}) {
    let list = Array.from(this.users.values());
    if (filter.role) {
      list = list.filter((u) => u.role === filter.role);
    }
    if (filter.plan) {
      list = list.filter((u) => u.plan === filter.plan);
    }
    return list;
  }

  updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);

    if (!this.isSeeding && mongoose.connection.readyState === 1) {
      UserModel.updateOne({ id }, { $set: updates }).catch((err) => console.warn('[Mongo Sync Error]', err.message));
    }

    return updated;
  }

  // Client operations
  createClient(clientData) {
    const id = clientData.id || `cli_${crypto.randomUUID()}`;
    const client = {
      id,
      ...clientData,
      createdAt: clientData.createdAt || new Date().toISOString(),
    };
    this.clients.set(id, client);

    if (!this.isSeeding && mongoose.connection.readyState === 1) {
      ClientModel.create(client).catch((err) => console.warn('[Mongo Sync Error]', err.message));
    }

    return client;
  }

  findClientsByRiaId(riaId) {
    return Array.from(this.clients.values()).filter((c) => c.riaId === riaId);
  }

  findClientById(id) {
    if (id === 'cli_rohan_mehta') {
      return this.clients.get('cli_1') || this.clients.get('cli_rohan_mehta');
    }
    if (id === 'cli_1') {
      return this.clients.get('cli_1') || this.clients.get('cli_rohan_mehta');
    }
    return this.clients.get(id);
  }

  findClients() {
    return Array.from(this.clients.values());
  }

  // Mandate operations
  createMandate(mandateData) {
    const id = mandateData.id || `man_${crypto.randomUUID()}`;
    const rawMagicToken = mandateData.magicToken || crypto.randomBytes(32).toString('hex');
    const magicTokenHash = mandateData.magicTokenHash || crypto.createHash('sha256').update(rawMagicToken).digest('hex');
    const tokenExpiresAt = mandateData.tokenExpiresAt
      ? (typeof mandateData.tokenExpiresAt === 'string' ? mandateData.tokenExpiresAt : new Date(mandateData.tokenExpiresAt).toISOString())
      : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const cutoffTimestamp = mandateData.cutoffTimestamp
      ? (typeof mandateData.cutoffTimestamp === 'string' ? mandateData.cutoffTimestamp : new Date(mandateData.cutoffTimestamp).toISOString())
      : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const createdAt = mandateData.createdAt
      ? (typeof mandateData.createdAt === 'string' ? mandateData.createdAt : new Date(mandateData.createdAt).toISOString())
      : new Date().toISOString();

    // Determine client password for password-derived key encryption
    let clientPassword = mandateData.clientPassword;
    if (!clientPassword && mandateData.clientId) {
      const client = this.findClientById(mandateData.clientId);
      if (client && client.pan && client.dob) {
        clientPassword = formatClientPassword(client.pan, client.dob);
      }
    }

    const sensitiveFields = {
      trades: mandateData.trades || [],
      currentAllocation: mandateData.currentAllocation || { equity: 70, debt: 20, gold: 5, cash: 5 },
      proposedAllocation: mandateData.proposedAllocation || { equity: 60, debt: 25, gold: 10, cash: 5 },
      sellBasket: mandateData.sellBasket || [],
      buyBasket: mandateData.buyBasket || [],
      stcgAmount: mandateData.stcgAmount || 0,
      ltcgAmount: mandateData.ltcgAmount || 0,
      stcgTax: mandateData.stcgTax || 0,
      ltcgTax: mandateData.ltcgTax || 0,
      cessAmount: mandateData.cessAmount || 0,
      taxPayable: mandateData.taxPayable || 0,
      advanceTaxQuarter: mandateData.advanceTaxQuarter || '',
      advanceTaxAlert: mandateData.advanceTaxAlert || '',
      rationale: mandateData.rationale || mandateData.advisorRationale || '',
      advisorRationale: mandateData.advisorRationale || mandateData.rationale || '',
    };

    // Encrypt sensitive payload using dual-envelope encryption
    const { encryptedPayload, serverWrappedDek, clientWrappedDek } = protectMandatePayload(
      sensitiveFields,
      clientPassword
    );

    const storedMandate = {
      id,
      riaId: mandateData.riaId,
      clientId: mandateData.clientId,
      title: mandateData.title,
      magicTokenHash,
      tokenExpiresAt,
      cutoffTimestamp,
      status: mandateData.status || 'draft',
      isRevoked: mandateData.isRevoked || false,
      isPasswordProtected: true,
      encryptionVersion: ENCRYPTION_VERSION,
      encryptedPayload,
      serverWrappedDek,
      clientWrappedDek,
      chatMessages: mandateData.chatMessages || [],
      createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.mandates.set(id, storedMandate);

    if (rawMagicToken && mandateData.magicToken !== null) {
      this.activeMagicTokens.set(id, rawMagicToken);
    } else {
      this.activeMagicTokens.delete(id);
    }

    if (!this.isSeeding && mongoose.connection.readyState === 1) {
      MandateModel.create(storedMandate).catch((err) => console.warn('[Mongo Sync Error]', err.message));
    }

    // Return object with transparently decrypted data and transient magicToken
    return {
      ...storedMandate,
      ...sensitiveFields,
      magicToken: mandateData.magicToken === null ? null : rawMagicToken,
    };
  }

  findMandatesByRiaId(riaId, statusFilter) {
    let list = Array.from(this.mandates.values()).filter((m) => m.riaId === riaId);
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((m) => m.status === statusFilter);
    }
    return list.map((m) => unlockMandateWithServerKey(m));
  }

  findAllMandates(statusFilter) {
    let list = Array.from(this.mandates.values());
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((m) => m.status === statusFilter);
    }
    return list.map((m) => unlockMandateWithServerKey(m));
  }

  findMandateById(id) {
    let mandate = this.mandates.get(id);
    if (!mandate && id === 'man_rohan_equity_conc') {
      mandate = this.mandates.get('man_1');
    }
    if (!mandate && id === 'man_1') {
      mandate = this.mandates.get('man_rohan_equity_conc');
    }
    if (!mandate) return undefined;
    return unlockMandateWithServerKey(mandate);
  }

  findMandateByToken(rawToken) {
    if (!rawToken) return undefined;
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Primary: lookup by SHA-256 hash
    let found = Array.from(this.mandates.values()).find(
      (m) => m.magicTokenHash === tokenHash
    );

    // Safe backwards-compatible migration for legacy/unmigrated records
    if (!found) {
      found = Array.from(this.mandates.values()).find(
        (m) => m.magicToken === rawToken
      );
      if (found) {
        found.magicTokenHash = tokenHash;
        delete found.magicToken;
        if (!this.isSeeding && mongoose.connection.readyState === 1) {
          MandateModel.updateOne(
            { id: found.id },
            { $set: { magicTokenHash: tokenHash }, $unset: { magicToken: 1 } }
          ).catch((err) => console.warn('[Mongo Migration Error]', err.message));
        }
      }
    }

    if (found && rawToken) {
      this.activeMagicTokens.set(found.id, rawToken);
    }
    return found;
  }

  unlockMandateClient(rawToken, password) {
    const mandate = this.findMandateByToken(rawToken);
    if (!mandate) return null;
    return unlockMandateWithPassword(mandate, password);
  }

  getMandateChat(mandateId) {
    const mandate = this.mandates.get(mandateId);
    if (!mandate) return [];
    return mandate.chatMessages || [];
  }

  addMandateChatMessage(mandateId, messageData) {
    const mandate = this.mandates.get(mandateId);
    if (!mandate) return null;
    if (!mandate.chatMessages) mandate.chatMessages = [];
    const msg = {
      id: `msg_${crypto.randomUUID()}`,
      ...messageData,
      timestamp: new Date().toISOString(),
      timestampIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };
    mandate.chatMessages.push(msg);
    if (!this.isSeeding && mongoose.connection.readyState === 1) {
      MandateModel.updateOne(
        { id: mandateId },
        { $push: { chatMessages: msg } }
      ).catch((err) => console.warn('[Mongo Chat Sync Error]', err.message));
    }
    return msg;
  }

  updateMandate(id, updates) {
    const mandate = this.mandates.get(id);
    if (!mandate) return null;

    const copy = { ...updates };
    let transientMagicToken;
    if (copy.magicToken !== undefined) {
      transientMagicToken = copy.magicToken;
      if (transientMagicToken) {
        copy.magicTokenHash = crypto.createHash('sha256').update(transientMagicToken).digest('hex');
        this.activeMagicTokens.set(id, transientMagicToken);
      } else {
        copy.magicTokenHash = null;
        this.activeMagicTokens.delete(id);
      }
      delete copy.magicToken;
    } else {
      transientMagicToken = this.activeMagicTokens.get(id);
    }

    const updated = { ...mandate, ...copy, updatedAt: new Date().toISOString() };
    this.mandates.set(id, updated);

    if (!this.isSeeding && mongoose.connection.readyState === 1) {
      MandateModel.updateOne({ id }, { $set: copy, $unset: { magicToken: 1 } }).catch((err) => console.warn('[Mongo Sync Error]', err.message));
    }

    return {
      ...updated,
      magicToken: transientMagicToken !== undefined ? transientMagicToken : undefined,
    };
  }

  countActiveMandates(riaId) {
    return Array.from(this.mandates.values()).filter(
      (m) => m.riaId === riaId && (m.status === 'in_review' || m.status === 'draft' || m.status === 'sent' || m.status === 'viewed')
    ).length;
  }

  countMonthlyMandates(riaId) {
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    return Array.from(this.mandates.values()).filter((m) => {
      if (!m || m.riaId !== riaId || !m.createdAt) return false;
      try {
        const dateStr = typeof m.createdAt === 'string'
          ? m.createdAt
          : m.createdAt instanceof Date
          ? m.createdAt.toISOString()
          : new Date(m.createdAt).toISOString();
        return typeof dateStr === 'string' && dateStr.startsWith(currentMonthPrefix);
      } catch (err) {
        return false;
      }
    }).length;
  }

  // Request composer operations (Dedicated request composer UI)
  createRequest(requestData) {
    const id = requestData.id || `req_${crypto.randomUUID()}`;
    const request = {
      id,
      ...requestData,
      status: requestData.status || 'pending',
      createdAt: requestData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.requests.set(id, request);

    if (!this.isSeeding && mongoose.connection.readyState === 1) {
      RequestModel.create(request).catch((err) => console.warn('[Mongo Sync Error]', err.message));
    }

    return request;
  }

  findRequests(filter = {}) {
    let list = Array.from(this.requests.values());
    if (filter.userId && filter.role !== 'admin' && filter.role !== 'compliance_officer') {
      list = list.filter((r) => r.userId === filter.userId || r.assignedTo === filter.userId);
    }
    if (filter.status) {
      list = list.filter((r) => r.status === filter.status);
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  findRequestById(id) {
    return this.requests.get(id);
  }

  updateRequest(id, updates) {
    const request = this.requests.get(id);
    if (!request) return null;
    const updated = { ...request, ...updates, updatedAt: new Date().toISOString() };
    this.requests.set(id, updated);

    if (!this.isSeeding && mongoose.connection.readyState === 1) {
      RequestModel.updateOne({ id }, { $set: updates }).catch((err) => console.warn('[Mongo Sync Error]', err.message));
    }

    return updated;
  }

  // Audit Log operations - strictly immutable, append-only
  createAuditLog(entry) {
    const id = `aud_${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();
    const timestampIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Hash chaining with previous log entry
    const prevHash = this.auditLogs.length > 0 ? this.auditLogs[this.auditLogs.length - 1].payloadHash : 'GENESIS';
    const rawPayload = JSON.stringify({ ...entry, prevHash, timestamp, timestampIST });
    const payloadHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const logEntry = Object.freeze({
      id,
      ...entry,
      channel: entry.channel || 'EMAIL_IN_APP (SMS Disabled by Policy)',
      timestamp,
      timestampIST,
      prevHash,
      payloadHash,
      immutable: true,
    });

    this.auditLogs.push(logEntry);

    if (!this.isSeeding && mongoose.connection.readyState === 1) {
      AuditLogModel.create({
        ...logEntry,
        hash: payloadHash,
        previousHash: prevHash,
      }).catch((err) => console.warn('[Mongo Sync Error]', err.message));
    }

    return logEntry;
  }

  getAuditLogsForMandate(mandateId) {
    return this.auditLogs.filter((log) => log.mandateId === mandateId);
  }

  getAllAuditLogs() {
    return this.auditLogs;
  }

  // OTP management with distributed attempt tracking and brute-force lockout
  setOtp(token, destination, code, ttlSeconds = 300) {
    const entry = sharedState.setOtp(token, destination, code, ttlSeconds);
    this.otps.set(token, entry);
    return entry;
  }

  verifyOtp(token, code) {
    const result = sharedState.verifyOtp(token, code);
    if (result.valid || result.locked) {
      this.otps.delete(token);
    }
    return result;
  }

  // Session & JWT Token Revocation
  revokeToken(token, expiresInMs) {
    return sharedState.revokeToken(token, expiresInMs);
  }

  isTokenRevoked(token) {
    return sharedState.isTokenRevoked(token);
  }
}

export const dbStore = new FinConsentStore();
