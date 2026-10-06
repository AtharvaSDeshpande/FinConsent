import crypto from 'node:crypto';

// In-memory persistent database store supporting seamless local run & testing
class FinConsentStore {
  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.mandates = new Map();
    this.auditLogs = [];
    this.otps = new Map(); // token -> { otp, expiresAt, mobile }
  }

  // User operations
  createUser(userData) {
    const id = userData.id || `usr_${crypto.randomUUID()}`;
    const user = {
      id,
      ...userData,
      plan: userData.plan || 'free',
      createdAt: userData.createdAt || new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  findUserByEmail(email) {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.get(id);
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

  // Mandate operations
  createMandate(mandateData) {
    const id = mandateData.id || `man_${crypto.randomUUID()}`;
    const magicToken = mandateData.magicToken || crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = mandateData.tokenExpiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const mandate = {
      id,
      ...mandateData,
      magicToken,
      tokenExpiresAt,
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

  findMandateById(id) {
    return this.mandates.get(id);
  }

  findMandateByToken(token) {
    return Array.from(this.mandates.values()).find((m) => m.magicToken === token);
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
      (m) => m.riaId === riaId && (m.status === 'in_review' || m.status === 'draft')
    ).length;
  }

  // Audit Log operations - strictly immutable, append-only
  createAuditLog(entry) {
    const id = `aud_${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();
    
    // Hash chaining with previous log entry
    const prevHash = this.auditLogs.length > 0 ? this.auditLogs[this.auditLogs.length - 1].payloadHash : 'GENESIS';
    const rawPayload = JSON.stringify({ ...entry, prevHash, timestamp });
    const payloadHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const logEntry = Object.freeze({
      id,
      ...entry,
      timestamp,
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

  // OTP management
  setOtp(token, mobile, code, ttlSeconds = 300) {
    this.otps.set(token, {
      code,
      mobile,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  verifyOtp(token, code) {
    const entry = this.otps.get(token);
    if (!entry) return { valid: false, reason: 'OTP not found or expired' };
    if (Date.now() > entry.expiresAt) {
      this.otps.delete(token);
      return { valid: false, reason: 'OTP expired. Please request a new code.' };
    }
    if (entry.code !== code && code !== '123456') { // 123456 test demo bypass
      return { valid: false, reason: 'Invalid 6-digit OTP' };
    }
    this.otps.delete(token);
    return { valid: true };
  }
}

export const dbStore = new FinConsentStore();
