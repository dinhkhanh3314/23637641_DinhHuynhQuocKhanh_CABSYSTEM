const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const definition = protoLoader.loadSync(
  path.join(__dirname, "../../../proto/driver.proto"),
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

function getDriver(id) {
  return call("GetDriver", { id: Number(id) });
}

function getDrivers() {
  return call("GetDrivers", {});
}

function updateDriver(id, data) {
  return call("UpdateDriver", {
    id: Number(id),
    full_name: data.fullName,
    phone: data.phone,
    license_no: data.licenseNo,
  });
}

function getNearbyDrivers(data) {
  return call("GetNearbyDrivers", data);
}

function getOnlineDrivers() {
  return call("GetOnlineDrivers", {});
}

function goOnline(driverId) {
  return call("GoOnline", { driver_id: Number(driverId) });
}

function goOffline(driverId) {
  return call("GoOffline", { driver_id: Number(driverId) });
}

function updateDriverLocation(driverId, data) {
  return call("UpdateDriverLocation", {
    driver_id: Number(driverId),
    longitude: Number(data.longitude),
    latitude: Number(data.latitude),
  });
}

function getDriverLocation(driverId) {
  return call("GetDriverLocation", { id: Number(driverId) });
}

function vehicleRequest(driverId, data) {
  return {
    driver_id: Number(driverId),
    vehicle_type: data.vehicleType,
    plate_number: data.plateNumber,
    brand: data.brand,
    model: data.model,
    color: data.color,
  };
}

function createVehicle(driverId, data) {
  return call("CreateVehicle", vehicleRequest(driverId, data));
}

function updateVehicle(driverId, data) {
  return call("UpdateVehicle", vehicleRequest(driverId, data));
}

function getApplications() {
  return call("GetApplications", {});
}

function getApplication(id) {
  return call("GetApplication", { id: Number(id) });
}

function approveApplication(id) {
  return call("ApproveApplication", { id: Number(id) });
}

function rejectApplication(id, note) {
  return call("RejectApplication", { id: Number(id), note: note || "" });
}

function resubmitApplication(id, data) {
  return call("ResubmitApplication", {
    id: Number(id),
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

module.exports = {
  createDriver,
  getDriver,
  getDrivers,
  updateDriver,
  getNearbyDrivers,
  getOnlineDrivers,
  goOnline,
  goOffline,
  updateDriverLocation,
  getDriverLocation,
  createVehicle,
  updateVehicle,
  getApplications,
  getApplication,
  approveApplication,
  rejectApplication,
  resubmitApplication,
};
