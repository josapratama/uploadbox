import { FastifyInstance } from "fastify";
import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
import { authenticateUser } from "../middleware/auth";
import crypto from "crypto";

export async function projectRoutes(app: FastifyInstance) {
  // List user's projects
  app.get("/", { preHandler: [authenticateUser] }, async (request, reply) => {
    const { id: userId } = request.user as any;

    const projects = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.userId, userId));

    return reply.send({ projects });
  });

  // Create project
  app.post("/", { preHandler: [authenticateUser] }, async (request, reply) => {
    const { id: userId } = request.user as any;
    const { name, description } = request.body as {
      name: string;
      description?: string;
    };

    if (!name) {
      return reply.status(400).send({ error: "Project name is required" });
    }

    const [project] = await db
      .insert(schema.projects)
      .values({ name, description: description || null, userId })
      .returning();

    // Create default API key
    const publicKey = "pub_" + crypto.randomBytes(16).toString("hex");
    const secretKey = "sec_" + crypto.randomBytes(24).toString("hex");

    await db.insert(schema.apiKeys).values({
      projectId: project.id,
      publicKey,
      secretKey,
      name: "Default Key",
    });

    return reply.status(201).send({
      project,
      apiKeys: { publicKey, secretKey },
    });
  });

  // Get project details
  app.get(
    "/:id",
    { preHandler: [authenticateUser] },
    async (request, reply) => {
      const { id: userId } = request.user as any;
      const { id } = request.params as { id: string };

      const projects = await db
        .select()
        .from(schema.projects)
        .where(
          and(eq(schema.projects.id, id), eq(schema.projects.userId, userId)),
        )
        .limit(1);

      if (projects.length === 0) {
        return reply.status(404).send({ error: "Project not found" });
      }

      return reply.send(projects[0]);
    },
  );

  // Update project
  app.put(
    "/:id",
    { preHandler: [authenticateUser] },
    async (request, reply) => {
      const { id: userId } = request.user as any;
      const { id } = request.params as { id: string };
      const { name, description } = request.body as {
        name?: string;
        description?: string;
      };

      const projects = await db
        .select()
        .from(schema.projects)
        .where(
          and(eq(schema.projects.id, id), eq(schema.projects.userId, userId)),
        )
        .limit(1);

      if (projects.length === 0) {
        return reply.status(404).send({ error: "Project not found" });
      }

      const updateData: any = { updatedAt: new Date() };
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      const [updated] = await db
        .update(schema.projects)
        .set(updateData)
        .where(eq(schema.projects.id, id))
        .returning();

      return reply.send(updated);
    },
  );

  // Delete project
  app.delete(
    "/:id",
    { preHandler: [authenticateUser] },
    async (request, reply) => {
      const { id: userId } = request.user as any;
      const { id } = request.params as { id: string };

      const projects = await db
        .select()
        .from(schema.projects)
        .where(
          and(eq(schema.projects.id, id), eq(schema.projects.userId, userId)),
        )
        .limit(1);

      if (projects.length === 0) {
        return reply.status(404).send({ error: "Project not found" });
      }

      await db.delete(schema.projects).where(eq(schema.projects.id, id));

      return reply.send({ message: "Project deleted", id });
    },
  );

  // List API keys for project
  app.get(
    "/:id/keys",
    { preHandler: [authenticateUser] },
    async (request, reply) => {
      const { id: userId } = request.user as any;
      const { id } = request.params as { id: string };

      // Verify project ownership
      const projects = await db
        .select()
        .from(schema.projects)
        .where(
          and(eq(schema.projects.id, id), eq(schema.projects.userId, userId)),
        )
        .limit(1);

      if (projects.length === 0) {
        return reply.status(404).send({ error: "Project not found" });
      }

      const keys = await db
        .select({
          id: schema.apiKeys.id,
          publicKey: schema.apiKeys.publicKey,
          secretKey: schema.apiKeys.secretKey,
          name: schema.apiKeys.name,
          isActive: schema.apiKeys.isActive,
          createdAt: schema.apiKeys.createdAt,
          lastUsedAt: schema.apiKeys.lastUsedAt,
        })
        .from(schema.apiKeys)
        .where(eq(schema.apiKeys.projectId, id));

      return reply.send({ keys });
    },
  );

  // Generate new API key
  app.post(
    "/:id/keys",
    { preHandler: [authenticateUser] },
    async (request, reply) => {
      const { id: userId } = request.user as any;
      const { id } = request.params as { id: string };
      const { name } = request.body as { name?: string };

      // Verify project ownership
      const projects = await db
        .select()
        .from(schema.projects)
        .where(
          and(eq(schema.projects.id, id), eq(schema.projects.userId, userId)),
        )
        .limit(1);

      if (projects.length === 0) {
        return reply.status(404).send({ error: "Project not found" });
      }

      const publicKey = "pub_" + crypto.randomBytes(16).toString("hex");
      const secretKey = "sec_" + crypto.randomBytes(24).toString("hex");

      const [key] = await db
        .insert(schema.apiKeys)
        .values({
          projectId: id,
          publicKey,
          secretKey,
          name: name || "API Key",
        })
        .returning();

      return reply.status(201).send({
        id: key.id,
        publicKey,
        secretKey,
        name: key.name,
        createdAt: key.createdAt,
      });
    },
  );

  // Revoke API key
  app.delete(
    "/:id/keys/:keyId",
    { preHandler: [authenticateUser] },
    async (request, reply) => {
      const { id: userId } = request.user as any;
      const { id, keyId } = request.params as { id: string; keyId: string };

      // Verify project ownership
      const projects = await db
        .select()
        .from(schema.projects)
        .where(
          and(eq(schema.projects.id, id), eq(schema.projects.userId, userId)),
        )
        .limit(1);

      if (projects.length === 0) {
        return reply.status(404).send({ error: "Project not found" });
      }

      await db
        .update(schema.apiKeys)
        .set({ isActive: false })
        .where(
          and(eq(schema.apiKeys.id, keyId), eq(schema.apiKeys.projectId, id)),
        );

      return reply.send({ message: "API key revoked", id: keyId });
    },
  );
}
