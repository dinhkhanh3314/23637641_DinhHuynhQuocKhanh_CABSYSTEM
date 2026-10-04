const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const { createDriver, getNearbyDrivers } = require("../services/driverService");

const PROTO_PATH = path.join(__dirname, "../../../contracts/grpc/driver.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const driverProto = grpc.loadPackageDefinition(packageDefinition).driver;

async function createDriverHandler(call, callback) {
  try {
    const result = await createDriver({
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

function startDriverGrpcServer() {
  const server = new grpc.Server();

  server.addService(driverProto.DriverService.service, {
    CreateDriver: createDriverHandler,

    GetNearbyDrivers: async (call, callback) => {
      try {
        const { latitude, longitude, radius } = call.request;

        const drivers = await getNearbyDrivers(
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
