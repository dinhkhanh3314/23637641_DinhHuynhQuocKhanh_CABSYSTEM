require("dotenv").config();

const express = require("express");
const routes = require("./routes");
const { connectRedis } = require("./config/redis");

const app = express();

app.use(express.json());

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
  });
});

app.get("/ready", (req, res) => {
  res.status(200).json({
    status: "READY",
  });
});

app.get("/health/services", (req, res) => {
  res.status(200).json({
    gateway: "UP",
    authService: "UNKNOWN",
    customerService: "UNKNOWN",
    driverService: "UNKNOWN",
    bookingService: "UNKNOWN",
    tripService: "UNKNOWN",
    paymentService: "UNKNOWN",
    notificationService: "UNKNOWN",
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectRedis();

  const rateLimitMiddleware = require("./middlewares/rateLimit");

  app.use(rateLimitMiddleware);

  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
  });
};

startServer();
