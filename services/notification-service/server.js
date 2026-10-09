require("dotenv").config();

const express = require("express");
const connectDatabase = require("./config/database");
const notificationRoutes = require("./routes/notification");
const { startNotificationGrpcServer } = require("./grpc/notificationServer");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "notification-service",
    status: "OK",
  });
});

app.use("/notifications", notificationRoutes);

const PORT = process.env.PORT || 3007;

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
  });

  startNotificationGrpcServer();
}

startServer();
