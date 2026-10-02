require("dotenv").config();

const express = require("express");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const customerRoutes = require("./routes/customer");
const { startGrpcServer } = require("./grpc/customerServer");

const app = express();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      service: "customer-service",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "customer-service",
      database: "disconnected",
    });
  }
});

app.use("/customers", customerRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Customer Service running on port ${PORT}`);
});

startGrpcServer();
