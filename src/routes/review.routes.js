import express from 'express';
import {
  create,
  getForListing,
  remove,
} from '../controllers/review.controller.js';
import {
  authenticateToken,
  requireRole,
} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post(
  '/:listingId',
  authenticateToken,
  requireRole('buyer', 'admin'),
  create
);

router.get('/:listingId', getForListing);

router.delete(
  '/:id',
  authenticateToken,
  remove
);

export default router;