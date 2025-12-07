import { redisClient } from "../server.js";
export const getCachedData = async (res, key, message) => {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
        console.log("USER BLOGS: Serving from cache");
        return res.status(200).json({
            message: message,
            CACHED: true,
            data: JSON.parse(cachedData)
        });
    }
};
export const setCachedData = async (key, data) => {
    await redisClient.set(key, JSON.stringify(data), { EX: 1000 });
    console.log("Serving from database");
};
export const invalidateCache = async (keys) => {
    for (const key of keys) {
        const idkManMaybeKeys = await redisClient.keys(key);
        if (idkManMaybeKeys.length > 0) {
            await redisClient.del(idkManMaybeKeys);
        }
    }
};
