import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import logger from './config/logger.js';
import { securityMiddleware } from './middleware/security.middleware.js';
import authRoutes from './routes/auth.routes.js';
import listingRoutes from './routes/listing.routes.js';
import inquiryRoutes from './routes/inquiry.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import reviewRoutes from './routes/review.routes.js';
import userRoutes from './routes/user.routes.js';
import estimateRoutes from './routes/estimate.routes.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(securityMiddleware);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Real Estate API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      listings: '/api/listings',
      inquiries: '/api/inquiries',
      wishlists: '/api/wishlists',
      reviews: '/api/reviews',
      estimate: '/api/estimate',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/estimate', estimateRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  });
});

export default app;