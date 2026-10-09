const express = require("express");

const {
  createBooking,
  getBooking,
  getBookings,
  updateBookingStatus,
  cancelBooking,
  acceptBooking,
  rejectBooking,
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
    const booking = await cancelBooking(req.params.id, req.body.cancelReason);

    res.json({
      message: "Hủy chuyến thành công",
      booking,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy booking",
      });
    }

    if (error.message === "CANCEL_REASON_REQUIRED") {
      return res.status(400).json({
        message: "Vui lòng cung cấp lý do hủy chuyến",
      });
    }

    if (error.message === "BOOKING_CANNOT_CANCEL") {
      return res.status(400).json({
        message: "Booking không thể hủy ở trạng thái hiện tại",
      });
    }

    res.status(500).json({
      message: "Không thể hủy chuyến",
    });
  }
});

router.put("/:id/accept", async (req, res) => {
  try {
    const booking = await acceptBooking(req.params.id);

    res.json({
      message: "Tài xế đã nhận chuyến",
      booking,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy booking",
      });
    }

    if (error.message === "BOOKING_NOT_ASSIGNED") {
      return res.status(400).json({
        message: "Booking chưa được gán tài xế",
      });
    }

    if (error.message === "TRIP_CREATION_FAILED") {
      return res.status(503).json({
        message: "Không thể tạo chuyến đi",
      });
    }

    res.status(500).json({
      message: "Không thể xác nhận tài xế nhận chuyến",
    });
  }
});

router.put("/:id/reject", async (req, res) => {
  try {
    const booking = await rejectBooking(req.params.id);

    res.json({
      message: "Tài xế đã từ chối chuyến, tiếp tục tìm tài xế khác",
      booking,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy booking",
      });
    }

    if (error.message === "BOOKING_NOT_ASSIGNED") {
      return res.status(400).json({
        message: "Booking chưa được gán tài xế",
      });
    }

    res.status(500).json({
      message: "Không thể từ chối chuyến",
    });
  }
});

module.exports = router;
