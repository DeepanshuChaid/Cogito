import { Router } from "express";
import {
  createCommentController,
  getAllCommentsInBlogController,
} from "../controllers/comment.controllers.js";

const commentRoutes = Router();

commentRoutes.post("/create/blog/:blogId", createCommentController);

commentRoutes.get("/get/blog/:blogId", getAllCommentsInBlogController);

export default commentRoutes;
