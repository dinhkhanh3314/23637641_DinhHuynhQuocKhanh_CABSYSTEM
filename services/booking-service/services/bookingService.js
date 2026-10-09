const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { getNearbyDrivers } = require("../grpc/driverClient");
const { createTrip } = require("../grpc/tripClient");

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

  return findAndAssignNextDriver(booking.id);
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
    ].includes(booking.status)
  ) {
    throw new Error("BOOKING_CANNOT_CANCEL");
  }

  if (!cancelReason || !cancelReason.trim()) {
    throw new Error("CANCEL_REASON_REQUIRED");
  }

  return prisma.booking.update({
    where: {
      id: Number(id),
    },
    data: {
      status: "CANCELLED",
      cancelReason: cancelReason.trim(),
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

  const bookingAccepted = await prisma.booking.update({
    where: {
      id: Number(id),
    },
    data: {
      status: "DRIVER_ACCEPTED",
    },
  });

  try {
    await createTrip({
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

  return bookingAccepted;
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

  return findAndAssignNextDriver(id);
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
  }, 60000);
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

  const drivers = await getNearbyDrivers(
    Number(booking.pickupLatitude),
    Number(booking.pickupLongitude),
    1,
  );

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
