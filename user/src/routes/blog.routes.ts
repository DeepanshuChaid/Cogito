import { Router } from "express"
import { getRecommendedBlogsController } from "../controllers/blog.controller.js"

const blogRoutes = Router()

blogRoutes.get("/recommended", getRecommendedBlogsController)

export default blogRoutes