import { jwtToken } from '../utils/jwt.js';
import { cookies } from '../utils/cookies.js';
import logger from '../config/logger.js';

export const authenticateToken = (req, res, next) => {
  try {
    const token =
      cookies.get(req, 'token') || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No access token provided',
      });
    }

    const decoded = jwtToken.verify(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Your session has expired, please login again',
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `This action requires one of these roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};
