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

function getBooking(id) {
  return promisify("GetBooking", { id: Number(id) });
}

function getBookings() {
  return promisify("GetBookings", {});
}

function updateBookingStatus(id, status) {
  return promisify("UpdateBookingStatus", {
    id: Number(id),
    status,
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
  acceptBooking,
  cancelBooking,
  rejectBooking,
};
