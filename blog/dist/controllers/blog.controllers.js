import { asyncHandler } from "../middlewares/asyncHandler.js";
import getBuffer from "../utils/datauri.utils.js";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../prisma.js";
import { redisClient } from "../server.js";
import { getCachedData, invalidateCache, setCachedData, } from "../utils/redis.utils.js";
import BLOGCATEGORY from "../enum/blogCategory.enum.js";
// *************************** //
// GET BLOG BY ID CONTROLLER
// *************************** //
export const getBlogByIdController = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user?.id;
    const cacheKey = `blog:${blogId}`;
    const viewKey = `blog:${blogId}:user:${userId}`;
    // 1) Check cache first (fastest path)
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        const blog = JSON.parse(cached);
        const viewed = await redisClient.set(viewKey, "1", {
            NX: true,
            EX: 1800, // 30 min
        });
        if (viewed) {
            // Increment DB views async
            await prisma.blog.update({
                where: { id: blogId },
                data: { views: { increment: 1, engagementScore: { increment: 0.5 } } },
            });
            // Update cached object without refetch
            blog.views += 1;
            await redisClient.set(cacheKey, JSON.stringify(blog), { EX: 18000 });
        }
        const role = blog.authorId === userId ? "author" : "user";
        return res.status(200).json({
            cached: true,
            message: "Blog fetched successfully",
            data: blog,
            role,
        });
    }
    // 2) Fetch fresh from DB using OPTIMIZED include
    let blog = await prisma.blog.findUnique({
        where: { id: blogId },
        include: {
            author: true,
            blogReaction: {
                select: {
                    type: true,
                },
            },
            _count: {
                select: { comments: true, savedBlogs: true },
            },
        },
    });
    if (!blog)
        throw new Error("Blog not found");
    // Cache it
    await redisClient.set(cacheKey, JSON.stringify(blog), { EX: 18000 });
    // 3) Unique view logic
    const viewed = await redisClient.set(viewKey, "1", {
        NX: true,
        EX: 1800,
    });
    if (viewed) {
        // increment + return updated fields IN ONE HIT
        blog = await prisma.blog.update({
            where: { id: blogId },
            data: { views: { increment: 1 }, engagementScore: { increment: 0.5 } },
            include: {
                author: true,
                blogReaction: {
                    select: {
                        type: true,
                    },
                },
                _count: {
                    select: { comments: true, savedBlogs: true },
                },
            },
        });
        await redisClient.set(cacheKey, JSON.stringify(blog), { EX: 18000 });
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
            author: true,
        },
    });
    await invalidateCache([
        `user_blogs:${req.user?.id}`,
    ]);
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
        data: {
            title,
            description,
            blogContent,
            category,
            image: imageUrl,
        },
        where: { id: blogId },
        include: {
            author: true,
            blogReaction: {
                select: {
                    type: true,
                },
            },
            _count: {
                select: { comments: true, savedBlogs: true },
            },
        },
    });
    await invalidateCache([
        `blog:${blogId}`,
        `user_blogs:${req.user?.id}`,
    ]);
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
    ]);
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
            blogReaction: {
                select: {
                    type: true,
                },
            },
            _count: {
                select: { comments: true, savedBlogs: true },
            },
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
// INCREMENT SHARE BLOG CONTROLLER
// *************************** //
export const incrementShareBlogController = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    await prisma.blog.update({
        where: { id: blogId },
        data: { shares: { increment: 1 }, engagementScore: { increment: 5 } },
    });
    await invalidateCache([`blog:${blogId}`, `user_blogs:${req.user?.id}`]);
    return res.status(200).json({
        message: "Blog share incremented successfully"
    });
});
