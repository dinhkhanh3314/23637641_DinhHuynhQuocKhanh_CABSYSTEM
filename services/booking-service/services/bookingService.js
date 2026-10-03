const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function createBooking(data) {
  if (
    !data.customerId ||
    data.pickupLatitude === undefined ||
    data.pickupLongitude === undefined ||
    data.destinationLatitude === undefined ||
    data.destinationLongitude === undefined ||
    !data.vehicleType
  ) {
    throw new Error("MISSING_BOOKING_DATA");
  }

  return prisma.booking.create({
    data: {
      customerId: Number(data.customerId),

      pickupLatitude: data.pickupLatitude,
      pickupLongitude: data.pickupLongitude,

      destinationLatitude: data.destinationLatitude,
      destinationLongitude: data.destinationLongitude,

      vehicleType: data.vehicleType,

      status: "PENDING",
    },
  });
}

async function getBooking(id) {
  return prisma.booking.findUnique({
    where: {
      id: Number(id),
    },
  });
}

async function getBookings() {
  return prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function updateBookingStatus(id, status) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  const validStatuses = [
    "PENDING",
    "SEARCHING_DRIVER",
    "DRIVER_ASSIGNED",
    "DRIVER_ACCEPTED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ];

  if (!validStatuses.includes(status)) {
    throw new Error("INVALID_STATUS");
  }

  return prisma.booking.update({
    where: {
      id: Number(id),
    },
    data: {
      status,
    },
  });
}

async function cancelBooking(id) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  const cancellableStatuses = [
    "PENDING",
    "SEARCHING_DRIVER",
    "DRIVER_ASSIGNED",
    "DRIVER_ACCEPTED",
  ];

  if (!cancellableStatuses.includes(booking.status)) {
    throw new Error("BOOKING_CANNOT_CANCEL");
  }

  return prisma.booking.update({
    where: {
      id: Number(id),
    },
    data: {
      status: "CANCELLED",
    },
  });
}

module.exports = {
  createBooking,
  getBooking,
  getBookings,
  updateBookingStatus,
  cancelBooking,
};
