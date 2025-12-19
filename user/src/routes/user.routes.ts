import { Router } from "express";
import {
  getUserDataController,
  loginUserController,
  registerUserController,
  updateUserDataController,
  logoutUserController,
  updateProfilePictureController,
  getProfileUserDataController,
} from "../controllers/user.controlleres.js";
import { isAuthenticatedMiddleware } from "../middlewares/isAuthenticatedMiddleware.js";
import passport from "../configs/passport.config.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.utils.js";
import { setCookies } from "../utils/cookie.utils.js";
import uploadFile from "../middlewares/multerMiddleware.js";
import { rateLimit } from "../ratelimiter/bucketToken.ratelimiter.js";

const userRoutes = Router();

userRoutes.post(
  "/login",
  rateLimit({ capacity: 3, refillPerSecond: 0.8 }),
  loginUserController,
);

userRoutes.post(
  "/register",
  rateLimit({ capacity: 3, refillPerSecond: 0.2 }),
  registerUserController,
);

userRoutes.put(
  "/update",
  rateLimit({ capacity: 3, refillPerSecond: 0.2 }),
  isAuthenticatedMiddleware,
  updateUserDataController,
);

userRoutes.post(
  "/update/profile-picture",
  rateLimit({ capacity: 3, refillPerSecond: 0.8 }),
  isAuthenticatedMiddleware,
  uploadFile,
  updateProfilePictureController,
);

userRoutes.get(
  "/current",
  rateLimit({ capacity: 25, refillPerSecond: 0.2 }),
  isAuthenticatedMiddleware,
  getUserDataController,
);

// Logout route
userRoutes.post("/logout", isAuthenticatedMiddleware, logoutUserController);

// get other user data
userRoutes.get(
  "/profile/:name",
  isAuthenticatedMiddleware,
  getProfileUserDataController,
);

// Login route - THIS IS WHERE YOU ADD SCOPE
userRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // ✅ Scope goes here
  }),
);

// Callback route
userRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const user = req.user as { id: string };
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    setCookies(res, accessToken, refreshToken);
    res.redirect("/"); // Redirect after successful login
  },
);

export default userRoutes;
