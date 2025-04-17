import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const user = searchParams.get("user");
  if (!user) return new Response("User not found", { status: 400 });

  const messages = await prisma.message.findMany({
    orderBy: {
      id: "desc",
    },
  });

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
        .slice(0, 20),
    },
    { status: 200 }
  );
}
