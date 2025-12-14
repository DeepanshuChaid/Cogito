import { redisClient } from "../server.js";
import { Request, Response, NextFunction } from "express"

const luaScript = `
-- KEYS[1] = redis key
-- ARGV[1] = capacity
-- ARGV[2] = refill rate (tokens per ms)
-- ARGV[3] = now (timestamp ms)

local data = redis.call("HMGET", KEYS[1], "tokens", "last_refill")

local tokens = tonumber(data[1])
local last_refill = tonumber(data[2])

if tokens == nil then
  tokens = tonumber(ARGV[1])
  last_refill = tonumber(ARGV[3])
end

local elapsed = ARGV[3] - last_refill
local refill = elapsed * tonumber(ARGV[2])

tokens = math.min(ARGV[1], tokens + refill)

if tokens < 1 then
  redis.call("HMSET", KEYS[1], "tokens", tokens, "last_refill", ARGV[3])
  return 0
end

tokens = tokens - 1
redis.call("HMSET", KEYS[1], "tokens", tokens, "last_refill", ARGV[3])
redis.call("PEXPIRE", KEYS[1], 60000)

return 1
`

export const rateLimit = ({
  capacity,
  refillPerSecond,
}: {capacity: number, refillPerSecond: number}) => {
  const refillRate = refillPerSecond / 1000; // per ms

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `rate:${req.user?.id || req.ip}`;
    const now = Date.now();

    const allowed = await redisClient.eval(luaScript, {
      keys: [key],
      arguments: [capacity, refillRate, now],
    });

    if (!allowed) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Too many requests",
      });
    }

    next();
  };
};


