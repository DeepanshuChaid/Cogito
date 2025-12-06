import { Router } from "express";
import uploadFile from "../middlewares/multerMiddleware.js";
import { createBlogController, updateBlogController, deleteBlogController, getAllUserBlogsController } from "../controllers/blog.controllers.js";
const blogRoutes = Router();
blogRoutes.post("/create", uploadFile, createBlogController);
blogRoutes.put("/update/:id", uploadFile, updateBlogController);
blogRoutes.delete("/delete/:id", deleteBlogController);
blogRoutes.get("/all", getAllUserBlogsController);
// ADD COMMENT
export default blogRoutes;
