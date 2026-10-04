const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "../../../contracts/grpc/driver.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const driverProto = grpc.loadPackageDefinition(packageDefinition).driver;

const client = new driverProto.DriverService(
  "localhost:50053",
  grpc.credentials.createInsecure(),
);

function getNearbyDrivers(latitude, longitude, radius = 1000) {
  return new Promise((resolve, reject) => {
    client.GetNearbyDrivers(
      {
        latitude,
        longitude,
        radius,
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        resolve(response.drivers || []);
      },
    );
  });
}

module.exports = {
  getNearbyDrivers,
};
