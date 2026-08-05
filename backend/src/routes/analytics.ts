import { FastifyInstance } from "fastify";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { authenticateAny } from "../middleware/auth";

export async function analyticsRoutes(app: FastifyInstance) {
  // Get usage analytics
  app.get(
    "/usage",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;

      const result = await db.execute(sql`
      SELECT
        count(*)::int as total_files,
        coalesce(sum(size), 0)::numeric as total_size,
        count(*) FILTER (WHERE is_image = true)::int as total_images,
        count(*) FILTER (WHERE is_video = true)::int as total_videos,
        count(*) FILTER (WHERE uploaded_at > NOW() - INTERVAL '7 days')::int as uploads_last_week,
        count(*) FILTER (WHERE uploaded_at > NOW() - INTERVAL '30 days')::int as uploads_last_month
      FROM files
      WHERE project_id = ${projectId} AND is_deleted = false
    `);

      return reply.send(result.rows[0]);
    },
  );

  // Get upload history (daily counts for last 30 days)
  app.get(
    "/uploads-history",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;

      const result = await db.execute(sql`
      SELECT
        date_trunc('day', uploaded_at)::date as date,
        count(*)::int as count,
        coalesce(sum(size), 0)::numeric as size
      FROM files
      WHERE project_id = ${projectId}
        AND is_deleted = false
        AND uploaded_at > NOW() - INTERVAL '30 days'
      GROUP BY date_trunc('day', uploaded_at)
      ORDER BY date
    `);

      return reply.send({ history: result.rows });
    },
  );

  // Get top files by size
  app.get(
    "/top-files",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;

      const result = await db.execute(sql`
      SELECT id, original_filename, mime_type, size, uploaded_at
      FROM files
      WHERE project_id = ${projectId} AND is_deleted = false
      ORDER BY size DESC
      LIMIT 10
    `);

      return reply.send({ files: result.rows });
    },
  );

  // Get MIME type distribution
  app.get(
    "/mime-distribution",
    { preHandler: [authenticateAny] },
    async (request, reply) => {
      const projectId = (request as any).projectId;

      const result = await db.execute(sql`
      SELECT
        split_part(mime_type, '/', 1) as category,
        count(*)::int as count,
        coalesce(sum(size), 0)::numeric as total_size
      FROM files
      WHERE project_id = ${projectId} AND is_deleted = false
      GROUP BY split_part(mime_type, '/', 1)
      ORDER BY count DESC
    `);

      return reply.send({ distribution: result.rows });
    },
  );
}
