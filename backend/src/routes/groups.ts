import { FastifyInstance } from "fastify";
import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
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

  // List groups
  app.get("/", { preHandler: [authenticateAny] }, async (request, reply) => {
    const projectId = (request as any).projectId;

    const groups = await db
      .select()
      .from(schema.fileGroups)
      .where(eq(schema.fileGroups.projectId, projectId));

    return reply.send({ groups });
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
}
