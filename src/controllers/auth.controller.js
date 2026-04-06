import { createUser, authenticateUser } from '../services/auth.service.js';
import { jwtToken } from '../utils/jwt.js';
import { cookies } from '../utils/cookies.js';
import { signupSchema, signinSchema } from '../validations/auth.validation.js';
import { formatValidationError } from '../utils/format.js';
import logger from '../config/logger.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, password, role, phone } = validationResult.data;

    const user = await createUser({ name, email, password, role, phone });

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token, { maxAge: 24 * 60 * 60 * 1000 });

    logger.info(`User registered: ${email}`);

    return res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    logger.error('Signup error:', error);

    if (error.message === 'User with this email already exists') {
      return res.status(409).json({
        error: 'User with this email already exists',
      });
    }

    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationResult = signinSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser({ email, password });

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token, { maxAge: 24 * 60 * 60 * 1000 });

    logger.info(`User signed in: ${email}`);

    return res.status(200).json({
      message: 'Signed in successfully',
      user,
      token,
    });
  } catch (error) {
    logger.error('Signin error:', error);

    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    if (error.message === 'Account is deactivated') {
      return res.status(403).json({
        error: 'Account is deactivated',
      });
    }

    next(error);
  }
};

export const signout = async (req, res) => {
  try {
    cookies.clear(res, 'token');

    logger.info(`User signed out: ${req.user?.email}`);

    return res.status(200).json({
      message: 'Signed out successfully',
    });
  } catch (error) {
    logger.error('Signout error:', error);
    return res.status(500).json({
      error: 'Error signing out',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      message: 'User retrieved successfully',
      user: req.user,
    });
  } catch (error) {
    logger.error('GetMe error:', error);
    return res.status(500).json({
      error: 'Error retrieving user',
    });
  }
};