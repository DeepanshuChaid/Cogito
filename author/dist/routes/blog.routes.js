import { Router } from "express";
import uploadFile from "../middlewares/multerMiddleware.js";
import { createBlogController } from "../controllers/blog.controllers.js";
const blogRoutes = Router();
blogRoutes.post("/create", uploadFile, createBlogController);
export default blogRoutes;
