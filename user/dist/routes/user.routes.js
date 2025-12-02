import { Router } from "express";
import { getUserDataController, loginUserController, registerUserController } from "../controllers/user.controlleres.js";
import { isAuthenticatedMiddleware } from "../middlewares/isAuthenticatedMiddleware.js";
const userRoutes = Router();
userRoutes.post("/login", loginUserController);
userRoutes.post("/register", registerUserController);
userRoutes.get("/current", isAuthenticatedMiddleware, getUserDataController);
export default userRoutes;
