import express from 'express';
import {
  getAll,
  getById,
  update,
  remove,
} from '../controllers/user.controller.js';
import {
  authenticateToken,
  requireRole,
} from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('admin'), getAll);

router.get('/:id', authenticateToken, getById);

router.put('/:id', authenticateToken, update);

router.delete('/:id', authenticateToken, remove);

export default router;
