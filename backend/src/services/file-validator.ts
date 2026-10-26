import fs from "fs";

// Magic bytes for common file types
const SIGNATURES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  // Images
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/webp", bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }, // RIFF....WEBP
  { mime: "image/bmp", bytes: [0x42, 0x4d] },
  { mime: "image/tiff", bytes: [0x49, 0x49, 0x2a, 0x00] },
  { mime: "image/tiff", bytes: [0x4d, 0x4d, 0x00, 0x2a] },
  // Video
  { mime: "video/mp4", bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }, // ftyp at offset 4
  { mime: "video/webm", bytes: [0x1a, 0x45, 0xdf, 0xa3] },
  { mime: "video/avi", bytes: [0x41, 0x56, 0x49, 0x20], offset: 8 }, // RIFF....AVI 
  // Audio
  { mime: "audio/mpeg", bytes: [0xff, 0xfb] },
  { mime: "audio/mpeg", bytes: [0x49, 0x44, 0x33] }, // ID3
  { mime: "audio/wav", bytes: [0x57, 0x41, 0x56, 0x45], offset: 8 }, // RIFF....WAVE
  { mime: "audio/flac", bytes: [0x66, 0x4c, 0x61, 0x43] },
  // Documents
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "application/zip", bytes: [0x50, 0x4b, 0x03, 0x04] },
  { mime: "application/gzip", bytes: [0x1f, 0x8b] },
  { mime: "application/x-rar-compressed", bytes: [0x52, 0x61, 0x72, 0x21] },
  { mime: "application/x-7z-compressed", bytes: [0x37, 0x7a, 0xbc, 0xaf] },
];

// Dangerous file extensions that should be blocked
const BLOCKED_EXTENSIONS = [
  "exe",
  "bat",
  "cmd",
  "com",
  "msi",
  "scr",
  "pif",
  "vbs",
  "vbe",
  "js",
  "jse",
  "wsf",
  "wsh",
  "ps1",
  "reg",
  "inf",
  "hta",
  "cpl",
  "msc",
];

/**
 * Detect MIME type from file content (magic bytes)
 */
export async function detectMimeType(filePath: string): Promise<string | null> {
  const fd = await fs.promises.open(filePath, "r");
  const buffer = Buffer.alloc(16);
  await fd.read(buffer, 0, 16, 0);
  await fd.close();

  for (const sig of SIGNATURES) {
    const offset = sig.offset || 0;
    let match = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (buffer[offset + i] !== sig.bytes[i]) {
        match = false;
        break;
      }
    }
    if (match) return sig.mime;
  }

  return null;
}

/**
 * Validate that a file is safe to store
 */
export function validateFile(
  filename: string,
  declaredMime: string,
): { valid: boolean; reason?: string } {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  // Block dangerous extensions
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      reason: `File type .${ext} is not allowed for security reasons`,
    };
  }

  // Block files with no extension that claim to be executables
  if (
    declaredMime.includes("executable") ||
    declaredMime.includes("x-msdownload")
  ) {
    return { valid: false, reason: "Executable files are not allowed" };
  }

  return { valid: true };
}

/**
 * Verify that declared MIME type matches actual content
 */
export async function verifyMimeType(
  filePath: string,
  declaredMime: string,
): Promise<boolean> {
  const detected = await detectMimeType(filePath);

  // If we can't detect, allow it (could be text, code, etc.)
  if (!detected) return true;

  // Check if the general category matches (image/*, video/*, etc.)
  const declaredCategory = declaredMime.split("/")[0];
  const detectedCategory = detected.split("/")[0];

  return declaredCategory === detectedCategory;
}
