import fs from "fs";
import path from "path";
import crypto from "crypto";
import { config } from "../config";
import { v4 as uuidv4 } from "uuid";

export function ensureStorageDir() {
  const dirs = [
    config.storagePath,
    path.join(config.storagePath, "files"),
    path.join(config.storagePath, "cache"),
    path.join(config.storagePath, "multipart"),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export function getFilePath(fileId: string, extension?: string): string {
  // Organize files in subdirectories based on first 2 chars of UUID
  const subDir = fileId.substring(0, 2);
  const dir = path.join(config.storagePath, "files", subDir);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = extension ? `${fileId}.${extension}` : fileId;
  return path.join(dir, filename);
}

export function getCachePath(fileId: string, operations: string): string {
  const cacheDir = path.join(
    config.storagePath,
    "cache",
    fileId.substring(0, 2),
  );

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  // Create a deterministic cache key from operations
  const cacheKey = Buffer.from(operations).toString("base64url");
  return path.join(cacheDir, `${fileId}_${cacheKey}`);
}

export function getMultipartDir(uploadId: string): string {
  const dir = path.join(config.storagePath, "multipart", uploadId);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return dir;
}

export async function saveFile(
  buffer: Buffer,
  fileId: string,
  extension?: string,
): Promise<string> {
  const filePath = getFilePath(fileId, extension);
  await fs.promises.writeFile(filePath, buffer);
  return filePath;
}

export async function saveStream(
  stream: NodeJS.ReadableStream,
  fileId: string,
  extension?: string,
): Promise<string> {
  const filePath = getFilePath(fileId, extension);
  const writeStream = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    stream.pipe(writeStream);
    writeStream.on("finish", () => resolve(filePath));
    writeStream.on("error", reject);
  });
}

export async function saveStreamWithHash(
  stream: NodeJS.ReadableStream,
  fileId: string,
  extension?: string,
): Promise<{ storagePath: string; sha256: string; size: number }> {
  const filePath = getFilePath(fileId, extension);
  const writeStream = fs.createWriteStream(filePath);
  const hash = crypto.createHash("sha256");
  let size = 0;

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => {
      hash.update(chunk);
      size += chunk.length;
    });

    stream.pipe(writeStream);

    writeStream.on("finish", () => {
      const sha256 = hash.digest("hex");
      resolve({ storagePath: filePath, sha256, size });
    });

    writeStream.on("error", reject);
    stream.on("error", reject);
  });
}

export async function getFileSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

export async function deleteFile(filePath: string): Promise<void> {
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
}

export async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.promises.stat(filePath);
  return stats.size;
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
