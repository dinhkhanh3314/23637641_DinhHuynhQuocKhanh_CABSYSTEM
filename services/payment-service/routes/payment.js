const express = require("express");

const {
  createPayment,
  getPayment,
  processPayment,
} = require("../services/paymentService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const payment = await createPayment(req.body);

    res.status(201).json({
      message: "Tạo payment thành công",
      payment,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "PAYMENT_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Payment cho chuyến đi này đã tồn tại",
      });
    }

    if (error.message === "INVALID_TRIP_ID") {
      return res.status(400).json({
        message: "tripId phải là số nguyên lớn hơn 0",
      });
    }

    if (error.message === "INVALID_CUSTOMER_ID") {
      return res.status(400).json({
        message: "customerId phải là số nguyên lớn hơn 0",
      });
    }

    if (error.message === "INVALID_AMOUNT") {
      return res.status(400).json({
        message: "Số tiền thanh toán phải lớn hơn 0",
      });
    }

    if (error.message === "INVALID_PAYMENT_METHOD") {
      return res.status(400).json({
        message: "Phương thức thanh toán không được để trống",
      });
    }

    res.status(500).json({
      message: "Không thể tạo payment",
    });
  }
});

router.put("/:id/process", async (req, res) => {
  try {
    const payment = await processPayment(req.params.id);

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
