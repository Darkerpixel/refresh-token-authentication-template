import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.deleteMany();
  await prisma.session.deleteMany();
  await prisma.note.deleteMany();

  //set test password
  const passwordHash = await bcrypt.hash("123456789", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@example.com" },
    update: {},
    create: {
      email: "employee@example.com",
      passwordHash,
      role: "EMPLOYEE",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      passwordHash,
      role: "USER",
    },
  });

  await prisma.note.upsert({
    where: { userId_title: { userId: admin.id, title: "Admin's note" } },
    update: {},
    create: {
      title: "Admin's note",
      content:
        "Only an admin should be able to edit or delete someone else's note like this one.",
      userId: admin.id,
    },
  });

  await prisma.note.upsert({
    where: { userId_title: { userId: employee.id, title: "Employee's note" } },
    update: {},
    create: {
      title: "Employee's note",
      content:
        "An employee can delete their own notes, and any other user's notes too.",
      userId: employee.id,
    },
  });

  await prisma.note.upsert({
    where: { userId_title: { userId: user.id, title: "User's note" } },
    update: {},
    create: {
      title: "User's note",
      content:
        "A plain user can only delete this one, nothing belonging to others.",
      userId: user.id,
    },
  });

  console.log("Seeded:");
  console.log("  admin@example.com / 123456789 (ADMIN)");
  console.log("  employee@example.com / 123456789 (EMPLOYEE)");
  console.log("  user@example.com / 123456789 (USER)");
}

main()
  .then(() => console.log("Done."))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
