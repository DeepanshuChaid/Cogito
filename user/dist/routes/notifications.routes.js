import { Router } from "express";
import { getNotifications } from "../controllers/notification.controller.js";
import { rateLimit } from "../ratelimiter/bucketToken.ratelimiter.js";
const notificationRoutes = Router();
notificationRoutes.get("/get", rateLimit({ capacity: 25, refillPerSecond: 0.5 }), getNotifications);
export default notificationRoutes;
