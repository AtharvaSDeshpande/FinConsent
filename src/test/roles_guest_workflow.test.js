import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../server/index.js';
import {
  ROLES,
  GUEST_USER,
  ESTABLISHED_PERSONAS,
  hasPermission,
  isRoleAllowed,
  getRoleDefinition,
} from '../security/roles.js';

describe('Established Users, Roles & Guest Role Workflow Suite', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(() => {
    if (server) server.close();
  });

  it('1. Establishes all 5 system roles with complete definitions and permissions', () => {
    const requiredRoles = ['guest', 'ria', 'compliance_officer', 'admin', 'client'];
    requiredRoles.forEach((roleKey) => {
      const def = ROLES[roleKey];
      expect(def).toBeDefined();
      expect(def.id).toBe(roleKey);
      expect(def.name).toBeDefined();
      expect(def.shortLabel).toBeDefined();
      expect(Array.isArray(def.permissions)).toBe(true);
      expect(def.permissions.length).toBeGreaterThan(0);
    });

    // Check specific role capabilities
    expect(ROLES.guest.isGuest).toBe(true);
    expect(ROLES.ria.isGuest).toBe(false);
    expect(ROLES.compliance_officer.isGuest).toBe(false);
    expect(ROLES.admin.isGuest).toBe(false);
    expect(ROLES.client.isGuest).toBe(false);

    // Permission checks
    expect(hasPermission('guest', 'view_public')).toBe(true);
    expect(hasPermission('guest', 'create_mandates')).toBe(false);
    expect(hasPermission('ria', 'create_mandates')).toBe(true);
    expect(hasPermission('compliance_officer', 'approve_requests')).toBe(true);
    expect(hasPermission('admin', 'anything_at_all')).toBe(true); // Superadmin wildcard
  });

  it('2. Guarantees every unauthenticated guest user has an established guest role and profile', () => {
    expect(GUEST_USER).toBeDefined();
    expect(GUEST_USER.role).toBe('guest');
    expect(GUEST_USER.isGuest).toBe(true);
    expect(GUEST_USER.name).toBe('Guest Visitor');
    expect(GUEST_USER.permissions).toContain('view_public');
    expect(GUEST_USER.permissions).toContain('preview_demo');

    // Default fallback when role is unknown
    const fallbackDef = getRoleDefinition('unknown_role');
    expect(fallbackDef.id).toBe('guest');
  });

  it('3. Establishes interactive personas for fast role switching and journey testing', () => {
    expect(ESTABLISHED_PERSONAS.length).toBeGreaterThanOrEqual(6);
    const rolesPresent = ESTABLISHED_PERSONAS.map((p) => p.role);
    expect(rolesPresent).toContain('guest');
    expect(rolesPresent).toContain('ria');
    expect(rolesPresent).toContain('compliance_officer');
    expect(rolesPresent).toContain('admin');
    expect(rolesPresent).toContain('client');
  });

  it('4. Backend API exposes /api/auth/roles with complete role metadata and default guest role', async () => {
    const res = await fetch(`${baseUrl}/api/auth/roles`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.defaultGuestRole).toBe('guest');
    expect(data.roles.guest).toBeDefined();
    expect(data.roles.ria).toBeDefined();
    expect(data.roles.compliance_officer).toBeDefined();
    expect(data.roles.admin).toBeDefined();
    expect(data.roles.client).toBeDefined();
  });

  it('5. Backend API issues authenticated guest tokens via /api/auth/guest-session', async () => {
    const res = await fetch(`${baseUrl}/api/auth/guest-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.role).toBe('guest');
    expect(data.user.isGuest).toBe(true);
    expect(data.user.email).toBe('guest@finconsent.in');
  });

  it('6. Validates RBAC route allowance rules for guest and privileged roles', () => {
    // Unrestricted routes
    expect(isRoleAllowed('guest', [])).toBe(true);

    // RIA/Admin restricted
    expect(isRoleAllowed('guest', ['ria', 'admin'])).toBe(false);
    expect(isRoleAllowed('ria', ['ria', 'admin'])).toBe(true);
    expect(isRoleAllowed('client', ['ria', 'admin'])).toBe(false);

    // Super Admin bypasses restrictions
    expect(isRoleAllowed('admin', ['compliance_officer'])).toBe(true);
  });
});
