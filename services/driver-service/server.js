require("dotenv").config();

const express = require("express");
const redisClient = require("./redisClient");

const driverRoutes = require("./routes/driver");
const applicationRoutes = require("./routes/application");
const { startDriverGrpcServer } = require("./grpc/driverServer");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "driver-service",
    status: "OK",
  });
});

app.use("/drivers/applications", applicationRoutes);
app.use("/drivers", driverRoutes);

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    await redisClient.connect();

    console.log("Redis connected");

    app.listen(PORT, () => {
      console.log(`Driver Service running on port ${PORT}`);
    });

    startDriverGrpcServer();
  } catch (error) {
    console.error("Redis connection failed:", error);
  }
}

startServer();
