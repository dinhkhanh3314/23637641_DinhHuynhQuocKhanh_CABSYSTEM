const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const {
  registerCustomer,
  loginCustomer,
  registerDriver,
  sendDriverOtp,
  verifyDriverOtp,
  setDriverPassword,
} = require("../services/authService");

const PROTO_PATH = path.join(__dirname, "../../../contracts/grpc/auth.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

function mapError(error) {
  const message = error.message || "INTERNAL_ERROR";

  const codes = {
    USER_ALREADY_EXISTS: grpc.status.ALREADY_EXISTS,
    CUSTOMER_CREATION_FAILED: grpc.status.UNAVAILABLE,
    DRIVER_CREATION_FAILED: grpc.status.UNAVAILABLE,
    INVALID_CREDENTIALS: grpc.status.UNAUTHENTICATED,
    PASSWORD_NOT_SET: grpc.status.FAILED_PRECONDITION,
    USER_INACTIVE: grpc.status.PERMISSION_DENIED,
    OTP_EXPIRED: grpc.status.FAILED_PRECONDITION,
    INVALID_OTP: grpc.status.INVALID_ARGUMENT,
    PHONE_NOT_VERIFIED: grpc.status.FAILED_PRECONDITION,
    USER_NOT_FOUND: grpc.status.NOT_FOUND,
    NOT_DRIVER: grpc.status.FAILED_PRECONDITION,
    PASSWORD_ALREADY_SET: grpc.status.FAILED_PRECONDITION,
  };

  return {
    code: codes[message] || grpc.status.INTERNAL,
    message,
  };
}

async function RegisterCustomer(call, callback) {
  try {
    const user = await registerCustomer({
      phone: call.request.phone,
      email: call.request.email,
      password: call.request.password,
    });

    callback(null, {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.createdAt ? user.createdAt.toISOString() : "",
    });
  } catch (error) {
    console.error("RegisterCustomer gRPC error:", error);
    callback(mapError(error));
  }
}

async function LoginCustomer(call, callback) {
  try {
    const user = await loginCustomer({
      identifier: call.request.identifier,
      password: call.request.password,
    });

    callback(null, {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status,
      access_token: user.accessToken,
    });
  } catch (error) {
    console.error("LoginCustomer gRPC error:", error);
    callback(mapError(error));
  }
}

async function SendDriverOtp(call, callback) {
  try {
    const otp = await sendDriverOtp(call.request.phone);

    callback(null, {
      message: "Đã gửi OTP",
      otp,
    });
  } catch (error) {
    console.error("SendDriverOtp gRPC error:", error);
    callback(mapError(error));
  }
}

async function VerifyDriverOtp(call, callback) {
  try {
    await verifyDriverOtp(call.request.phone, call.request.otp);

    callback(null, {
      message: "Xác thực OTP thành công",
    });
  } catch (error) {
    console.error("VerifyDriverOtp gRPC error:", error);
    callback(mapError(error));
  }
}

async function RegisterDriver(call, callback) {
  try {
    const result = await registerDriver({
      phone: call.request.phone,
      email: call.request.email,
      fullName: call.request.full_name,
      licenseNo: call.request.license_no,
      vehicleType: call.request.vehicle_type,
      plateNumber: call.request.plate_number,
      brand: call.request.brand,
      model: call.request.model,
      color: call.request.color,
    });

    callback(null, {
      message: result.message,
      user_id: result.userId,
      driver_id: result.driverId,
      role: result.role,
      application_status: result.applicationStatus,
    });
  } catch (error) {
    console.error("RegisterDriver gRPC error:", error);
    callback(mapError(error));
  }
}

async function SetDriverPassword(call, callback) {
  try {
    const result = await setDriverPassword(
      call.request.phone,
      call.request.password,
    );

    callback(null, {
      message: result.message,
    });
  } catch (error) {
    console.error("SetDriverPassword gRPC error:", error);
    callback(mapError(error));
  }
}

function startAuthGrpcServer() {
  const server = new grpc.Server();

  server.addService(authProto.AuthService.service, {
    RegisterCustomer,
    LoginCustomer,
    SendDriverOtp,
    VerifyDriverOtp,
    RegisterDriver,
    SetDriverPassword,
  });

  const port = process.env.AUTH_GRPC_PORT || "50051";

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, boundPort) => {
      if (error) {
        console.error("Auth gRPC server error:", error);
        return;
      }

      console.log(`Auth gRPC Server running on port ${boundPort}`);
    },
  );
}

module.exports = { startAuthGrpcServer };
