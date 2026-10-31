const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const {
  createPayment,
  calculateFare,
  calculateFareFromCoordinates,
  getPayment,
  getPaymentByTrip,
  processPayment,
} = require("../services/paymentService");

const PROTO_PATH = path.join(
  __dirname,
  "../../../proto/payment.proto",
);

const definition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const paymentProto = grpc.loadPackageDefinition(definition).payment;

function toPaymentResponse(payment) {
  return {
    id: payment.id,
    trip_id: payment.tripId,
    customer_id: payment.customerId,
    amount: Number(payment.amount),
    payment_method: payment.paymentMethod || "",
    status: payment.status,
    transaction_id: payment.transactionId || "",
    failure_reason: payment.failureReason || "",
    paid_at: payment.paidAt ? payment.paidAt.toISOString() : "",
    failed_at: payment.failedAt ? payment.failedAt.toISOString() : "",
  };
}

function mapError(error) {
  const codes = {
    PAYMENT_NOT_FOUND: grpc.status.NOT_FOUND,
    PAYMENT_CANNOT_PROCESS: grpc.status.FAILED_PRECONDITION,
    INVALID_TRIP_ID: grpc.status.INVALID_ARGUMENT,
    INVALID_CUSTOMER_ID: grpc.status.INVALID_ARGUMENT,
    INVALID_COORDINATES: grpc.status.INVALID_ARGUMENT,
    PAYMENT_DETAILS_MISMATCH: grpc.status.INVALID_ARGUMENT,
    CUSTOMER_TRIP_MISMATCH: grpc.status.PERMISSION_DENIED,
    TRIP_NOT_COMPLETED: grpc.status.FAILED_PRECONDITION,
  };

  return {
    code: codes[error.message] || grpc.status.INTERNAL,
    message: error.message || "INTERNAL_ERROR",
  };
}

async function CreatePayment(call, callback) {
  try {
    const payment = await createPayment({
      tripId: call.request.trip_id,
      customerId: call.request.customer_id,
    });
    callback(null, toPaymentResponse(payment));
  } catch (error) {
    console.error("CreatePayment gRPC error:", error);
    callback(mapError(error));
  }
}

async function GetPayment(call, callback) {
  try {
    callback(null, toPaymentResponse(await getPayment(call.request.id)));
  } catch (error) {
    console.error("GetPayment gRPC error:", error);
    callback(mapError(error));
  }
}

async function GetPaymentByTrip(call, callback) {
  try {
    callback(
      null,
      toPaymentResponse(
        await getPaymentByTrip(call.request.trip_id),
      ),
    );
  } catch (error) {
    console.error("GetPaymentByTrip gRPC error:", error);
    callback(mapError(error));
  }
}

async function ProcessPayment(call, callback) {
  try {
    callback(
      null,
      toPaymentResponse(
        await processPayment(
          call.request.id,
          call.request.amount,
          call.request.payment_method,
        ),
      ),
    );
  } catch (error) {
    console.error("ProcessPayment gRPC error:", error);
    callback(mapError(error));
  }

}

async function EstimateFare(call, callback) {
  try {
    const fare = await calculateFare(call.request.trip_id);
    callback(null, {
      trip_id: fare.tripId,
      distance_km: fare.distanceKm,
      base_fare: fare.baseFare,
      price_per_km: fare.pricePerKm,
      total_fare: fare.totalFare,
      currency: fare.currency,
    });
  } catch (error) {
    console.error("EstimateFare gRPC error:", error);
    callback(mapError(error));
  }
}

async function EstimateFareFromCoordinates(call, callback) {
  try {
    const fare = calculateFareFromCoordinates({
      pickupLatitude: call.request.pickup_latitude,
      pickupLongitude: call.request.pickup_longitude,
      destinationLatitude: call.request.destination_latitude,
      destinationLongitude: call.request.destination_longitude,
    });
    callback(null, {
      distance_km: fare.distanceKm,
      base_fare: fare.baseFare,
      price_per_km: fare.pricePerKm,
      total_fare: fare.totalFare,
      currency: fare.currency,
    });
  } catch (error) {
    console.error("EstimateFareFromCoordinates gRPC error:", error);
    callback(mapError(error));
  }
}

function startPaymentGrpcServer() {
  const server = new grpc.Server();
  server.addService(paymentProto.PaymentService.service, {
    CreatePayment,
    GetPayment,
    GetPaymentByTrip,
    ProcessPayment,
    EstimateFare,
    EstimateFareFromCoordinates,
  });

  const port = process.env.PAYMENT_GRPC_PORT || "50056";
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, boundPort) => {
      if (error) {
        console.error("Payment gRPC server error:", error);
        return;
      }
      console.log(`Payment gRPC Server running on port ${boundPort}`);
    },
  );
}

module.exports = { startPaymentGrpcServer };
