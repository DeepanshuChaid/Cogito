import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import { redisClient } from "../server.js";
export const saveBlogController = asyncHandler(async (req, res) => {
    const userId = req?.user?.id;
    const blogId = req.params.id;
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog)
        throw new Error("Blog not found");
    const alreadySaved = await prisma.savedblogs.findUnique({
        where: { userId_blogId: { userId, blogId } },
    });
    if (alreadySaved)
        throw new Error("Blog already saved");
    // Save and update score
    const savedBlog = await prisma.$transaction(async (tx) => {
        const saved = await tx.savedblogs.create({
            data: {
                user: { connect: { id: userId } },
                blog: { connect: { id: blogId } },
            },
        });
        await tx.blog.update({
            where: { id: blogId },
            data: {
                engagementScore: { increment: 8 }, // Saves are very valuable
            },
        });
        return saved;
    });
    return res.status(201).json({
        message: "Blog saved successfully",
        data: savedBlog,
    });
});
//  *************************** //
//  DELETE SAVED BLOG CONTROLLER
//  *************************** //
export const deleteSavedBlogController = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const blogId = req.params.id;
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog)
        throw new Error("Blog not found");
    // Delete and update score
    const savedBlog = await prisma.$transaction(async (tx) => {
        const deleted = await tx.savedblogs.delete({
            where: {
                userId_blogId: {
                    userId,
                    blogId,
                },
            },
        });
        await tx.blog.update({
            where: { id: blogId },
            data: {
                engagementScore: { decrement: 8 }, // Remove save weight
            },
        });
        return deleted;
    });
    if (!savedBlog)
        throw new Error("Blog not found in saved blogs");
    return res.status(200).json({
        message: "Blog removed from saved blogs successfully",
        data: savedBlog,
    });
});
// GET SAVED BLOGS BY USERNAME CONTROLLER
export const getSavedBlogsController = asyncHandler(async (req, res) => {
    const name = req.params.name;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // Cache key for public view
    const cacheKey = `saved_blogs:${name}:page:${page}:limit:${limit}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return res.status(200).json({
            message: "User saved blogs fetched successfully",
            CACHED: true,
            data: JSON.parse(cachedData),
        });
    }
    // Check if user exists first
    const user = await prisma.user.findUnique({
        where: { name },
        select: { id: true, name: true, profilePicture: true },
    });
    if (!user)
        throw new Error("User not found");
    // CORRECT QUERY: Get saved blogs through the user relationship
    const savedBlogs = await prisma.savedblogs.findMany({
        where: {
            user: { name: name },
        },
        skip,
        take: limit,
        include: {
            blog: {
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            savedblogs: true,
                            blogReaction: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const totalSavedBlogs = await prisma.savedblogs.count({
        where: {
            user: { name: name }, // ✅ Correct count
        },
    });
    const response = {
        user: {
            id: user.id,
            name: user.name,
            avatar: user.profilePicture,
        },
        savedBlogs,
        pagination: {
            page,
            limit,
            total: totalSavedBlogs,
            totalPages: Math.ceil(totalSavedBlogs / limit),
        },
    };
    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 300 });
    return res.status(200).json({
        message: "User saved blogs fetched successfully",
        data: response,
    });
});
