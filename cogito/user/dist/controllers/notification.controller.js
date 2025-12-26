import prisma from "../prisma.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { AppError } from "../middlewares/appError.js";
import { redisClient } from "../server.js";
// GET NOTIFICATIONS
export const getNotificationsController = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new AppError("Unauthorized", 401);
    const filterType = req.query.filter;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50
    const skip = (page - 1) * limit;
    // Validate filter type
    const validTypes = ['FOLLOW', 'BLOG_LIKE', 'COMMENT', 'REPLY'];
    if (filterType && !validTypes.includes(filterType)) {
        throw new AppError("Invalid filter type", 400);
    }
    const cacheKey = filterType
        ? `notifications:${userId}:page:${page}:limit:${limit}:filter:${filterType}`
        : `notifications:${userId}:page:${page}:limit:${limit}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return res.status(200).json({
            success: true,
            message: "Successfully Notifications Fetched",
            cached: true,
            data: JSON.parse(cachedData),
        });
    }
    // Build where clause
    const whereClause = { receiverId: userId };
    if (filterType) {
        whereClause.type = filterType;
    }
    // Fetch notifications and total count in parallel
    const [notifications, totalCount] = await Promise.all([
        prisma.notification.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
                issuer: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                    },
                },
            },
        }),
        prisma.notification.count({ where: whereClause }),
    ]);
    const totalPages = Math.ceil(totalCount / limit);
    const responseData = {
        notifications,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
            hasMore: page < totalPages,
        },
    };
    // Cache for 2 minutes (120 seconds)
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 60 });
    return res.status(200).json({
        success: true,
        message: "Successfully Notifications Fetched",
        cached: false,
        data: responseData,
    });
});
// MARK NOTIFICATIONS AS READ
export const markNotificationsAsReadController = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new AppError("Unauthorized", 401);
    const { notificationIds } = req.body;
    if (!notificationIds || !Array.isArray(notificationIds)) {
        throw new AppError("Invalid notification IDs", 400);
    }
    await prisma.notification.updateMany({
        where: {
            id: { in: notificationIds },
            receiverId: userId,
        },
        data: { isRead: true },
    });
    // Invalidate cache
    const keys = await redisClient.keys(`notifications:${userId}:*`);
    if (keys.length > 0) {
        await redisClient.del(...keys);
    }
    return res.status(200).json({
        success: true,
        message: "Notifications marked as read",
    });
});
// MARK ALL AS READ
export const markAllAsReadController = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new AppError("Unauthorized", 401);
    await prisma.notification.updateMany({
        where: {
            receiverId: userId,
            isRead: false,
        },
        data: { isRead: true },
    });
    // Invalidate cache
    const keys = await redisClient.keys(`notifications:${userId}:*`);
    if (keys.length > 0) {
        await redisClient.del(...keys);
    }
    return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
    });
});
// GET UNREAD COUNT
export const getUnreadCountController = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new AppError("Unauthorized", 401);
    const cacheKey = `notifications:${userId}:unread-count`;
    const cachedCount = await redisClient.get(cacheKey);
    if (cachedCount) {
        return res.status(200).json({
            success: true,
            data: { unreadCount: parseInt(cachedCount) },
        });
    }
    const unreadCount = await prisma.notification.count({
        where: {
            receiverId: userId,
            isRead: false,
        },
    });
    await redisClient.set(cacheKey, unreadCount.toString(), { EX: 60 });
    return res.status(200).json({
        success: true,
        data: { unreadCount },
    });
});
// DELETE NOTIFICATION
export const deleteNotificationController = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new AppError("Unauthorized", 401);
    const { notificationId } = req.params;
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });
    if (!notification) {
        throw new AppError("Notification not found", 404);
    }
    if (notification.receiverId !== userId) {
        throw new AppError("Unauthorized", 403);
    }
    await prisma.notification.delete({
        where: { id: notificationId },
    });
    // Invalidate cache
    const keys = await redisClient.keys(`notifications:${userId}:*`);
    if (keys.length > 0) {
        await redisClient.del(...keys);
    }
    return res.status(200).json({
        success: true,
        message: "Notification deleted",
    });
});
