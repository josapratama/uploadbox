import { FastifyInstance } from "fastify";
import { db, schema } from "../db";
import { eq, and, inArray } from "drizzle-orm";
import { authenticateAny } from "../middleware/auth";
import { fileExists } from "../services/storage";
import fs from "fs";

export async function downloadRoutes(app: FastifyInstance) {
  // Bulk download as concatenated files with tar-like format
  // For simplicity, we'll create a simple zip-like response
  app.post(
    "/download-zip",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { fileIds } = request.body as { fileIds: string[] };

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({ error: "fileIds array is required" });
      }

      // Get files
      const files = await db
        .select()
        .from(schema.files)
        .where(
          and(
            eq(schema.files.projectId, projectId),
            eq(schema.files.isDeleted, false),
            inArray(schema.files.id, fileIds),
          ),
        );

      if (files.length === 0) {
        return reply.status(404).send({ error: "No files found" });
      }

      // For single file, just redirect to CDN
      if (files.length === 1) {
        const file = files[0];
        if (!fileExists(file.storagePath)) {
          return reply.status(404).send({ error: "File not found on storage" });
        }
        const stream = fs.createReadStream(file.storagePath);
        reply.header("Content-Type", file.mimeType);
        reply.header(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(file.originalFilename)}"`,
        );
        return reply.send(stream);
      }

      // For multiple files, create a tar.gz archive
      // Using a simple approach: send files as multipart or use archiver
      // Since we don't have archiver, let's use a simple approach
      reply.header("Content-Type", "application/x-tar");
      reply.header(
        "Content-Disposition",
        'attachment; filename="uploadbox-files.tar"',
      );

      // Simple TAR format
      const chunks: Buffer[] = [];

      for (const file of files) {
        if (!fileExists(file.storagePath)) continue;

        const stats = await fs.promises.stat(file.storagePath);
        const content = await fs.promises.readFile(file.storagePath);

        // TAR header (512 bytes)
        const header = Buffer.alloc(512);
        const filename = file.originalFilename.substring(0, 100);

        // Name
        header.write(filename, 0, Math.min(filename.length, 100), "utf8");
        // Mode
        header.write("0000644\0", 100, 8, "utf8");
        // UID
        header.write("0001000\0", 108, 8, "utf8");
        // GID
        header.write("0001000\0", 116, 8, "utf8");
        // Size (octal)
        header.write(
          stats.size.toString(8).padStart(11, "0") + "\0",
          124,
          12,
          "utf8",
        );
        // Mtime (octal)
        header.write(
          Math.floor(stats.mtimeMs / 1000)
            .toString(8)
            .padStart(11, "0") + "\0",
          136,
          12,
          "utf8",
        );
        // Checksum placeholder
        header.write("        ", 148, 8, "utf8");
        // Type flag (regular file)
        header.write("0", 156, 1, "utf8");

        // Calculate checksum
        let checksum = 0;
        for (let i = 0; i < 512; i++) {
          checksum += header[i];
        }
        header.write(
          checksum.toString(8).padStart(6, "0") + "\0 ",
          148,
          8,
          "utf8",
        );

        chunks.push(header);
        chunks.push(content);

        // Pad to 512-byte boundary
        const remainder = content.length % 512;
        if (remainder > 0) {
          chunks.push(Buffer.alloc(512 - remainder));
        }
      }

      // End of archive (two 512-byte blocks of zeros)
      chunks.push(Buffer.alloc(1024));

      return reply.send(Buffer.concat(chunks));
    },
  );
}
