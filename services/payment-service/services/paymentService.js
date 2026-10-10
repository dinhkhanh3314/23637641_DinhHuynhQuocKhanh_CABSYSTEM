const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const axios = require("axios");
const { publishEvent } = require("../kafka/eventBus");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function createPayment(data) {
  const tripId = Number(data.tripId);
  const customerId = Number(data.customerId);
  const amount = Number(data.amount);
  const paymentMethod = data.paymentMethod;

  if (!Number.isInteger(tripId) || tripId <= 0) {
    throw new Error("INVALID_TRIP_ID");
  }

  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw new Error("INVALID_CUSTOMER_ID");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  if (!paymentMethod) {
    throw new Error("INVALID_PAYMENT_METHOD");
  }

  const existingPayment = await prisma.payment.findUnique({
    where: {
      tripId,
    },
  });

  if (existingPayment) {
    throw new Error("PAYMENT_ALREADY_EXISTS");
  }

  const payment = await prisma.payment.create({
    data: {
      tripId,
      customerId,
      amount,
      paymentMethod,
      status: "PENDING",
    },
  });

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

async function processPayment(paymentId) {
  const payment = await prisma.payment.findUnique({
    where: {
      id: Number(paymentId),
    },
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
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
        paymentMethod: payment.paymentMethod,
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

module.exports = {
  createPayment,
  getPayment,
  processPayment,
};
