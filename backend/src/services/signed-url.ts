import crypto from "crypto";
import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
import { config } from "../config";

export function computeSignedToken(fileId: string, expires: number, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${fileId}:${expires}`)
    .digest("hex");
}

export async function getProjectSecret(projectId: string): Promise<string> {
  const keys = await db
    .select({ secretKey: schema.apiKeys.secretKey })
    .from(schema.apiKeys)
    .where(and(eq(schema.apiKeys.projectId, projectId), eq(schema.apiKeys.isActive, true)))
    .limit(1);

  if (keys.length > 0 && keys[0].secretKey) {
    return keys[0].secretKey;
  }

  // Fallback: derive stable project secret from JWT secret + projectId
  return crypto
    .createHmac("sha256", config.jwtSecret || "uploadbox-secret-seed")
    .update(projectId)
    .digest("hex");
}

export async function verifySignedToken(
  fileId: string,
  projectId: string,
  expires: number,
  token: string,
): Promise<{ valid: boolean; reason?: string }> {
  const nowSec = Math.floor(Date.now() / 1000);
  if (nowSec > expires) {
    return { valid: false, reason: "Signed URL has expired" };
  }

  const primarySecret = await getProjectSecret(projectId);
  const expectedPrimary = computeSignedToken(fileId, expires, primarySecret);

  if (token.length === expectedPrimary.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedPrimary))) {
    return { valid: true };
  }

  // Check all active keys for project
  const allKeys = await db
    .select({ secretKey: schema.apiKeys.secretKey })
    .from(schema.apiKeys)
    .where(and(eq(schema.apiKeys.projectId, projectId), eq(schema.apiKeys.isActive, true)));

  for (const k of allKeys) {
    const expToken = computeSignedToken(fileId, expires, k.secretKey);
    if (token.length === expToken.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expToken))) {
      return { valid: true };
    }
  }

  return { valid: false, reason: "Invalid signature token" };
}
