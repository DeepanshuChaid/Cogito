import { Router } from "express";
import uploadFile from "../middlewares/multerMiddleware.js";
import {
  createBlogController,
  updateBlogController,
  deleteBlogController,
  getAllUserBlogsController,
  getBlogByIdController,
  likeBlogController,
  dislikeBlogController
} from "../controllers/blog.controllers.js";

const blogRoutes = Router();

blogRoutes.get("/get/:id", getBlogByIdController)

blogRoutes.post("/create", uploadFile, createBlogController);

blogRoutes.put("/update/:id", uploadFile, updateBlogController);

blogRoutes.delete("/delete/:id", deleteBlogController);

blogRoutes.get("/all", getAllUserBlogsController) 

blogRoutes.post("/like/:id", likeBlogController)

blogRoutes.post("/dislike/:id", dislikeBlogController)

// ADD COMMENT

export default blogRoutes;
