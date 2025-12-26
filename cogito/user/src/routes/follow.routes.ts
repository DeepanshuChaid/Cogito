import { Router } from "express";
import { followUserController } from "../controllers/follow.controllers.js";
import { rateLimit } from "../ratelimiter/bucketToken.ratelimiter.js";

const followRoutes = Router();

followRoutes.post(
  "/follow/:name",
  rateLimit({ capacity: 5, refillPerSecond: 0.2 }),
  followUserController,
);

export default followRoutes;
