import { asyncHandler } from "../middlewares/asyncHandler.js";
import getBuffer from "../utils/datauri.utils.js";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../prisma.js";
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
        data: result
    });
});
