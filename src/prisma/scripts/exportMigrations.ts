import * as Minio from "minio";
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import archiver from "archiver";
const { BUCKET_NAME, ENDPOINT, ACCESS_KEY, SECRET_KEY } = process.env;

const bucketName = BUCKET_NAME || "undefined";

const minio = new Minio.Client({
  endPoint: ENDPOINT || "undefined",
  useSSL: true,
  accessKey: ACCESS_KEY || "undefined",
  secretKey: SECRET_KEY || "undefined",
});

const archive = async () => {
  const sourceDir = path.resolve(__dirname, "../migrations");
  const outputDir = path.resolve(__dirname, "../migrations");
  const zipFileName = "migrations.zip";
  const zipFilePath = path.join(outputDir, zipFileName);

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const archive = archiver("zip", { zlib: { level: 9 } });
  const output = fs.createWriteStream(zipFilePath);

  output.on("close", () => {
    console.log(
      `Compressed ${archive.pointer()} total bytes to ${zipFilePath}`
    );
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  // Exclude .zip files when archiving
  archive.glob("**/*", {
    cwd: sourceDir,
    ignore: ["*.zip"],
  });

  await archive.finalize();
  return outputDir + "/" + zipFileName;
};

const exec = async () => {
  const zip = await archive();
  const metaData = {
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename=${path.basename(zip)}`,
  };
  await minio.fPutObject(bucketName, "migrations.zip", zip, metaData);
};

exec();
