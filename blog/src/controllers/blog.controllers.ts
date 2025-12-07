import { asyncHandler } from "../middlewares/asyncHandler.js";
import getBuffer from "../utils/datauri.utils.js";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../prisma.js";
import { redisClient } from "../server.js";
import { getCachedData, invalidateCache, setCachedData } from "../utils/redis.utils.js";

// *************************** //
// GET BLOG BY ID CONTROLLER
// *************************** //
export const getBlogByIdController = asyncHandler(
  async (req, res) => {
    const blogId = req.params.id
    const userId = req.user?.id
    const cacheKey = `blog:${blogId}`;

    // Try cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const blog = JSON.parse(cached);
      const role = blog.authorId === userId ? "author" : "user";
      return res.status(200).json({
        message: "Blog fetched successfully",
        data: blog,
        role,
        cached: true
      });
    }
    
    const blog = await prisma.blog.findUnique({
      where: {
        id: blogId
      }
    })

    if (!blog) throw new Error("Blog not found")
    

    const role = blog.authorId === userId ? "author" : "user";
    
    await setCachedData(`blog:${blogId}`, blog)

    return res.status(200).json({
      message: "Blog fetched successfully",
      data: blog,
      role
    })
  }
)


// *************************** //
// CREATE BLOG CONTROLLER
// *************************** //
export const createBlogController = asyncHandler(async (req, res) => {
  const { title, description, blogContent, category } = req.body;

  if (category && !Object.values(BLOGCATEGORY).includes(category)) {
    throw new Error("Invalid category")
  }

  const file = req.file;

  if (!file) throw new Error("Please upload a file");

  const fileBuffer = getBuffer(file);

  if (!fileBuffer || !fileBuffer.content) {
    throw new Error("Invalid file buffer or content");
  }

  const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
    folder: "blogs",
  });

  const result = await prisma.blog.create({
    data: {
      title,
      description,
      blogContent,
      category,
      image: cloud.secure_url,
      author: { connect: { id: req.user?.id } },
    },
  });

  await invalidateCache([
    `user_blogs:${req.user?.id}`,
    'recommended_blogs:all',
    `recommended_blogs:${category}`
  ]);

  return res.status(201).json({
    message: "Blog created successfully",
    data: result,
  });
});


// *************************** //
// UPDATE BLOG CONTROLLER
// *************************** //
export const updateBlogController = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const { title, description, blogContent, category } = req.body;

  const file = req.file;

  const blog = await prisma.blog.findUnique({
    where: {
      id: blogId,
    },
  });

  if (!blog) throw new Error("Blog not found");

  if (blog.authorId !== req.user?.id) {
    throw new Error("You are not authorized to update this blog");
  }

  let imageUrl = blog.image;

  if (file) {
    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content)
      throw new Error("Invalid file buffer or content");

    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });

    imageUrl = cloud.secure_url;
  }

  const result = await prisma.blog.update({
    where: {
      id: blogId,
    },
    data: {
      title,
      description,
      blogContent,
      category,
      image: imageUrl,
    },
  });

  const cachesToInvalidate = [
    `blog:${blogId}`,
    `user_blogs:${req.user?.id}`,
    'recommended_blogs:all',
    `recommended_blogs:${blog.category}`
  ];

  if (category && category !== blog.category) {
    cachesToInvalidate.push(`recommended_blogs:${category}`);
  }

  await invalidateCache(cachesToInvalidate);

  return res.status(200).json({
    message: "Blog updated successfully",
    data: result,
  });
});


// *************************** //
// DELETE BLOG CONTROLLER
// *************************** //
export const deleteBlogController = asyncHandler(async (req, res) => {
  const blogId = req.params.id;

  const blog = await prisma.blog.findUnique({
    where: {
      id: blogId
    }
  })

  if (!blog) throw new Error("Blog not found");

  if (blog.authorId !== req.user?.id) {
    throw new Error("You are not authorized to delete this blog");
  }

  await prisma.blog.delete({
    where: { id: blogId }
  });

  await invalidateCache([
    `blog:${blogId}`,
    `user_blogs:${req.user?.id}`,
    'recommended_blogs:all',
    `recommended_blogs:${blog.category}`
  ]);

  return res.status(200).json({
    message: "Blog deleted successfully",
    data: blog
  })
});


// *************************** //
// GET ALL USERS BLOGS CONTROLLER
// *************************** //
export const getAllUserBlogsController = asyncHandler(
  async (req, res) => {
    const userId = req.user?.id

    const cacheKey = `user_blogs:${userId}`
    
    const cache = await getCachedData(res, cacheKey, "User blogs fetched successfully")
    if (cache) return

    const blogs = await prisma.blog.findMany({
      where: {
        authorId: userId
      }, 
      include: {
        blogReaction: true
      }
    })

    if (!blogs) throw new Error("Error getting Your blogs")

    await setCachedData(cacheKey, blogs)

    return res.status(200).json({
      message: "Blogs fetched successfully",
      data: blogs
    })
  }
)


// *************************** //
// GET RECOMMENDED BLOGS CONTROLLER
// *************************** //
export const getRecommendedBlogsController = asyncHandler(
  async (req, res) => {
    // Optional: get category filter from query

    const category = req.query.category as string | undefined;

    if (category && !Object.values(BLOGCATEGORY).includes(category)) {
      throw new Error("Invalid category")
    }
    
    const cacheKey = category ? `recommended_blogs:${category}` : 'recommended_blogs:all'

    const cache = await getCachedData(res, cacheKey, "Recommended blogs fetched successfully")
    if (cache) return

    const blogs = await prisma.blog.findMany({
      where: {
        ...(category && {
          category: { equals: category, mode: 'insensitive' }
        })
      },
      include: {
        blogReaction: true,
        author: true
      },
    });

    // Calculate popularity score: likes - dislikes
    const blogsWithScore = blogs.map(blog => {
      const likes = blog.blogReaction.filter(r => r.type === 'LIKE').length;
      const dislikes = blog.blogReaction.filter(r => r.type === 'DISLIKE').length;
      const score = likes - dislikes;
      return { ...blog, score };
    });

    // Sort by popularity descending
    blogsWithScore.sort((a, b) => b.score - a.score);

    // Cache the result for 5 hour
    await setCachedData(cacheKey, blogsWithScore)

    return res.status(200).json({
      message: "Recommended blogs fetched successfully",
      data: blogsWithScore
    });
  }
);

