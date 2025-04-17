import { prisma } from "../prisma";

const exec = async () => {
  console.log("Deleting users...");
  const validUsers = ["Tilli", "Juri", "Piet", "Johannes", "Kerstin"];
  await prisma.message.deleteMany({
    where: {
      messageFrom: {
        notIn: validUsers,
      },
    },
  });
  await prisma.userHasCurrentData.deleteMany({
    where: {
      user: {
        notIn: validUsers,
      },
    },
  });
  console.log("Deleting users complete!");
};

exec();
