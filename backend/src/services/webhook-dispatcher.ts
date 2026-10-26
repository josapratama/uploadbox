import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import fetch from "node-fetch";

export async function dispatchWebhook(
  projectId: string,
  event: string,
  payload: Record<string, unknown>,
) {
  try {
    const activeWebhooks = await db
      .select()
      .from(schema.webhooks)
      .where(
        and(
          eq(schema.webhooks.projectId, projectId),
          eq(schema.webhooks.isActive, true),
        ),
      );

    for (const wh of activeWebhooks) {
      if (Array.isArray(wh.events) && wh.events.includes(event)) {
        const body = JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          data: payload,
        });

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "User-Agent": "UploadBox-Webhooks/1.0",
        };

        if (wh.secret) {
          const signature = crypto
            .createHmac("sha256", wh.secret)
            .update(body)
            .digest("hex");
          headers["X-UploadBox-Signature"] = signature;
        }

        fetch(wh.url, {
          method: "POST",
          headers,
          body,
          signal: AbortSignal.timeout(5000),
        }).catch((err) => {
          console.warn(`Webhook delivery to ${wh.url} failed:`, (err as any)?.message || err);
        });
      }
    }
  } catch (err) {
    console.error("Failed to dispatch webhooks:", err);
  }
}
