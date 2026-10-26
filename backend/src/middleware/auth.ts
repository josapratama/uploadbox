import { FastifyRequest, FastifyReply } from "fastify";
import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";

// JWT auth for dashboard users
export async function authenticateUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply
      .status(401)
      .send({ error: "Unauthorized", message: "Invalid or expired token" });
  }
}

// API key auth for upload/file operations
export async function authenticateApiKey(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authHeader = request.headers.authorization;
  const publicKeyHeader = request.headers["x-uploadbox-public-key"] as string;

  let publicKey: string | undefined;
  let secretKey: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    secretKey = authHeader.substring(7);
  }

  if (publicKeyHeader) {
    publicKey = publicKeyHeader;
  }

  // Also check query params for public key (for CDN URLs)
  const queryKey = (request.query as any)?.pub_key;
  if (queryKey) {
    publicKey = queryKey;
  }

  if (!publicKey && !secretKey) {
    reply
      .status(401)
      .send({ error: "Unauthorized", message: "API key required" });
    return;
  }

  try {
    let apiKeyRecord;

    if (secretKey) {
      const results = await db
        .select()
        .from(schema.apiKeys)
        .where(
          and(
            eq(schema.apiKeys.secretKey, secretKey),
            eq(schema.apiKeys.isActive, true),
          ),
        )
        .limit(1);
      apiKeyRecord = results[0];
    } else if (publicKey) {
      const results = await db
        .select()
        .from(schema.apiKeys)
        .where(
          and(
            eq(schema.apiKeys.publicKey, publicKey),
            eq(schema.apiKeys.isActive, true),
          ),
        )
        .limit(1);
      apiKeyRecord = results[0];
    }

    if (!apiKeyRecord) {
      reply
        .status(401)
        .send({ error: "Unauthorized", message: "Invalid API key" });
      return;
    }

    // Update last used
    await db
      .update(schema.apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(schema.apiKeys.id, apiKeyRecord.id));

    // Attach project info to request
    (request as any).projectId = apiKeyRecord.projectId;
    (request as any).apiKeyId = apiKeyRecord.id;
  } catch (err) {
    reply.status(500).send({ error: "Internal Server Error" });
  }
}

// Combined auth - accepts either JWT or API key
export async function authenticateAny(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Try JWT first
  try {
    await request.jwtVerify();
    const user = request.user as any;
    const projectHeader = request.headers["x-project-id"] as string;

    let selectedProject;

    if (projectHeader) {
      const found = await db
        .select()
        .from(schema.projects)
        .where(
          and(
            eq(schema.projects.id, projectHeader),
            eq(schema.projects.userId, user.id),
          ),
        )
        .limit(1);
      if (found.length > 0) {
        selectedProject = found[0];
      }
    }

    if (!selectedProject) {
      const projects = await db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.userId, user.id))
        .limit(1);

      if (projects.length > 0) {
        selectedProject = projects[0];
      } else {
        // Auto-create default project if user has no project
        const [newProj] = await db
          .insert(schema.projects)
          .values({ name: "Default Project", userId: user.id })
          .returning();
        selectedProject = newProj;
      }
    }

    (request as any).projectId = selectedProject.id;
    return;
  } catch {
    // JWT failed, try API key
  }

  // Try API key
  await authenticateApiKey(request, reply);
}
