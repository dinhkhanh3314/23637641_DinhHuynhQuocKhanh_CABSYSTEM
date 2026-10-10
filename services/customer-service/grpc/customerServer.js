const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const {
  createCustomer,
  getCustomerByUserId,
  updateCustomer,
} = require("../services/customerService");

const PROTO_PATH = path.join(
  __dirname,
  "../../../contracts/grpc/customer.proto",
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const customerProto = grpc.loadPackageDefinition(packageDefinition).customer;

async function createCustomerHandler(call, callback) {
  try {
    const customer = await createCustomer({
      userId: call.request.user_id,
      fullName: call.request.full_name || undefined,
      dateOfBirth: call.request.date_of_birth || undefined,
      gender: call.request.gender || undefined,
    });

    callback(null, {
      id: customer.id,
      user_id: customer.userId,
      full_name: customer.fullName || "",
      gender: customer.gender || "",
    });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: "Failed to create customer",
    });
  }
}

function toCustomerResponse(customer) {
  return {
    id: customer.id,
    user_id: customer.userId,
    full_name: customer.fullName || "",
    gender: customer.gender || "",
  };
}

async function getCustomerHandler(call, callback) {
  try {
    const customer = await getCustomerByUserId(call.request.user_id);
    if (!customer) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "CUSTOMER_NOT_FOUND",
      });
    }
    callback(null, toCustomerResponse(customer));
  } catch (error) {
    console.error("Get customer gRPC error:", error);
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

async function updateCustomerHandler(call, callback) {
  try {
    const customer = await updateCustomer(call.request.user_id, {
      fullName: call.request.full_name,
      dateOfBirth: call.request.date_of_birth,
      gender: call.request.gender,
    });
    callback(null, toCustomerResponse(customer));
  } catch (error) {
    console.error("Update customer gRPC error:", error);
    callback({
      code: error.code === "P2025" ? grpc.status.NOT_FOUND : grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

function startGrpcServer() {
  const server = new grpc.Server();

  server.addService(customerProto.CustomerService.service, {
    CreateCustomer: createCustomerHandler,
    GetCustomer: getCustomerHandler,
    UpdateCustomer: updateCustomerHandler,
  });

  server.bindAsync(
    "0.0.0.0:50052",
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("Customer gRPC server running on port 50052");
    },
  );
}

module.exports = {
  startGrpcServer,
};
