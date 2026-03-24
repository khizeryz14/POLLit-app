import rateLimit from "express-rate-limit"

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: "Too many requests, please slow down." },
  standardHeaders: true, 
  legacyHeaders: false,
});


export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { message: "You are creating too many things! Try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 1 hour
  max: 50,
  message: { message: "You are voting too many polls! Try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});