import { Router } from "express";
import { getNotifications, markNotificationsAsRead, markAllAsRead } from "../controllers/notification.controller.js";
import { rateLimit } from "../ratelimiter/bucketToken.ratelimiter.js";
const notificationRoutes = Router();
notificationRoutes.get("/get", rateLimit({ capacity: 5, refillPerSecond: 0.5 }), getNotifications);
notificationRoutes.put("/mark-as-read", rateLimit({ capacity: 1, refillPerSecond: 0.1 }), markNotificationsAsRead);
notificationRoutes.put("/mark-as-read/all", rateLimit({ capacity: 1, refillPerSecond: 0.1 }), markAllAsRead);
notificationRoutes.delete;
export default notificationRoutes;
