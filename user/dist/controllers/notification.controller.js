import prisma from "../prisma.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { AppError } from "../middlewares/appError.js";
import { redisClient } from "../server.js";

// GET NOTIFICATIONS
export const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new AppError("Unauthorized", 401);
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const cursor = req.query.cursor;
    const cacheKey = `notifications:${userId}:cursor:${cursor ?? "start"}:limit:${limit}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return res.status(200).json({
            message: "Notifications fetched successfully",
            notifications: JSON.parse(cachedData),
            nextCursor: JSON.parse(cachedData).length
                ? JSON.parse(cachedData)[JSON.parse(cachedData).length - 1].id
                : null,
            limit,
        });
    }
    const rawNotifications = await prisma.notification.findMany({
        where: { receiverId: userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0, // skip the cursor itself
        include: {
            issuer: { select: { id: true, name: true, profilePicture: true } },
        },
    });
    // Aggregation logic
    const map = new Map();
    for (const n of rawNotifications) {
        let key = null;
        if (n.type === "BLOG_LIKE" && n.blogId)
            key = `LIKE_${n.blogId}`;
        if (n.type === "COMMENT" && n.commentId)
            key = `COMMENT_${n.commentId}`;
        if (n.type === "FOLLOW")
            key = `FOLLOW_${n.issuerId}`;
        if (!key) {
            map.set(n.id, { ...n, othersCount: 0 });
            continue;
        }
        if (!map.has(key)) {
            map.set(key, {
                id: key,
                type: n.type,
                blogId: n.blogId ?? null,
                commentId: n.commentId ?? null,
                comment: n.commentText ?? null,
                issuer: n.issuer,
                othersCount: 0,
                isRead: n.isRead,
                createdAt: n.createdAt,
            });
        }
        else {
            const item = map.get(key);
            item.othersCount += 1;
            item.isRead = item.isRead && n.isRead;
        }
    }
    const aggregatedNotifications = Array.from(map.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    await redisClient.set(cacheKey, JSON.stringify(aggregatedNotifications), { EX: 300 } // cache 5 min
    );
    return res.status(200).json({
        message: "Notifications fetched successfully",
        notifications: aggregatedNotifications,
        nextCursor: aggregatedNotifications.length
            ? aggregatedNotifications[aggregatedNotifications.length - 1].id
            : null,
        limit,
    });
});
