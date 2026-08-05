import { FastifyInstance } from "fastify";
import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
import fs from "fs";
import mime from "mime-types";
import {
  processImage,
  parseOperationsFromUrl,
} from "../services/image-processor";
import { fileExists } from "../services/storage";
import { generateVideoThumbnail } from "../services/video-processor";

export async function cdnRoutes(app: FastifyInstance) {
  // Single unified route that handles all CDN patterns:
  // /cdn/:uuid/:filename
  // /cdn/:uuid/-/operation/params/.../:filename
  app.get("/:uuid/*", async (request, reply) => {
    const { uuid } = request.params as { uuid: string };
    const wildcard = (request.params as any)["*"] as string;

    // Find file in database
    const files = await db
      .select()
      .from(schema.files)
      .where(and(eq(schema.files.id, uuid), eq(schema.files.isDeleted, false)))
      .limit(1);

    if (files.length === 0) {
      return reply.status(404).send({ error: "File not found" });
    }

    const file = files[0];

    // Check if file exists on disk
    if (!fileExists(file.storagePath)) {
      return reply.status(404).send({ error: "File not found on storage" });
    }

    // Detect if this is a preview request
    const isPreview = wildcard.startsWith("-/preview");

    // Parse operations from URL
    const hasOperations = wildcard.includes("-/");

    if (!hasOperations || (!file.isImage && !file.isVideo)) {
      // Serve original file
      const stats = await fs.promises.stat(file.storagePath);
      const stream = fs.createReadStream(file.storagePath);
      const mimeType =
        file.mimeType ||
        mime.lookup(file.originalFilename) ||
        "application/octet-stream";

      reply.header("Content-Type", mimeType);
      reply.header("Content-Length", stats.size);
      reply.header(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(file.originalFilename)}"`,
      );
      reply.header("Cache-Control", "public, max-age=31536000, immutable");
      reply.header("ETag", `"${file.id}-${stats.mtimeMs}"`);
      reply.header("Access-Control-Allow-Origin", "*");

      return reply.send(stream);
    }

    // Process image/video operations
    try {
      // Video preview - serve thumbnail
      if (file.isVideo && isPreview) {
        const thumbPath = await generateVideoThumbnail(
          file.storagePath,
          file.id,
        );
        if (thumbPath && fileExists(thumbPath)) {
          const stats = await fs.promises.stat(thumbPath);
          const stream = fs.createReadStream(thumbPath);
          reply.header("Content-Type", "image/jpeg");
          reply.header("Content-Length", stats.size);
          reply.header("Cache-Control", "public, max-age=31536000, immutable");
          reply.header("Access-Control-Allow-Origin", "*");
          return reply.send(stream);
        }
        // Fallback: serve original video
        const stats = await fs.promises.stat(file.storagePath);
        const stream = fs.createReadStream(file.storagePath);
        reply.header("Content-Type", file.mimeType);
        reply.header("Content-Length", stats.size);
        return reply.send(stream);
      }

      // Image operations
      let operations;
      let operationsKey: string;

      if (isPreview) {
        operations = {
          preview: true,
          resize: { width: 400, height: 400, fit: "inside" as const },
          quality: 80,
          format: "webp" as const,
        };
        operationsKey = "preview-400-webp";
      } else {
        // Extract operations string (everything before the last segment which is filename)
        const operationsStr =
          wildcard.substring(0, wildcard.lastIndexOf("/")) || wildcard;
        operations = parseOperationsFromUrl(operationsStr);
        operationsKey = operationsStr;
      }

      const result = await processImage(
        file.storagePath,
        file.id,
        operations,
        operationsKey,
      );

      const stats = await fs.promises.stat(result.path);
      const stream = fs.createReadStream(result.path);

      reply.header("Content-Type", result.mimeType);
      reply.header("Content-Length", stats.size);
      reply.header("Cache-Control", "public, max-age=31536000, immutable");
      reply.header(
        "ETag",
        `"${file.id}-${Buffer.from(operationsKey).toString("base64url")}"`,
      );
      reply.header("Access-Control-Allow-Origin", "*");

      return reply.send(stream);
    } catch (err: any) {
      app.log.error(err, "Image processing failed");
      // Fallback to original
      const stats = await fs.promises.stat(file.storagePath);
      const stream = fs.createReadStream(file.storagePath);
      reply.header("Content-Type", file.mimeType);
      reply.header("Content-Length", stats.size);
      reply.header("Cache-Control", "public, max-age=3600");
      return reply.send(stream);
    }
  });
}
