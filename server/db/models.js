import mongoose from 'mongoose';

// User Schema (users collection)
const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: false, default: '' },
    role: {
      type: String,
      enum: ['ria', 'compliance_officer', 'admin', 'client'],
      default: 'ria',
      index: true,
    },
    firmName: { type: String },
    sebiRegNumber: { type: String },
    complianceEmail: { type: String },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    googleId: { type: String, sparse: true },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, default: null },
    mfaPendingSecret: { type: String, default: null },
    backupCodes: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'users' }
);

// Client Schema (clients collection)
const ClientSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    riaId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    pan: { type: String, required: true, index: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    portfolioValue: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'clients' }
);

// Mandate Schema (mandates collection)
const MandateSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    riaId: { type: String, required: true, index: true },
    clientId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'consented', 'expired'],
      default: 'draft',
      index: true,
    },
    trades: { type: Array, default: [] },
    taxPayable: { type: Number, default: 0 },
    stcgTax: { type: Number, default: 0 },
    ltcgTax: { type: Number, default: 0 },
    magicTokenHash: { type: String, index: true },
    magicToken: { type: String, sparse: true, select: false },
    tokenExpiresAt: { type: Date },
    cutoffTimestamp: { type: Date },
    isRevoked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'mandates' }
);

// Audit Log Schema (auditlogs collection)
const AuditLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    timestamp: { type: String },
    timestampIST: { type: String },
    eventType: { type: String, index: true },
    riaId: { type: String, index: true },
    clientId: { type: String, index: true },
    mandateId: { type: String, index: true },
    requestId: { type: String, index: true },
    userId: { type: String, index: true },
    channel: { type: String },
    previousHash: { type: String },
    hash: { type: String },
    prevHash: { type: String },
    payloadHash: { type: String },
    metadata: { type: Object, default: {} },
  },
  { collection: 'auditlogs', strict: false }
);

// Request Schema (requests collection)
const RequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userRole: { type: String, default: 'ria' },
    userName: { type: String },
    userFirm: { type: String },
    clientId: { type: String, index: true },
    clientName: { type: String },
    category: { type: String, required: true, index: true },
    title: { type: String, required: true },
    priority: { type: String, default: 'standard' },
    description: { type: String, required: true },
    proposedEquityRatio: { type: Number, default: 60 },
    proposedDebtRatio: { type: Number, default: 25 },
    proposedGoldRatio: { type: Number, default: 10 },
    proposedCashRatio: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'in_review', 'approved', 'completed', 'rejected'],
      default: 'pending',
      index: true,
    },
    responseNotes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'requests' }
);

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const ClientModel = mongoose.models.Client || mongoose.model('Client', ClientSchema);
export const MandateModel = mongoose.models.Mandate || mongoose.model('Mandate', MandateSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export const RequestModel = mongoose.models.Request || mongoose.model('Request', RequestSchema);
