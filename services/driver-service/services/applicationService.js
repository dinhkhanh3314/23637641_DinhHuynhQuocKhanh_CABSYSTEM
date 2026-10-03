const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function getApplications() {
  return prisma.application.findMany({
    include: {
      driver: {
        include: {
          vehicle: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getApplication(id) {
  return prisma.application.findUnique({
    where: { id },
    include: {
      driver: {
        include: {
          vehicle: true,
        },
      },
    },
  });
}

async function approveApplication(id) {
  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    throw new Error("APPLICATION_NOT_FOUND");
  }

  if (application.status !== "PENDING") {
    throw new Error("APPLICATION_ALREADY_PROCESSED");
  }

  return prisma.application.update({
    where: { id },
    data: {
      status: "APPROVED",
      note: null,
    },
  });
}

async function rejectApplication(id, note) {
  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    throw new Error("APPLICATION_NOT_FOUND");
  }

  if (application.status !== "PENDING") {
    throw new Error("APPLICATION_ALREADY_PROCESSED");
  }

  return prisma.application.update({
    where: { id },
    data: {
      status: "REJECTED",
      note: note || null,
    },
  });
}

async function resubmitApplication(id, data) {
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      driver: {
        include: {
          vehicle: true,
        },
      },
    },
  });

  if (!application) {
    throw new Error("APPLICATION_NOT_FOUND");
  }

  if (application.status !== "REJECTED") {
    throw new Error("APPLICATION_NOT_REJECTED");
  }

  return prisma.$transaction(async (tx) => {
    await tx.driver.update({
      where: {
        id: application.driverId,
      },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        licenseNo: data.licenseNo,
      },
    });

    await tx.vehicle.update({
      where: {
        driverId: application.driverId,
      },
      data: {
        vehicleType: data.vehicleType,
        plateNumber: data.plateNumber,
        brand: data.brand,
        model: data.model,
        color: data.color,
      },
    });

    return tx.application.update({
      where: {
        id,
      },
      data: {
        status: "PENDING",
        note: null,
      },
    });
  });
}

module.exports = {
  getApplications,
  getApplication,
  approveApplication,
  rejectApplication,
  resubmitApplication,
};
