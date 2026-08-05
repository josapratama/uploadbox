import { FastifyInstance } from "fastify";
import { db, schema } from "../db";
import { eq, and, desc, asc, like, sql, ilike } from "drizzle-orm";
import { authenticateAny } from "../middleware/auth";
import { deleteFile as deleteStorageFile } from "../services/storage";
import { config } from "../config";
import { logActivity } from "./activity";

export async function fileRoutes(app: FastifyInstance) {
  // List files with pagination and filtering
  app.get("/", { preHandler: [authenticateAny] }, async (request, reply) => {
    const projectId = (request as any).projectId;
    const {
      page = "1",
      limit = "20",
      sort = "uploaded_at",
      order = "desc",
      search,
      mimeType,
      isImage,
      isVideo,
      folder,
      metadataKey,
      metadataValue,
    } = request.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let conditions = [
      eq(schema.files.projectId, projectId),
      eq(schema.files.isDeleted, false),
    ];

    if (search) {
      conditions.push(ilike(schema.files.originalFilename, `%${search}%`));
    }

    if (mimeType) {
      conditions.push(like(schema.files.mimeType, `${mimeType}%`));
    }

    if (isImage === "true") {
      conditions.push(eq(schema.files.isImage, true));
    }

    if (isVideo === "true") {
      conditions.push(eq(schema.files.isVideo, true));
    }

    if (folder) {
      conditions.push(sql`folder = ${folder}`);
    }

    if (metadataKey && metadataValue) {
      conditions.push(
        sql`metadata->>cast(${metadataKey} as text) ILIKE ${"%" + metadataValue + "%"}`,
      );
    } else if (metadataKey) {
      conditions.push(sql`metadata ? ${metadataKey}`);
    }

    const whereClause = and(...conditions);

    const [files, countResult] = await Promise.all([
      db
        .select({
          id: schema.files.id,
          originalFilename: schema.files.originalFilename,
          mimeType: schema.files.mimeType,
          size: schema.files.size,
          isImage: schema.files.isImage,
          isVideo: schema.files.isVideo,
          width: schema.files.width,
          height: schema.files.height,
          metadata: schema.files.metadata,
          uploadedAt: schema.files.uploadedAt,
        })
        .from(schema.files)
        .where(whereClause)
        .orderBy(
          order === "asc"
            ? asc(schema.files.uploadedAt)
            : desc(schema.files.uploadedAt),
        )
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.files)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count || 0;

    const filesWithUrls = files.map((file) => ({
      ...file,
      cdnUrl: `${config.cdnBaseUrl}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
      thumbnailUrl: file.isImage
        ? `${config.cdnBaseUrl}/${file.id}/-/preview/`
        : file.isVideo
          ? `/api/files/${file.id}/thumbnail`
          : null,
    }));

    return reply.send({
      files: filesWithUrls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  });

  // Get single file info
  app.get(
    "/:uuid",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const { uuid } = request.params as { uuid: string };
      const projectId = (request as any).projectId;

      const files = await db
        .select()
        .from(schema.files)
        .where(
          and(
            eq(schema.files.id, uuid),
            eq(schema.files.projectId, projectId),
            eq(schema.files.isDeleted, false),
          ),
        )
        .limit(1);

      if (files.length === 0) {
        return reply.status(404).send({ error: "File not found" });
      }

      const file = files[0];

      return reply.send({
        id: file.id,
        originalFilename: file.originalFilename,
        mimeType: file.mimeType,
        size: file.size,
        isImage: file.isImage,
        isVideo: file.isVideo,
        width: file.width,
        height: file.height,
        duration: file.duration,
        metadata: file.metadata,
        cdnUrl: `${config.cdnBaseUrl}/${file.id}/${encodeURIComponent(file.originalFilename)}`,
        thumbnailUrl: file.isImage
          ? `${config.cdnBaseUrl}/${file.id}/-/preview/`
          : null,
        uploadedAt: file.uploadedAt,
      });
    },
  );

  // Update file metadata
  app.put(
    "/:uuid/metadata",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const { uuid } = request.params as { uuid: string };
      const projectId = (request as any).projectId;
      const { metadata } = request.body as {
        metadata: Record<string, unknown>;
      };

      const files = await db
        .select()
        .from(schema.files)
        .where(
          and(
            eq(schema.files.id, uuid),
            eq(schema.files.projectId, projectId),
            eq(schema.files.isDeleted, false),
          ),
        )
        .limit(1);

      if (files.length === 0) {
        return reply.status(404).send({ error: "File not found" });
      }

      const [updated] = await db
        .update(schema.files)
        .set({ metadata })
        .where(eq(schema.files.id, uuid))
        .returning();

      return reply.send({ id: updated.id, metadata: updated.metadata });
    },
  );

  // Delete file (soft delete)
  app.delete(
    "/:uuid",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const { uuid } = request.params as { uuid: string };
      const projectId = (request as any).projectId;

      const files = await db
        .select()
        .from(schema.files)
        .where(
          and(
            eq(schema.files.id, uuid),
            eq(schema.files.projectId, projectId),
            eq(schema.files.isDeleted, false),
          ),
        )
        .limit(1);

      if (files.length === 0) {
        return reply.status(404).send({ error: "File not found" });
      }

      // Soft delete - keep file on disk for 30 days (trash/recycle bin)
      await db
        .update(schema.files)
        .set({ isDeleted: true, deletedAt: new Date() })
        .where(eq(schema.files.id, uuid));

      await logActivity(projectId, "delete", uuid, null, {
        filename: files[0].originalFilename,
      });

      return reply.send({ message: "File deleted", id: uuid });
    },
  );

  // Batch delete
  app.post(
    "/batch-delete",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { fileIds } = request.body as { fileIds: string[] };

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({ error: "fileIds array is required" });
      }

      const deleted: string[] = [];

      for (const fileId of fileIds) {
        const files = await db
          .select()
          .from(schema.files)
          .where(
            and(
              eq(schema.files.id, fileId),
              eq(schema.files.projectId, projectId),
              eq(schema.files.isDeleted, false),
            ),
          )
          .limit(1);

        if (files.length > 0) {
          await db
            .update(schema.files)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where(eq(schema.files.id, fileId));
          deleted.push(fileId);
        }
      }

      return reply.send({ deleted, count: deleted.length });
    },
  );

  // Get storage stats
  app.get(
    "/stats/overview",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;

      const stats = await db
        .select({
          totalFiles: sql<number>`count(*)::int`,
          totalSize: sql<number>`coalesce(sum(size), 0)::numeric`,
          totalImages: sql<number>`count(*) filter (where is_image = true)::int`,
          totalVideos: sql<number>`count(*) filter (where is_video = true)::int`,
        })
        .from(schema.files)
        .where(
          and(
            eq(schema.files.projectId, projectId),
            eq(schema.files.isDeleted, false),
          ),
        );

      return reply.send(stats[0]);
    },
  );

  // Rename file
  app.put(
    "/:uuid/rename",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const { uuid } = request.params as { uuid: string };
      const projectId = (request as any).projectId;
      const { filename } = request.body as { filename: string };

      if (!filename || !filename.trim()) {
        return reply.status(400).send({ error: "Filename is required" });
      }

      const files = await db
        .select()
        .from(schema.files)
        .where(
          and(
            eq(schema.files.id, uuid),
            eq(schema.files.projectId, projectId),
            eq(schema.files.isDeleted, false),
          ),
        )
        .limit(1);

      if (files.length === 0) {
        return reply.status(404).send({ error: "File not found" });
      }

      const [updated] = await db
        .update(schema.files)
        .set({ originalFilename: filename.trim() })
        .where(eq(schema.files.id, uuid))
        .returning();

      return reply.send({ id: updated.id, filename: updated.originalFilename });
    },
  );

  // Move file to folder
  app.put(
    "/:uuid/move",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const { uuid } = request.params as { uuid: string };
      const projectId = (request as any).projectId;
      const { folder } = request.body as { folder: string };

      if (!folder) {
        return reply.status(400).send({ error: "Folder path is required" });
      }

      // Normalize folder path
      const normalizedFolder =
        "/" + folder.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");

      const files = await db
        .select()
        .from(schema.files)
        .where(
          and(
            eq(schema.files.id, uuid),
            eq(schema.files.projectId, projectId),
            eq(schema.files.isDeleted, false),
          ),
        )
        .limit(1);

      if (files.length === 0) {
        return reply.status(404).send({ error: "File not found" });
      }

      await db.execute(
        sql`UPDATE files SET folder = ${normalizedFolder} WHERE id = ${uuid}`,
      );

      return reply.send({ id: uuid, folder: normalizedFolder });
    },
  );

  // List folders
  app.get(
    "/folders/list",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;

      const result = await db.execute(sql`
        SELECT DISTINCT folder, count(*)::int as file_count
        FROM files
        WHERE project_id = ${projectId} AND is_deleted = false
        GROUP BY folder
        ORDER BY folder
      `);

      return reply.send({ folders: result.rows });
    },
  );

  // List trash (soft-deleted files)
  app.get(
    "/trash/list",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;

      const files = await db
        .select({
          id: schema.files.id,
          originalFilename: schema.files.originalFilename,
          mimeType: schema.files.mimeType,
          size: schema.files.size,
          isImage: schema.files.isImage,
          isVideo: schema.files.isVideo,
          deletedAt: schema.files.deletedAt,
        })
        .from(schema.files)
        .where(
          and(
            eq(schema.files.projectId, projectId),
            eq(schema.files.isDeleted, true),
          ),
        )
        .orderBy(desc(schema.files.deletedAt));

      return reply.send({ files });
    },
  );

  // Restore file from trash
  app.post(
    "/:uuid/restore",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const { uuid } = request.params as { uuid: string };
      const projectId = (request as any).projectId;

      const files = await db
        .select()
        .from(schema.files)
        .where(
          and(
            eq(schema.files.id, uuid),
            eq(schema.files.projectId, projectId),
            eq(schema.files.isDeleted, true),
          ),
        )
        .limit(1);

      if (files.length === 0) {
        return reply.status(404).send({ error: "File not found in trash" });
      }

      await db
        .update(schema.files)
        .set({ isDeleted: false, deletedAt: null })
        .where(eq(schema.files.id, uuid));

      await logActivity(projectId, "restore", uuid, null, {
        filename: files[0].originalFilename,
      });

      return reply.send({ message: "File restored", id: uuid });
    },
  );

  // Permanently delete file from trash
  app.delete(
    "/:uuid/permanent",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const { uuid } = request.params as { uuid: string };
      const projectId = (request as any).projectId;

      const files = await db
        .select()
        .from(schema.files)
        .where(
          and(
            eq(schema.files.id, uuid),
            eq(schema.files.projectId, projectId),
            eq(schema.files.isDeleted, true),
          ),
        )
        .limit(1);

      if (files.length === 0) {
        return reply.status(404).send({ error: "File not found in trash" });
      }

      // Delete from storage
      await deleteStorageFile(files[0].storagePath);

      // Delete from database
      await db.delete(schema.files).where(eq(schema.files.id, uuid));

      return reply.send({ message: "File permanently deleted", id: uuid });
    },
  );

  // Empty trash
  app.post(
    "/trash/empty",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;

      const trashedFiles = await db
        .select()
        .from(schema.files)
        .where(
          and(
            eq(schema.files.projectId, projectId),
            eq(schema.files.isDeleted, true),
          ),
        );

      for (const file of trashedFiles) {
        await deleteStorageFile(file.storagePath);
      }

      await db
        .delete(schema.files)
        .where(
          and(
            eq(schema.files.projectId, projectId),
            eq(schema.files.isDeleted, true),
          ),
        );

      return reply.send({
        message: "Trash emptied",
        count: trashedFiles.length,
      });
    },
  );

  // Get video thumbnail
  app.get(
    "/:uuid/thumbnail",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const { uuid } = request.params as { uuid: string };
      const projectId = (request as any).projectId;
      const fs = await import("fs");
      const path = await import("path");

      const files = await db
        .select()
        .from(schema.files)
        .where(
          and(eq(schema.files.id, uuid), eq(schema.files.projectId, projectId)),
        )
        .limit(1);

      if (files.length === 0) {
        return reply.status(404).send({ error: "File not found" });
      }

      const thumbnailPath = path.join(
        config.storagePath,
        "cache",
        uuid.substring(0, 2),
        `${uuid}_thumb.jpeg`,
      );

      if (!fs.existsSync(thumbnailPath)) {
        return reply.status(404).send({ error: "Thumbnail not available" });
      }

      const stream = fs.createReadStream(thumbnailPath);
      reply.header("Content-Type", "image/jpeg");
      reply.header("Cache-Control", "public, max-age=86400");
      return reply.send(stream);
    },
  );

  // Get storage quota info
  app.get(
    "/stats/quota",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;

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

      return reply.send({
        used,
        quota,
        percentage: quota > 0 ? Math.round((used / quota) * 100) : 0,
      });
    },
  );
}
