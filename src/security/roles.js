/**
 * FinConsent Established Roles & RBAC Architecture
 * Implements strict role definitions covering Guest, RIA, Compliance Officer, Admin, and Client
 */

export const ROLES = {
  guest: {
    id: 'guest',
    name: 'Guest Visitor',
    shortLabel: 'GUEST',
    badge: 'GUEST',
    color: 'default',
    description: 'Public visitor exploring FinConsent statutory advisory and consent workflows.',
    isGuest: true,
    permissions: ['view_public', 'view_disclosures', 'preview_demo', 'switch_persona'],
    allowedRoutes: ['/', '/login', '/register', '/legal/privacy', '/legal/terms', '/legal/refund', '/m/:token'],
  },
  ria: {
    id: 'ria',
    name: 'Registered Investment Adviser (RIA)',
    shortLabel: 'RIA ADVISER',
    badge: 'RIA',
    color: 'primary',
    description: 'SEBI-registered Investment Adviser drafting trade rebalance mandates per Regulation 19.',
    isGuest: false,
    permissions: [
      'create_mandates',
      'view_mandates',
      'compose_requests',
      'view_clients',
      'manage_billing',
      'view_dossier',
    ],
    allowedRoutes: [
      '/dashboard',
      '/mandates/new',
      '/mandates/:id',
      '/requests',
      '/requests/new',
      '/clients',
      '/settings/profile',
      '/settings/billing',
    ],
  },
  compliance_officer: {
    id: 'compliance_officer',
    name: 'Compliance & Audit Officer',
    shortLabel: 'COMPLIANCE OFFICER',
    badge: 'AUDITOR',
    color: 'info',
    description: 'Statutory compliance authority scrutinizing trade mandates and SEBI audit dossiers.',
    isGuest: false,
    permissions: [
      'view_mandates',
      'review_requests',
      'approve_requests',
      'view_clients',
      'view_audit_trail',
      'view_dossier',
      'export_dossier',
    ],
    allowedRoutes: ['/dashboard', '/mandates/:id', '/requests', '/clients', '/settings/profile'],
  },
  admin: {
    id: 'admin',
    name: 'Platform Super Admin',
    shortLabel: 'SUPER ADMIN',
    badge: 'SUPERUSER',
    color: 'secondary',
    description: 'Platform administrator with unconstrained access across all advisory practices and audit trails.',
    isGuest: false,
    permissions: ['*'],
    allowedRoutes: ['*'],
  },
  client: {
    id: 'client',
    name: 'Advisory Client / Investor',
    shortLabel: 'CLIENT INVESTOR',
    badge: 'CLIENT',
    color: 'success',
    description: 'Individual or corporate client reviewing rebalance proposals and submitting OTP consent.',
    isGuest: false,
    permissions: ['view_own_mandates', 'submit_consent', 'view_receipts', 'view_requests'],
    allowedRoutes: ['/dashboard', '/requests', '/m/:token', '/settings/profile'],
  },
};

export const GUEST_USER = {
  id: 'guest_visitor',
  name: 'Guest Visitor',
  email: 'guest@finconsent.in',
  role: 'guest',
  isGuest: true,
  plan: 'guest',
  permissions: ROLES.guest.permissions,
};

export const ESTABLISHED_PERSONAS = [
  {
    role: 'guest',
    label: 'Guest Visitor',
    email: 'guest@finconsent.in',
    badge: 'Public',
    description: 'Explore statutory disclosures and test-drive role workflows',
  },
  {
    role: 'ria',
    label: 'RIA (Free Plan)',
    email: 'ria@example.in',
    badge: 'Standard',
    description: 'Draft rebalances, compose advisory requests, up to 3 active mandates',
  },
  {
    role: 'ria',
    label: 'RIA (Pro Plan)',
    email: 'pro.ria@example.in',
    badge: 'Pro',
    description: 'Unlimited mandates, tax optimization engine, priority compliance dossiers',
  },
  {
    role: 'compliance_officer',
    label: 'Compliance Officer',
    email: 'compliance@example.in',
    badge: 'Auditor',
    description: 'Scrutinize requests, inspect SHA-256 tamper-evident audit trails',
  },
  {
    role: 'admin',
    label: 'Platform Admin',
    email: 'admin@example.in',
    badge: 'Superuser',
    description: 'Global system administration, user management, and quota overrides',
  },
  {
    role: 'client',
    label: 'Advisory Client',
    email: 'client@example.in',
    badge: 'Investor',
    description: 'Inspect trade allocations, calculate tax impact, submit statutory OTP consent',
  },
];

export function getRoleDefinition(roleId) {
  return ROLES[roleId] || ROLES.guest;
}

export function hasPermission(userOrRole, permission) {
  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
  const def = ROLES[role] || ROLES.guest;
  if (def.permissions.includes('*')) return true;
  return def.permissions.includes(permission);
}

export function isRoleAllowed(role, allowedRoles = []) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (role === 'admin') return true;
  return allowedRoles.includes(role);
}
