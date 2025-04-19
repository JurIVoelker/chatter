import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/prisma/prisma";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get("name");
  if (name) {
    const filePath = join(process.cwd(), "public", name);
    const buffer = await readFile(filePath);
    return new Response(buffer, { status: 200 });
  } else return new Response("not found", { status: 404 });
}

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const fileName = searchParams.get("name");
  const to = searchParams.get("to");
  if (!fileName || !to) return new Response("Bad Request", { status: 400 });

  const data = await req.blob();
  const buffer = await data.arrayBuffer();
  const filePath = join(process.cwd(), "public", fileName);
  await writeFile(filePath, Buffer.from(buffer));
  await prisma.imageTo.create({
    data: {
      path: "/image?name=" + fileName,
      user: to,
    },
  });
  return NextResponse.json({ success: true }, { status: 200 });
}
