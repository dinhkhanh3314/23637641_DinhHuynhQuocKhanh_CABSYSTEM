const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const definition = protoLoader.loadSync(
  path.join(__dirname, "../../../contracts/grpc/payment.proto"),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true },
);
const paymentProto = grpc.loadPackageDefinition(definition).payment;
const client = new paymentProto.PaymentService(
  process.env.PAYMENT_GRPC_ADDRESS || "localhost:50056",
  grpc.credentials.createInsecure(),
);

function call(method, request) {
  return new Promise((resolve, reject) => {
    client[method](request, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
}

function createPayment(data) {
  return call("CreatePayment", data);
}

function getPayment(id) {
  return call("GetPayment", { id: Number(id) });
}

function processPayment(id) {
  return call("ProcessPayment", { id: Number(id) });
}

module.exports = { createPayment, getPayment, processPayment };
