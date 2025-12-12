import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "../server.js";

// Limit to 20 requests per minute per IP
export const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // max 20 requests per window
  standardHeaders: true, // X-RateLimit headers
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP. Please try again in a minute.",
  },
});
