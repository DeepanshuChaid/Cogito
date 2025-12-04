import {Router} from "express"
import { getUserDataController, loginUserController, registerUserController } from "../controllers/user.controlleres.js"
import { isAuthenticatedMiddleware } from "../middlewares/isAuthenticatedMiddleware.js"
import passport from "../configs/passport.config.js"

const failedUrl = `${process.env.FRONTEND_URL}?status=failure`
const userRoutes = Router()

userRoutes.post("/login", loginUserController)

userRoutes.post("/register", registerUserController)

userRoutes.get("/current", isAuthenticatedMiddleware, getUserDataController)

userRoutes.get(
  "/google",
  passport.authenticate("google", {
    failureRedirect: failedUrl
  }),
  (req, res, next) => {
    console.log("Google auth initiated")
    next()    
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
)

userRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: failedUrl
  }),
  (_, res) => {
    res.redirect("/")
  }
)

export default userRoutes

