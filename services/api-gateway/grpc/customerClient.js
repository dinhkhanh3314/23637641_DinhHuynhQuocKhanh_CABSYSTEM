const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const definition = protoLoader.loadSync(
  path.join(__dirname, "../../../proto/customer.proto"),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true },
);
const customerProto = grpc.loadPackageDefinition(definition).customer;
const client = new customerProto.CustomerService(
  process.env.CUSTOMER_GRPC_ADDRESS || "localhost:50052",
  grpc.credentials.createInsecure(),
);

function createCustomer(data) {
  return call("CreateCustomer", data);
}

function call(method, data) {
  return new Promise((resolve, reject) => {
    client[method](data, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
}

function getCustomer(userId) {
  return call("GetCustomer", { user_id: Number(userId) });
}

function updateCustomer(userId, data) {
  return call("UpdateCustomer", {
    user_id: Number(userId),
    full_name: data.fullName,
    date_of_birth: data.dateOfBirth || "",
    gender: data.gender || "",
  });
}

module.exports = { createCustomer, getCustomer, updateCustomer };
