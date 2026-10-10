const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(
  __dirname,
  "../../../proto/customer.proto",
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const customerProto = grpc.loadPackageDefinition(packageDefinition).customer;

const client = new customerProto.CustomerService(
  "localhost:50052",
  grpc.credentials.createInsecure(),
);

function createCustomer(userId) {
  return new Promise((resolve, reject) => {
    client.CreateCustomer(
      {
        user_id: userId,
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
  createCustomer,
};
