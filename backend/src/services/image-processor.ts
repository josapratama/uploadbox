import sharp from "sharp";
import path from "path";
import fs from "fs";
import { getCachePath, fileExists } from "./storage";

export interface ImageOperations {
  resize?: {
    width?: number;
    height?: number;
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  };
  crop?: { width: number; height: number; x?: number; y?: number };
  format?: "jpeg" | "png" | "webp" | "avif" | "gif";
  quality?: number;
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
  preview?: boolean;
}

export function parseOperationsFromUrl(operationsStr: string): ImageOperations {
  const ops: ImageOperations = {};
  // Strip leading -/ if present
  const normalized = operationsStr.startsWith("-/")
    ? operationsStr.substring(2)
    : operationsStr;
  const parts = normalized.split("/-/").filter(Boolean);

  for (const part of parts) {
    const segments = part.split("/");
    const operation = segments[0];

    switch (operation) {
      case "resize": {
        const dimensions = segments[1] || "";
        const [w, h] = dimensions.split("x").map(Number);
        ops.resize = { width: w || undefined, height: h || undefined };
        if (segments[2]) {
          ops.resize.fit = segments[2] as any;
        }
        break;
      }
      case "crop": {
        const dimensions = segments[1] || "";
        const [w, h] = dimensions.split("x").map(Number);
        ops.crop = { width: w, height: h };
        if (segments[2]) {
          const [x, y] = segments[2].split(",").map(Number);
          ops.crop.x = x;
          ops.crop.y = y;
        }
        break;
      }
      case "format": {
        ops.format = segments[1] as ImageOperations["format"];
        break;
      }
      case "quality": {
        ops.quality = parseInt(segments[1], 10);
        break;
      }
      case "blur": {
        ops.blur = parseInt(segments[1] || "5", 10);
        break;
      }
      case "sharpen": {
        ops.sharpen = true;
        break;
      }
      case "grayscale":
      case "greyscale": {
        ops.grayscale = true;
        break;
      }
      case "rotate": {
        ops.rotate = parseInt(segments[1] || "0", 10);
        break;
      }
      case "flip": {
        ops.flip = true;
        break;
      }
      case "flop": {
        ops.flop = true;
        break;
      }
      case "preview": {
        ops.preview = true;
        ops.resize = { width: 400, height: 400, fit: "inside" };
        ops.quality = 80;
        break;
      }
    }
  }

  return ops;
}

export async function processImage(
  inputPath: string,
  fileId: string,
  operations: ImageOperations,
  operationsKey: string,
): Promise<{ path: string; mimeType: string }> {
  // Check cache first
  const cachePath = getCachePath(fileId, operationsKey);

  const format = operations.format || "jpeg";
  const cachedFile = `${cachePath}.${format}`;

  if (fileExists(cachedFile)) {
    return {
      path: cachedFile,
      mimeType: `image/${format === "jpeg" ? "jpeg" : format}`,
    };
  }

  // Process image
  let pipeline = sharp(inputPath);

  if (operations.rotate) {
    pipeline = pipeline.rotate(operations.rotate);
  }

  if (operations.flip) {
    pipeline = pipeline.flip();
  }

  if (operations.flop) {
    pipeline = pipeline.flop();
  }

  if (operations.resize) {
    pipeline = pipeline.resize({
      width: operations.resize.width,
      height: operations.resize.height,
      fit: operations.resize.fit || "inside",
      withoutEnlargement: true,
    });
  }

  if (operations.crop) {
    pipeline = pipeline.extract({
      left: operations.crop.x || 0,
      top: operations.crop.y || 0,
      width: operations.crop.width,
      height: operations.crop.height,
    });
  }

  if (operations.blur) {
    pipeline = pipeline.blur(operations.blur);
  }

  if (operations.sharpen) {
    pipeline = pipeline.sharpen();
  }

  if (operations.grayscale) {
    pipeline = pipeline.grayscale();
  }

  // Output format
  const quality = operations.quality || 85;

  switch (format) {
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality });
      break;
    case "png":
      pipeline = pipeline.png({ quality });
      break;
    case "gif":
      pipeline = pipeline.gif();
      break;
    case "jpeg":
    default:
      pipeline = pipeline.jpeg({ quality });
      break;
  }

  await pipeline.toFile(cachedFile);

  return {
    path: cachedFile,
    mimeType: `image/${format === "jpeg" ? "jpeg" : format}`,
  };
}

export async function getImageMetadata(
  filePath: string,
): Promise<{ width: number; height: number; format: string }> {
  const metadata = await sharp(filePath).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || "unknown",
  };
}
