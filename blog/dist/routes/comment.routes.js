import { Router } from "express";
import { createCommentController, deleteCommentController } from "../controllers/comment.controllers.js";
const commentRoutes = Router();
commentRoutes.post("/create/blog/:blogId", createCommentController);
commentRoutes.delete("/delete/:id/blog/:blogId", deleteCommentController);
export default commentRoutes;
