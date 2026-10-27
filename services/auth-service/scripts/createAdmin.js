const bcrypt = require("bcrypt");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exitCode = 1;
} else if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  process.exitCode = 1;
} else if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters");
  process.exitCode = 1;
} else {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  async function createAdmin() {
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        updatedAt: new Date(),
      },
      create: {
        email,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    console.log(
      `Admin ready: id=${admin.id}, email=${admin.email}, role=${admin.role}, status=${admin.status}`,
    );
  }

  createAdmin()
    .catch((error) => {
      console.error("Failed to create Admin:", error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
