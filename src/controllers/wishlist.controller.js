import {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist,
} from '../services/wishlist.service.js';
import logger from '../config/logger.js';

export const add = async (req, res, next) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const result = await addToWishlist(req.user.id, listingId);

    return res.status(201).json({
      message: 'Added to wishlist successfully',
      wishlist: result,
    });
  } catch (error) {
    logger.error('Add wishlist error:', error);

    if (error.message === 'Listing already in wishlist') {
      return res.status(409).json({ error: error.message });
    }

    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await removeFromWishlist(req.user.id, req.params.listingId);

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Remove wishlist error:', error);
    next(error);
  }
};

export const getMine = async (req, res, next) => {
  try {
    const result = await getMyWishlist(req.user.id);

    return res.status(200).json({
      message: 'Wishlist retrieved successfully',
      wishlist: result,
    });
  } catch (error) {
    logger.error('Get wishlist error:', error);
    next(error);
  }
};
