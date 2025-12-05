import { Router } from "express";
import { getUserDataController, loginUserController, registerUserController } from "../controllers/user.controlleres.js";
import { isAuthenticatedMiddleware } from "../middlewares/isAuthenticatedMiddleware.js";
import passport from "../configs/passport.config.js";
const userRoutes = Router();
userRoutes.post("/login", loginUserController);
userRoutes.post("/register", registerUserController);
userRoutes.get("/current", isAuthenticatedMiddleware, getUserDataController);
// Login route - THIS IS WHERE YOU ADD SCOPE
userRoutes.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"], // ✅ Scope goes here
}));
// Callback route
userRoutes.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/"); // Redirect after successful login
});
// Logout route
userRoutes.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err)
            return res.status(500).json({ error: err.message });
        res.redirect("/");
    });
});
export default userRoutes;
