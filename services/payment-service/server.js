require("dotenv").config();

const express = require("express");
const paymentRoutes = require("./routes/payment");
const { handlePaymentWebhook } = require("./services/paymentService");
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

app.post("/payments/webhook", async (req, res) => {
  const expectedSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (expectedSecret && req.get("x-payment-webhook-secret") !== expectedSecret) {
    return res.status(401).json({ message: "Invalid webhook secret" });
  }

  try {
    const payment = await handlePaymentWebhook(req.body);
    return res.json({ payment });
  } catch (error) {
    console.error("Payment webhook error:", error);
    const status = error.message === "PAYMENT_NOT_FOUND" ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});

startPaymentGrpcServer();
