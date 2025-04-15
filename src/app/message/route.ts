import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const text = await req.text();
  const splitText = text.split(" ");
  const user = splitText[0].split('"')[1];
  const time = splitText[1].split("(")[1].split(")")[0];
  const message = splitText.slice(3, splitText.length).join(" ");
  if (!user || !time || !message) {
    return new Response("Invalid request", { status: 400 });
  }
  await prisma.message.create({
    data: {
      message,
      messageAt: time,
      messageFrom: user,
    },
  });

  await prisma.userHasCurrentData.updateMany({
    data: {
      hasCurrentData: false,
    },
  });

  return new Response("Message saved successfully", { status: 200 });
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const user = searchParams.get("user");
  if (!user) return new Response("User not found", { status: 400 });

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
    const messages = (
      await prisma.message.findMany({
        orderBy: {
          id: "desc",
        },
      })
    ).map(
      (message) =>
        `"${message.messageFrom}" (${message.messageAt}): ${message.message}`
    );

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
    return NextResponse.json({ messages: messages }, { status: 200 });
  }

  return new Response("ggez", { status: 200 });
}
