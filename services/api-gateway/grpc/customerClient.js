const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const definition = protoLoader.loadSync(
  path.join(__dirname, "../../../contracts/grpc/customer.proto"),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true },
);
const customerProto = grpc.loadPackageDefinition(definition).customer;
const client = new customerProto.CustomerService(
  process.env.CUSTOMER_GRPC_ADDRESS || "localhost:50052",
  grpc.credentials.createInsecure(),
);

function createCustomer(data) {
  return new Promise((resolve, reject) => {
    client.CreateCustomer(data, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
}

module.exports = { createCustomer };
