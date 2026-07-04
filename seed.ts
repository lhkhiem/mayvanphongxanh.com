import { prisma } from "./lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@mvpx.vn";
  const password = "password123";
  
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: email,
        password: hashedPassword,
        role: "ADMIN"
      }
    });
    console.log("Admin user created: admin@mvpx.vn / password123");
  } else {
    console.log("Admin user already exists.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
