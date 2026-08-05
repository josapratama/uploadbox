import { db } from "../db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { config } from "../config";

/**
 * Clean up expired share links
 */
export async function cleanupExpiredShareLinks(): Promise<number> {
  const result = await db.execute(sql`
    DELETE FROM share_links
    WHERE expires_at IS NOT NULL AND expires_at < NOW()
    RETURNING id
  `);
  return result.rows.length;
}

/**
 * Clean up orphaned cache files (for deleted files)
 */
export async function cleanupOrphanedCache(): Promise<number> {
  const cacheDir = path.join(config.storagePath, "cache");
  if (!fs.existsSync(cacheDir)) return 0;

  let cleaned = 0;
  const subdirs = await fs.promises.readdir(cacheDir);

  for (const subdir of subdirs) {
    const subdirPath = path.join(cacheDir, subdir);
    const stat = await fs.promises.stat(subdirPath);
    if (!stat.isDirectory()) continue;

    const files = await fs.promises.readdir(subdirPath);
    for (const file of files) {
      // Extract file ID from cache filename (format: fileId_cacheKey.ext)
      const fileId = file.split("_")[0];
      if (!fileId || fileId.length < 8) continue;

      // Check if original file still exists in DB
      const result = await db.execute(sql`
        SELECT id FROM files WHERE id = ${fileId} AND is_deleted = false LIMIT 1
      `);

      if (result.rows.length === 0) {
        await fs.promises.unlink(path.join(subdirPath, file)).catch(() => {});
        cleaned++;
      }
    }
  }

  return cleaned;
}

/**
 * Permanently delete files that have been in trash for more than 30 days
 */
export async function cleanupOldTrash(): Promise<number> {
  const result = await db.execute(sql`
    SELECT id, storage_path FROM files
    WHERE is_deleted = true AND deleted_at < NOW() - INTERVAL '30 days'
  `);

  for (const row of result.rows as any[]) {
    if (row.storage_path && fs.existsSync(row.storage_path)) {
      await fs.promises.unlink(row.storage_path).catch(() => {});
    }
  }

  await db.execute(sql`
    DELETE FROM files
    WHERE is_deleted = true AND deleted_at < NOW() - INTERVAL '30 days'
  `);

  return result.rows.length;
}

/**
 * Run all cleanup tasks
 */
export async function runCleanup(): Promise<{
  shareLinks: number;
  cache: number;
  trash: number;
}> {
  const shareLinks = await cleanupExpiredShareLinks();
  const cache = await cleanupOrphanedCache();
  const trash = await cleanupOldTrash();
  return { shareLinks, cache, trash };
}
