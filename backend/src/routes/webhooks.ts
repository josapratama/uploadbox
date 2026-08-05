import { FastifyInstance } from "fastify";
import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
import { authenticateAny } from "../middleware/auth";
import crypto from "crypto";

export async function webhookRoutes(app: FastifyInstance) {
  // List webhooks
  app.get("/", { preHandler: [authenticateAny] }, async (request, reply) => {
    const projectId = (request as any).projectId;

    const webhooks = await db
      .select()
      .from(schema.webhooks)
      .where(eq(schema.webhooks.projectId, projectId));

    return reply.send({ webhooks });
  });

  // Create webhook
  app.post("/", { preHandler: [authenticateAny] }, async (request, reply) => {
    const projectId = (request as any).projectId;
    const { url, events } = request.body as { url: string; events: string[] };

    if (!url || !events || events.length === 0) {
      return reply.status(400).send({ error: "url and events are required" });
    }

    const secret = crypto.randomBytes(24).toString("hex");

    const [webhook] = await db
      .insert(schema.webhooks)
      .values({ projectId, url, events, secret })
      .returning();

    return reply.status(201).send(webhook);
  });

  // Delete webhook
  app.delete(
    "/:id",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { id } = request.params as { id: string };

      await db
        .delete(schema.webhooks)
        .where(
          and(
            eq(schema.webhooks.id, id),
            eq(schema.webhooks.projectId, projectId),
          ),
        );

      return reply.send({ message: "Webhook deleted" });
    },
  );

  // Toggle webhook active state
  app.put(
    "/:id/toggle",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;
      const { id } = request.params as { id: string };

      const webhooks = await db
        .select()
        .from(schema.webhooks)
        .where(
          and(
            eq(schema.webhooks.id, id),
            eq(schema.webhooks.projectId, projectId),
          ),
        )
        .limit(1);

      if (webhooks.length === 0) {
        return reply.status(404).send({ error: "Webhook not found" });
      }

      const [updated] = await db
        .update(schema.webhooks)
        .set({ isActive: !webhooks[0].isActive })
        .where(eq(schema.webhooks.id, id))
        .returning();

      return reply.send(updated);
    },
  );
}
