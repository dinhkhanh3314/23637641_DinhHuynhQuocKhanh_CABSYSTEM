require("dotenv").config();

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
  return prisma.customer.update({
    where: {
      userId,
    },
    data,
  });
}

module.exports = {
  getCustomerByUserId,
  createCustomer,
  updateCustomer,
};
