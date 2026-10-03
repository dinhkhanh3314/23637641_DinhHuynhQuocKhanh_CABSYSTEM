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

module.exports = {
  createDriver,
  getDriver,
  updateDriver,
};
