import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let lastConnectionError = null;
let listenersRegistered = false;

/**
 * Resolves MongoDB connection URI from environment variables with aliases and normalization.
 * Handles Render / container environments where variables might be named MONGODB_URI,
 * MONGO_URI, or DATABASE_URL, and strips accidental wrapping quotes or whitespace.
 */
export function getMongoUri() {
  const raw = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || '';
  if (typeof raw !== 'string') return '';
  let cleaned = raw.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

/**
 * Sanitizes MongoDB connection URIs by redacting credentials (passwords).
 * Safe for logging and diagnostic output without exposing secrets.
 */
export function sanitizeMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return '';
  try {
    return rawUri.replace(/(mongodb(?:\+srv)?:\/\/)([^:@/]+):([^@/]+)@/i, '$1$2:****@');
  } catch {
    return '[REDACTED_URI]';
  }
}

/**
 * Sanitizes error messages by redacting any embedded MongoDB connection strings containing passwords.
 */
export function sanitizeError(errMessage) {
  if (!errMessage || typeof errMessage !== 'string') return '';
  return errMessage.replace(/(mongodb(?:\+srv)?:\/\/)([^:@/]+):([^@/]+)@/gi, '$1$2:****@');
}

/**
 * Determines whether in-memory storage fallback is permitted.
 * Strictly forbidden in production (NODE_ENV === 'production') unless explicitly overridden
 * with ALLOW_IN_MEMORY_FALLBACK === 'true'. Always allowed in development/test.
 */
export function isInMemoryAllowed() {
  if (process.env.ALLOW_IN_MEMORY_FALLBACK === 'true') {
    return true;
  }
  return process.env.NODE_ENV !== 'production';
}

/**
 * Returns true if the Mongoose connection is actively connected to MongoDB (readyState === 1).
 */
export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Returns true if the database is ready to accept data-dependent writes.
 * In production, this requires an active live MongoDB connection.
 * In dev/test, this permits in-memory storage.
 */
export function isWriteReady() {
  return isDbConnected() || isInMemoryAllowed();
}

let reconnectTimer = null;

/**
 * Cancels any active reconnection timer (used during shutdown / testing).
 */
export function cancelReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

/**
 * Schedules background reconnection retries when live MongoDB Atlas is disconnected in production.
 * Ensures the container automatically heals when Atlas network or cluster becomes reachable.
 */
export function scheduleReconnect(intervalMs = 10000) {
  if (reconnectTimer || isDbConnected() || isInMemoryAllowed()) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (!isDbConnected() && !isInMemoryAllowed()) {
      console.log('[DB] Attempting automatic background reconnection to MongoDB Atlas...');
      const ok = await connectDB();
      if (!ok) {
        scheduleReconnect(intervalMs);
      }
    }
  }, intervalMs);
}

/**
 * Returns diagnostic metadata regarding current database health and storage mode.
 */
export function getDbStatus() {
  const connected = isDbConnected();
  const readyState = mongoose.connection.readyState;
  const inMemAllowed = isInMemoryAllowed();
  const rawUri = getMongoUri();

  let state = 'disconnected';
  if (readyState === 1) state = 'connected';
  else if (readyState === 2) state = 'connecting';
  else if (readyState === 3) state = 'disconnecting';
  else if (lastConnectionError) state = 'error';

  return {
    connected,
    state,
    readyState,
    storageMode: connected ? 'mongodb' : (inMemAllowed ? 'in-memory' : 'unavailable'),
    inMemoryAllowed: inMemAllowed,
    writesBlocked: !isWriteReady(),
    configuredUri: Boolean(rawUri),
    sanitizedUri: sanitizeMongoUri(rawUri),
    reconnectScheduled: Boolean(reconnectTimer),
    lastError: lastConnectionError ? sanitizeError(lastConnectionError) : null,
    diagnostics: diagnoseMongoConfig(),
  };
}

/**
 * Inspects MongoDB environment configuration without exposing credentials.
 * Provides actionable diagnostic feedback for deployment troubleshooting.
 */
export function diagnoseMongoConfig() {
  const configuredVar = process.env.MONGODB_URI ? 'MONGODB_URI' : (process.env.MONGO_URI ? 'MONGO_URI' : (process.env.DATABASE_URL ? 'DATABASE_URL' : null));
  if (!configuredVar) {
    return {
      status: 'MISSING_CONFIGURATION',
      configuredVar: null,
      message: 'No MongoDB URI environment variable detected. Configure MONGODB_URI (or MONGO_URI, DATABASE_URL).',
      recommendations: [
        'Set MONGODB_URI in Render dashboard Environment settings',
        'Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/finconsent?retryWrites=true&w=majority',
      ],
    };
  }

  const cleaned = getMongoUri();
  const isSrv = cleaned.startsWith('mongodb+srv://');
  const isStandard = cleaned.startsWith('mongodb://');

  let hasUser = false;
  let hasPassword = false;
  let host = 'unknown';
  let dbName = null;

  try {
    const urlWithoutProto = cleaned.replace(/^mongodb(?:\+srv)?:\/\//, '');
    const atSplit = urlWithoutProto.split('@');
    if (atSplit.length > 1) {
      const creds = atSplit[0].split(':');
      hasUser = Boolean(creds[0]);
      hasPassword = Boolean(creds[1]);
      const hostAndPath = atSplit[1].split('/')[0];
      host = hostAndPath.split('?')[0];
      const pathPart = atSplit[1].split('/')[1];
      if (pathPart) {
        dbName = pathPart.split('?')[0];
      }
    }
  } catch {
    // safe fallback
  }

  const recommendations = [];
  if (!hasPassword) {
    recommendations.push('Password appears to be missing from connection URI');
  }
  if (!dbName) {
    recommendations.push('Explicit database name (/finconsent) omitted; defaulting to finconsent');
  }
  if (lastConnectionError && lastConnectionError.includes('ECONNREFUSED')) {
    recommendations.push('DNS SRV ECONNREFUSED: Check Atlas Network Access (whitelist 0.0.0.0/0 for Render outbound IPs) and verify cluster is active');
  } else if (lastConnectionError && lastConnectionError.toLowerCase().includes('auth')) {
    recommendations.push('Authentication failed: Percent-encode special characters in password (e.g. @ -> %40, : -> %3A) and verify database user privileges');
  }

  return {
    status: isDbConnected() ? 'CONNECTED' : (lastConnectionError ? 'CONNECTION_FAILED' : 'CONFIGURED'),
    configuredVar,
    protocol: isSrv ? 'mongodb+srv' : (isStandard ? 'mongodb' : 'unknown'),
    hasUser,
    hasPassword,
    host,
    targetDb: dbName || 'finconsent (defaulted)',
    tlsRequired: isSrv,
    sanitizedUri: sanitizeMongoUri(cleaned),
    lastError: lastConnectionError ? sanitizeError(lastConnectionError) : null,
    recommendations,
  };
}

/**
 * Establishes connection to MongoDB Atlas.
 * Configured with 10s selection timeout, IPv4 first (family: 4) for container DNS stability,
 * and secret-safe error logging.
 */
export async function connectDB() {
  const uri = getMongoUri();

  if (!listenersRegistered) {
    mongoose.connection.on('connected', () => {
      cancelReconnect();
      console.log('[DB] MongoDB Atlas connection established.');
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB Atlas connection disconnected.');
      if (!isInMemoryAllowed()) {
        scheduleReconnect(10000);
      }
    });
    mongoose.connection.on('error', (err) => {
      const safeMsg = sanitizeError(err.message || String(err));
      console.error('[DB] MongoDB Atlas connection error:', safeMsg);
    });
    listenersRegistered = true;
  }

  if (!uri) {
    lastConnectionError = 'No MONGODB_URI, MONGO_URI, or DATABASE_URL environment variable configured';
    if (!isInMemoryAllowed()) {
      console.error('[DB] CRITICAL: No MongoDB URI configured in production environment! Persistent storage is required; in-memory fallback is disabled in production.');
      scheduleReconnect(10000);
    } else {
      console.log('[DB] No MongoDB URI configured. Running with in-memory persistence store (allowed in development/test).');
    }
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // Force IPv4 first to avoid IPv6 DNS SRV lookup delays in containers
      maxPoolSize: 10,
      dbName: 'finconsent', // Explicit database name guarantees no fallback to 'test'
    });
    lastConnectionError = null;
    cancelReconnect();
    console.log(`[DB] Successfully connected to live MongoDB Atlas cluster (${sanitizeMongoUri(uri)}).`);
    return true;
  } catch (err) {
    lastConnectionError = sanitizeError(err.message || String(err));
    if (!isInMemoryAllowed()) {
      console.error(`[DB] CRITICAL: Live MongoDB connection failed in production (${lastConnectionError}). In-memory fallback is disabled; readiness probe will report 503 and writes are blocked.`);
      scheduleReconnect(10000);
    } else {
      console.warn(`[DB] Live MongoDB connection unavailable (${lastConnectionError}). Operating with local in-memory store for development/test environment.`);
    }
    return false;
  }
}

/**
 * Helper to cleanly disconnect for tests and graceful shutdown.
 */
export async function disconnectDB() {
  cancelReconnect();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
