require("dotenv").config();

const express = require("express");
const paymentRoutes = require("./routes/payment");
const { startPaymentGrpcServer } = require("./grpc/paymentServer");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "payment-service",
    status: "OK",
  });
});

app.use("/payments", paymentRoutes);

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});

startPaymentGrpcServer();
