import { Router } from "express";
import { getNotificationsController, markNotificationsAsReadController, markAllAsReadController, deleteNotificationController } from "../controllers/notification.controller.js";
import { rateLimit } from "../ratelimiter/bucketToken.ratelimiter.js";
const notificationRoutes = Router();
notificationRoutes.get("/get", rateLimit({ capacity: 5, refillPerSecond: 0.5 }), getNotificationsController);
notificationRoutes.put("/mark-as-read", rateLimit({ capacity: 1, refillPerSecond: 0.1 }), markNotificationsAsReadController);
notificationRoutes.put("/mark-as-read/all", rateLimit({ capacity: 1, refillPerSecond: 0.1 }), markAllAsReadController);
notificationRoutes.delete("/delete/:notificationId", rateLimit({ capacity: 5, refillPerSecond: 0.1 }), deleteNotificationController);
export default notificationRoutes;
