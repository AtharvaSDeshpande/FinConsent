import { verifyToken } from './jwt.js';
import { dbStore } from '../db/store.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];

  // 1. Check session revocation blacklist
  if (dbStore.isTokenRevoked(token)) {
    return res.status(401).json({ success: false, error: 'Session has been revoked / logged out' });
  }

  // 2. Cryptographic signature and expiry verification
  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
  }

  // 3. Prevent temp MFA tokens from accessing fully authenticated endpoints
  if (decoded.mfaPending) {
    return res.status(401).json({
      success: false,
      error: 'Two-factor authentication verification required',
      mfaRequired: true,
    });
  }

  const user = dbStore.findUserById(decoded.userId);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User account not found' });
  }

  // 4. Server-side MFA enforcement for enrolled accounts
  if (user.mfaEnabled && !decoded.mfaVerified) {
    return res.status(401).json({
      success: false,
      error: 'MFA verification required for this account',
      mfaRequired: true,
    });
  }

  req.user = user;
  req.token = token;
  next();
}

/**
 * Role-Based Access Control (RBAC) middleware
 * Enforces route and action level restrictions based on user roles
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const userRole = req.user.role || 'ria';
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Role '${userRole}' lacks permission for this action. Permitted roles: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}
