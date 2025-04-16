import { prisma } from "../prisma";

const exec = async () => {
  console.log("Clearing database...");
  await prisma.message.deleteMany({});
  await prisma.userHasCurrentData.deleteMany({});
  console.log("Database cleared");
};

exec();
