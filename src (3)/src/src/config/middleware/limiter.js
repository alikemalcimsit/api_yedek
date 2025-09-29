import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

 const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  message: {
    error: true,
    message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
    retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { limiter };