import { Router } from "express";
import {
  deleteSavedBlogController,
  getSavedBlogsByUsernameController,
  saveBlogController,
  getBlogsByUsernameController,
  getLikedBlogsByUsernameController
} from "../controllers/user.controllers.js";

const userRoutes = Router();

userRoutes.post("/save/blog/:id", saveBlogController);


userRoutes.delete("/delete/save/blog/:id", deleteSavedBlogController);


userRoutes.get("/profile/:name/saved-blogs", getSavedBlogsByUsernameController);

userRoutes.get("/profile/:name/blogs", getBlogsByUsernameController)

userRoutes.get("/profile/:name/liked-blogs", getLikedBlogsByUsernameController)

export default userRoutes;