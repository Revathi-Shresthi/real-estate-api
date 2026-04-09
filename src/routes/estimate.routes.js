import express from 'express';
import { estimate } from '../controllers/estimate.controller.js';

const router = express.Router();

router.post('/', estimate);

export default router;
