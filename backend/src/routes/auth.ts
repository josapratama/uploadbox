import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function authRoutes(app: FastifyInstance) {
  // Register
  app.post("/register", async (request, reply) => {
    const { email, password, name } = request.body as {
      email: string;
      password: string;
      name?: string;
    };

    if (!email || !password) {
      return reply
        .status(400)
        .send({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return reply
        .status(400)
        .send({ error: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return reply.status(409).send({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(schema.users)
      .values({ email, passwordHash, name: name || null })
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
      });

    // Create default project for user
    const [project] = await db
      .insert(schema.projects)
      .values({ name: "My Project", userId: user.id })
      .returning();

    // Create default API keys
    const publicKey = "pub_" + crypto.randomBytes(16).toString("hex");
    const secretKey = "sec_" + crypto.randomBytes(24).toString("hex");

    await db.insert(schema.apiKeys).values({
      projectId: project.id,
      publicKey,
      secretKey,
      name: "Default Key",
    });

    const token = app.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: "7d" },
    );

    return reply.status(201).send({
      user: { id: user.id, email: user.email, name: user.name },
      token,
      project: { id: project.id, name: project.name },
      apiKeys: { publicKey, secretKey },
    });
  });

  // Login
  app.post("/login", async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return reply
        .status(400)
        .send({ error: "Email and password are required" });
    }

    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (users.length === 0) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = app.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: "7d" },
    );

    return reply.send({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  });

  // Get current user
  app.get(
    "/me",
    {
      preHandler: [
        async (req, rep) => {
          try {
            await req.jwtVerify();
          } catch {
            rep.status(401).send({ error: "Unauthorized" });
          }
        },
      ],
    },
    async (request) => {
      const { id } = request.user as any;

      const users = await db
        .select({
          id: schema.users.id,
          email: schema.users.email,
          name: schema.users.name,
          createdAt: schema.users.createdAt,
        })
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);

      return users[0];
    },
  );

  // Change password
  app.post(
    "/change-password",
    {
      preHandler: [
        async (req, rep) => {
          try {
            await req.jwtVerify();
          } catch {
            rep.status(401).send({ error: "Unauthorized" });
          }
        },
      ],
    },
    async (request, reply) => {
      const { id } = request.user as any;
      const { currentPassword, newPassword } = request.body as {
        currentPassword: string;
        newPassword: string;
      };

      if (!currentPassword || !newPassword) {
        return reply
          .status(400)
          .send({ error: "Current and new password are required" });
      }

      if (newPassword.length < 6) {
        return reply
          .status(400)
          .send({ error: "New password must be at least 6 characters" });
      }

      const users = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);
      if (users.length === 0)
        return reply.status(404).send({ error: "User not found" });

      const valid = await bcrypt.compare(
        currentPassword,
        users[0].passwordHash,
      );
      if (!valid)
        return reply
          .status(401)
          .send({ error: "Current password is incorrect" });

      const newHash = await bcrypt.hash(newPassword, 12);
      await db
        .update(schema.users)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(schema.users.id, id));

      return reply.send({ message: "Password changed successfully" });
    },
  );

  // Update profile
  app.put(
    "/profile",
    {
      preHandler: [
        async (req, rep) => {
          try {
            await req.jwtVerify();
          } catch {
            rep.status(401).send({ error: "Unauthorized" });
          }
        },
      ],
    },
    async (request, reply) => {
      const { id } = request.user as any;
      const { name } = request.body as { name?: string };

      const [updated] = await db
        .update(schema.users)
        .set({ name: name || null, updatedAt: new Date() })
        .where(eq(schema.users.id, id))
        .returning({
          id: schema.users.id,
          email: schema.users.email,
          name: schema.users.name,
        });

      return reply.send(updated);
    },
  );
}
