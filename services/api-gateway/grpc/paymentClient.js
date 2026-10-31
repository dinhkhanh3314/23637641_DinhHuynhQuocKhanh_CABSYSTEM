const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const definition = protoLoader.loadSync(
  path.join(__dirname, "../../../proto/payment.proto"),
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
  return call("CreatePayment", {
    trip_id: Number(data.tripId),
    customer_id: Number(data.customerId),
  });
}

function getPayment(id) {
  return call("GetPayment", { id: Number(id) });
}

function getPaymentByTrip(tripId) {
  return call("GetPaymentByTrip", {
    trip_id: Number(tripId),
  });
}

function processPayment(id, data) {
  return call("ProcessPayment", {
    id: Number(id),
    amount: data.amount,
    payment_method: data.paymentMethod,
  });
}

function estimateFare(tripId) {
  return call("EstimateFare", { trip_id: Number(tripId) });
}

function estimateFareFromCoordinates(data) {
  return call("EstimateFareFromCoordinates", {
    pickup_latitude: data.pickupLatitude,
    pickup_longitude: data.pickupLongitude,
    destination_latitude: data.destinationLatitude,
    destination_longitude: data.destinationLongitude,
  });
}

module.exports = {
  createPayment,
  getPayment,
  getPaymentByTrip,
  processPayment,
  estimateFare,
  estimateFareFromCoordinates,
};
