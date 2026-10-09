const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "../../../contracts/grpc/trip.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const tripProto = grpc.loadPackageDefinition(packageDefinition).trip;

const tripClient = new tripProto.TripService(
  process.env.TRIP_GRPC_ADDRESS || "localhost:50055",
  grpc.credentials.createInsecure(),
);

function createTrip(data) {
  return new Promise((resolve, reject) => {
    tripClient.createTrip(data, (error, response) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(response);
    });
  });
}

function getTrip(tripId) {
  return new Promise((resolve, reject) => {
    tripClient.getTrip({ tripId }, (error, response) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(response);
    });
  });
}

module.exports = {
  createTrip,
  getTrip,
};
