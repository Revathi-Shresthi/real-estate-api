import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';
import logger from './logger.js';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({
      mode: 'LIVE',
    }),
    detectBot({
      mode: 'LIVE',
      allow: [
        'CATEGORY:SEARCH_ENGINE',
        'CATEGORY:PREVIEW',
        'CATEGORY:MONITOR',
      ],
    }),
    slidingWindow({
      mode: 'LIVE',
      interval: '1m',
      max: 60,
    }),
  ],
});

logger.info('Arcjet security configured');

export default aj;