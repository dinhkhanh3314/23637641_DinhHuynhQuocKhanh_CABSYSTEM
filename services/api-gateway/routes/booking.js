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

const router = express.Router();

function handleError(res, error) {
  console.error(error);
  const mapped = grpcErrorToHttp(error);
  return res.status(mapped.status).json({ message: mapped.message });
}

router.post("/", async (req, res) => {
  try {
    const booking = await createBooking({
      customer_id: req.body.customerId,
      pickup_latitude: req.body.pickupLatitude,
      pickup_longitude: req.body.pickupLongitude,
      destination_latitude: req.body.destinationLatitude,
      destination_longitude: req.body.destinationLongitude,
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

router.get("/", async (req, res) => {
  try {
    const result = await getBookings();
    res.json({ bookings: result.bookings || [] });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const booking = await getBooking(req.params.id);
    res.json({ booking });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:id/status", async (req, res) => {
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

router.put("/:id/accept", async (req, res) => {
  try {
    const booking = await acceptBooking(req.params.id);
    res.json({
      message: "Tài xế đã nhận chuyến",
      booking,
    });
  } catch (error) {
    handleError(res, error);
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
    handleError(res, error);
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
    handleError(res, error);
  }
});

module.exports = router;
