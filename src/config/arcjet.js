import arcjet, { shield, slidingWindow } from '@arcjet/node';
import logger from './logger.js';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({
      mode: 'DRY_RUN',
    }),
    slidingWindow({
      mode: 'DRY_RUN',
      interval: '1m',
      max: 100,
    }),
  ],
});

logger.info('Arcjet security configured');

export default aj;