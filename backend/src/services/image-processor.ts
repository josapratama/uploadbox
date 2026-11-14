import sharp from "sharp";
import path from "path";
import fs from "fs";
import { getCachePath, fileExists } from "./storage";
import { parseExifBuffer, ExifData } from "./exif";

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
  stripMeta?: boolean;
  watermark?: {
    text: string;
    position?: "southeast" | "southwest" | "northeast" | "northwest" | "center";
    opacity?: number;
  };
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
      case "watermark": {
        let text = "UploadBox";
        try {
          text = decodeURIComponent(segments[1] || "UploadBox");
        } catch {
          text = segments[1] || "UploadBox";
        }
        const posRaw = (segments[2] || "southeast").toLowerCase();
        const validPositions: Array<NonNullable<ImageOperations["watermark"]>["position"]> = [
          "southeast", "southwest", "northeast", "northwest", "center"
        ];
        const position = validPositions.includes(posRaw as any)
          ? (posRaw as NonNullable<ImageOperations["watermark"]>["position"])
          : "southeast";
        const opacity = Math.min(100, Math.max(10, parseInt(segments[3] || "80", 10)));
        ops.watermark = { text, position, opacity };
        break;
      }
      case "strip_meta": {
        ops.stripMeta = true;
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
  } else {
    // Automatically orient image based on EXIF Orientation tag
    pipeline = pipeline.rotate();
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

  // Apply on-the-fly watermark if specified
  if (operations.watermark && operations.watermark.text) {
    // Get intermediate metadata to size the watermark proportionally
    const tempBuffer = await pipeline.toBuffer({ resolveWithObject: true });
    const imgWidth = tempBuffer.info.width;
    const imgHeight = tempBuffer.info.height;

    const wmText = operations.watermark.text.trim();
    const position = operations.watermark.position || "southeast";
    const opacity = (operations.watermark.opacity || 80) / 100;

    // Font size relative to image width (between 14px and 72px)
    const fontSize = Math.max(14, Math.min(72, Math.round(imgWidth / 24)));
    const padding = Math.max(12, Math.round(fontSize * 0.8));

    let posX = imgWidth - padding;
    let posY = imgHeight - padding;
    let textAnchor = "end";

    if (position === "center") {
      posX = Math.round(imgWidth / 2);
      posY = Math.round(imgHeight / 2) + Math.round(fontSize / 3);
      textAnchor = "middle";
    } else if (position === "southwest") {
      posX = padding;
      posY = imgHeight - padding;
      textAnchor = "start";
    } else if (position === "northwest") {
      posX = padding;
      posY = padding + fontSize;
      textAnchor = "start";
    } else if (position === "northeast") {
      posX = imgWidth - padding;
      posY = padding + fontSize;
      textAnchor = "end";
    }

    const escapedText = wmText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    const svgWatermark = `
      <svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .wm-label {
            font-family: Arial, Helvetica, sans-serif;
            font-size: ${fontSize}px;
            font-weight: 700;
            fill: rgba(255, 255, 255, ${opacity});
            stroke: rgba(0, 0, 0, ${Math.min(1, opacity * 0.9)});
            stroke-width: ${Math.max(1, Math.round(fontSize / 14))}px;
            paint-order: stroke fill;
          }
        </style>
        <text x="${posX}" y="${posY}" text-anchor="${textAnchor}" class="wm-label">${escapedText}</text>
      </svg>
    `;

    pipeline = sharp(tempBuffer.data).composite([
      {
        input: Buffer.from(svgWatermark),
        blend: "over",
      },
    ]);
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
): Promise<{ width: number; height: number; format: string; exif?: ExifData }> {
  const metadata = await sharp(filePath).metadata();
  let width = metadata.width || 0;
  let height = metadata.height || 0;
  if (metadata.orientation && metadata.orientation >= 5 && metadata.orientation <= 8) {
    [width, height] = [height, width];
  }
  let exif: ExifData | undefined;
  if (metadata.exif && Buffer.isBuffer(metadata.exif)) {
    try {
      exif = parseExifBuffer(metadata.exif);
    } catch {
      // Ignore EXIF parsing error
    }
  }

  return {
    width,
    height,
    format: metadata.format || "unknown",
    exif,
  };
}
