import { prisma } from "@/prisma/prisma";
import { asyncLog } from "@/utils/logUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const text = await req.text();
  const splitText = text.split(" ");
  const user = splitText[0].split('"')[1];
  const time = splitText[1].split("(")[1].split(")")[0];
  const message = splitText.slice(3, splitText.length).join(" ").trim();
  if (!user || !time || !message) {
    return new Response("Invalid request", { status: 400 });
  }

  if (message.startsWith("!read")) {
    const splitMessage = message.split(" ");
    const readTo = splitMessage[1];
    const readText = splitMessage.slice(2, splitMessage.length).join(" ");
    await prisma.readTo.create({
      data: {
        message: `Neue Nachricht von ${user}... ${readText}`,
        user: readTo,
      },
    });
    return new Response(`Read "${readText}" to "${readTo}"`, { status: 200 });
  }

  if (message.startsWith("!update")) {
    const users = await prisma.userHasCurrentData.findMany();
    await prisma.updateNotification.createMany({
      data: users.map((u) => ({ user: u.user })),
    });
    return new Response("Created notification successfully", { status: 200 });
  }

  await prisma.message.create({
    data: {
      message,
      messageAt: time,
      messageFrom: user,
    },
  });

  if (
    !message.includes("!beep") &&
    !message.includes("!essen") &&
    !message.includes("?essen")
  ) {
    await prisma.userHasCurrentData.updateMany({
      data: {
        hasCurrentData: false,
      },
      where: {
        user: {
          not: user,
        },
      },
    });
  }

  if (message === "!essen") {
    const messages = (
      await prisma.userHasCurrentData.findMany({
        select: { user: true },
      })
    )
      .filter((u) => u.user !== user)
      .map((u) => ({
        messageFrom: user,
        message: "?essen " + u.user,
        messageAt: "??:??",
      }));

    await prisma.message.createMany({ data: messages });

    await prisma.message.deleteMany({
      where: {
        message: `!essen`,
      },
    });
  }

  await asyncLog(`New message from ${user} at ${time}: ${message}`);

  return new Response("Message saved successfully", { status: 200 });
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const user = searchParams.get("user");
  if (!user) return new Response("User not found", { status: 400 });

  const update = await prisma.updateNotification.findFirst({
    where: {
      user,
    },
  });

  if (update) {
    await prisma.updateNotification.delete({
      where: {
        id: update.id,
      },
    });
    return new Response("update", { status: 200 });
  }

  const readTo = await prisma.readTo.findFirst({
    where: {
      user,
    },
  });

  if (readTo) {
    await prisma.readTo.delete({
      where: {
        id: readTo.id,
      },
    });
    return NextResponse.json({ read: readTo.message });
  }

  const imageTo = await prisma.imageTo.findFirst({
    where: {
      user,
    },
  });

  if (imageTo) {
    await prisma.imageTo.delete({
      where: {
        id: imageTo.id,
      },
    });
    return NextResponse.json({ image: imageTo.path });
  }

  await asyncLog(`User ${user} requested data`);

  const messages = await prisma.message.findMany({
    orderBy: {
      id: "desc",
    },
  });

  if (messages.some((message) => message.message === `!beep ${user}`)) {
    await prisma.message.deleteMany({
      where: {
        message: `!beep ${user}`,
      },
    });

    await asyncLog(`User ${user} got beeped`);

    return new Response("beep");
  }

  if (messages.some((message) => message.message === `?essen ${user}`)) {
    await prisma.message.deleteMany({
      where: {
        message: `?essen ${user}`,
      },
    });
    return new Response("essen");
  }

  let userData = await prisma.userHasCurrentData.findFirst({
    where: {
      user: {
        equals: user,
      },
    },
  });

  if (!userData) {
    userData = await prisma.userHasCurrentData.create({
      data: {
        hasCurrentData: false,
        user,
      },
    });
  }

  if (!userData?.hasCurrentData) {
    await prisma.userHasCurrentData.updateMany({
      where: {
        user: {
          equals: user,
        },
      },
      data: {
        hasCurrentData: true,
      },
    });

    await asyncLog(`User ${user} got messages`);

    return NextResponse.json(
      {
        messages: messages
          .filter(
            (m) =>
              !(
                m.message.includes("!beep") ||
                m.message.includes("?essen") ||
                m.message.includes("!essen") ||
                m.message.includes("!read")
              )
          )
          .slice(0, 20)
          .map(
            (message) =>
              `"${message.messageFrom}" (${message.messageAt}): ${message.message}`
          ),
      },
      { status: 200 }
    );
  }

  return new Response("ggez", { status: 200 });
}
