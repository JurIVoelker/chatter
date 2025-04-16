import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const user = searchParams.get("user");
  if (!user) return new Response("User not found", { status: 400 });

  const usersData = await prisma.message.findMany({
    distinct: ["messageFrom"],
  });

  const users = usersData
    .map((user) => user.messageFrom)
    .filter((u) => u !== user);

  return NextResponse.json({ users }, { status: 200 });
}
