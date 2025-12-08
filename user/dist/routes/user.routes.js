import { Router } from "express";
import { getUserDataController, loginUserController, registerUserController, updateUserDataController, logoutUserController, updateProfilePictureController } from "../controllers/user.controlleres.js";
import { isAuthenticatedMiddleware } from "../middlewares/isAuthenticatedMiddleware.js";
import passport from "../configs/passport.config.js";
import { generateAccessToken, generateRefreshToken, } from "../utils/token.utils.js";
import { setCookies } from "../utils/cookie.utils.js";
import uploadFile from "../middlewares/multerMiddleware.js";
const userRoutes = Router();
userRoutes.post("/login", loginUserController);
userRoutes.post("/register", registerUserController);
userRoutes.put("/update", isAuthenticatedMiddleware, updateUserDataController);
userRoutes.post("/update/profile-picture", isAuthenticatedMiddleware, uploadFile, updateProfilePictureController);
userRoutes.get("/current", isAuthenticatedMiddleware, getUserDataController);
// Logout route
userRoutes.post("/logout", isAuthenticatedMiddleware, logoutUserController);
// Login route - THIS IS WHERE YOU ADD SCOPE
userRoutes.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"], // ✅ Scope goes here
}));
// Callback route
userRoutes.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    const user = req.user;
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    setCookies(res, accessToken, refreshToken);
    res.redirect("/"); // Redirect after successful login
});
export default userRoutes;
