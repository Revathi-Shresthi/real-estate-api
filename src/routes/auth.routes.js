import express from 'express';
import {
  signup,
  signin,
  signout,
  getMe,
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);
router.get('/me', authenticateToken, getMe);

export default router;