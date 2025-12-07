import { redisClient } from "../server.js";
export const getCachedData = async (res, key, message) => {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
        console.log("USER BLOGS: Serving from cache");
        return res.status(200).json({
            message: message,
            REDIS: "TURNED ON",
            data: JSON.parse(cachedData)
        });
    }
};
export const setCachedData = async (key, data) => {
    await redisClient.set(key, JSON.stringify(data), { EX: 3600 });
    console.log("Serving from database");
};
