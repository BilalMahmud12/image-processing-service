import rateLimit from 'express-rate-limit';

export const uploadRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: 'Too many requests. Please try again later.',
    headers: true,
});
