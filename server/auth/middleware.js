import { verifyToken } from './jwt.js';
import { dbStore } from '../db/store.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
  }

  const user = dbStore.findUserById(decoded.userId);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User account not found' });
  }

  req.user = user;
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
