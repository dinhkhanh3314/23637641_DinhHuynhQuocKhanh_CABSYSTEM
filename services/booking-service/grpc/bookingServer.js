const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const {
  createBooking,
  getBooking,
  getBookings,
  updateBookingStatus,
  acceptBooking,
  cancelBooking,
  rejectBooking,
} = require("../services/bookingService");

const PROTO_PATH = path.join(
  __dirname,
  "../../../proto/booking.proto",
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const bookingProto = grpc.loadPackageDefinition(packageDefinition).booking;

function toBookingResponse(booking) {
  return {
    id: booking.id,
    customer_id: booking.customerId,
    driver_id: booking.driverId ?? 0,
    pickup_latitude: booking.pickupLatitude,
    pickup_longitude: booking.pickupLongitude,
    destination_latitude: booking.destinationLatitude,
    destination_longitude: booking.destinationLongitude,
    vehicle_type: booking.vehicleType,
    status: booking.status,
    cancel_reason: booking.cancelReason || "",
    trip_id: booking.tripId || 0,
    trip_status: booking.tripStatus || "",
  };
}

function mapError(error) {
  const message = error.message || "INTERNAL_ERROR";

  const codes = {
    MISSING_BOOKING_DATA: grpc.status.INVALID_ARGUMENT,
    BOOKING_NOT_FOUND: grpc.status.NOT_FOUND,
    BOOKING_NOT_ASSIGNED: grpc.status.FAILED_PRECONDITION,
    BOOKING_CANNOT_CANCEL: grpc.status.FAILED_PRECONDITION,
    CANCEL_REASON_REQUIRED: grpc.status.INVALID_ARGUMENT,
    INVALID_STATUS: grpc.status.INVALID_ARGUMENT,
    TRIP_CREATION_FAILED: grpc.status.UNAVAILABLE,
  };

  return {
    code: codes[message] || grpc.status.INTERNAL,
    message,
  };
}

async function CreateBooking(call, callback) {
  try {
    const request = call.request;

    const booking = await createBooking({
      customerId: request.customer_id,
      pickupLatitude: request.pickup_latitude,
      pickupLongitude: request.pickup_longitude,
      destinationLatitude: request.destination_latitude,
      destinationLongitude: request.destination_longitude,
      vehicleType: request.vehicle_type,
    });

    callback(null, toBookingResponse(booking));
  } catch (error) {
    console.error("CreateBooking gRPC error:", error);
    callback(mapError(error));
  }
}

async function GetBooking(call, callback) {
  try {
    const booking = await getBooking(call.request.id);

    if (!booking) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "BOOKING_NOT_FOUND",
      });
    }

    callback(null, toBookingResponse(booking));
  } catch (error) {
    console.error("GetBooking gRPC error:", error);
    callback(mapError(error));
  }
}

async function GetBookings(call, callback) {
  try {
    const bookings = await getBookings();
    callback(null, {
      bookings: bookings.map(toBookingResponse),
    });
  } catch (error) {
    console.error("GetBookings gRPC error:", error);
    callback(mapError(error));
  }
}

async function UpdateBookingStatus(call, callback) {
  try {
    const booking = await updateBookingStatus(
      call.request.id,
      call.request.status,
    );
    callback(null, toBookingResponse(booking));
  } catch (error) {
    console.error("UpdateBookingStatus gRPC error:", error);
    callback(mapError(error));
  }
}

async function AcceptBooking(call, callback) {
  try {
    const result = await acceptBooking(call.request.id);
    const response = toBookingResponse(result.booking);
    response.trip_id = result.trip?.tripId || 0;
    response.trip_status = result.trip?.status || "";
    callback(null, response);
  } catch (error) {
    console.error("AcceptBooking gRPC error:", error);
    callback(mapError(error));
  }
}

async function CancelBooking(call, callback) {
  try {
    const booking = await cancelBooking(
      call.request.id,
      call.request.cancel_reason,
    );
    callback(null, toBookingResponse(booking));
  } catch (error) {
    console.error("CancelBooking gRPC error:", error);
    callback(mapError(error));
  }
}

async function RejectBooking(call, callback) {
  try {
    const booking = await rejectBooking(call.request.id);
    callback(null, toBookingResponse(booking));
  } catch (error) {
    console.error("RejectBooking gRPC error:", error);
    callback(mapError(error));
  }
}

function startBookingGrpcServer() {
  const server = new grpc.Server();

  server.addService(bookingProto.BookingService.service, {
    CreateBooking,
    GetBooking,
    GetBookings,
    UpdateBookingStatus,
    AcceptBooking,
    CancelBooking,
    RejectBooking,
  });

  const port = process.env.BOOKING_GRPC_PORT || "50054";

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, boundPort) => {
      if (error) {
        console.error("Booking gRPC server error:", error);
        return;
      }

      console.log(`Booking gRPC Server running on port ${boundPort}`);
    },
  );
}

module.exports = { startBookingGrpcServer };
