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
const { estimateFareFromCoordinates } = require("../grpc/paymentClient");
const { grpcErrorToHttp } = require("../grpc/grpcError");
const { requireRoles } = require("../middlewares/auth");

const router = express.Router();

function handleError(res, error) {
  console.error(error);
  const mapped = grpcErrorToHttp(error);
  return res.status(mapped.status).json({ message: mapped.message });
}

function omitUncreatedTrip(booking) {
  if (!booking || booking.trip_id) {
    return booking;
  }

  const { trip_id, trip_status, ...bookingWithoutTrip } = booking;
  return bookingWithoutTrip;
}

router.post("/", async (req, res) => {
  try {
    const coordinates = {
      pickupLatitude: req.body.pickLat,
      pickupLongitude: req.body.pickLng,
      destinationLatitude: req.body.destLat,
      destinationLongitude: req.body.destLng,
    };
    const coordinateValues = Object.values(coordinates);
    if (
      coordinateValues.some(
        (coordinate) =>
          typeof coordinate !== "number" || !Number.isFinite(coordinate),
      ) ||
      Math.abs(coordinates.pickupLatitude) > 90 ||
      Math.abs(coordinates.destinationLatitude) > 90 ||
      Math.abs(coordinates.pickupLongitude) > 180 ||
      Math.abs(coordinates.destinationLongitude) > 180
    ) {
      return res.status(400).json({
        message: "Tọa độ đón và điểm đến không hợp lệ",
      });
    }

    const fare = await estimateFareFromCoordinates(coordinates);
    const booking = await createBooking({
      customer_id: req.user.userId,
      pickup_latitude: coordinates.pickupLatitude,
      pickup_longitude: coordinates.pickupLongitude,
      destination_latitude: coordinates.destinationLatitude,
      destination_longitude: coordinates.destinationLongitude,
      vehicle_type: req.body.vehicleType,
    });

    res.status(201).json({
      message: "Tạo booking thành công",
      booking: omitUncreatedTrip(booking),
      estimatedFare: {
        distanceKm: fare.distance_km,
        baseFare: fare.base_fare,
        pricePerKm: fare.price_per_km,
        totalFare: fare.total_fare,
        currency: fare.currency,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    const result = await getBookings(undefined, req.query.page, req.query.limit);
    res.json({
      bookings: (result.bookings || []).map(omitUncreatedTrip),
      pagination: {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:id", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    const booking = await getBooking(req.params.id);
    res.json({ booking: omitUncreatedTrip(booking) });
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
      booking: omitUncreatedTrip(booking),
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
      booking: omitUncreatedTrip(result.booking),
      trip: result.trip,
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:id/cancel", requireRoles("CUSTOMER"), async (req, res) => {
  try {
    const booking = await cancelBooking(req.params.id, req.body.cancelReason);
    res.json({
      message: "Hủy chuyến thành công",
      booking: omitUncreatedTrip(booking),
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
      booking: omitUncreatedTrip(booking),
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
