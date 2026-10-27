const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

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

const client = new bookingProto.BookingService(
  process.env.BOOKING_GRPC_ADDRESS || "localhost:50054",
  grpc.credentials.createInsecure(),
);

function promisify(method, request) {
  return new Promise((resolve, reject) => {
    client[method](request, (error, response) => {
      if (error) {
        return reject(error);
      }

      resolve(response);
    });
  });
}

function createBooking(data) {
  return promisify("CreateBooking", data);
}

function getBooking(id, customerId) {
  return promisify("GetBooking", {
    id: Number(id),
    customer_id: Number(customerId),
  });
}

function getBookings(customerId, page, limit) {
  const request = {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  };
  if (customerId !== undefined && customerId !== null) {
    request.customer_id = Number(customerId);
  }
  return promisify("GetBookings", request);
}

function updateBookingStatus(id, status) {
  return promisify("UpdateBookingStatus", {
    id: Number(id),
    status,
  });
}

function syncTripStatus(bookingId, tripId, tripStatus) {
  return promisify("SyncTripStatus", {
    booking_id: Number(bookingId),
    trip_id: Number(tripId),
    trip_status: tripStatus,
  });
}

function acceptBooking(id) {
  return promisify("AcceptBooking", { id: Number(id) }).then((response) => ({
    booking: response,
    trip: response.trip_id
      ? {
          tripId: response.trip_id,
          status: response.trip_status,
        }
      : null,
  }));
}

function cancelBooking(id, cancelReason) {
  return promisify("CancelBooking", {
    id: Number(id),
    cancel_reason: cancelReason,
  });
}

function rejectBooking(id) {
  return promisify("RejectBooking", { id: Number(id) });
}

module.exports = {
  createBooking,
  getBooking,
  getBookings,
  updateBookingStatus,
  syncTripStatus,
  acceptBooking,
  cancelBooking,
  rejectBooking,
};
