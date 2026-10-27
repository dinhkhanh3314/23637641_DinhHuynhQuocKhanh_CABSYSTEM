const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function getCustomerByUserId(userId) {
  return prisma.customer.findUnique({
    where: {
      userId,
    },
  });
}

async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });
}

async function createCustomer({ userId, fullName, dateOfBirth, gender }) {
  return prisma.customer.create({
    data: {
      userId,
      fullName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
    },
  });
}

async function updateCustomer(userId, data) {
  const updateData = {};
  if (data.fullName !== undefined && data.fullName !== "") {
    updateData.fullName = data.fullName;
  }
  if (data.dateOfBirth !== undefined && data.dateOfBirth !== "") {
    updateData.dateOfBirth = new Date(data.dateOfBirth);
  }
  if (data.gender !== undefined && data.gender !== "") {
    updateData.gender = data.gender;
  }

  return prisma.customer.update({
    where: { userId },
    data: updateData,
  });
}

module.exports = {
  getCustomerByUserId,
  getCustomers,
  createCustomer,
  updateCustomer,
};
