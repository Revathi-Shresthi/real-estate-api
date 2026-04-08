import express from 'express';
import {
  create,
  getMine,
  reply,
  remove,
} from '../controllers/inquiry.controller.js';
import {
  authenticateToken,
  requireRole,
} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  requireRole('buyer', 'admin'),
  create
);

router.get(
  '/mine',
  authenticateToken,
  getMine
);

router.post(
  '/:id/reply',
  authenticateToken,
  requireRole('agent', 'admin'),
  reply
);

router.delete(
  '/:id',
  authenticateToken,
  remove
);

export default router;