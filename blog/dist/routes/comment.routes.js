import { Router } from "express";
import { createCommentController } from "../controllers/comment.controllers.js";
const commentRoutes = Router();
commentRoutes.post("/create", createCommentController);
export default commentRoutes;
