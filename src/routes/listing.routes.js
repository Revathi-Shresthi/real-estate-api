import express from 'express';
import {
  create,
  getAll,
  getById,
  update,
  remove,
  updateStatus,
  getMyListings,
} from '../controllers/listing.controller.js';

import {
  authenticateToken,
  requireRole,
} from '../middleware/auth.middleware.js';

import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAll);

// ✅ This must come BEFORE /:id
router.get(
  '/agent/my-listings',
  authenticateToken,
  requireRole('agent', 'admin'),
  getMyListings
);

router.get('/:id', getById);

// Protected routes
router.post(
  '/',
  authenticateToken,
  requireRole('agent', 'admin'),
  upload.array('images', 10),
  create
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('agent', 'admin'),
  upload.array('images', 10),
  update
);

router.delete('/:id', authenticateToken, requireRole('agent', 'admin'), remove);

router.patch(
  '/:id/status',
  authenticateToken,
  requireRole('agent', 'admin'),
  updateStatus
);

export default router;
