const express = require("express");

const app = express();

app.use(express.json());

app.post("/payments", (req, res) => {
  const { paymentId, amount, paymentMethod } = req.body;

  if (!paymentId || !amount || !paymentMethod) {
    return res.status(400).json({
      status: "FAILED",
      message: "Thông tin thanh toán không hợp lệ",
    });
  }

  if (paymentMethod === "FAIL") {
    return res.json({
      status: "FAILED",
      message: "Thanh toán bị từ chối",
    });
  }

  res.json({
    status: "SUCCESS",
    transactionId: `TXN-${paymentId}-${Date.now()}`,
    message: "Thanh toán thành công",
  });
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Mock Payment Provider running on port ${PORT}`);
});
