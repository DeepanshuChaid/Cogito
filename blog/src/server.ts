import express from "express";
import prisma from "./prisma.js";
import blogRoutes from "./routes/blog.routes.js";
import { errorHandler } from "./middlewares/errorHandlerMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import { isAuthenticatedMiddleware } from "./middlewares/isAuthenticatedMiddleware.js";
import cookieParser from "cookie-parser";
import { createClient } from "redis";

// Initialize Redis client
export const redisClient = createClient({
  url: process.env.REDIS_URL_UPSTASH,
});

redisClient
  .connect()
  .then(() => {
    console.log("Redis connected");
  })
  .catch(err => console.error("REDIS IS A BITCH MF DID NOT CONNECTED"));



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

app.use("/api/blog", isAuthenticatedMiddleware, blogRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("hello world author service");
});


app.listen(PORT, async () => {
  console.log("BLOG Server is running on port " + PORT);
  const data = await prisma.user.findMany();
  console.log(data);
  
  const blog = await prisma.blog.findMany({ include: { blogReaction: true, comments: true, } });
  
  console.log(blog);
});

