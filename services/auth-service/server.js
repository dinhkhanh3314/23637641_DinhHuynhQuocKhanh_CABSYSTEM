require("dotenv").config();

const redisClient = require("./redisClient");
const express = require("express");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const authRoutes = require("./routes/auth");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
const prisma = new PrismaClient({ adapter });

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await prisma.user.count();

    res.status(200).json({
      status: "UP",
      database: "UP",
    });
  } catch (error) {
    console.error("Database health check error:", error);

    res.status(503).json({
      status: "DOWN",
      database: "DOWN",
    });
  }
});

redisClient
  .connect()
  .then(() => {
    console.log("Redis connected");

    app.use("/auth", authRoutes);

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Redis connection failed:", error);
  });
