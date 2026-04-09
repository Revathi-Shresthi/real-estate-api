import aj from '../config/arcjet.js';
import logger from '../config/logger.js';

export const securityMiddleware = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        logger.warn('Bot request blocked', {
          ip: req.ip,
          path: req.path,
        });
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Automated requests are not allowed',
        });
      }

      if (decision.reason.isRateLimit()) {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
        });
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Please slow down and try again later',
        });
      }

      if (decision.reason.isShield()) {
        logger.warn('Shield blocked request', {
          ip: req.ip,
          path: req.path,
        });
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Request blocked by security policy',
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Security middleware error:', error);
    next();
  }
};
