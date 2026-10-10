const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { getNearbyDrivers } = require("../grpc/driverClient");
const { createTrip, cancelTrip } = require("../grpc/tripClient");
const { publishEvent } = require("../kafka/eventBus");

const DRIVER_RESPONSE_TIMEOUT_MS = Number(
  process.env.DRIVER_RESPONSE_TIMEOUT_MS || 300000,
);

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

  const booking = await prisma.booking.create({
    data: {
      customerId: Number(data.customerId),
      pickupLatitude: data.pickupLatitude,
      pickupLongitude: data.pickupLongitude,
      destinationLatitude: data.destinationLatitude,
      destinationLongitude: data.destinationLongitude,
      vehicleType: data.vehicleType,
      status: "SEARCHING_DRIVER",
    },
  });

  const assignedBooking = await findAndAssignNextDriver(booking.id);
  await publishEvent("booking.events", "BookingCreated", {
    bookingId: assignedBooking.id,
    customerId: assignedBooking.customerId,
    driverId: assignedBooking.driverId,
    status: assignedBooking.status,
  });
  return assignedBooking;
}

async function getBooking(id, customerId) {
  return prisma.booking.findFirst({
    where: {
      id: Number(id),
      ...(customerId ? { customerId: Number(customerId) } : {}),
    },
  });
}

async function getBookings(customerId, page = 1, limit = 20) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  return prisma.booking.findMany({
    where: customerId ? { customerId: Number(customerId) } : undefined,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
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

async function cancelBooking(id, cancelReason) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (
    ![
      "PENDING",
      "SEARCHING_DRIVER",
      "DRIVER_ASSIGNED",
      "DRIVER_ACCEPTED",
      "IN_PROGRESS",
    ].includes(booking.status)
  ) {
    throw new Error("BOOKING_CANNOT_CANCEL");
  }

  if (!cancelReason || !cancelReason.trim()) {
    throw new Error("CANCEL_REASON_REQUIRED");
  }

  const canceledBooking = await prisma.booking.update({
    where: {
      id: Number(id),
    },
    data: {
      status: "CANCELLED",
      cancelReason: cancelReason.trim(),
    },
  });

  if (["DRIVER_ACCEPTED", "IN_PROGRESS"].includes(booking.status)) {
    try {
      await cancelTrip(booking.id, cancelReason.trim());
    } catch (error) {
      if (!["TRIP_NOT_FOUND", "5"].includes(error.details) &&
          error.message !== "TRIP_NOT_FOUND") {
        throw error;
      }
    }
  }

  await publishEvent("booking.events", "BookingCanceled", {
    bookingId: canceledBooking.id,
    customerId: canceledBooking.customerId,
    driverId: canceledBooking.driverId,
    status: canceledBooking.status,
    cancelReason: canceledBooking.cancelReason,
  });

  return canceledBooking;
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

  const bookingAccepted = await prisma.booking.update({
    where: {
      id: Number(id),
    },
    data: {
      status: "DRIVER_ACCEPTED",
    },
  });

  await publishEvent("booking.events", "DriverAccepted", {
    bookingId: bookingAccepted.id,
    customerId: bookingAccepted.customerId,
    driverId: bookingAccepted.driverId,
    status: bookingAccepted.status,
  });

  let trip;
  try {
    trip = await createTrip({
      bookingId: bookingAccepted.id,
      customerId: bookingAccepted.customerId,
      driverId: bookingAccepted.driverId,
      pickupLatitude: bookingAccepted.pickupLatitude,
      pickupLongitude: bookingAccepted.pickupLongitude,
      destinationLatitude: bookingAccepted.destinationLatitude,
      destinationLongitude: bookingAccepted.destinationLongitude,
    });
  } catch (error) {
    const alreadyExists =
      error.details === "TRIP_ALREADY_EXISTS" ||
      error.message === "TRIP_ALREADY_EXISTS";

    if (!alreadyExists) {
      console.error("CreateTrip gRPC error:", error);
      throw new Error("TRIP_CREATION_FAILED");
    }
  }

  return { booking: bookingAccepted, trip };
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

  await prisma.bookingDriverAttempt.updateMany({
    where: {
      bookingId: Number(id),
      driverId: booking.driverId,
      status: "ASSIGNED",
    },
    data: {
      status: "REJECTED",
    },
  });

  const nextBooking = await findAndAssignNextDriver(id);
  await publishEvent("booking.events", "DriverRejected", {
    bookingId: nextBooking.id,
    customerId: nextBooking.customerId,
    driverId: nextBooking.driverId,
    status: nextBooking.status,
  });
  return nextBooking;
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
    return booking;
  }

  await prisma.bookingDriverAttempt.updateMany({
    where: {
      bookingId: Number(id),
      driverId: booking.driverId,
      status: "ASSIGNED",
    },
    data: {
      status: "TIMEOUT",
    },
  });

  return findAndAssignNextDriver(id);
}

function startDriverTimeout(bookingId) {
  setTimeout(async () => {
    try {
      const booking = await prisma.booking.findUnique({
        where: {
          id: Number(bookingId),
        },
      });

      if (!booking) {
        return;
      }
      if (booking.status !== "DRIVER_ASSIGNED") {
        return;
      }

      console.log(`Booking ${bookingId}: tài xế timeout, tìm tài xế khác`);

      await timeoutBooking(bookingId);
    } catch (error) {
      console.error(`Booking ${bookingId}: timeout error`, error);
    }
  }, DRIVER_RESPONSE_TIMEOUT_MS);
}

async function findAndAssignNextDriver(bookingId) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: Number(bookingId),
    },
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  const driverResult = await getNearbyDrivers(
    Number(booking.pickupLatitude),
    Number(booking.pickupLongitude),
    1,
  );

  const drivers = Array.isArray(driverResult)
    ? driverResult
    : driverResult.drivers || [];

  if (drivers.length === 0) {
    return prisma.booking.update({
      where: {
        id: Number(bookingId),
      },
      data: {
        driverId: null,
        status: "NO_DRIVER",
      },
    });
  }

  const attempts = await prisma.bookingDriverAttempt.findMany({
    where: {
      bookingId: Number(bookingId),
    },
    select: {
      driverId: true,
    },
  });

  const triedDriverIds = new Set(attempts.map((attempt) => attempt.driverId));

  const nextDriver = drivers.find(
    (driver) => !triedDriverIds.has(Number(driver.id)),
  );

  if (!nextDriver) {
    return prisma.booking.update({
      where: {
        id: Number(bookingId),
      },
      data: {
        driverId: null,
        status: "NO_DRIVER",
      },
    });
  }

  const result = await prisma.booking.update({
    where: {
      id: Number(bookingId),
    },
    data: {
      driverId: Number(nextDriver.id),
      status: "DRIVER_ASSIGNED",
    },
  });

  await prisma.bookingDriverAttempt.create({
    data: {
      bookingId: Number(bookingId),
      driverId: Number(nextDriver.id),
      status: "ASSIGNED",
    },
  });

  startDriverTimeout(bookingId);

  return result;
}

module.exports = {
  createBooking,
  getBooking,
  getBookings,
  updateBookingStatus,
  cancelBooking,
  acceptBooking,
  rejectBooking,
  startDriverTimeout,
  findAndAssignNextDriver,
};
