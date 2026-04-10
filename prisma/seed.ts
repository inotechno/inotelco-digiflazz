import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);
  const hashedPin = await bcrypt.hash("123456", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@inotelco.com" },
    update: {},
    create: {
      email: "admin@inotelco.com",
      name: "Admin InoTelco",
      password: hashedPassword,
      pin: hashedPin,
      role: "ADMIN",
      balance: 1000000, // Saldo awal 1jt untuk testing
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@inotelco.com" },
    update: {},
    create: {
      email: "member@inotelco.com",
      name: "Member InoTelco",
      password: hashedPassword,
      pin: hashedPin,
      role: "MEMBER",
      balance: 100000,
    },
  });

  const reseller = await prisma.user.upsert({
    where: { email: "reseller@inotelco.com" },
    update: {},
    create: {
      email: "reseller@inotelco.com",
      name: "Reseller InoTelco",
      password: hashedPassword,
      pin: hashedPin,
      role: "RESELLER",
      balance: 500000,
    },
  });

  console.log({ admin: user, member, reseller });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
