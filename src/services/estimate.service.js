import axios from 'axios';
import logger from '../config/logger.js';

export const getPriceEstimate = async (data) => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';

    const response = await axios.post(`${mlServiceUrl}/predict`, {
      city: data.city,
      state: data.state,
      type: data.type,
      category: data.category,
      bedrooms: parseInt(data.bedrooms),
      bathrooms: parseInt(data.bathrooms),
      area: parseFloat(data.area),
    });

    logger.info('Price estimate generated successfully');
    return response.data;
  } catch (error) {
    logger.error('Error getting price estimate:', error);
    throw new Error('Price estimation service unavailable');
  }
};