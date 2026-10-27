const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = path.join(__dirname, "../../../proto/driver.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const driverProto = grpc.loadPackageDefinition(packageDefinition).driver;

const client = new driverProto.DriverService(
  process.env.DRIVER_GRPC_ADDRESS || "localhost:50053",
  grpc.credentials.createInsecure(),
);

function call(method, request) {
  return new Promise((resolve, reject) => {
    client[method](request, (error, response) => {
      if (error) {
        return reject(error);
      }
      resolve(response);
    });
  });
}

function createDriver(data) {
  return call("CreateDriver", {
    user_id: data.userId,
    full_name: data.fullName,
    phone: data.phone,
    license_no: data.licenseNo,
    vehicle_type: data.vehicleType,
    plate_number: data.plateNumber,
    brand: data.brand,
    model: data.model,
    color: data.color,
  });
}

const getDrivers = () => call("GetDrivers", {});
const getApplications = () => call("GetApplications", {});
const approveApplication = (id) => call("ApproveApplication", { id });
const goOnline = (driverId) => call("GoOnline", { driver_id: driverId });
const updateDriverLocation = (driverId, latitude, longitude) =>
  call("UpdateDriverLocation", { driver_id: driverId, latitude, longitude });

module.exports = {
  createDriver,
  getDrivers,
  getApplications,
  approveApplication,
  goOnline,
  updateDriverLocation,
};
