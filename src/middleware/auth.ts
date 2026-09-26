import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, UserProfile } from '../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medvision_enterprise_secure_jwt_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export function generateJWTToken(user: UserProfile): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role, 
      email: user.email 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If authorization header is absent in demo mode, proceed with default user
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserProfile;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication JWT token' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(); // Default pass for demo
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires role: ${roles.join(', ')}` });
    }
    next();
  };
}
