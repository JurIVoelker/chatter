import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import * as fs from "fs";

export async function GET() {
  const updatesDir = join(process.cwd(), "public", "updates");
  if (!fs.existsSync(updatesDir)) {
    return new Response("No updates found", { status: 404 });
  }

  const files = fs
    .readdirSync(updatesDir)
    .filter((file) => file.endsWith(".category"));
  if (files.length === 0) {
    return new Response("No updates found", { status: 404 });
  }

  const latestFile = files.sort(
    (a, b) =>
      fs.statSync(join(updatesDir, b)).mtime.getTime() -
      fs.statSync(join(updatesDir, a)).mtime.getTime()
  )[0];
  const buffer = await readFile(join(updatesDir, latestFile));
  return new Response(buffer, { status: 200 });
}

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const version = searchParams.get("version");
  if (!version) return new Response("Bad Request", { status: 400 });

  const data = await req.blob();
  const buffer = await data.arrayBuffer();
  const filePath = join(
    process.cwd(),
    "public",
    "updates",
    "chaTTer-" + version + ".category"
  );

  if (!fs.existsSync(join(process.cwd(), "public", "updates"))) {
    fs.mkdirSync(join(process.cwd(), "public", "updates"), { recursive: true });
  }

  await writeFile(filePath, Buffer.from(buffer));

  return NextResponse.json({ success: true }, { status: 200 });
}
