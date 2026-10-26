import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import path from "path";
import fs from "fs";
import { config } from "./config";
import { uploadRoutes } from "./routes/upload";
import { fileRoutes } from "./routes/files";
import { cdnRoutes } from "./routes/cdn";
import { authRoutes } from "./routes/auth";
import { projectRoutes } from "./routes/projects";
import { groupRoutes } from "./routes/groups";
import { webhookRoutes } from "./routes/webhooks";
import { activityRoutes } from "./routes/activity";
import { shareRoutes, publicShareRoutes } from "./routes/share";
import { downloadRoutes } from "./routes/download";
import { analyticsRoutes } from "./routes/analytics";
import { widgetRoutes } from "./routes/widget";
import { ensureStorageDir } from "./services/storage";
import { runCleanup } from "./services/cleanup";
import { runMigrations } from "./db/migrate";

const app = Fastify({
  logger: true,
  bodyLimit: config.maxFileSize,
});

async function start() {
  ensureStorageDir();

  // Run database migrations automatically
  try {
    await runMigrations();
  } catch (err) {
    app.log.error(err, "Failed to run migrations at startup");
  }

  // CORS - configurable origins
  await app.register(cors, {
    origin: [
      config.frontendUrl,
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  });

  await app.register(multipart, {
    limits: {
      fileSize: config.maxFileSize,
      files: 10,
    },
  });

  await app.register(jwt, {
    secret: config.jwtSecret,
  });

  // Global rate limit
  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
    keyGenerator: (request) => {
      // Rate limit per API key if present, otherwise per IP
      const apiKey = request.headers["x-uploadbox-public-key"] as string;
      return apiKey || request.ip;
    },
  });

  // Register routes
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(uploadRoutes, { prefix: "/api/upload" });
  await app.register(fileRoutes, { prefix: "/api/files" });
  await app.register(downloadRoutes, { prefix: "/api/files" });
  await app.register(projectRoutes, { prefix: "/api/projects" });
  await app.register(groupRoutes, { prefix: "/api/groups" });
  await app.register(webhookRoutes, { prefix: "/api/webhooks" });
  await app.register(activityRoutes, { prefix: "/api/activity" });
  await app.register(shareRoutes, { prefix: "/api/share" });
  await app.register(analyticsRoutes, { prefix: "/api/analytics" });
  await app.register(widgetRoutes, { prefix: "/api" });
  await app.register(publicShareRoutes, { prefix: "/share" });
  await app.register(cdnRoutes, { prefix: "/cdn" });

  // Health check
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  // Serve Frontend SPA if built public directory exists (Single-Container Production Mode)
  const publicCandidates = [
    path.resolve(__dirname, "../public"),
    path.resolve(__dirname, "../../frontend/dist"),
    path.resolve(process.cwd(), "public"),
    path.resolve(process.cwd(), "frontend/dist"),
  ];
  const publicDir = publicCandidates.find((dir) => fs.existsSync(dir));

  if (publicDir) {
    app.log.info(`Serving static frontend from: ${publicDir}`);
    await app.register(fastifyStatic, {
      root: publicDir,
      prefix: "/",
      wildcard: false,
    });

    app.setNotFoundHandler((req, reply) => {
      const url = req.raw.url || "";
      if (
        !url.startsWith("/api") &&
        !url.startsWith("/cdn") &&
        !url.startsWith("/health") &&
        req.method === "GET"
      ) {
        return reply.sendFile("index.html");
      }
      reply.status(404).send({ error: "Not Found" });
    });
  }

  // Cleanup job - runs every hour
  setInterval(
    async () => {
      try {
        const result = await runCleanup();
        if (result.shareLinks + result.cache + result.trash > 0) {
          app.log.info(result, "Cleanup completed");
        }
      } catch (err) {
        app.log.error(err, "Cleanup failed");
      }
    },
    60 * 60 * 1000,
  ); // Every hour

  // Start server
  try {
    await app.listen({ port: config.port, host: config.host });
    console.log(
      `UploadBox server running at http://${config.host}:${config.port}`,
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
