import {Router} from "express"
import { deleteSavedBlogController, getSavedBlogsController, saveBlogController } from "../controllers/user.controllers.js"
  
const userRoutes = Router()

userRoutes.post("/save/blog/:id", saveBlogController)

userRoutes.get("/save/blog/all", getSavedBlogsController)

userRoutes.delete("/delete/save/blog/:id", deleteSavedBlogController)

export default userRoutes