const express = require("express");

const app = express();

app.use(express.json());

app.post("/payments", (req, res) => {
  const { paymentId, amount } = req.body;

  res.json({
    paymentId,
    amount,
    status: "SUCCESS",
    message: "Payment processed successfully",
  });
});

app.post("/payments/callback", (req, res) => {
  const { paymentId, status } = req.body;

  res.json({
    paymentId,
    status,
    message: "Callback received",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "UP",
  });
});

app.listen(4000, () => {
  console.log("Mock Payment Provider running on port 4000");
});
