const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const axios = require("axios");
const { publishEvent } = require("../kafka/eventBus");
const { getTrip } = require("../grpc/tripClient");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

function calculateDistanceKm(fromLatitude, fromLongitude, toLatitude, toLongitude) {
  const earthRadiusKm = 6371;
  const toRadians = (value) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(fromLatitude)) *
      Math.cos(toRadians(toLatitude)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildFareEstimate(distanceKm, tripId) {
  const roundedDistanceKm = Number(distanceKm.toFixed(2));
  const pricePerKm = 4000;

  return {
    ...(tripId === undefined ? {} : { tripId: Number(tripId) }),
    distanceKm: roundedDistanceKm,
    baseFare: 0,
    pricePerKm,
    totalFare: Math.round(roundedDistanceKm * pricePerKm),
    currency: "VND",
  };
}

function calculateFareFromCoordinates(data) {
  const coordinates = [
    data.pickupLatitude,
    data.pickupLongitude,
    data.destinationLatitude,
    data.destinationLongitude,
  ].map(Number);
  const [pickupLatitude, pickupLongitude, destinationLatitude, destinationLongitude] =
    coordinates;

  if (
    coordinates.some((coordinate) => !Number.isFinite(coordinate)) ||
    Math.abs(pickupLatitude) > 90 ||
    Math.abs(destinationLatitude) > 90 ||
    Math.abs(pickupLongitude) > 180 ||
    Math.abs(destinationLongitude) > 180
  ) {
    throw new Error("INVALID_COORDINATES");
  }

  const distanceKm = calculateDistanceKm(
    pickupLatitude,
    pickupLongitude,
    destinationLatitude,
    destinationLongitude,
  );

  return buildFareEstimate(distanceKm);
}

async function calculateFare(tripId) {
  const trip = await getTrip(tripId);
  const distanceKm = calculateDistanceKm(
    trip.pickupLatitude,
    trip.pickupLongitude,
    trip.destinationLatitude,
    trip.destinationLongitude,
  );

  return buildFareEstimate(distanceKm, tripId);
}

async function createPayment(data) {
  const tripId = Number(data.tripId);
  const customerId = Number(data.customerId);

  if (!Number.isInteger(tripId) || tripId <= 0) {
    throw new Error("INVALID_TRIP_ID");
  }

  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw new Error("INVALID_CUSTOMER_ID");
  }

  const trip = await getTrip(tripId);
  if (Number(trip.customerId) !== customerId) {
    throw new Error("CUSTOMER_TRIP_MISMATCH");
  }
  if (trip.status !== "COMPLETED") {
    throw new Error("TRIP_NOT_COMPLETED");
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { tripId },
  });
  if (existingPayment) {
    if (existingPayment.customerId !== customerId) {
      throw new Error("CUSTOMER_TRIP_MISMATCH");
    }
    return existingPayment;
  }

  const fare = buildFareEstimate(
    calculateDistanceKm(
      trip.pickupLatitude,
      trip.pickupLongitude,
      trip.destinationLatitude,
      trip.destinationLongitude,
    ),
    tripId,
  );
  const amount = fare.totalFare;

  let payment;
  try {
    payment = await prisma.payment.create({
      data: {
        tripId,
        customerId,
        amount,
        paymentMethod: null,
        status: "PENDING",
      },
    });
  } catch (error) {
    if (error.code !== "P2002") {
      throw error;
    }
    payment = await prisma.payment.findUnique({ where: { tripId } });
    if (!payment || payment.customerId !== customerId) {
      throw new Error("CUSTOMER_TRIP_MISMATCH");
    }
    return payment;
  }

  await publishEvent("payment.events", "PaymentCreated", {
    paymentId: payment.id,
    tripId: payment.tripId,
    customerId: payment.customerId,
    status: payment.status,
  });
  return payment;
}

async function getPayment(paymentId) {
  const payment = await prisma.payment.findUnique({
    where: {
      id: Number(paymentId),
    },
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  return payment;
}

async function getPaymentByTrip(tripId) {
  const payment = await prisma.payment.findUnique({
    where: { tripId: Number(tripId) },
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  return payment;
}

async function processPayment(paymentId, amount, paymentMethod) {
  const payment = await prisma.payment.findUnique({
    where: {
      id: Number(paymentId),
    },
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  if (
    !Number.isFinite(Number(amount)) ||
    Number(amount) !== Number(payment.amount) ||
    !["CASH", "BANK_TRANSFER"].includes(paymentMethod)
  ) {
    throw new Error("PAYMENT_DETAILS_MISMATCH");
  }

  if (payment.status !== "PENDING") {
    throw new Error("PAYMENT_CANNOT_PROCESS");
  }

  try {
    const response = await axios.post(
      `${process.env.PAYMENT_PROVIDER_URL}/payments`,
      {
        paymentId: payment.id,
        amount: Number(payment.amount),
        paymentMethod,
      },
    );

    const result = response.data;

    if (result.status === "SUCCESS") {
      const paidPayment = await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "PAID",
          paymentMethod,
          transactionId: result.transactionId,
          paidAt: new Date(),
        },
      });
      await publishEvent("payment.events", "PaymentProcessed", {
        paymentId: paidPayment.id,
        tripId: paidPayment.tripId,
        customerId: paidPayment.customerId,
        status: paidPayment.status,
      });
      return paidPayment;
    }

    const failedPayment = await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "FAILED",
        paymentMethod,
        failedAt: new Date(),
        failureReason: result.message || "Payment failed",
      },
    });
    await publishEvent("payment.events", "PaymentProcessed", {
      paymentId: failedPayment.id,
      tripId: failedPayment.tripId,
      customerId: failedPayment.customerId,
      status: failedPayment.status,
    });
    return failedPayment;
  } catch (error) {
    console.error(error);

    const failedPayment = await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "FAILED",
        paymentMethod,
        failedAt: new Date(),
        failureReason: "Payment provider unavailable",
      },
    });
    await publishEvent("payment.events", "PaymentProcessed", {
      paymentId: failedPayment.id,
      tripId: failedPayment.tripId,
      customerId: failedPayment.customerId,
      status: failedPayment.status,
    });
    return failedPayment;
  }
}

async function handlePaymentWebhook(data) {
  const paymentId = Number(data.paymentId);
  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    throw new Error("INVALID_PAYMENT_ID");
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });
  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  if (payment.status !== "PENDING") {
    return payment;
  }

  const succeeded = data.status === "SUCCESS";
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: succeeded
      ? {
          status: "PAID",
          transactionId: data.transactionId || null,
          paidAt: new Date(),
        }
      : {
          status: "FAILED",
          failedAt: new Date(),
          failureReason: data.message || "Payment failed",
        },
  });

  await publishEvent("payment.events", "PaymentProcessed", {
    paymentId: updatedPayment.id,
    tripId: updatedPayment.tripId,
    customerId: updatedPayment.customerId,
    status: updatedPayment.status,
  });

  return updatedPayment;
}

module.exports = {
  createPayment,
  calculateFare,
  calculateFareFromCoordinates,
  getPayment,
  getPaymentByTrip,
  processPayment,
  handlePaymentWebhook,
};
