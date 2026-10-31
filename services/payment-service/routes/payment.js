const express = require("express");

const {
  getPayment,
  processPayment,
} = require("../services/paymentService");

const router = express.Router();

router.put("/:id/process", async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body || {};
    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      !paymentMethod
    ) {
      return res.status(400).json({
        message: "A valid amount and paymentMethod are required",
      });
    }

    const payment = await processPayment(
      req.params.id,
      amount,
      paymentMethod,
    );

    res.json({
      message:
        payment.status === "PAID"
          ? "Thanh toán thành công"
          : "Thanh toán thất bại",
      payment,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "PAYMENT_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy payment",
      });
    }

    if (error.message === "PAYMENT_CANNOT_PROCESS") {
      return res.status(409).json({
        message: "Payment không thể xử lý",
      });
    }

    if (error.message === "PAYMENT_DETAILS_MISMATCH") {
      return res.status(400).json({
        message: "Số tiền hoặc phương thức thanh toán không khớp",
      });
    }

    res.status(500).json({
      message: "Không thể xử lý payment",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const payment = await getPayment(req.params.id);

    res.json({
      payment,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "PAYMENT_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy payment",
      });
    }

    res.status(500).json({
      message: "Không thể lấy payment",
    });
  }
});

module.exports = router;
