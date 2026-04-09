import express from 'express';
import { add, remove, getMine } from '../controllers/wishlist.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:listingId', authenticateToken, add);

router.delete('/:listingId', authenticateToken, remove);

router.get('/mine', authenticateToken, getMine);

export default router;
