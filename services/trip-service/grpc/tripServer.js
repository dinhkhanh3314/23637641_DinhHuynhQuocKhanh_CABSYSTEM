const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const {
  createTrip,
  getTrip,
  startTrip,
  completeTrip,
  createReview,
  getReview,
} = require("../services/tripService");

const PROTO_PATH = path.join(__dirname, "../../../proto/trip.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const tripProto = grpc.loadPackageDefinition(packageDefinition).trip;

function toTripResponse(trip) {
  return {
    success: true,
    message: "OK",
    tripId: trip.tripId,
    bookingId: trip.bookingId,
    customerId: trip.customerId,
    driverId: trip.driverId,
    pickupLatitude: trip.pickup.latitude,
    pickupLongitude: trip.pickup.longitude,
    destinationLatitude: trip.destination.latitude,
    destinationLongitude: trip.destination.longitude,
    status: trip.status,
    startedAt: trip.startedAt ? trip.startedAt.toISOString() : "",
    completedAt: trip.completedAt ? trip.completedAt.toISOString() : "",
  };
}

function handleError(callback, error) {
  const message = error.message || "INTERNAL_ERROR";

  const status =
    message === "TRIP_NOT_FOUND"
      ? grpc.status.NOT_FOUND
      : message === "REVIEW_NOT_FOUND"
        ? grpc.status.NOT_FOUND
      : message === "TRIP_ALREADY_EXISTS" ||
          message === "TRIP_CANNOT_START" ||
          message === "TRIP_CANNOT_COMPLETE" ||
          message === "REVIEW_ALREADY_EXISTS"
        ? grpc.status.FAILED_PRECONDITION
        : message === "INVALID_RATING"
          ? grpc.status.INVALID_ARGUMENT
        : grpc.status.INTERNAL;

  callback({
    code: status,
    message,
  });
}

function toReviewResponse(review) {
  return {
    reviewId: review.reviewId,
    tripId: review.tripId,
    reviewerId: review.reviewerId,
    revieweeId: review.revieweeId,
    reviewerType: review.reviewerType,
    rating: review.rating || 0,
    comment: review.comment || "",
    status: review.status,
  };
}

async function createTripHandler(call, callback) {
  try {
    const trip = await createTrip(call.request);
    callback(null, toTripResponse(trip));
  } catch (error) {
    handleError(callback, error);
  }
}

async function getTripHandler(call, callback) {
  try {
    const trip = await getTrip(call.request.tripId);
    callback(null, toTripResponse(trip));
  } catch (error) {
    handleError(callback, error);
  }
}

async function startTripHandler(call, callback) {
  try {
    const trip = await startTrip(call.request.tripId);
    callback(null, toTripResponse(trip));
  } catch (error) {
    handleError(callback, error);
  }
}

async function completeTripHandler(call, callback) {
  try {
    const trip = await completeTrip(call.request.tripId);
    callback(null, toTripResponse(trip));
  } catch (error) {
    handleError(callback, error);
  }

  async function submitReviewHandler(call, callback) {
    try {
      const review = await createReview(call.request);
      callback(null, toReviewResponse(review));
    } catch (error) {
      handleError(callback, error);
    }
  }

  async function getReviewHandler(call, callback) {
    try {
      const review = await getReview(
        call.request.tripId,
        call.request.reviewerId,
      );
      callback(null, toReviewResponse(review));
    } catch (error) {
      handleError(callback, error);
    }
  }
}

function startTripGrpcServer() {
  const server = new grpc.Server();

  server.addService(tripProto.TripService.service, {
    createTrip: createTripHandler,
    getTrip: getTripHandler,
    startTrip: startTripHandler,
    completeTrip: completeTripHandler,
    submitReview: submitReviewHandler,
    getReview: getReviewHandler,
  });

  const port = process.env.TRIP_GRPC_PORT || "50055";

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, boundPort) => {
      if (error) {
        console.error("Trip gRPC server failed to start:", error);
        return;
      }

      console.log(`Trip gRPC server running on port ${boundPort}`);
    },
  );

  return server;
}

module.exports = startTripGrpcServer;
