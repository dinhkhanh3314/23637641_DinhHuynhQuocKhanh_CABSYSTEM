const express = require("express");

const {
  createBooking,
  getBooking,
  getBookings,
  updateBookingStatus,
  cancelBooking,
  findNearbyDrivers,
  assignDriver,
  acceptBooking,
  startSearchingDriver,
  rejectBooking,
  timeoutBooking,
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

router.get("/nearby-drivers", async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Thiếu latitude hoặc longitude",
      });
    }

    const result = await findNearbyDrivers(
      Number(latitude),
      Number(longitude),
      radius ? Number(radius) : 1000,
    );

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể tìm tài xế gần",
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

router.put("/:id/assign-driver", async (req, res) => {
  try {
    const booking = await assignDriver(req.params.id, req.body.driverId);

    res.json({
      message: "Gán tài xế thành công",
      booking,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy booking",
      });
    }

    if (error.message === "DRIVER_ID_REQUIRED") {
      return res.status(400).json({
        message: "Thiếu driverId",
      });
    }

    if (error.message === "BOOKING_NOT_SEARCHING_DRIVER") {
      return res.status(400).json({
        message: "Booking chưa ở trạng thái tìm tài xế",
      });
    }

    res.status(500).json({
      message: "Không thể gán tài xế",
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

    res.status(500).json({
      message: "Không thể xác nhận tài xế nhận chuyến",
    });
  }
});

router.put("/:id/search-driver", async (req, res) => {
  try {
    const booking = await startSearchingDriver(req.params.id);

    res.json({
      message: "Bắt đầu tìm tài xế",
      booking,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy booking",
      });
    }

    if (error.message === "BOOKING_NOT_PENDING") {
      return res.status(400).json({
        message: "Booking không ở trạng thái PENDING",
      });
    }

    res.status(500).json({
      message: "Không thể bắt đầu tìm tài xế",
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

router.put("/:id/timeout", async (req, res) => {
  try {
    const booking = await timeoutBooking(req.params.id);

    res.json({
      message: "Tài xế không phản hồi, tiếp tục tìm tài xế khác",
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
      message: "Không thể xử lý timeout",
    });
  }
});

module.exports = router;
