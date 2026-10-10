require("dotenv").config();

const http = require("http");
const express = require("express");
const routes = require("./routes");
const { connectRedis } = require("./config/redis");

const app = express();

app.use(express.json());

const serviceHealthUrls = {
  authService: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  customerService: process.env.CUSTOMER_SERVICE_URL || "http://localhost:3002",
  driverService: process.env.DRIVER_SERVICE_URL || "http://localhost:3003",
  bookingService: process.env.BOOKING_SERVICE_URL || "http://localhost:3004",
  tripService: process.env.TRIP_SERVICE_URL || "http://localhost:3005",
  paymentService: process.env.PAYMENT_SERVICE_URL || "http://localhost:3006",
  notificationService:
    process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3007",
};

const checkServiceHealth = (serviceUrl) =>
  new Promise((resolve) => {
    const request = http.get(`${serviceUrl}/health`, (response) => {
      response.resume();
      response.on("end", () => {
        resolve(response.statusCode >= 200 && response.statusCode < 300);
      });
    });

    request.setTimeout(Number(process.env.HEALTH_CHECK_TIMEOUT_MS) || 2000, () => {
      request.destroy();
      resolve(false);
    });

    request.on("error", () => {
      resolve(false);
    });
  });

const getServiceStatuses = async () => {
  const serviceStatuses = await Promise.all(
    Object.entries(serviceHealthUrls).map(async ([serviceName, serviceUrl]) => [
      serviceName,
      (await checkServiceHealth(serviceUrl)) ? "UP" : "DOWN",
    ]),
  );

  return Object.fromEntries(serviceStatuses);
};

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
  });
});

app.get("/ready", async (req, res) => {
  const services = await getServiceStatuses();
  const allServicesUp = Object.values(services).every(
    (status) => status === "UP",
  );

  res.status(allServicesUp ? 200 : 503).json({
    status: allServicesUp ? "READY" : "NOT_READY",
  });
});

app.get("/health/services", async (req, res) => {
  const services = await getServiceStatuses();
  const allServicesUp = Object.values(services).every(
    (status) => status === "UP",
  );

  res.status(allServicesUp ? 200 : 503).json({
    status: allServicesUp ? "HEALTHY" : "DEGRADED",
    gateway: "UP",
    ...services,
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectRedis();

  const rateLimitMiddleware = require("./middlewares/rateLimit");

  app.use("/api", rateLimitMiddleware, routes);

  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
  });
};

startServer();
