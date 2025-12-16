import { Router } from "express";
import { deleteSavedBlogController, getSavedBlogsController, saveBlogController, } from "../controllers/user.controllers.js";
const userRoutes = Router();
userRoutes.post("/save/blog/:id", saveBlogController);
userRoutes.delete("/delete/save/blog/:id", deleteSavedBlogController);
userRoutes.get("/profile/:name/saved-blogs", getSavedBlogsController); // Only one GET route
export default userRoutes;
