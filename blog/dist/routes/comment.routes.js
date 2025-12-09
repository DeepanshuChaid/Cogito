import { Router } from "express";
import { createCommentController, deleteCommentController, updateCommentController } from "../controllers/comment.controllers.js";
const commentRoutes = Router();
commentRoutes.post("/create/blog/:blogId", createCommentController);
commentRoutes.delete("/delete/:id/blog/:blogId", deleteCommentController);
commentRoutes.put("/update/:id/blog/:blogId", updateCommentController);
export default commentRoutes;
