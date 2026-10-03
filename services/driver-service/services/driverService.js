const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const redisClient = require("../redisClient");

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

  await redisClient.set(`driver:status:${driverId}`, "ONLINE");

  return {
    driverId,
    status: "ONLINE",
  };
}

async function goOffline(driverId) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    throw new Error("DRIVER_NOT_FOUND");
  }

  await redisClient.set(`driver:status:${driverId}`, "OFFLINE");

  return {
    driverId,
    status: "OFFLINE",
  };
}

async function setDriverPassword(phone, password) {
  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.role !== "DRIVER") {
    throw new Error("NOT_DRIVER");
  }

  if (user.passwordHash) {
    throw new Error("PASSWORD_ALREADY_SET");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
    },
  });

  return {
    message: "Đặt mật khẩu thành công",
  };
}

async function getOnlineDrivers() {
  const keys = await redisClient.keys("driver:status:*");

  const onlineDrivers = [];

  for (const key of keys) {
    const status = await redisClient.get(key);

    if (status === "ONLINE") {
      const driverId = key.replace("driver:status:", "");

      onlineDrivers.push(Number(driverId));
    }
  }
  return onlineDrivers;
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

module.exports = {
  createDriver,
  getDriver,
  getDrivers,
  updateDriver,
  goOnline,
  goOffline,
  getOnlineDrivers,
};
