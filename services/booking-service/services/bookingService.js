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

async function findNearbyDrivers(latitude, longitude, radius = 1000) {
  return {
    latitude,
    longitude,
    radius,
    drivers: [],
  };
}

async function assignDriver(id, driverId) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (!driverId) {
    throw new Error("DRIVER_ID_REQUIRED");
  }

  if (booking.status !== "SEARCHING_DRIVER") {
    throw new Error("BOOKING_NOT_SEARCHING_DRIVER");
  }

  return prisma.booking.update({
    where: {
      id: Number(id),
    },
    data: {
      driverId: Number(driverId),
      status: "DRIVER_ASSIGNED",
    },
  });
}

async function acceptBooking(id) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (booking.status !== "DRIVER_ASSIGNED") {
    throw new Error("BOOKING_NOT_ASSIGNED");
  }

  return prisma.booking.update({
    where: {
      id: Number(id),
    },
    data: {
      status: "DRIVER_ACCEPTED",
    },
  });
}

async function startSearchingDriver(id) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (booking.status !== "PENDING") {
    throw new Error("BOOKING_NOT_PENDING");
  }

  return prisma.booking.update({
    where: {
      id: Number(id),
    },
    data: {
      status: "SEARCHING_DRIVER",
    },
  });
}

async function rejectBooking(id) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (booking.status !== "DRIVER_ASSIGNED") {
    throw new Error("BOOKING_NOT_ASSIGNED");
  }

  return prisma.booking.update({
    where: {
      id: Number(id),
    },
    data: {
      driverId: null,
      status: "SEARCHING_DRIVER",
    },
  });
}

async function timeoutBooking(id) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (booking.status !== "DRIVER_ASSIGNED") {
    throw new Error("BOOKING_NOT_ASSIGNED");
  }

  return prisma.booking.update({
    where: {
      id: Number(id),
    },
    data: {
      driverId: null,
      status: "SEARCHING_DRIVER",
    },
  });
}

module.exports = {
  createBooking,
  getBooking,
  getBookings,
  updateBookingStatus,
  cancelBooking,
  findNearbyDrivers,
  assignDriver,
  acceptBooking,
  rejectBooking,
  startSearchingDriver,
  timeoutBooking,
};
