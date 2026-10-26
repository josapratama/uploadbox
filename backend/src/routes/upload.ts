import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";
import path from "path";
import fs from "fs";
import { eq, sql, and } from "drizzle-orm";
import { db, schema } from "../db";
import { authenticateAny } from "../middleware/auth";
import {
  saveStream,
  getMultipartDir,
  getFilePath,
  getFileSize,
} from "../services/storage";
import { getImageMetadata } from "../services/image-processor";
import {
  generateVideoThumbnail,
  getVideoDuration,
} from "../services/video-processor";
import { validateFile, verifyMimeType } from "../services/file-validator";
import { config } from "../config";
import { logActivity } from "./activity";
import { dispatchWebhook } from "../services/webhook-dispatcher";

export async function uploadRoutes(app: FastifyInstance) {
  // Direct file upload (streaming to disk - no memory buffering)
  app.post(
    "/file",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;

      if (!projectId) {
        return reply.status(400).send({ error: "No project associated" });
      }

      // Check storage quota
      const quotaCheck = await checkQuota(projectId);
      if (!quotaCheck.ok) {
        return reply.status(413).send({
          error: "Storage quota exceeded",
          used: quotaCheck.used,
          quota: quotaCheck.quota,
        });
      }

      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: "No file provided" });
      }

      const fileId = uuidv4();
      const rawFolder = (data.fields?.folder as any)?.value || (request.query as any)?.folder || "/";
      const folder = "/" + rawFolder.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");
      const ext = path.extname(data.filename).slice(1) || "";
      const mimeType =
        data.mimetype ||
        mime.lookup(data.filename) ||
        "application/octet-stream";
      const isImage = mimeType.startsWith("image/");
      const isVideo = mimeType.startsWith("video/");

      // Validate file
      const validation = validateFile(data.filename, mimeType);
      if (!validation.valid) {
        return reply.status(400).send({ error: validation.reason });
      }

      // Stream directly to disk (no memory buffering for large files)
      const storagePath = await saveStream(data.file, fileId, ext);
      const size = await getFileSize(storagePath);

      // Verify MIME type matches content
      const mimeValid = await verifyMimeType(storagePath, mimeType);
      if (!mimeValid) {
        await fs.promises.unlink(storagePath).catch(() => {});
        return reply
          .status(400)
          .send({ error: "File content does not match declared type" });
      }

      // Get image metadata if applicable
      let width: number | null = null;
      let height: number | null = null;

      if (isImage) {
        try {
          const meta = await getImageMetadata(storagePath);
          width = meta.width;
          height = meta.height;
        } catch {
          // Non-critical
        }
      }

      // Get video metadata and generate thumbnail
      let duration: number | null = null;
      if (isVideo) {
        try {
          duration = await getVideoDuration(storagePath);
          // Generate thumbnail in background (don't block response)
          generateVideoThumbnail(storagePath, fileId).catch(() => {});
        } catch {
          // Non-critical
        }
      }

      // Save to database
      const [file] = await db
        .insert(schema.files)
        .values({
          id: fileId,
          projectId,
          originalFilename: data.filename,
          mimeType,
          size,
          storagePath,
          isImage,
          isVideo,
          width,
          height,
          duration,
          folder: folder === "//" ? "/" : folder,
          metadata: {},
        })
        .returning();

      // Log activity
      await logActivity(projectId, "upload", file.id, null, {
        filename: file.originalFilename,
        size: file.size,
      });

      // Dispatch webhook
      dispatchWebhook(projectId, "file.uploaded", {
        id: file.id,
        filename: file.originalFilename,
        mimeType: file.mimeType,
        size: file.size,
        folder: file.folder,
        cdnUrl: `${config.cdnBaseUrl}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
      });

      // Generate video thumbnail if applicable
      if (isVideo) {
        generateVideoThumbnail(storagePath, file.id).catch(() => {});
      }

      return reply.status(201).send({
        id: file.id,
        filename: file.originalFilename,
        mimeType: file.mimeType,
        size: file.size,
        isImage: file.isImage,
        isVideo: file.isVideo,
        width: file.width,
        height: file.height,
        cdnUrl: `${config.cdnBaseUrl}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
        uploadedAt: file.uploadedAt,
      });
    },
  );

  // Multiple file upload
  app.post(
    "/files",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;

      if (!projectId) {
        return reply.status(400).send({ error: "No project associated" });
      }

      // Check storage quota
      const quotaCheck = await checkQuota(projectId);
      if (!quotaCheck.ok) {
        return reply.status(413).send({
          error: "Storage quota exceeded",
          used: quotaCheck.used,
          quota: quotaCheck.quota,
        });
      }

      const parts = request.files();
      const results: any[] = [];

      for await (const data of parts) {
        const fileId = uuidv4();
        const ext = path.extname(data.filename).slice(1) || "";
        const mimeType =
          data.mimetype ||
          mime.lookup(data.filename) ||
          "application/octet-stream";
        const isImage = mimeType.startsWith("image/");
        const isVideo = mimeType.startsWith("video/");

        const storagePath = await saveStream(data.file, fileId, ext);
        const size = await getFileSize(storagePath);

        let width: number | null = null;
        let height: number | null = null;

        if (isImage) {
          try {
            const meta = await getImageMetadata(storagePath);
            width = meta.width;
            height = meta.height;
          } catch {}
        }

        const [file] = await db
          .insert(schema.files)
          .values({
            id: fileId,
            projectId,
            originalFilename: data.filename,
            mimeType,
            size,
            storagePath,
            isImage,
            isVideo,
            width,
            height,
            metadata: {},
          })
          .returning();

        // Log activity
        await logActivity(projectId, "upload", file.id, null, {
          filename: file.originalFilename,
          size: file.size,
        });

        // Dispatch webhook
        dispatchWebhook(projectId, "file.uploaded", {
          id: file.id,
          filename: file.originalFilename,
          mimeType: file.mimeType,
          size: file.size,
          folder: file.folder,
          cdnUrl: `${config.cdnBaseUrl}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
        });

        // Generate video thumbnail if applicable
        if (isVideo) {
          generateVideoThumbnail(storagePath, file.id).catch(() => {});
        }

        results.push({
          id: file.id,
          filename: file.originalFilename,
          mimeType: file.mimeType,
          size: file.size,
          isImage: file.isImage,
          isVideo: file.isVideo,
          cdnUrl: `${config.cdnBaseUrl}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
          uploadedAt: file.uploadedAt,
        });
      }

      return reply.status(201).send({ files: results });
    },
  );

  // Start multipart upload
  app.post(
    "/multipart/start",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { filename, mimeType, totalSize, totalParts } = request.body as {
        filename: string;
        mimeType: string;
        totalSize: number;
        totalParts: number;
      };

      if (!filename || !totalSize || !totalParts) {
        return reply
          .status(400)
          .send({ error: "filename, totalSize, and totalParts are required" });
      }

      const uploadId = uuidv4();
      const storagePath = getMultipartDir(uploadId);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const [upload] = await db
        .insert(schema.multipartUploads)
        .values({
          id: uploadId,
          projectId,
          filename,
          mimeType:
            mimeType || mime.lookup(filename) || "application/octet-stream",
          totalSize,
          totalParts,
          storagePath,
          status: "uploading",
          expiresAt,
        })
        .returning();

      return reply
        .status(201)
        .send({ uploadId: upload.id, expiresAt: upload.expiresAt });
    },
  );

  // Upload chunk (streaming)
  app.post(
    "/multipart/chunk",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: "No chunk provided" });
      }

      const uploadId = (data.fields as any).uploadId?.value;
      const partNumber = parseInt(
        (data.fields as any).partNumber?.value || "0",
        10,
      );

      if (!uploadId || partNumber < 0) {
        return reply
          .status(400)
          .send({ error: "uploadId and partNumber are required" });
      }

      const uploads = await db
        .select()
        .from(schema.multipartUploads)
        .where(eq(schema.multipartUploads.id, uploadId))
        .limit(1);

      if (uploads.length === 0) {
        return reply.status(404).send({ error: "Upload not found" });
      }

      const upload = uploads[0];
      const chunkPath = path.join(
        upload.storagePath,
        `part_${partNumber.toString().padStart(5, "0")}`,
      );

      // Stream chunk to disk
      const writeStream = fs.createWriteStream(chunkPath);
      await new Promise<void>((resolve, reject) => {
        data.file.pipe(writeStream);
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      // Atomic increment using SQL
      await db.execute(
        sql`UPDATE multipart_uploads SET uploaded_parts = uploaded_parts + 1 WHERE id = ${uploadId}`,
      );

      return reply.send({ partNumber, status: "uploaded" });
    },
  );

  // Complete multipart upload
  app.post(
    "/multipart/complete",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const { uploadId } = request.body as { uploadId: string };

      const uploads = await db
        .select()
        .from(schema.multipartUploads)
        .where(eq(schema.multipartUploads.id, uploadId))
        .limit(1);

      if (uploads.length === 0) {
        return reply.status(404).send({ error: "Upload not found" });
      }

      const upload = uploads[0];

      // Combine chunks
      const chunkDir = upload.storagePath;
      const chunkFiles = await fs.promises.readdir(chunkDir);
      chunkFiles.sort();

      const fileId = uuidv4();
      const ext = path.extname(upload.filename).slice(1) || "";
      const finalPath = getFilePath(fileId, ext);

      // Stream chunks to final file
      const writeStream = fs.createWriteStream(finalPath);
      for (const chunkFile of chunkFiles) {
        const chunkData = fs.createReadStream(path.join(chunkDir, chunkFile));
        await new Promise<void>((resolve, reject) => {
          chunkData.pipe(writeStream, { end: false });
          chunkData.on("end", resolve);
          chunkData.on("error", reject);
        });
      }
      writeStream.end();
      await new Promise<void>((resolve) => writeStream.on("finish", resolve));

      // Clean up chunks
      await fs.promises.rm(chunkDir, { recursive: true, force: true });

      // Get file info
      const size = await getFileSize(finalPath);
      const isImage = upload.mimeType.startsWith("image/");
      const isVideo = upload.mimeType.startsWith("video/");

      let width: number | null = null;
      let height: number | null = null;

      if (isImage) {
        try {
          const meta = await getImageMetadata(finalPath);
          width = meta.width;
          height = meta.height;
        } catch {}
      }

      const [file] = await db
        .insert(schema.files)
        .values({
          id: fileId,
          projectId: upload.projectId,
          originalFilename: upload.filename,
          mimeType: upload.mimeType,
          size,
          storagePath: finalPath,
          isImage,
          isVideo,
          width,
          height,
          metadata: {},
        })
        .returning();

      await db
        .update(schema.multipartUploads)
        .set({ status: "completed" })
        .where(eq(schema.multipartUploads.id, uploadId));

      dispatchWebhook(upload.projectId, "file.uploaded", {
        id: file.id,
        filename: file.originalFilename,
        mimeType: file.mimeType,
        size: file.size,
        cdnUrl: `${config.cdnBaseUrl}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
      });

      return reply.send({
        id: file.id,
        filename: file.originalFilename,
        mimeType: file.mimeType,
        size: file.size,
        isImage: file.isImage,
        isVideo: file.isVideo,
        cdnUrl: `${config.cdnBaseUrl}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
        uploadedAt: file.uploadedAt,
      });
    },
  );

  // Upload from URL
  app.post(
    "/from-url",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { url } = request.body as { url: string };

      if (!url) {
        return reply.status(400).send({ error: "URL is required" });
      }

      try {
        const response = await fetch(url);

        if (!response.ok) {
          return reply
            .status(400)
            .send({ error: `Failed to fetch URL: ${response.statusText}` });
        }

        const contentType =
          response.headers.get("content-type") || "application/octet-stream";
        const urlPath = new URL(url).pathname;
        const filename = path.basename(urlPath) || "downloaded-file";

        const fileId = uuidv4();
        const ext =
          path.extname(filename).slice(1) || mime.extension(contentType) || "";
        const mimeType = contentType.split(";")[0].trim();
        const isImage = mimeType.startsWith("image/");
        const isVideo = mimeType.startsWith("video/");

        // Stream response body to disk
        const filePath = getFilePath(fileId, ext);
        const writeStream = fs.createWriteStream(filePath);
        const reader = response.body as any;

        if (reader && reader.pipe) {
          await new Promise<void>((resolve, reject) => {
            reader.pipe(writeStream);
            writeStream.on("finish", resolve);
            writeStream.on("error", reject);
          });
        } else {
          // Fallback for environments without streaming
          const buffer = Buffer.from(await response.arrayBuffer());
          await fs.promises.writeFile(filePath, buffer);
        }

        const size = await getFileSize(filePath);

        let width: number | null = null;
        let height: number | null = null;

        if (isImage) {
          try {
            const meta = await getImageMetadata(filePath);
            width = meta.width;
            height = meta.height;
          } catch {}
        }

        const [file] = await db
          .insert(schema.files)
          .values({
            id: fileId,
            projectId,
            originalFilename: filename,
            mimeType,
            size,
            storagePath: filePath,
            isImage,
            isVideo,
            width,
            height,
            metadata: { sourceUrl: url },
          })
          .returning();

        dispatchWebhook(projectId, "file.uploaded", {
          id: file.id,
          filename: file.originalFilename,
          mimeType: file.mimeType,
          size: file.size,
          cdnUrl: `${config.cdnBaseUrl}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
        });

        return reply.status(201).send({
          id: file.id,
          filename: file.originalFilename,
          mimeType: file.mimeType,
          size: file.size,
          isImage: file.isImage,
          isVideo: file.isVideo,
          cdnUrl: `${config.cdnBaseUrl}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
          uploadedAt: file.uploadedAt,
        });
      } catch (err: any) {
        return reply
          .status(400)
          .send({ error: `Failed to download from URL: ${err.message}` });
      }
    },
  );
}

// Check storage quota for a project
async function checkQuota(projectId: string): Promise<{
  ok: boolean;
  used: number;
  quota: number;
}> {
  const projects = await db
    .select({ storageQuota: schema.projects.storageQuota })
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .limit(1);

  const quota = projects[0]?.storageQuota || 5368709120;

  const result = await db
    .select({ totalSize: sql<number>`coalesce(sum(size), 0)::numeric` })
    .from(schema.files)
    .where(
      and(
        eq(schema.files.projectId, projectId),
        eq(schema.files.isDeleted, false),
      ),
    );

  const used = Number(result[0]?.totalSize || 0);

  return { ok: used < quota, used, quota };
}
