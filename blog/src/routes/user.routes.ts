import { Router } from "express";
import {
  deleteSavedBlogController,
  getSavedBlogsController,
  saveBlogController, getOtherUserBlogsController,
  getOtherUserSavedBlogsController
} from "../controllers/user.controllers.js";

const userRoutes = Router();

userRoutes.post("/save/blog/:id", saveBlogController);

userRoutes.get("/save/blog/all", getSavedBlogsController);

userRoutes.delete("/delete/save/blog/:id", deleteSavedBlogController);

userRoutes.get("/profile/:name/blogs", getOtherUserBlogsController);

userRoutes.get("/profile/:name/saved-blogs", getOtherUserSavedBlogsController);

export default userRoutes;
