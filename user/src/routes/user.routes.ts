import {Router} from "express"
import { getUserDataController, loginUserController, registerUserController } from "../controllers/user.controlleres.js"
import { isAuthenticatedMiddleware } from "../middlewares/isAuthenticatedMiddleware.js"
import passport from "../configs/passport.config.js"
import { generateAccessToken, generateRefreshToken } from "../utils/token.utils.js"
import { setCookies } from "../utils/cookie.utils.js"


const userRoutes = Router()

userRoutes.post("/login", loginUserController)

userRoutes.post("/register", registerUserController)

userRoutes.get("/current", isAuthenticatedMiddleware, getUserDataController)

// Login route - THIS IS WHERE YOU ADD SCOPE
userRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // ✅ Scope goes here
  })
);

// Callback route
userRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const user = req.user as { id: string }
    
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    setCookies(res, accessToken, refreshToken)
    res.redirect("/"); // Redirect after successful login
  }
);

// Logout route
userRoutes.get("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("session")

  res.status(200).json({ message: "Logged out successfully" });
});


export default userRoutes




