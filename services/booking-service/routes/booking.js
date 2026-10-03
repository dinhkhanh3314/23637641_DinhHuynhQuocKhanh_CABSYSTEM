const express = require("express");

const {
  createBooking,
  getBooking,
  getBookings,
  updateBookingStatus,
  cancelBooking,
} = require("../services/bookingService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const booking = await createBooking(req.body);

    res.status(201).json({
      message: "Tạo booking thành công",
      booking,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "MISSING_BOOKING_DATA") {
      return res.status(400).json({
        message: "Thiếu thông tin đặt xe",
      });
    }

    res.status(500).json({
      message: "Không thể tạo booking",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const bookings = await getBookings();

    res.json({
      bookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy danh sách booking",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const booking = await getBooking(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Không tìm thấy booking",
      });
    }

    res.json({
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy booking",
    });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const booking = await updateBookingStatus(req.params.id, req.body.status);

    res.json({
      message: "Cập nhật trạng thái booking thành công",
      booking,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy booking",
      });
    }

    if (error.message === "INVALID_STATUS") {
      return res.status(400).json({
        message: "Trạng thái booking không hợp lệ",
      });
    }

    res.status(500).json({
      message: "Không thể cập nhật trạng thái booking",
    });
  }
});

router.put("/:id/cancel", async (req, res) => {
  try {
    const booking = await cancelBooking(req.params.id);

    res.json({
      message: "Hủy booking thành công",
      booking,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy booking",
      });
    }

    if (error.message === "BOOKING_CANNOT_CANCEL") {
      return res.status(400).json({
        message: "Booking hiện tại không thể hủy",
      });
    }

    res.status(500).json({
      message: "Không thể hủy booking",
    });
  }
});

module.exports = router;
