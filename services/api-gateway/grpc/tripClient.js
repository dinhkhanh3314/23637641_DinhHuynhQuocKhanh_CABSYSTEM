const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const definition = protoLoader.loadSync(
  path.join(__dirname, "../../../proto/trip.proto"),
  { keepCase: false, longs: String, enums: String, defaults: true, oneofs: true },
);
const tripProto = grpc.loadPackageDefinition(definition).trip;
const client = new tripProto.TripService(
  process.env.TRIP_GRPC_ADDRESS || "localhost:50055",
  grpc.credentials.createInsecure(),
);

function call(method, request) {
  return new Promise((resolve, reject) => {
    client[method](request, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
}

function createTrip(data) {
  return call("createTrip", data);
}

function getTrip(tripId) {
  return call("getTrip", { tripId: Number(tripId) });
}

function startTrip(tripId) {
  return call("startTrip", { tripId: Number(tripId) });
}

function completeTrip(tripId) {
  return call("completeTrip", { tripId: Number(tripId) });
}

function submitReview(data) {
  return call("submitReview", {
    tripId: Number(data.tripId),
    reviewerId: Number(data.reviewerId),
    rating: Number(data.rating),
    comment: data.comment || "",
  });
}

function getReview(tripId, reviewerId) {
  return call("getReview", {
    tripId: Number(tripId),
    reviewerId: Number(reviewerId),
  });
}

module.exports = {
  createTrip,
  getTrip,
  startTrip,
  completeTrip,
  submitReview,
  getReview,
};
