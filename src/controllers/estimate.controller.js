import { getPriceEstimate } from '../services/estimate.service.js';
import logger from '../config/logger.js';

export const estimate = async (req, res, next) => {
  try {
    const {
      city,
      state,
      type,
      category,
      bedrooms,
      bathrooms,
      area,
    } = req.body;

    if (!city || !state || !type || !category ||
        !bedrooms || !bathrooms || !area) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: [
          'city', 'state', 'type', 'category',
          'bedrooms', 'bathrooms', 'area'
        ],
      });
    }

    const result = await getPriceEstimate({
      city, state, type, category,
      bedrooms, bathrooms, area,
    });

    return res.status(200).json({
      message: 'Price estimate generated successfully',
      input: { city, state, type, category, bedrooms, bathrooms, area },
      ...result,
    });
  } catch (error) {
    logger.error('Estimate error:', error);
    next(error);
  }
};