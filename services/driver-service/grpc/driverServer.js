const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const driverService = require("../services/driverService");
const applicationService = require("../services/applicationService");

const PROTO_PATH = path.join(__dirname, "../../../proto/driver.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const driverProto = grpc.loadPackageDefinition(packageDefinition).driver;

function errorCallback(callback, error) {
  const codeMap = {
    DRIVER_NOT_FOUND: grpc.status.NOT_FOUND,
    LOCATION_NOT_FOUND: grpc.status.NOT_FOUND,
    DRIVER_NOT_ONLINE: grpc.status.FAILED_PRECONDITION,
    DRIVER_NOT_APPROVED: grpc.status.FAILED_PRECONDITION,
    APPLICATION_NOT_FOUND: grpc.status.NOT_FOUND,
    APPLICATION_ALREADY_PROCESSED: grpc.status.FAILED_PRECONDITION,
    APPLICATION_NOT_REJECTED: grpc.status.FAILED_PRECONDITION,
  };
  callback({
    code: codeMap[error.message] || grpc.status.INTERNAL,
    message: error.message || "DRIVER_SERVICE_ERROR",
  });
}

function toVehicleResponse(vehicle, driverId) {
  return {
    driver_id: driverId,
    vehicle_type: vehicle?.vehicleType || "",
    plate_number: vehicle?.plateNumber || "",
    brand: vehicle?.brand || "",
    model: vehicle?.model || "",
    color: vehicle?.color || "",
  };
}

function toDriverDetails(driver) {
  return {
    id: driver.id,
    user_id: driver.userId,
    full_name: driver.fullName || "",
    phone: driver.phone || "",
    license_no: driver.licenseNo || "",
    status: driver.status || "",
    application_status: driver.application?.status || "",
    vehicle: toVehicleResponse(driver.vehicle, driver.id),
  };
}

function toApplicationResponse(application) {
  return {
    id: application.id,
    driver_id: application.driverId,
    status: application.status,
    note: application.note || "",
  };
}

async function createDriverHandler(call, callback) {
  try {
    const result = await driverService.createDriver({
      userId: call.request.user_id,
      fullName: call.request.full_name,
      phone: call.request.phone,
      licenseNo: call.request.license_no,
      vehicleType: call.request.vehicle_type,
      plateNumber: call.request.plate_number,
      brand: call.request.brand,
      model: call.request.model,
      color: call.request.color,
    });

    callback(null, {
      id: result.id,
      user_id: result.userId,
      full_name: result.fullName,
      phone: result.phone || "",
      status: result.status,
    });
  } catch (error) {
    console.error("Create driver gRPC error:", error);

    callback({
      code: grpc.status.INTERNAL,
      message: "Không thể tạo hồ sơ tài xế",
    });
  }
}

async function handleDriver(call, callback, action, mapper) {
  try {
    const result = await action();
    callback(null, mapper ? mapper(result) : result);
  } catch (error) {
    console.error("Driver gRPC error:", error);
    errorCallback(callback, error);
  }
}

function startDriverGrpcServer() {
  const server = new grpc.Server();

  server.addService(driverProto.DriverService.service, {
    CreateDriver: createDriverHandler,
    GetDriver: (call, callback) =>
      handleDriver(
        call,
        callback,
        () => driverService.getDriver(call.request.id),
        (result) => {
          if (!result) throw new Error("DRIVER_NOT_FOUND");
          return toDriverDetails(result);
        },
      ),
    GetDrivers: (call, callback) =>
      handleDriver(
        call,
        callback,
        () => driverService.getDrivers(),
        (results) => ({ drivers: results.map(toDriverDetails) }),
      ),
    UpdateDriver: (call, callback) =>
      handleDriver(
        call,
        callback,
        () =>
          driverService.updateDriver(call.request.id, {
            fullName: call.request.full_name,
            phone: call.request.phone,
            licenseNo: call.request.license_no,
          }),
        toDriverDetails,
      ),

    GetNearbyDrivers: async (call, callback) => {
      try {
        const { latitude, longitude, radius } = call.request;

        const drivers = await driverService.getNearbyDrivers(
          latitude,
          longitude,
          radius || 1000,
        );

        callback(null, {
          drivers: drivers.map((driver) => ({
            id: driver.id,
            user_id: driver.userId,
            full_name: driver.fullName,
            phone: driver.phone || "",
            status: driver.status,
            latitude: driver.latitude,
            longitude: driver.longitude,
          })),
        });
      } catch (error) {
        console.error("Get nearby drivers gRPC error:", error);

        callback({
          code: grpc.status.INTERNAL,
          message: "Không thể tìm tài xế gần",
        });
      }
    },
    GetOnlineDrivers: (call, callback) =>
      handleDriver(
        call,
        callback,
        () => driverService.getOnlineDrivers(),
        (driverIds) => ({ driver_ids: driverIds }),
      ),
    GoOnline: (call, callback) =>
      handleDriver(
        call,
        callback,
        () => driverService.goOnline(call.request.driver_id),
        (result) => result,
      ),
    GoOffline: (call, callback) =>
      handleDriver(
        call,
        callback,
        () => driverService.goOffline(call.request.driver_id),
        (result) => result,
      ),
    UpdateDriverLocation: (call, callback) =>
      handleDriver(
        call,
        callback,
        () =>
          driverService.updateDriverLocation(
            call.request.driver_id,
            call.request.longitude,
            call.request.latitude,
          ),
        (result) => result,
      ),
    GetDriverLocation: (call, callback) =>
      handleDriver(
        call,
        callback,
        () => driverService.getDriverLocation(call.request.id),
        (result) => result,
      ),
    CreateVehicle: (call, callback) =>
      handleDriver(
        call,
        callback,
        () =>
          driverService.createVehicle(call.request.driver_id, {
            vehicleType: call.request.vehicle_type,
            plateNumber: call.request.plate_number,
            brand: call.request.brand,
            model: call.request.model,
            color: call.request.color,
          }),
        (result) => toVehicleResponse(result, call.request.driver_id),
      ),
    UpdateVehicle: (call, callback) =>
      handleDriver(
        call,
        callback,
        () =>
          driverService.updateVehicle(call.request.driver_id, {
            vehicleType: call.request.vehicle_type,
            plateNumber: call.request.plate_number,
            brand: call.request.brand,
            model: call.request.model,
            color: call.request.color,
          }),
        (result) => toVehicleResponse(result, call.request.driver_id),
      ),
    GetApplications: (call, callback) =>
      handleDriver(
        call,
        callback,
        () => applicationService.getApplications(),
        (results) => ({
          applications: results.map(toApplicationResponse),
        }),
      ),
    GetApplication: (call, callback) =>
      handleDriver(
        call,
        callback,
        () => applicationService.getApplication(call.request.id),
        (result) => {
          if (!result) throw new Error("APPLICATION_NOT_FOUND");
          return toApplicationResponse(result);
        },
      ),
    ApproveApplication: (call, callback) =>
      handleDriver(
        call,
        callback,
        () => applicationService.approveApplication(call.request.id),
        toApplicationResponse,
      ),
    RejectApplication: (call, callback) =>
      handleDriver(
        call,
        callback,
        () =>
          applicationService.rejectApplication(
            call.request.id,
            call.request.note,
          ),
        toApplicationResponse,
      ),
    ResubmitApplication: (call, callback) =>
      handleDriver(
        call,
        callback,
        () =>
          applicationService.resubmitApplication(call.request.id, {
            fullName: call.request.full_name,
            phone: call.request.phone,
            licenseNo: call.request.license_no,
            vehicleType: call.request.vehicle_type,
            plateNumber: call.request.plate_number,
            brand: call.request.brand,
            model: call.request.model,
            color: call.request.color,
          }),
        toApplicationResponse,
      ),
  });

  server.bindAsync(
    "0.0.0.0:50053",
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error("Driver gRPC server error:", error);
        return;
      }

      console.log(`Driver gRPC Server running on port ${port}`);
    },
  );
}

module.exports = {
  startDriverGrpcServer,
};
