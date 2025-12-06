import { Router } from "express";
import uploadFile from "../middlewares/multerMiddleware.js";
import { createBlogController, updateBlogController } from "../controllers/blog.controllers.js";

const blogRoutes = Router()

blogRoutes.post("/create", uploadFile, createBlogController)

blogRoutes.put("/update/:id", uploadFile, updateBlogController)

export default blogRoutes





