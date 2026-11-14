import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
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
import { verifySignedToken } from "../services/signed-url";

/**
 * Streams file with full RFC 7233 HTTP Range support (HTTP 206 Partial Content)
 * Enables seekable video/audio scrubbing and resumable downloads.
 */
async function sendFileWithRange(
  request: FastifyRequest,
  reply: FastifyReply,
  filePath: string,
  mimeType: string,
  filename: string,
  cacheControl = "public, max-age=31536000, immutable",
  etag?: string,
) {
  const stats = await fs.promises.stat(filePath);
  const fileSize = stats.size;
  const range = request.headers.range;

  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Accept-Ranges", "bytes");
  reply.header(
    "Content-Disposition",
    `inline; filename="${encodeURIComponent(filename)}"`,
  );
  if (etag) reply.header("ETag", etag);

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (
      isNaN(start) ||
      isNaN(end) ||
      start >= fileSize ||
      end >= fileSize ||
      start > end
    ) {
      reply.header("Content-Range", `bytes */${fileSize}`);
      return reply.status(416).send({ error: "Requested Range Not Satisfiable" });
    }

    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(filePath, { start, end });

    reply.status(206);
    reply.header("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    reply.header("Content-Length", chunkSize);
    reply.header("Content-Type", mimeType);
    reply.header("Cache-Control", "no-cache");
    return reply.send(stream);
  }

  reply.header("Content-Type", mimeType);
  reply.header("Content-Length", fileSize);
  reply.header("Cache-Control", cacheControl);
  const stream = fs.createReadStream(filePath);
  return reply.send(stream);
}

export async function cdnRoutes(app: FastifyInstance) {
  // Unified CDN route handling:
  // - Original file: /cdn/:uuid/:filename
  // - Image transforms: /cdn/:uuid/-/resize/400x400/:filename
  // - Signed URLs: /cdn/:uuid/-/signed/:expires/:token/.../:filename OR ?token=...&expires=...
  app.get("/:uuid/*", async (request, reply) => {
    const { uuid } = request.params as { uuid: string };
    let wildcard = (request.params as any)["*"] as string;
    const query = (request.query || {}) as { token?: string; expires?: string };

    // 1. Find file in database
    const files = await db
      .select()
      .from(schema.files)
      .where(and(eq(schema.files.id, uuid), eq(schema.files.isDeleted, false)))
      .limit(1);

    if (files.length === 0) {
      return reply.status(404).send({ error: "File not found" });
    }

    const file = files[0];

    // 2. Check if file exists on disk
    if (!fileExists(file.storagePath)) {
      return reply.status(404).send({ error: "File not found on storage" });
    }

    // 3. Handle Time-Limited Signed URL Verification
    let signedExpires: number | null = null;
    let signedToken: string | null = null;

    // Check path-based signed pattern: -/signed/:expires/:token/
    const signedMatch = wildcard.match(/-\/signed\/(\d+)\/([a-f0-9]{32,64})\/?/i);
    if (signedMatch) {
      signedExpires = parseInt(signedMatch[1], 10);
      signedToken = signedMatch[2];
      // Strip -/signed/:expires/:token/ from wildcard so subsequent transforms continue
      wildcard = wildcard.replace(signedMatch[0], "");
      if (wildcard.startsWith("-//")) wildcard = wildcard.substring(2);
    } else if (query.token && query.expires) {
      signedExpires = parseInt(query.expires, 10);
      signedToken = query.token;
    }

    if (signedExpires && signedToken) {
      const verifyRes = await verifySignedToken(
        file.id,
        file.projectId,
        signedExpires,
        signedToken,
      );
      if (!verifyRes.valid) {
        return reply.status(403).send({ error: verifyRes.reason || "Forbidden" });
      }
    }

    // 4. Detect if this is a preview request
    const isPreview = wildcard.startsWith("-/preview");

    // 5. Parse operations from URL
    const hasOperations = wildcard.includes("-/");

    if (!hasOperations || (!file.isImage && !file.isVideo)) {
      // Serve original file with Range support
      const mimeType =
        file.mimeType ||
        mime.lookup(file.originalFilename) ||
        "application/octet-stream";

      const stats = await fs.promises.stat(file.storagePath);
      const etag = `"${file.id}-${stats.mtimeMs}"`;

      return sendFileWithRange(
        request,
        reply,
        file.storagePath,
        mimeType,
        file.originalFilename,
        "public, max-age=31536000, immutable",
        etag,
      );
    }

    // 6. Process image/video operations
    try {
      // Video preview - serve thumbnail
      if (file.isVideo && isPreview) {
        const thumbPath = await generateVideoThumbnail(
          file.storagePath,
          file.id,
        );
        if (thumbPath && fileExists(thumbPath)) {
          return sendFileWithRange(
            request,
            reply,
            thumbPath,
            "image/jpeg",
            `${file.originalFilename}-thumb.jpg`,
            "public, max-age=31536000, immutable",
          );
        }
        // Fallback: serve original video
        return sendFileWithRange(
          request,
          reply,
          file.storagePath,
          file.mimeType,
          file.originalFilename,
        );
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

      const etag = `"${file.id}-${Buffer.from(operationsKey).toString("base64url")}"`;

      return sendFileWithRange(
        request,
        reply,
        result.path,
        result.mimeType,
        file.originalFilename,
        "public, max-age=31536000, immutable",
        etag,
      );
    } catch (err: any) {
      app.log.error(err, "Image processing failed");
      // Fallback to original
      return sendFileWithRange(
        request,
        reply,
        file.storagePath,
        file.mimeType,
        file.originalFilename,
        "public, max-age=3600",
      );
    }
  });
}
