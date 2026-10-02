const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const { createCustomer } = require("../services/customerService");

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

function startGrpcServer() {
  const server = new grpc.Server();

  server.addService(customerProto.CustomerService.service, {
    CreateCustomer: createCustomerHandler,
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
