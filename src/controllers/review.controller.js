import {
  createReview,
  getListingReviews,
  deleteReview,
} from '../services/review.service.js';
import { createReviewSchema } from '../validations/review.validation.js';
import { formatValidationError } from '../utils/format.js';
import logger from '../config/logger.js';

export const create = async (req, res, next) => {
  try {
    const body = {
      ...req.body,
      rating: parseInt(req.body.rating),
    };

    const validationResult = createReviewSchema.safeParse(body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const review = await createReview(
      req.user.id,
      parseInt(req.params.listingId),
      validationResult.data
    );

    return res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    logger.error('Create review error:', error);

    if (error.message === 'You have already reviewed this listing') {
      return res.status(409).json({ error: error.message });
    }

    next(error);
  }
};

export const getForListing = async (req, res, next) => {
  try {
    const result = await getListingReviews(req.params.listingId);

    return res.status(200).json({
      message: 'Reviews retrieved successfully',
      ...result,
    });
  } catch (error) {
    logger.error('Get reviews error:', error);
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await deleteReview(
      parseInt(req.params.id),
      req.user.id,
      req.user.role
    );

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Delete review error:', error);
    next(error);
  }
};
