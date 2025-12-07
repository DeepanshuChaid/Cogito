import express from "express";
import "dotenv/config";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import prisma from "./prisma.js";
import passport from "passport";
import session from "express-session";
import { isAuthenticatedMiddleware } from "./middlewares/isAuthenticatedMiddleware.js";
import { v2 as cloudinary } from "cloudinary";

const app = express();
const PORT = process.env.PORT || 3000;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(
  session({
    name: "session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/user", userRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/test/google", isAuthenticatedMiddleware, async (req, res) => {
  const userId = req.user?.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: true },
  });
  res.json(user);
});

app.listen(PORT, async () => {
  console.log("Server is running on port " + PORT);
  const data = await prisma.user.findMany();
  console.log(data);

});
