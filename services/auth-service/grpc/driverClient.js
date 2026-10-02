const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

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

function createDriver(data) {
  return new Promise((resolve, reject) => {
    client.CreateDriver(
      {
        user_id: data.userId,
        full_name: data.fullName,
        phone: data.phone,
        license_no: data.licenseNo,
        vehicle_type: data.vehicleType,
        plate_number: data.plateNumber,
        brand: data.brand,
        model: data.model,
        color: data.color,
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        resolve(response);
      },
    );
  });
}

module.exports = {
  createDriver,
};
