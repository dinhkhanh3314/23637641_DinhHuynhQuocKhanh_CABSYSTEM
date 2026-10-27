const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function createDriver(data) {
  return prisma.$transaction(async (tx) => {
    const driver = await tx.driver.create({
      data: {
        userId: data.userId,
        fullName: data.fullName,
        phone: data.phone,
        licenseNo: data.licenseNo,
      },
    });

    await tx.vehicle.create({
      data: {
        driverId: driver.id,
        vehicleType: data.vehicleType,
        plateNumber: data.plateNumber,
        brand: data.brand,
        model: data.model,
        color: data.color,
      },
    });

    await tx.application.create({
      data: {
        driverId: driver.id,
        status: "PENDING",
      },
    });

    return driver;
  });
}

async function getDriver(id) {
  return prisma.driver.findUnique({
    where: { id },
    include: {
      vehicle: true,
      application: true,
    },
  });
}

async function updateDriver(id, data) {
  return prisma.driver.update({
    where: { id },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      licenseNo: data.licenseNo,
    },
  });
}

async function createVehicle(driverId, data) {
  return prisma.vehicle.create({
    data: {
      driverId: Number(driverId),
      vehicleType: data.vehicleType,
      plateNumber: data.plateNumber,
      brand: data.brand,
      model: data.model,
      color: data.color,
    },
  });
}

async function updateVehicle(driverId, data) {
  return prisma.vehicle.update({
    where: {
      driverId: Number(driverId),
    },
    data: {
      vehicleType: data.vehicleType,
      plateNumber: data.plateNumber,
      brand: data.brand,
      model: data.model,
      color: data.color,
    },
  });
}

async function goOnline(driverId) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: {
      application: true,
    },
  });

  if (!driver) {
    throw new Error("DRIVER_NOT_FOUND");
  }

  if (!driver.application || driver.application.status !== "APPROVED") {
    throw new Error("DRIVER_NOT_APPROVED");
  }

  await prisma.driver.update({
    where: { id: driverId },
    data: { isOnline: true },
  });

  return {
    driverId,
    status: "ONLINE",
  };
}

async function goOffline(driverId) {
  await prisma.driver.update({
    where: { id: driverId },
    data: { isOnline: false },
  });

  return {
    driverId,
    status: "OFFLINE",
  };
}

async function getOnlineDrivers() {
  const drivers = await prisma.driver.findMany({
    where: { isOnline: true },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  return drivers.map((driver) => driver.id);
}

async function getDrivers() {
  return prisma.driver.findMany({
    include: {
      vehicle: true,
      application: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function updateDriverLocation(driverId, longitude, latitude) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    throw new Error("DRIVER_NOT_FOUND");
  }

  if (!driver.isOnline) {
    throw new Error("DRIVER_NOT_ONLINE");
  }

  const coordinates = {
    longitude: Number(longitude),
    latitude: Number(latitude),
  };
  if (
    !Number.isFinite(coordinates.longitude) ||
    coordinates.longitude < -180 ||
    coordinates.longitude > 180 ||
    !Number.isFinite(coordinates.latitude) ||
    coordinates.latitude < -90 ||
    coordinates.latitude > 90
  ) {
    throw new Error("INVALID_COORDINATES");
  }

  await prisma.driver.update({
    where: { id: driverId },
    data: coordinates,
  });

  return {
    driverId,
    ...coordinates,
  };
}

async function getDriverLocation(driverId) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    throw new Error("DRIVER_NOT_FOUND");
  }

  if (driver.latitude === null || driver.longitude === null) {
    throw new Error("LOCATION_NOT_FOUND");
  }

  return {
    driverId,
    longitude: driver.longitude,
    latitude: driver.latitude,
  };
}

async function getNearbyDrivers(latitude, longitude, radius, page = 1, limit = 20) {
  const center = {
    latitude: Number(latitude),
    longitude: Number(longitude),
  };
  const radiusKm = Number(radius);
  if (
    !Number.isFinite(center.latitude) ||
    center.latitude < -90 ||
    center.latitude > 90 ||
    !Number.isFinite(center.longitude) ||
    center.longitude < -180 ||
    center.longitude > 180 ||
    !Number.isFinite(radiusKm) ||
    radiusKm <= 0
  ) {
    throw new Error("INVALID_COORDINATES");
  }

  const candidates = await prisma.driver.findMany({
    where: {
      isOnline: true,
      latitude: { not: null },
      longitude: { not: null },
      application: { is: { status: "APPROVED" } },
    },
    include: { vehicle: true, application: true },
  });

  const radians = (degrees) => (degrees * Math.PI) / 180;
  const nearbyDrivers = candidates
    .map((driver) => {
      const latitudeDelta = radians(driver.latitude - center.latitude);
      const longitudeDelta = radians(driver.longitude - center.longitude);
      const haversine =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(radians(center.latitude)) *
          Math.cos(radians(driver.latitude)) *
          Math.sin(longitudeDelta / 2) ** 2;
      const distance =
        6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

      return {
        id: driver.id,
        userId: driver.userId,
        fullName: driver.fullName,
        phone: driver.phone,
        status: driver.status,
        isOnline: driver.isOnline,
        latitude: driver.latitude,
        longitude: driver.longitude,
        distance,
      };
    })
    .filter((driver) => driver.distance <= radiusKm)
    .sort((left, right) => left.distance - right.distance);

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const start = (safePage - 1) * safeLimit;

  return {
    drivers: nearbyDrivers.slice(start, start + safeLimit),
    page: safePage,
    limit: safeLimit,
    total: nearbyDrivers.length,
  };
}

module.exports = {
  createDriver,
  getDriver,
  getDrivers,
  updateDriver,
  createVehicle,
  updateVehicle,
  goOnline,
  goOffline,
  getOnlineDrivers,
  updateDriverLocation,
  getDriverLocation,
  getNearbyDrivers,
};
