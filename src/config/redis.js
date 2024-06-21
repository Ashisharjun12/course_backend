import { Redis } from "ioredis";
import { _config } from "./config";

const redisClient = () => {
  if (_config.REDIS_URI) {
    console.log("redis is conneccted successfully!!");

    return _config.REDIS_URI;
  }
  throw new error(" redis connection failed.");
};

export const redis = new Redis(redisClient());
