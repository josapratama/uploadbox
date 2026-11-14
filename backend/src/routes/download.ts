import { FastifyInstance } from "fastify";
import { db, schema } from "../db";
import { eq, and, inArray } from "drizzle-orm";
import { authenticateAny } from "../middleware/auth";
import { fileExists } from "../services/storage";
import { streamZipArchive } from "../services/zip-stream";
import fs from "fs";

export async function downloadRoutes(app: FastifyInstance) {
  // Bulk download as genuine streaming ZIP archive
  app.post(
    "/download-zip",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { fileIds } = request.body as { fileIds: string[] };

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({ error: "fileIds array is required" });
      }

      // Get files from database
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

      // Single file download directly
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

      // Multiple files: Stream standard ZIP archive directly to response
      const filesToArchive = files
        .filter((f) => fileExists(f.storagePath))
        .map((f) => ({
          storagePath: f.storagePath,
          filename: f.originalFilename,
        }));

      if (filesToArchive.length === 0) {
        return reply.status(404).send({ error: "No files found on storage" });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const zipFilename = `uploadbox-archive-${timestamp}.zip`;

      reply.raw.writeHead(200, {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      });

      try {
        await streamZipArchive(filesToArchive, reply.raw);
        reply.raw.end();
      } catch (err: any) {
        app.log.error(err, "Failed to stream ZIP archive");
        if (!reply.raw.headersSent) {
          reply.status(500).send({ error: "Failed to generate ZIP archive" });
        } else {
          reply.raw.destroy();
        }
      }
    },
  );
}
