import { FastifyInstance } from "fastify";
import { db, schema } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { authenticateAny } from "../middleware/auth";
import crypto from "crypto";
import fs from "fs";
import { fileExists } from "../services/storage";

export async function shareRoutes(app: FastifyInstance) {
  // Create share link
  app.post("/", { preHandler: [authenticateAny] }, async (request, reply) => {
    const projectId = (request as any).projectId;
    const { fileId, expiresIn, maxDownloads } = request.body as {
      fileId: string;
      expiresIn?: number;
      maxDownloads?: number;
    };

    if (!fileId) {
      return reply.status(400).send({ error: "fileId is required" });
    }

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

    if (files.length === 0) {
      return reply.status(404).send({ error: "File not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString()
      : null;

    await db.execute(sql`
      INSERT INTO share_links (file_id, project_id, token, expires_at, max_downloads)
      VALUES (${fileId}, ${projectId}, ${token}, ${expiresAt}, ${maxDownloads || null})
    `);

    return reply.status(201).send({
      token,
      url: `/share/${token}`,
      expiresAt,
      maxDownloads: maxDownloads || null,
    });
  });

  // List share links for a file
  app.get(
    "/:fileId",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { fileId } = request.params as { fileId: string };

      const result = await db.execute(sql`
      SELECT id, token, expires_at, max_downloads, download_count, created_at
      FROM share_links WHERE file_id = ${fileId} AND project_id = ${projectId}
      ORDER BY created_at DESC
    `);

      return reply.send({ links: result.rows });
    },
  );

  // Delete share link
  app.delete(
    "/:id",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await db.execute(sql`DELETE FROM share_links WHERE id = ${id}`);
      return reply.send({ message: "Share link deleted" });
    },
  );
}

// Public share download (no auth required)
export async function publicShareRoutes(app: FastifyInstance) {
  app.get("/:token", async (request, reply) => {
    const { token } = request.params as { token: string };

    const result = await db.execute(sql`
      SELECT sl.*, f.storage_path, f.original_filename, f.mime_type, f.size
      FROM share_links sl
      JOIN files f ON f.id = sl.file_id
      WHERE sl.token = ${token} AND f.is_deleted = false
    `);

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: "Share link not found" });
    }

    const link = result.rows[0] as any;

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return reply.status(410).send({ error: "Share link has expired" });
    }

    if (link.max_downloads && link.download_count >= link.max_downloads) {
      return reply.status(410).send({ error: "Download limit reached" });
    }

    if (!fileExists(link.storage_path)) {
      return reply.status(404).send({ error: "File not found" });
    }

    await db.execute(
      sql`UPDATE share_links SET download_count = download_count + 1 WHERE token = ${token}`,
    );

    const stream = fs.createReadStream(link.storage_path);
    reply.header("Content-Type", link.mime_type || "application/octet-stream");
    reply.header("Content-Length", link.size);
    reply.header(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(link.original_filename)}"`,
    );

    return reply.send(stream);
  });
}
