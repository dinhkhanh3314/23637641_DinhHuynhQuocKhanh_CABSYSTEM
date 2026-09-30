const { createClient } = require("redis");

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

const setCache = async (key, value, expireSeconds = 60) => {
  await redisClient.set(key, value, {
    EX: expireSeconds,
  });
};

const getCache = async (key) => {
  return await redisClient.get(key);
};

redisClient.on("error", (error) => {
  console.error("Redis error:", error);
});

const connectRedis = async () => {
  await redisClient.connect();
  console.log("Redis connected");
};

module.exports = {
  redisClient,
  connectRedis,
  setCache,
  getCache,
};
