import { Router } from "express";
import { getNotifications } from "../controllers/notification.controller.js";
const notificationRoutes = Router();
notificationRoutes.get("/get", getNotifications);
export default notificationRoutes;
