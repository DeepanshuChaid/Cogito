import { asyncHandler } from "../middlewares/asyncHandler.js";
import getBuffer from "../utils/datauri.utils.js";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../prisma.js";
import { redisClient } from "../server.js";
import { getCachedData, invalidateCache, setCachedData, } from "../utils/redis.utils.js";
import BLOGCATEGORY from "../enum/blogCategory.enum.js";
import { invalidateRecommendedBlogsCache } from "../utils/redis.utils.js";
// *************************** //
// GET BLOG BY ID CONTROLLER
// *************************** //
export const getBlogByIdController = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user.id;
    const cacheKey = `blog:${blogId}`;
    const viewKey = `blog:${blogId}:user:${userId}`;
    // First: check cache
    const cachedBlog = await redisClient.get(cacheKey);
    if (cachedBlog) {
        const blog = JSON.parse(cachedBlog);
        // Try to increment view WITHOUT invalidating cache
        const viewed = await redisClient.set(viewKey, "1", {
            NX: true,
            EX: 60 * 30,
        });
        if (viewed) {
            // increment view count in DB
            await prisma.blog.update({
                where: { id: blogId },
                data: { views: { increment: 1 } },
            });
            // Update cached blog view count directly
            blog.views += 1;
            await redisClient.set(cacheKey, JSON.stringify(blog), { EX: 60 * 60 * 5 });
        }
        const role = blog.authorId === userId ? "author" : "user";
        return res.status(200).json({
            cached: true,
            message: "Blog fetched successfully",
            data: blog,
            role,
        });
    }
    // Not cached → fetch from DB
    let blog = await prisma.blog.findUnique({
        where: { id: blogId },
        include: {
            blogReaction: true,
            author: true,
            comments: true,
        },
    });
    if (!blog)
        throw new Error("Blog not found");
    // Cache it now
    await redisClient.set(cacheKey, JSON.stringify(blog), {
        EX: 60 * 60 * 5,
    });
    // Try to increment view
    const viewed = await redisClient.set(viewKey, "1", {
        NX: true,
        EX: 60 * 30,
    });
    if (viewed) {
        blog = await prisma.blog.update({
            where: { id: blogId },
            data: { views: { increment: 1 } },
            include: {
                blogReaction: true,
                author: true,
                comments: true,
            },
        });
        // Update cache again
        await redisClient.set(cacheKey, JSON.stringify(blog), {
            EX: 60 * 60 * 5,
        });
    }
    const role = blog.authorId === userId ? "author" : "user";
    return res.status(200).json({
        cached: false,
        message: "Blog fetched successfully",
        data: blog,
        role,
    });
});
// *************************** //
// CREATE BLOG CONTROLLER
// *************************** //
export const createBlogController = asyncHandler(async (req, res) => {
    const { title, description, blogContent, category } = req.body;
    if (category && !Object.values(BLOGCATEGORY).includes(category)) {
        throw new Error("Invalid category");
    }
    const file = req.file;
    if (!file)
        throw new Error("Please upload a file");
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
        include: {
            blogReaction: true,
            author: true,
        },
    });
    await invalidateCache([
        `user_blogs:${req.user?.id}`,
        "recommended_blogs:all",
    ]);
    await invalidateRecommendedBlogsCache(result.category);
    await setCachedData(`blog:${result.id}`, result);
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
    if (!blog)
        throw new Error("Blog not found");
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
        include: {
            blogReaction: true,
            author: true,
            comments: true,
        },
    });
    const cachesToInvalidate = [
        `blog:${blogId}`,
        `user_blogs:${req.user?.id}`,
        "recommended_blogs:all",
    ];
    await invalidateCache(cachesToInvalidate);
    await invalidateRecommendedBlogsCache(result.category);
    await setCachedData(`blog:${blogId}`, result);
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
            id: blogId,
        },
    });
    if (!blog)
        throw new Error("Blog not found");
    if (blog.authorId !== req.user?.id) {
        throw new Error("You are not authorized to delete this blog");
    }
    await prisma.blog.delete({
        where: { id: blogId },
    });
    await invalidateCache([
        `blog:${blogId}`,
        `user_blogs:${req.user?.id}`,
        "recommended_blogs:all",
    ]);
    await invalidateRecommendedBlogsCache(blog.category);
    return res.status(200).json({
        message: "Blog deleted successfully",
        data: blog,
    });
});
// *************************** //
// GET ALL USERS BLOGS CONTROLLER
// *************************** //
export const getAllUserBlogsController = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const cacheKey = `user_blogs:${userId}`;
    const cache = await getCachedData(res, cacheKey, "User blogs fetched successfully");
    if (cache)
        return;
    const blogs = await prisma.blog.findMany({
        where: {
            authorId: userId,
        },
        include: {
            author: true,
            blogReaction: true,
            comments: true,
        },
    });
    if (!blogs)
        throw new Error("Error getting Your blogs");
    await setCachedData(cacheKey, blogs);
    return res.status(200).json({
        message: "Blogs fetched successfully",
        data: blogs,
    });
});
// *************************** //
// GET RECOMMENDED BLOGS CONTROLLER
// *************************** //
export const getRecommendedBlogsController = asyncHandler(async (req, res) => {
    const category = req.query.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (category && !Object.values(BLOGCATEGORY).includes(category)) {
        throw new Error("Invalid category");
    }
    if (page < 1 || limit < 1 || limit > 100) {
        throw new Error("Invalid pagination parameters");
    }
    const cacheKey = category
        ? `recommended_blogs:${category}`
        : "recommended_blogs:all";
    // ✅ Try cache first with early return
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        const blogsWithScore = JSON.parse(cached);
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedBlogs = blogsWithScore.slice(startIndex, endIndex);
        const totalBlogs = blogsWithScore.length;
        const totalPages = Math.ceil(totalBlogs / limit);
        return res.status(200).json({
            message: "Recommended blogs fetched successfully",
            data: paginatedBlogs,
            pagination: {
                currentPage: page,
                totalPages,
                totalBlogs,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
            cached: true, // ✅ Clear cache indicator
        });
    }
    // ✅ If no cache, fetch from DB
    const blogs = await prisma.blog.findMany({
        where: {
            ...(category && {
                category: { has: category },
            }),
        },
        include: {
            author: true,
            blogReaction: true,
            comments: true,
        },
    });
    const blogsWithScore = blogs.map((blog) => {
        const likes = blog.blogReaction.filter((r) => r.type === "LIKE").length;
        const dislikes = blog.blogReaction.filter((r) => r.type === "DISLIKE").length;
        const comments = blog.comments.length || 0;
        const views = blog.views || 0;
        const engagementScore = likes * 3 +
            comments * 5 +
            views * 0.2 -
            dislikes;
        const hoursSincePosted = (Date.now() - new Date(blog.createdAt).getTime()) / (1000 * 60 * 60);
        const recency = 1 / Math.pow(hoursSincePosted + 8, 1.3);
        const score = engagementScore * recency;
        return { ...blog, score };
    });
    blogsWithScore.sort((a, b) => b.score - a.score);
    // Cache for 5 hours
    await redisClient.set(cacheKey, JSON.stringify(blogsWithScore), {
        EX: 5 * 60 * 60,
    });
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBlogs = blogsWithScore.slice(startIndex, endIndex);
    const totalBlogs = blogsWithScore.length;
    const totalPages = Math.ceil(totalBlogs / limit);
    return res.status(200).json({
        message: "Recommended blogs fetched successfully",
        data: paginatedBlogs,
        pagination: {
            currentPage: page,
            totalPages,
            totalBlogs,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
        cached: false,
    });
});
