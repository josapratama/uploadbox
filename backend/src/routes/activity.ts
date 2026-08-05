import { FastifyInstance } from "fastify";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { authenticateAny } from "../middleware/auth";

export async function activityRoutes(app: FastifyInstance) {
  // Get recent activity
  app.get("/", { preHandler: [authenticateAny] }, async (request, reply) => {
    const projectId = (request as any).projectId;
    const { limit = "20" } = request.query as { limit?: string };
    const limitNum = parseInt(limit, 10);

    const result = await db.execute(sql`
      SELECT al.id, al.action, al.file_id, al.metadata, al.created_at,
             f.original_filename
      FROM activity_logs al
      LEFT JOIN files f ON f.id = al.file_id
      WHERE al.project_id = ${projectId}
      ORDER BY al.created_at DESC
      LIMIT ${limitNum}
    `);

    return reply.send({ activities: result.rows });
  });
}

// Helper to log activity (used by other routes)
export async function logActivity(
  projectId: string,
  action: string,
  fileId?: string | null,
  userId?: string | null,
  metadata?: Record<string, unknown>,
) {
  try {
    await db.execute(sql`
      INSERT INTO activity_logs (project_id, action, file_id, user_id, metadata)
      VALUES (${projectId}, ${action}, ${fileId || null}, ${userId || null}, ${metadata ? JSON.stringify(metadata) : null}::jsonb)
    `);
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
