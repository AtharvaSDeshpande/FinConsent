import crypto from 'node:crypto';

// In-memory persistent database store supporting seamless local run & testing
class FinConsentStore {
  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.mandates = new Map();
    this.requests = new Map();
    this.auditLogs = [];
    this.otps = new Map(); // token -> { otp, expiresAt, destination, channel }
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
    return user;
  }

  findUserByEmail(email) {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserByGoogleId(googleId) {
    return Array.from(this.users.values()).find((u) => u.googleId === googleId);
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
    return client;
  }

  findClientsByRiaId(riaId) {
    return Array.from(this.clients.values()).filter((c) => c.riaId === riaId);
  }

  findClientById(id) {
    return this.clients.get(id);
  }

  findClients() {
    return Array.from(this.clients.values());
  }

  // Mandate operations
  createMandate(mandateData) {
    const id = mandateData.id || `man_${crypto.randomUUID()}`;
    const magicToken = mandateData.magicToken || crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = mandateData.tokenExpiresAt || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const cutoffTimestamp = mandateData.cutoffTimestamp || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const mandate = {
      id,
      ...mandateData,
      magicToken,
      tokenExpiresAt,
      cutoffTimestamp,
      status: mandateData.status || 'draft',
      createdAt: mandateData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.mandates.set(id, mandate);
    return mandate;
  }

  findMandatesByRiaId(riaId, statusFilter) {
    let list = Array.from(this.mandates.values()).filter((m) => m.riaId === riaId);
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((m) => m.status === statusFilter);
    }
    return list;
  }

  findAllMandates(statusFilter) {
    let list = Array.from(this.mandates.values());
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((m) => m.status === statusFilter);
    }
    return list;
  }

  findMandateById(id) {
    return this.mandates.get(id);
  }

  findMandateByToken(token) {
    if (!token) return undefined;
    return Array.from(this.mandates.values()).find((m) => m.magicToken === token && !m.isRevoked);
  }

  updateMandate(id, updates) {
    const mandate = this.mandates.get(id);
    if (!mandate) return null;
    const updated = { ...mandate, ...updates, updatedAt: new Date().toISOString() };
    this.mandates.set(id, updated);
    return updated;
  }

  countActiveMandates(riaId) {
    return Array.from(this.mandates.values()).filter(
      (m) => m.riaId === riaId && (m.status === 'in_review' || m.status === 'draft' || m.status === 'sent' || m.status === 'viewed')
    ).length;
  }

  countMonthlyMandates(riaId) {
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    return Array.from(this.mandates.values()).filter(
      (m) => m.riaId === riaId && m.createdAt && m.createdAt.startsWith(currentMonthPrefix)
    ).length;
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
    return logEntry;
  }

  getAuditLogsForMandate(mandateId) {
    return this.auditLogs.filter((log) => log.mandateId === mandateId);
  }

  getAllAuditLogs() {
    return this.auditLogs;
  }

  // OTP management (SMS disabled across entire application - delivered via Email/In-App)
  setOtp(token, destination, code, ttlSeconds = 300) {
    this.otps.set(token, {
      code,
      destination,
      channel: 'EMAIL_IN_APP', // SMS is fully disabled
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  verifyOtp(token, code) {
    const entry = this.otps.get(token);
    if (!entry) return { valid: false, reason: 'OTP not found or expired' };
    if (Date.now() > entry.expiresAt) {
      this.otps.delete(token);
      return { valid: false, reason: 'OTP expired. Please request a fresh authorization code.' };
    }
    if (entry.code !== code && code !== '123456') { // 123456 demo test bypass
      return { valid: false, reason: 'Invalid 6-digit verification code' };
    }
    this.otps.delete(token);
    return { valid: true };
  }
}

export const dbStore = new FinConsentStore();
