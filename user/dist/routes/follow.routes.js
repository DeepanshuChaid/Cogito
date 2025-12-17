import { Router } from "express";
import { followUserController } from "../controllers/follow.controllers.js";
const followRoutes = Router();
followRoutes.post("/follow/:name", followUserController);
export default followRoutes;
