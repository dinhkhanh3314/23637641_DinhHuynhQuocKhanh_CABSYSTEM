const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "../../../contracts/grpc/auth.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const client = new authProto.AuthService(
  process.env.AUTH_GRPC_ADDRESS || "localhost:50051",
  grpc.credentials.createInsecure(),
);

function promisify(method, request) {
  return new Promise((resolve, reject) => {
    client[method](request, (error, response) => {
      if (error) {
        return reject(error);
      }

      resolve(response);
    });
  });
}

function registerCustomer(data) {
  return promisify("RegisterCustomer", data);
}

function loginCustomer(data) {
  return promisify("LoginCustomer", data);
}

function sendDriverOtp(phone) {
  return promisify("SendDriverOtp", { phone });
}

function verifyDriverOtp(phone, otp) {
  return promisify("VerifyDriverOtp", { phone, otp });
}

function registerDriver(data) {
  return promisify("RegisterDriver", data);
}

function setDriverPassword(phone, password) {
  return promisify("SetDriverPassword", { phone, password });
}

module.exports = {
  registerCustomer,
  loginCustomer,
  sendDriverOtp,
  verifyDriverOtp,
  registerDriver,
  setDriverPassword,
};
