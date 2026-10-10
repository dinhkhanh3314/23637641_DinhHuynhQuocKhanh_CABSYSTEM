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

function getTrip(tripId) {
  return new Promise((resolve, reject) => {
    client.getTrip({ tripId: Number(tripId) }, (error, response) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(response);
    });
  });
}

module.exports = { getTrip };