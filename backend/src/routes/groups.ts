import { FastifyInstance } from "fastify";
import { db, schema } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { authenticateAny } from "../middleware/auth";

export async function groupRoutes(app: FastifyInstance) {
  // Create file group
  app.post("/", { preHandler: [authenticateAny] }, async (request, reply) => {
    const projectId = (request as any).projectId;
    const { name, fileIds } = request.body as {
      name?: string;
      fileIds: string[];
    };

    if (!fileIds || !Array.isArray(fileIds)) {
      return reply.status(400).send({ error: "fileIds array is required" });
    }

    const [group] = await db
      .insert(schema.fileGroups)
      .values({ projectId, name: name || null })
      .returning();

    // Add files to group
    for (let i = 0; i < fileIds.length; i++) {
      await db.insert(schema.fileGroupItems).values({
        groupId: group.id,
        fileId: fileIds[i],
        sortOrder: i,
      });
    }

    return reply.status(201).send({
      id: group.id,
      name: group.name,
      fileCount: fileIds.length,
      createdAt: group.createdAt,
    });
  });

  // List groups with file counts
  app.get("/", { preHandler: [authenticateAny] }, async (request, reply) => {
    const projectId = (request as any).projectId;

    const result = await db.execute(sql`
      SELECT fg.id, fg.name, fg.created_at as "createdAt", fg.project_id as "projectId",
             count(fgi.id)::int as "fileCount"
      FROM file_groups fg
      LEFT JOIN file_group_items fgi ON fgi.group_id = fg.id
      WHERE fg.project_id = ${projectId}
      GROUP BY fg.id
      ORDER BY fg.created_at DESC
    `);

    return reply.send({ groups: result.rows });
  });

  // Get group with files
  app.get(
    "/:uuid",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { uuid } = request.params as { uuid: string };

      const groups = await db
        .select()
        .from(schema.fileGroups)
        .where(
          and(
            eq(schema.fileGroups.id, uuid),
            eq(schema.fileGroups.projectId, projectId),
          ),
        )
        .limit(1);

      if (groups.length === 0) {
        return reply.status(404).send({ error: "Group not found" });
      }

      const group = groups[0];

      // Get files in group
      const items = await db
        .select({
          fileId: schema.fileGroupItems.fileId,
          sortOrder: schema.fileGroupItems.sortOrder,
          file: {
            id: schema.files.id,
            originalFilename: schema.files.originalFilename,
            mimeType: schema.files.mimeType,
            size: schema.files.size,
            isImage: schema.files.isImage,
            isVideo: schema.files.isVideo,
          },
        })
        .from(schema.fileGroupItems)
        .innerJoin(
          schema.files,
          eq(schema.fileGroupItems.fileId, schema.files.id),
        )
        .where(eq(schema.fileGroupItems.groupId, uuid))
        .orderBy(schema.fileGroupItems.sortOrder);

      return reply.send({
        ...group,
        files: items.map((item) => item.file),
      });
    },
  );

  // Delete group
  app.delete(
    "/:uuid",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { uuid } = request.params as { uuid: string };

      const groups = await db
        .select()
        .from(schema.fileGroups)
        .where(
          and(
            eq(schema.fileGroups.id, uuid),
            eq(schema.fileGroups.projectId, projectId),
          ),
        )
        .limit(1);

      if (groups.length === 0) {
        return reply.status(404).send({ error: "Group not found" });
      }

      await db.delete(schema.fileGroups).where(eq(schema.fileGroups.id, uuid));

      return reply.send({ message: "Group deleted", id: uuid });
    },
  );

  // Add files to existing group
  app.post(
    "/:uuid/files",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { uuid } = request.params as { uuid: string };
      const { fileIds } = request.body as { fileIds: string[] };

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send({ error: "fileIds array is required" });
      }

      const groups = await db
        .select()
        .from(schema.fileGroups)
        .where(
          and(
            eq(schema.fileGroups.id, uuid),
            eq(schema.fileGroups.projectId, projectId),
          ),
        )
        .limit(1);

      if (groups.length === 0) {
        return reply.status(404).send({ error: "Group not found" });
      }

      const existing = await db
        .select({ fileId: schema.fileGroupItems.fileId })
        .from(schema.fileGroupItems)
        .where(eq(schema.fileGroupItems.groupId, uuid));

      const existingIds = new Set(existing.map((e) => e.fileId));
      let added = 0;

      for (let i = 0; i < fileIds.length; i++) {
        if (!existingIds.has(fileIds[i])) {
          await db.insert(schema.fileGroupItems).values({
            groupId: uuid,
            fileId: fileIds[i],
            sortOrder: existing.length + i,
          });
          added++;
        }
      }

      return reply.send({ message: "Files added to group", added, groupId: uuid });
    },
  );

  // Remove file from group
  app.delete(
    "/:uuid/files/:fileId",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { uuid, fileId } = request.params as { uuid: string; fileId: string };

      const groups = await db
        .select()
        .from(schema.fileGroups)
        .where(
          and(
            eq(schema.fileGroups.id, uuid),
            eq(schema.fileGroups.projectId, projectId),
          ),
        )
        .limit(1);

      if (groups.length === 0) {
        return reply.status(404).send({ error: "Group not found" });
      }

      await db
        .delete(schema.fileGroupItems)
        .where(
          and(
            eq(schema.fileGroupItems.groupId, uuid),
            eq(schema.fileGroupItems.fileId, fileId),
          ),
        );

      return reply.send({ message: "File removed from group", fileId });
    },
  );

  // Rename group
  app.put(
    "/:uuid",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { uuid } = request.params as { uuid: string };
      const { name } = request.body as { name: string };

      if (!name || !name.trim()) {
        return reply.status(400).send({ error: "Name is required" });
      }

      const [updated] = await db
        .update(schema.fileGroups)
        .set({ name: name.trim() })
        .where(
          and(
            eq(schema.fileGroups.id, uuid),
            eq(schema.fileGroups.projectId, projectId),
          ),
        )
        .returning();

      if (!updated) {
        return reply.status(404).send({ error: "Group not found" });
      }

      return reply.send(updated);
    },
  );
}
