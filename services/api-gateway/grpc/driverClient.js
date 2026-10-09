const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const definition = protoLoader.loadSync(
  path.join(__dirname, "../../../contracts/grpc/driver.proto"),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true },
);
const driverProto = grpc.loadPackageDefinition(definition).driver;
const client = new driverProto.DriverService(
  process.env.DRIVER_GRPC_ADDRESS || "localhost:50053",
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

function createDriver(data) {
  return call("CreateDriver", data);
}

function getNearbyDrivers(data) {
  return call("GetNearbyDrivers", data);
}

module.exports = { createDriver, getNearbyDrivers };
