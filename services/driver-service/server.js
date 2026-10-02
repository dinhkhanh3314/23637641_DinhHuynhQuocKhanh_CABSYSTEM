require("dotenv").config();

const express = require("express");
const driverRoutes = require("./routes/driver");
const { startDriverGrpcServer } = require("./grpc/driverServer");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "driver-service",
    status: "OK",
  });
});

app.use("/drivers", driverRoutes);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Driver Service running on port ${PORT}`);
});

startDriverGrpcServer();
