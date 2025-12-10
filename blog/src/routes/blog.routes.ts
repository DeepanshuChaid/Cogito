import { Router } from "express";
import uploadFile from "../middlewares/multerMiddleware.js";
import {
  createBlogController,
  updateBlogController,
  deleteBlogController,
  getAllUserBlogsController,
  getBlogByIdController,
  getRecommendedBlogsController,
  searchBlogsController
} from "../controllers/blog.controllers.js";
import {
  likeBlogController,
  dislikeBlogController,
} from "../controllers/reaction.controllers.js";

const blogRoutes = Router();

blogRoutes.get("/search", searchBlogsController)

blogRoutes.get("/get/:id", getBlogByIdController);

blogRoutes.post("/create", uploadFile, createBlogController);

blogRoutes.put("/update/:id", uploadFile, updateBlogController);

blogRoutes.delete("/delete/:id", deleteBlogController);

blogRoutes.get("/all", getAllUserBlogsController);

blogRoutes.get("/recommended", getRecommendedBlogsController);

blogRoutes.post("/like/:id", likeBlogController);

blogRoutes.post("/dislike/:id", dislikeBlogController);

export default blogRoutes;


