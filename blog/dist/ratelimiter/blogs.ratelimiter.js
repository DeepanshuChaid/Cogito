import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "../server.js";
// Limit to 50 blog actions per 50 minutes per IP
export const blogLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
    windowMs: 50 * 60 * 1000, // 50 minutes
    max: 50, // max 50 requests per window
    standardHeaders: true, // X-RateLimit headers
    legacyHeaders: false,
    message: {
        message: "Too many blog actions from this IP. Try again later.",
    },
});
