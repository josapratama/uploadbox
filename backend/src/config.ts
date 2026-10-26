import dotenv from "dotenv";
import path from "path";

dotenv.config();

const envAppUrl = process.env.APP_URL ? process.env.APP_URL.replace(/\/+$/, "") : null;
const defaultCdnBase = process.env.CDN_BASE_URL || (envAppUrl ? `${envAppUrl}/cdn` : "http://localhost:3000/cdn");

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "0.0.0.0",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://uploadbox:uploadbox@localhost:5432/uploadbox",
  storagePath: path.resolve(process.env.STORAGE_PATH || "./storage"),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5368709120", 10), // 5GB
  nodeEnv: process.env.NODE_ENV || "development",
  cdnBaseUrl: defaultCdnBase,
};

export function getCdnBaseUrl(request?: any): string {
  if (process.env.CDN_BASE_URL) {
    return process.env.CDN_BASE_URL.replace(/\/+$/, "");
  }
  if (request) {
    const proto =
      request.headers?.["x-forwarded-proto"] ||
      request.protocol ||
      "http";
    const host =
      request.headers?.["x-forwarded-host"] ||
      request.headers?.host;
    if (host) {
      return `${proto}://${host}/cdn`;
    }
  }
  return config.cdnBaseUrl.replace(/\/+$/, "");
}
