const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const { createCustomer } = require("../grpc/customerClient");
const { createDriver } = require("../grpc/driverClient");

const redisClient = require("../redisClient");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function sendDriverOtp(phone) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await redisClient.set(`driver:otp:${phone}`, otp, {
    EX: 300,
  });

  return otp;
}

async function verifyDriverOtp(phone, otp) {
  const savedOtp = await redisClient.get(`driver:otp:${phone}`);

  if (!savedOtp) {
    throw new Error("OTP_EXPIRED");
  }

  if (savedOtp !== otp) {
    throw new Error("INVALID_OTP");
  }

  await redisClient.set(`driver:otp:verified:${phone}`, "true", {
    EX: 600,
  });

  await redisClient.del(`driver:otp:${phone}`);

  return true;
}

async function registerCustomer({ phone, email, password }) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ phone }, { email }],
    },
  });

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      phone,
      email,
      passwordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });

  try {
    await createCustomer(user.id);
  } catch (error) {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    throw new Error("CUSTOMER_CREATION_FAILED");
  }

  return {
    id: user.id,
    phone: user.phone,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

async function loginCustomer({ identifier, password }) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ phone: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.passwordHash) {
    throw new Error("PASSWORD_NOT_SET");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("USER_INACTIVE");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const accessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );

  return {
    id: user.id,
    phone: user.phone,
    email: user.email,
    role: user.role,
    status: user.status,
    accessToken,
  };
}

async function registerDriver(data) {
  const {
    phone,
    email,
    fullName,
    licenseNo,
    vehicleType,
    plateNumber,
    brand,
    model,
    color,
  } = data;

  const verified = await redisClient.get(`driver:otp:verified:${phone}`);

  if (verified !== "true") {
    throw new Error("PHONE_NOT_VERIFIED");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ phone }, { email }],
    },
  });

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const user = await prisma.user.create({
    data: {
      phone,
      email,
      passwordHash: null,
      role: "DRIVER",
      status: "ACTIVE",
    },
  });

  try {
    const driver = await createDriver({
      userId: user.id,
      fullName,
      phone,
      licenseNo,
      vehicleType,
      plateNumber,
      brand,
      model,
      color,
    });

    return {
      message: "Gửi hồ sơ tài xế thành công",
      userId: user.id,
      driverId: driver.id,
      role: user.role,
      applicationStatus: "PENDING",
    };
  } catch (error) {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    throw new Error("DRIVER_CREATION_FAILED");
  }
}

async function setDriverPassword(phone, password) {
  const verified = await redisClient.get(`driver:otp:verified:${phone}`);

  if (verified !== "true") {
    throw new Error("PHONE_NOT_VERIFIED");
  }

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

module.exports = {
  registerCustomer,
  loginCustomer,
  registerDriver,
  sendDriverOtp,
  verifyDriverOtp,
  setDriverPassword,
};
