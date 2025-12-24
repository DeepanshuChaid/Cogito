import prisma from "../prisma.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { AppError } from "../middlewares/appError.js";
import { redisClient } from "../server.js";
export const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new AppError("Unauthorized", 401);
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;
    const cacheKey = `notifications:${userId}:page:${page}:limit:${limit}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return res.status(200).json({
            message: "Notifications fetched successfully",
            notifications: JSON.parse(cachedData),
            pagination: { page, limit },
        });
    }
    const raw = await prisma.notification.findMany({
        where: { receiverId: userId },
        orderBy: { createdAt: "desc" },
        include: {
            issuer: {
                select: {
                    name: true,
                    profilePicture: true,
                    id: true
                }
            }
        },
        skip,
        take: limit,
    });
    const map = new Map();
    for (const n of raw) {
        let key = null;
        // 🔑 aggregation keys
        if (n.type === "BLOG_LIKE" && n.blogId) {
            key = `LIKE_${n.blogId}`;
        }
        if (n.type === "COMMENT" && n.commentId) {
            key = `COMMENT_${n.commentId}`;
        }
        if (n.type === "REPLY" && n.commentId) {
            key = `REPLY_${n.commentId}`;
        }
        // ❌ non-aggregatable
        if (!key) {
            map.set(n.id, {
                ...n,
                othersCount: 0,
            });
            continue;
        }
        // 🆕 first occurrence
        if (!map.has(key)) {
            map.set(key, {
                id: key,
                type: n.type,
                blogId: n.blogId ?? null,
                commentId: n.commentId ?? null,
                primaryUserId: n.issuerId,
                othersCount: 0,
                isRead: n.isRead,
                createdAt: n.createdAt,
            });
        }
        // ➕ aggregate
        else {
            const item = map.get(key);
            item.othersCount += 1;
            item.isRead = item.isRead && n.isRead;
        }
    }
    const aggregatedNotifications = Array.from(map.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    await redisClient.set(cacheKey, JSON.stringify(aggregatedNotifications), { EX: 300 });
    return res.status(200).json({
        message: "Notifications fetched successfully",
        notifications: aggregatedNotifications,
        pagination: { page, limit },
    });
});
