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
                data: { views: { increment: 1 } },
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
            data: { views: { increment: 1 } },
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
// GET RECOMMENDED BLOGS CONTROLLER
// *************************** //
export const getRecommendedBlogsController = asyncHandler(async (req, res) => {
    const categories = req.body.category;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const totalBlogs = await prisma.blog.count({
        where: categories ? { category: { hasSome: categories } } : {},
    });
    const blogs = await prisma.blog.findMany({
        where: categories ? { category: { hasSome: categories } } : {},
        include: {
            author: true,
            blogReaction: true,
            _count: { select: { comments: true, savedBlogs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
    });
    // Cache individual blogs - smart for when users click into them
    for (const blog of blogs) {
        await redisClient.set(`blog:${blog.id}`, JSON.stringify(blog), { EX: 60 * 60 * 5 });
    }
    const blogsWithScore = blogs.map(blog => {
        const likes = blog.blogReaction.filter(r => r.type === 'LIKE').length;
        const dislikes = blog.blogReaction.filter(r => r.type === 'DISLIKE').length;
        const comments = blog._count.comments;
        const views = blog.views || 0;
        const shares = blog.shares || 0;
        const engagementScore = likes * 4 + comments * 6 + shares * 10 + views * 0.15 - dislikes * 3;
        const hoursPassed = (Date.now() - new Date(blog.createdAt).getTime()) / 36e5;
        const recencyBoost = 1 / (1 + hoursPassed / 12);
        const score = engagementScore * recencyBoost;
        return { ...blog, score };
    });
    blogsWithScore.sort((a, b) => b.score - a.score);
    const pagination = {
        currentPage: page,
        totalPages: Math.ceil(totalBlogs / limit),
        totalBlogs,
        limit,
    };
    return res.status(200).json({
        message: "Recommended blogs fetched",
        data: blogsWithScore,
        pagination,
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
// SEARCH BLOGS CONTROLLER (FIXED)
// *************************** //
export const searchBlogsController = asyncHandler(async (req, res) => {
    const query = req.query.search?.trim();
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!query || query.length < 2) {
        return res.status(400).json({ message: "Search query too short" });
    }
    const search = query.toLowerCase();
    // Match categories — safe because it's enum
    const matchingCategories = Object.values(BLOGCATEGORY).filter((cat) => cat.toLowerCase().includes(search));
    // OR conditions
    const ORconditions = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { blogContent: { contains: search, mode: "insensitive" } },
    ];
    if (matchingCategories.length > 0) {
        ORconditions.push({
            category: { hasSome: matchingCategories },
        });
    }
    // Fetch from DB
    const blogs = await prisma.blog.findMany({
        where: { OR: ORconditions },
        include: {
            author: true,
            blogReaction: {
                select: { type: true }
            }, // NEED THIS TO COUNT LIKES/DISLIKES
            _count: {
                select: { comments: true, savedBlogs: true },
            },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
    });
    // Ranking
    const ranked = blogs.map((blog) => {
        const likes = blog.blogReaction.filter((r) => r.type === "LIKE").length;
        const dislikes = blog.blogReaction.filter((r) => r.type === "DISLIKE").length;
        const commentsCount = blog._count.comments; // FIXED — it's a number
        const views = blog.views || 0;
        const shares = blog.shares || 0;
        const engagement = likes * 5 +
            commentsCount * 6 +
            shares * 10 +
            views * 0.2 -
            dislikes * 3;
        const titleBoost = blog.title.toLowerCase().includes(search) ? 1.8 : 1.0;
        const hoursAgo = (Date.now() - new Date(blog.createdAt).getTime()) / 36e5;
        const recencyBoost = 1 / (1 + hoursAgo / 16);
        const relevanceBoost = blog.category.some((cat) => matchingCategories.includes(cat))
            ? 2.5
            : 1.0;
        const score = engagement * recencyBoost * titleBoost * relevanceBoost;
        return { ...blog, score };
    });
    ranked.sort((a, b) => b.score - a.score);
    return res.status(200).json({
        message: "Search results",
        query,
        totalResults: ranked.length,
        data: paginated,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(ranked.length / limit),
            limit,
        },
    });
});
