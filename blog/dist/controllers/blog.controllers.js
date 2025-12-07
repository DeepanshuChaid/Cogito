import { asyncHandler } from "../middlewares/asyncHandler.js";
import getBuffer from "../utils/datauri.utils.js";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../prisma.js";
// GET BLOG BY ID CONTROLLER
export const getBlogByIdController = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user?.id;
    let role;
    const blog = await prisma.blog.findUnique({
        where: {
            id: blogId
        }
    });
    if (!blog)
        throw new Error("Blog not found");
    if (blog.authorId !== userId) {
        role = "user";
    }
    else {
        role = "author";
    }
    return res.status(200).json({
        message: "Blog fetched successfully",
        data: blog,
        role
    });
});
// CREATE BLOG CONTROLLER
export const createBlogController = asyncHandler(async (req, res) => {
    const { title, description, blogContent, category } = req.body;
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
    });
    return res.status(201).json({
        message: "Blog created successfully",
        data: result,
    });
});
// UPDATE BLOG CONTROLLER
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
    });
    return res.status(200).json({
        message: "Blog updated successfully",
        data: result,
    });
});
// DELETE BLOG CONTROLLER
export const deleteBlogController = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const isAuthorized = await prisma.blog.findUnique({
        where: {
            id: blogId,
        },
    });
    if (isAuthorized.authorId !== req.user?.id)
        throw new Error("You are not authorized to delete this blog");
    const blog = await prisma.blog.delete({
        where: { id: blogId },
    });
    return res.status(200).json({
        message: "Blog deleted successfully",
        data: blog
    });
});
// GET ALL USERS BLOGS CONTROLLER
export const getAllUserBlogsController = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const blogs = await prisma.blog.findMany({
        where: {
            authorId: userId
        }
    });
    if (!blogs)
        throw new Error("Error getting Your blogs");
    return res.status(200).json({
        message: "Blogs fetched successfully",
        data: blogs
    });
});
export const likeBlogController = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user?.id;
    const blog = await prisma.blog.findUnique({
        where: {
            id: blogId
        }
    });
    if (!blog)
        throw new Error("Blog not found");
    const isLiked = await prisma.blogreaction.findFirst({
        where: {
            blogId,
            userId,
            type: "LIKE"
        }
    });
    const isDisliked = await prisma.blogreaction.findFirst({
        where: {
            blogId,
            userId,
            type: "DISLIKE"
        }
    });
    if (isLiked) {
        await prisma.blogreaction.delete({
            where: {
                id: isLiked.id
            }
        });
        return res.status(200).json({
            message: "Blog unliked successfully"
        });
    }
    if (isDisliked) {
        await prisma.blogreaction.delete({
            where: {
                id: isDisliked.id
            }
        });
        await prisma.blogreaction.create({
            data: {
                blogId,
                userId,
                type: "LIKE"
            }
        });
        return res.status(200).json({
            message: "Blog liked successfully"
        });
    }
    const result = await prisma.blogreaction.create({
        data: {
            blogId,
            userId,
            type: "LIKE"
        }
    });
    return res.status(200).json({
        message: "Blog liked successfully",
        data: result
    });
});
export const dislikeBlogController = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user?.id;
    const blog = await prisma.blog.findUnique({
        where: {
            id: blogId
        }
    });
    if (!blog)
        throw new Error("Blog not found");
    const isLiked = await prisma.blogreaction.findFirst({
        where: {
            blogId,
            userId,
            type: "LIKE"
        }
    });
    const isDisliked = await prisma.blogreaction.findFirst({
        where: {
            blogId,
            userId,
            type: "DISLIKE"
        }
    });
    if (isDisliked) {
        await prisma.blogreaction.delete({
            where: {
                id: isDisliked.id
            }
        });
        return res.status(200).json({
            message: "Blog disliked removed successfully"
        });
    }
    if (isLiked) {
        await prisma.blogreaction.delete({
            where: {
                id: isLiked.id
            }
        });
        await prisma.blogreaction.create({
            data: {
                blogId,
                userId,
                type: "DISLIKE"
            }
        });
        return res.status(200).json({
            message: "Blog disliked successfully"
        });
    }
    const result = await prisma.blogreaction.create({
        data: {
            blogId,
            userId,
            type: "DISLIKE"
        }
    });
    return res.status(200).json({
        message: "Blog disliked successfully",
        data: result
    });
});
