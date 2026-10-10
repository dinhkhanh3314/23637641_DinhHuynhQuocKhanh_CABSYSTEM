const express = require("express");

const {
  createBooking,
  getBooking,
  getBookings,
  updateBookingStatus,
  acceptBooking,
  cancelBooking,
  rejectBooking,
} = require("../grpc/bookingClient");
const { grpcErrorToHttp } = require("../grpc/grpcError");
const { requireRoles } = require("../middlewares/auth");

const router = express.Router();

function handleError(res, error) {
  console.error(error);
  const mapped = grpcErrorToHttp(error);
  return res.status(mapped.status).json({ message: mapped.message });
}

router.post("/", async (req, res) => {
  try {
    const booking = await createBooking({
      customer_id: req.user.userId,
      pickup_latitude: req.body.pickLat,
      pickup_longitude: req.body.pickLng,
      destination_latitude: req.body.destLat,
      destination_longitude: req.body.destLng,
      vehicle_type: req.body.vehicleType,
    });

    res.status(201).json({
      message: "Tạo booking thành công",
      booking,
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/", requireRoles("CUSTOMER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    const customerId = ["OPERATOR", "ADMIN"].includes(req.user.role)
      ? undefined
      : req.user.userId;
    const result = await getBookings(customerId, req.query.page, req.query.limit);
    res.json({ bookings: result.bookings || [] });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:id", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    const customerId = req.user.role === "CUSTOMER" ? req.user.userId : undefined;
    const booking = await getBooking(req.params.id, customerId);
    res.json({ booking });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:id/status", requireRoles("OPERATOR", "ADMIN"), async (req, res) => {
  try {
    const booking = await updateBookingStatus(
      req.params.id,
      req.body.status,
    );
    res.json({
      message: "Cập nhật trạng thái booking thành công",
      booking,
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:id/accept", requireRoles("DRIVER"), async (req, res) => {
  try {
    const result = await acceptBooking(req.params.id);
    res.json({
      message: "Tài xế đã nhận chuyến",
      booking: result.booking,
      trip: result.trip,
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:id/cancel", requireRoles("CUSTOMER"), async (req, res) => {
  try {
    const ownedBooking = await getBooking(req.params.id, req.user.userId);
    if (!ownedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const booking = await cancelBooking(req.params.id, req.body.cancelReason);
    res.json({
      message: "Hủy chuyến thành công",
      booking,
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:id/reject", requireRoles("DRIVER"), async (req, res) => {
  try {
    const booking = await rejectBooking(req.params.id);
    res.json({
      message: "Tài xế đã từ chối chuyến, tiếp tục tìm tài xế khác",
      booking,
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
