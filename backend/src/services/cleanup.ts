import { db } from "../db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { config } from "../config";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

async function getDirSize(dirPath: string): Promise<{ size: number; count: number }> {
  if (!fs.existsSync(dirPath)) return { size: 0, count: 0 };
  let totalSize = 0;
  let fileCount = 0;

  async function walk(current: string) {
    const entries = await fs.promises.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        try {
          const stats = await fs.promises.stat(fullPath);
          totalSize += stats.size;
          fileCount++;
        } catch {}
      }
    }
  }

  await walk(dirPath);
  return { size: totalSize, count: fileCount };
}

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
      const fileId = file.split("_")[0];
      if (!fileId || fileId.length < 8) continue;

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
 * Purge all generated CDN transformations cache
 */
export async function purgeAllCdnCache(): Promise<{
  freedBytes: number;
  freedHuman: string;
  filesRemoved: number;
}> {
  const cacheDir = path.join(config.storagePath, "cache");
  const before = await getDirSize(cacheDir);

  if (fs.existsSync(cacheDir)) {
    const subdirs = await fs.promises.readdir(cacheDir);
    for (const sub of subdirs) {
      const subPath = path.join(cacheDir, sub);
      await fs.promises.rm(subPath, { recursive: true, force: true }).catch(() => {});
    }
  }

  return {
    freedBytes: before.size,
    freedHuman: formatBytes(before.size),
    filesRemoved: before.count,
  };
}

/**
 * Get comprehensive disk & storage breakdown
 */
export async function getStorageBreakdown(projectId?: string): Promise<{
  originalFilesBytes: number;
  originalFilesHuman: string;
  cacheBytes: number;
  cacheHuman: string;
  multipartBytes: number;
  multipartHuman: string;
  trashBytes: number;
  trashHuman: string;
  totalStorageBytes: number;
  totalStorageHuman: string;
  filesCount: number;
  cacheFilesCount: number;
  trashFilesCount: number;
  mimeBreakdown: {
    images: { count: number; bytes: number; human: string };
    videos: { count: number; bytes: number; human: string };
    documents: { count: number; bytes: number; human: string };
    other: { count: number; bytes: number; human: string };
  };
}> {
  const projectFilter = projectId ? sql`AND project_id = ${projectId}` : sql``;

  // Active files
  const activeRes = await db.execute(sql`
    SELECT
      count(*)::int as total_count,
      coalesce(sum(size), 0)::numeric as total_size,
      count(*) FILTER (WHERE is_image = true)::int as image_count,
      coalesce(sum(size) FILTER (WHERE is_image = true), 0)::numeric as image_size,
      count(*) FILTER (WHERE is_video = true)::int as video_count,
      coalesce(sum(size) FILTER (WHERE is_video = true), 0)::numeric as video_size,
      count(*) FILTER (WHERE mime_type LIKE 'application/pdf%' OR mime_type LIKE 'text/%')::int as doc_count,
      coalesce(sum(size) FILTER (WHERE mime_type LIKE 'application/pdf%' OR mime_type LIKE 'text/%'), 0)::numeric as doc_size
    FROM files
    WHERE is_deleted = false ${projectFilter}
  `);

  // Trash files
  const trashRes = await db.execute(sql`
    SELECT
      count(*)::int as trash_count,
      coalesce(sum(size), 0)::numeric as trash_size
    FROM files
    WHERE is_deleted = true ${projectFilter}
  `);

  const aRow = activeRes.rows[0] as any;
  const tRow = trashRes.rows[0] as any;

  const originalFilesBytes = Number(aRow?.total_size || 0);
  const trashBytes = Number(tRow?.trash_size || 0);

  const cacheDir = path.join(config.storagePath, "cache");
  const multipartDir = path.join(config.storagePath, "multipart");

  const cacheStats = await getDirSize(cacheDir);
  const multipartStats = await getDirSize(multipartDir);

  const imgBytes = Number(aRow?.image_size || 0);
  const vidBytes = Number(aRow?.video_size || 0);
  const docBytes = Number(aRow?.doc_size || 0);
  const otherBytes = Math.max(0, originalFilesBytes - imgBytes - vidBytes - docBytes);

  const imgCount = Number(aRow?.image_count || 0);
  const vidCount = Number(aRow?.video_count || 0);
  const docCount = Number(aRow?.doc_count || 0);
  const otherCount = Math.max(0, Number(aRow?.total_count || 0) - imgCount - vidCount - docCount);

  const totalStorageBytes = originalFilesBytes + cacheStats.size + multipartStats.size;

  return {
    originalFilesBytes,
    originalFilesHuman: formatBytes(originalFilesBytes),
    cacheBytes: cacheStats.size,
    cacheHuman: formatBytes(cacheStats.size),
    multipartBytes: multipartStats.size,
    multipartHuman: formatBytes(multipartStats.size),
    trashBytes,
    trashHuman: formatBytes(trashBytes),
    totalStorageBytes,
    totalStorageHuman: formatBytes(totalStorageBytes),
    filesCount: Number(aRow?.total_count || 0),
    cacheFilesCount: cacheStats.count,
    trashFilesCount: Number(tRow?.trash_count || 0),
    mimeBreakdown: {
      images: { count: imgCount, bytes: imgBytes, human: formatBytes(imgBytes) },
      videos: { count: vidCount, bytes: vidBytes, human: formatBytes(vidBytes) },
      documents: { count: docCount, bytes: docBytes, human: formatBytes(docBytes) },
      other: { count: otherCount, bytes: otherBytes, human: formatBytes(otherBytes) },
    },
  };
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
