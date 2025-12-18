import express from "express";
import prisma from "./prisma.js";
import blogRoutes from "./routes/blog.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/errorHandlerMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import { isAuthenticatedMiddleware } from "./middlewares/isAuthenticatedMiddleware.js";
import cookieParser from "cookie-parser";
import { createClient } from "redis";
import { blogLimiter } from "./ratelimiter/blogs.ratelimiter.js";
import { generalLimiter } from "./ratelimiter/general.ratelimiter.js";
import { rateLimit } from "./ratelimiter/bucket.ratelimiter.js";

// Initialize Redis client
export const redisClient = createClient({
  url: process.env.REDIS_URL_UPSTASH,
});

redisClient
  .connect()
  .then(() => {
    console.log("Redis connected");
  })
  .catch((err) => console.error("REDIS IS A BITCH MF DID NOT CONNECTED"));

const app = express();
const PORT = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/api/blog",
  isAuthenticatedMiddleware,
  rateLimit({capacity: 50, refillPerSecond: 0.8,}),
  blogRoutes
);

app.use(
  "/api/comment",
  rateLimit({capacity: 10, refillPerSecond: 0.5,}), 
  isAuthenticatedMiddleware,
  commentRoutes
);
app.use(
  "/api/user",
  rateLimit({capacity: 10, refillPerSecond: 0.4,}), 
  isAuthenticatedMiddleware, 
  userRoutes
);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("hello world author service");
});

app.listen(PORT, async () => {
  console.log("BLOG Server is running on port " + PORT);
  const data = await prisma.user.findMany();
  console.log(data);

  const blog = await prisma.blog.findMany({
    where: { category: { hasSome: ["SEX_EDUCATION"] } },
    include: { blogReaction: true, comments: true },
  });

  console.log(blog);

  const redisKeys = await redisClient.keys("blog:*")
  console.log("checking redis keys", redisKeys)


  const totalSavedBlogs = await prisma.savedblogs.count({where : {user : {name: "Cogito25"}}})
  console.log("THIS IS THE BLOGS SAVED BY THE PROD DEV:- ", totalSavedBlogs)


  const followRows = await prisma.follow.findMany();
  console.log(followRows);

  // console.log(idk)
});



