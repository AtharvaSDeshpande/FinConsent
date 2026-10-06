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
