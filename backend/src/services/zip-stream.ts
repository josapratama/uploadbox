import fs from "fs";
import { Writable } from "stream";

// Table-based CRC-32 calculation (Standard IEEE 802.3)
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

export function updateCrc32(crc: number, buffer: Buffer): number {
  let c = ~crc;
  for (let i = 0; i < buffer.length; i++) {
    c = crcTable[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return ~c;
}

interface ZipEntryInfo {
  nameBuf: Buffer;
  crc32: number;
  size: number;
  offset: number;
}

/**
 * Stream multiple disk files into a standard, valid ZIP archive (PKZIP 2.0).
 * Uses compression method 0 (STORED) with data descriptors for streaming.
 * Memory consumption is constant (< 2 MB) regardless of total archive size.
 */
export async function streamZipArchive(
  files: Array<{ storagePath: string; filename: string }>,
  destination: Writable,
): Promise<void> {
  let totalOffset = 0;
  const entries: ZipEntryInfo[] = [];

  const writeData = async (buf: Buffer) => {
    totalOffset += buf.length;
    if (!destination.write(buf)) {
      await new Promise<void>((resolve) => destination.once("drain", resolve));
    }
  };

  // 1. Process each file
  for (const file of files) {
    if (!fs.existsSync(file.storagePath)) continue;

    const fileOffset = totalOffset;
    // Sanitize filename to prevent directory traversal
    const safeName = file.filename.replace(/[\\/]/g, "_").substring(0, 255) || "file";
    const nameBuf = Buffer.from(safeName, "utf8");

    // Local file header (30 bytes + nameBuf.length)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4);         // version needed: 2.0
    localHeader.writeUInt16LE(0x08, 6);       // bit flag: 0x08 (bit 3 set = data descriptor follows)
    localHeader.writeUInt16LE(0, 8);          // compression method: 0 (STORED)
    localHeader.writeUInt16LE(0x5000, 10);    // last mod time
    localHeader.writeUInt16LE(0x5000, 12);    // last mod date
    localHeader.writeUInt32LE(0, 14);         // crc32 (in descriptor)
    localHeader.writeUInt32LE(0, 18);         // compressed size (in descriptor)
    localHeader.writeUInt32LE(0, 22);         // uncompressed size (in descriptor)
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);         // extra field length
    nameBuf.copy(localHeader, 30);

    await writeData(localHeader);

    // Stream file contents and calculate CRC32 on-the-fly
    let fileCrc = 0;
    let fileSize = 0;

    await new Promise<void>((resolve, reject) => {
      const readStream = fs.createReadStream(file.storagePath);
      readStream.on("data", async (chunk: string | Buffer) => {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        fileCrc = updateCrc32(fileCrc, buf);
        fileSize += buf.length;
        readStream.pause();
        await writeData(buf);
        readStream.resume();
      });
      readStream.on("end", resolve);
      readStream.on("error", reject);
    });

    // Data descriptor (16 bytes)
    const descriptor = Buffer.alloc(16);
    descriptor.writeUInt32LE(0x08074b50, 0);   // signature PK\x07\x08
    descriptor.writeUInt32LE(fileCrc >>> 0, 4);
    descriptor.writeUInt32LE(fileSize >>> 0, 8);
    descriptor.writeUInt32LE(fileSize >>> 0, 12);

    await writeData(descriptor);

    entries.push({
      nameBuf,
      crc32: fileCrc >>> 0,
      size: fileSize,
      offset: fileOffset,
    });
  }

  // 2. Write Central Directory Headers
  const centralDirStart = totalOffset;

  for (const entry of entries) {
    const cdHeader = Buffer.alloc(46 + entry.nameBuf.length);
    cdHeader.writeUInt32LE(0x02014b50, 0);       // signature PK\x01\x02
    cdHeader.writeUInt16LE(20, 4);               // version made by
    cdHeader.writeUInt16LE(20, 6);               // version needed
    cdHeader.writeUInt16LE(0x08, 8);             // bit flag
    cdHeader.writeUInt16LE(0, 10);               // method: 0 (STORED)
    cdHeader.writeUInt16LE(0x5000, 12);          // last mod time
    cdHeader.writeUInt16LE(0x5000, 14);          // last mod date
    cdHeader.writeUInt32LE(entry.crc32, 16);     // crc-32
    cdHeader.writeUInt32LE(entry.size >>> 0, 20);// compressed size
    cdHeader.writeUInt32LE(entry.size >>> 0, 24);// uncompressed size
    cdHeader.writeUInt16LE(entry.nameBuf.length, 28);
    cdHeader.writeUInt16LE(0, 30);               // extra field length
    cdHeader.writeUInt16LE(0, 32);               // comment length
    cdHeader.writeUInt16LE(0, 34);               // disk start
    cdHeader.writeUInt16LE(0, 36);               // internal attrs
    cdHeader.writeUInt32LE(0x81a40000, 38);      // external attrs: regular file (-rw-r--r--)
    cdHeader.writeUInt32LE(entry.offset >>> 0, 42); // relative offset of local header
    entry.nameBuf.copy(cdHeader, 46);

    await writeData(cdHeader);
  }

  const centralDirSize = totalOffset - centralDirStart;

  // 3. Write End of Central Directory Record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);              // signature PK\x05\x06
  eocd.writeUInt16LE(0, 4);                       // disk number
  eocd.writeUInt16LE(0, 6);                       // disk where central dir starts
  eocd.writeUInt16LE(entries.length, 8);          // total entries this disk
  eocd.writeUInt16LE(entries.length, 10);         // total entries central dir
  eocd.writeUInt32LE(centralDirSize >>> 0, 12);   // central dir size
  eocd.writeUInt32LE(centralDirStart >>> 0, 16);  // central dir offset
  eocd.writeUInt16LE(0, 20);                      // comment length

  await writeData(eocd);
}
