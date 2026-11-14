/**
 * Pure-TypeScript EXIF Metadata Parser for UploadBox
 * Parses standard TIFF/EXIF blocks extracted from image buffers by Sharp
 */

export interface ExifData {
  make?: string;
  model?: string;
  lens?: string;
  fNumber?: number;
  exposureTime?: string;
  iso?: number;
  focalLength?: string;
  dateTime?: string;
  software?: string;
  orientation?: number;
  hasGps?: boolean;
}

export function parseExifBuffer(buf: Buffer): ExifData {
  const result: ExifData = {};
  if (!buf || buf.length < 14) return result;

  try {
    // Look for TIFF header within the buffer (0x4949 or 0x4D4D)
    let tiffOffset = -1;
    for (let i = 0; i <= Math.min(buf.length - 8, 64); i++) {
      if (
        (buf[i] === 0x49 && buf[i + 1] === 0x49 && buf[i + 2] === 0x2a && buf[i + 3] === 0x00) ||
        (buf[i] === 0x4d && buf[i + 1] === 0x4d && buf[i + 2] === 0x00 && buf[i + 3] === 0x2a)
      ) {
        tiffOffset = i;
        break;
      }
    }

    if (tiffOffset === -1) return result;

    const isLittleEndian = buf[tiffOffset] === 0x49;

    const readU16 = (offset: number): number => {
      if (offset + 2 > buf.length) return 0;
      return isLittleEndian ? buf.readUInt16LE(offset) : buf.readUInt16BE(offset);
    };

    const readU32 = (offset: number): number => {
      if (offset + 4 > buf.length) return 0;
      return isLittleEndian ? buf.readUInt32LE(offset) : buf.readUInt32BE(offset);
    };

    const readString = (valOffset: number, count: number): string => {
      if (valOffset + count > buf.length) return "";
      let str = buf.toString("ascii", valOffset, valOffset + count);
      return str.replace(/\0+$/, "").trim();
    };

    const readRational = (valOffset: number): number | undefined => {
      if (valOffset + 8 > buf.length) return undefined;
      const num = readU32(valOffset);
      const den = readU32(valOffset + 4);
      if (den === 0) return undefined;
      return num / den;
    };

    // Check IFD0 offset
    const firstIFDOffset = tiffOffset + readU32(tiffOffset + 4);
    if (firstIFDOffset >= buf.length) return result;

    const parseIFD = (ifdOffset: number, depth = 0) => {
      if (depth > 2 || ifdOffset + 2 > buf.length) return;
      const numEntries = readU16(ifdOffset);
      let cur = ifdOffset + 2;

      for (let i = 0; i < numEntries && cur + 12 <= buf.length; i++, cur += 12) {
        const tag = readU16(cur);
        const type = readU16(cur + 2);
        const count = readU32(cur + 4);
        const valOrOffset = cur + 8;
        const targetOffset = count * (type === 3 ? 2 : type === 4 ? 4 : type === 5 ? 8 : 1) > 4
          ? tiffOffset + readU32(valOrOffset)
          : valOrOffset;

        switch (tag) {
          case 0x010f: // Make
            result.make = readString(targetOffset, count);
            break;
          case 0x0110: // Model
            result.model = readString(targetOffset, count);
            break;
          case 0x0112: // Orientation
            result.orientation = readU16(valOrOffset);
            break;
          case 0x0131: // Software
            result.software = readString(targetOffset, count);
            break;
          case 0x0132: // DateTime
            result.dateTime = readString(targetOffset, count);
            break;
          case 0x8298: // Copyright
            break;
          case 0x829a: { // ExposureTime
            const r = readRational(targetOffset);
            if (r) {
              if (r < 1 && r > 0) {
                result.exposureTime = `1/${Math.round(1 / r)}s`;
              } else {
                result.exposureTime = `${r.toFixed(2)}s`;
              }
            }
            break;
          }
          case 0x829d: { // FNumber
            const f = readRational(targetOffset);
            if (f) result.fNumber = Math.round(f * 10) / 10;
            break;
          }
          case 0x8827: // ISO
            result.iso = readU16(valOrOffset) || readU32(valOrOffset);
            break;
          case 0x9003: // DateTimeOriginal
            if (!result.dateTime) result.dateTime = readString(targetOffset, count);
            break;
          case 0x920a: { // FocalLength
            const fl = readRational(targetOffset);
            if (fl) result.focalLength = `${Math.round(fl)}mm`;
            break;
          }
          case 0xa434: // LensModel
            result.lens = readString(targetOffset, count);
            break;
          case 0x8825: // GPSInfo IFD Pointer
            result.hasGps = true;
            break;
          case 0x8769: { // ExifSubIFD Pointer
            const subIFD = tiffOffset + readU32(valOrOffset);
            parseIFD(subIFD, depth + 1);
            break;
          }
        }
      }
    };

    parseIFD(firstIFDOffset);
  } catch {
    // Fail silently on non-standard EXIF byte orders
  }

  return result;
}
