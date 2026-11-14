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
  saveStreamWithHash,
  getFileSha256,
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
import { config, getCdnBaseUrl } from "../config";
import { logActivity } from "./activity";
import { dispatchWebhook } from "../services/webhook-dispatcher";
import fetch from "node-fetch";

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

      // Stream directly to disk and calculate SHA-256 simultaneously (zero extra memory buffer)
      const { storagePath, sha256, size } = await saveStreamWithHash(
        data.file,
        fileId,
        ext,
      );

      // Verify MIME type matches content
      const mimeValid = await verifyMimeType(storagePath, mimeType);
      if (!mimeValid) {
        await fs.promises.unlink(storagePath).catch(() => {});
        return reply
          .status(400)
          .send({ error: "File content does not match declared type" });
      }

      // Check if file is a duplicate within this project
      const [existingDuplicate] = await db
        .select({ id: schema.files.id, originalFilename: schema.files.originalFilename })
        .from(schema.files)
        .where(
          and(
            eq(schema.files.projectId, projectId),
            eq(schema.files.sha256, sha256),
            eq(schema.files.isDeleted, false),
          ),
        )
        .limit(1);

      // Get image metadata if applicable
      let width: number | null = null;
      let height: number | null = null;
      const fileMetadata: Record<string, unknown> = {};

      if (isImage) {
        try {
          const meta = await getImageMetadata(storagePath);
          width = meta.width;
          height = meta.height;
          if (meta.exif) {
            fileMetadata.exif = meta.exif;
          }
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
          sha256,
          folder: folder === "//" ? "/" : folder,
          metadata: {
            ...fileMetadata,
            ...(existingDuplicate
              ? { is_duplicate: true, duplicate_of: existingDuplicate.id }
              : {}),
          },
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
        cdnUrl: `${getCdnBaseUrl(request)}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
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
        cdnUrl: `${getCdnBaseUrl(request)}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
        uploadedAt: file.uploadedAt,
      });
    },
  );

  // Upload file directly by fetching from a remote URL (Remote Ingestion)
  app.post(
    "/from-url",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;

      const quotaCheck = await checkQuota(projectId);
      if (!quotaCheck.ok) {
        return reply.status(413).send({
          error: "Storage quota exceeded",
          used: quotaCheck.used,
          quota: quotaCheck.quota,
        });
      }

      const { url, folder: rawFolder = "/", filename: userFilename } = (request.body || {}) as {
        url?: string;
        folder?: string;
        filename?: string;
      };

      if (!url || typeof url !== "string" || !url.match(/^https?:\/\//i)) {
        return reply.status(400).send({ error: "Valid HTTP or HTTPS URL is required" });
      }

      try {
        const fetchRes = await fetch(url, {
          headers: {
            "User-Agent": "UploadBox-Ingest/1.0 (+https://uploadbox.josapratama.com)",
          },
          signal: AbortSignal.timeout(30000), // 30s timeout
        });

        if (!fetchRes.ok || !fetchRes.body) {
          return reply.status(400).send({
            error: `Failed to download from URL: HTTP ${fetchRes.status} ${fetchRes.statusText}`,
          });
        }

        const contentType = fetchRes.headers.get("content-type") || "application/octet-stream";
        const cleanMime = contentType.split(";")[0].trim().toLowerCase();

        // Determine filename
        let filename = userFilename?.trim();
        if (!filename) {
          try {
            const parsedUrl = new URL(url);
            const pathBase = path.basename(parsedUrl.pathname);
            if (pathBase && pathBase.includes(".")) {
              filename = decodeURIComponent(pathBase);
            }
          } catch {}
        }
        if (!filename) {
          const defaultExt = mime.extension(cleanMime) || "bin";
          filename = `imported-${Date.now()}.${defaultExt}`;
        }

        const ext = path.extname(filename).slice(1) || (mime.extension(cleanMime) || "bin");
        const fileId = uuidv4();
        const folder = "/" + rawFolder.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");
        const isImage = cleanMime.startsWith("image/");
        const isVideo = cleanMime.startsWith("video/");

        // Stream body directly to disk and calculate SHA-256
        const { storagePath, sha256, size } = await saveStreamWithHash(
          fetchRes.body as any,
          fileId,
          ext,
        );

        if (size === 0) {
          await fs.promises.unlink(storagePath).catch(() => {});
          return reply.status(400).send({ error: "Downloaded file is empty (0 bytes)" });
        }

        // Check duplicate within project
        const [existingDuplicate] = await db
          .select({ id: schema.files.id, originalFilename: schema.files.originalFilename })
          .from(schema.files)
          .where(
            and(
              eq(schema.files.projectId, projectId),
              eq(schema.files.sha256, sha256),
              eq(schema.files.isDeleted, false),
            ),
          )
          .limit(1);

        let width: number | null = null;
        let height: number | null = null;
        const fileMetadata: Record<string, unknown> = {
          imported_from_url: url,
        };

        if (isImage) {
          try {
            const meta = await getImageMetadata(storagePath);
            width = meta.width;
            height = meta.height;
            if (meta.exif) {
              fileMetadata.exif = meta.exif;
            }
          } catch {}
        }

        let duration: number | null = null;
        if (isVideo) {
          try {
            duration = await getVideoDuration(storagePath);
            generateVideoThumbnail(storagePath, fileId).catch(() => {});
          } catch {}
        }

        const [file] = await db
          .insert(schema.files)
          .values({
            id: fileId,
            projectId,
            originalFilename: filename,
            mimeType: cleanMime,
            size,
            storagePath,
            isImage,
            isVideo,
            width,
            height,
            duration,
            sha256,
            folder: folder === "//" ? "/" : folder,
            metadata: {
              ...fileMetadata,
              ...(existingDuplicate
                ? { is_duplicate: true, duplicate_of: existingDuplicate.id }
                : {}),
            },
          })
          .returning();

        await logActivity(projectId, "upload", file.id, null, {
          filename: file.originalFilename,
          size: file.size,
          source: "url",
          sourceUrl: url,
        });

        dispatchWebhook(projectId, "file.uploaded", {
          id: file.id,
          filename: file.originalFilename,
          mimeType: file.mimeType,
          size: file.size,
          source: "url",
        });

        const cdnBase = getCdnBaseUrl(request);
        const cdnUrl = `${cdnBase}/${file.id}/${encodeURIComponent(file.originalFilename)}`;

        return reply.status(201).send({
          id: file.id,
          filename: file.originalFilename,
          mimeType: file.mimeType,
          size: file.size,
          isImage: file.isImage,
          isVideo: file.isVideo,
          width: file.width,
          height: file.height,
          cdnUrl,
          uploadedAt: file.uploadedAt,
        });
      } catch (err: any) {
        return reply.status(500).send({
          error: `Remote import error: ${err.message || err}`,
        });
      }
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
          cdnUrl: `${getCdnBaseUrl(request)}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
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
          cdnUrl: `${getCdnBaseUrl(request)}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
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
      const sha256 = await getFileSha256(finalPath);
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
          sha256,
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
        cdnUrl: `${getCdnBaseUrl(request)}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
      });

      return reply.send({
        id: file.id,
        filename: file.originalFilename,
        mimeType: file.mimeType,
        size: file.size,
        isImage: file.isImage,
        isVideo: file.isVideo,
        cdnUrl: `${getCdnBaseUrl(request)}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
        uploadedAt: file.uploadedAt,
      });
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
