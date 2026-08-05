import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { getCachePath, fileExists } from "./storage";

/**
 * Generate a thumbnail from a video file using FFmpeg.
 * Captures a frame at 1 second (or first frame if video is shorter).
 */
export async function generateVideoThumbnail(
  videoPath: string,
  fileId: string,
): Promise<string | null> {
  const thumbnailPath = getCachePath(fileId, "video-thumb") + ".jpg";

  // Return cached thumbnail if exists
  if (fileExists(thumbnailPath)) {
    return thumbnailPath;
  }

  try {
    await runFFmpeg([
      "-i",
      videoPath,
      "-ss",
      "00:00:01",
      "-vframes",
      "1",
      "-vf",
      "scale=400:-1",
      "-q:v",
      "3",
      "-y",
      thumbnailPath,
    ]);

    // If FFmpeg failed to create the file (video shorter than 1s), try frame 0
    if (!fileExists(thumbnailPath)) {
      await runFFmpeg([
        "-i",
        videoPath,
        "-vframes",
        "1",
        "-vf",
        "scale=400:-1",
        "-q:v",
        "3",
        "-y",
        thumbnailPath,
      ]);
    }

    return fileExists(thumbnailPath) ? thumbnailPath : null;
  } catch (err) {
    console.error("Video thumbnail generation failed:", err);
    return null;
  }
}

/**
 * Get video duration in seconds using FFprobe.
 */
export async function getVideoDuration(
  videoPath: string,
): Promise<number | null> {
  try {
    const output = await runFFprobe([
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ]);

    const duration = parseFloat(output.trim());
    return isNaN(duration) ? null : Math.round(duration);
  } catch {
    return null;
  }
}

function runFFmpeg(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        // FFmpeg often outputs info to stderr even on success
        // Only reject if exit code is non-zero AND no output file was created
        resolve(stdout || stderr);
      }
    });

    proc.on("error", (err) => {
      // FFmpeg not installed - gracefully handle
      if ((err as any).code === "ENOENT") {
        console.warn(
          "FFmpeg not found. Video thumbnails will not be generated.",
        );
        resolve("");
      } else {
        reject(err);
      }
    });
  });
}

function runFFprobe(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffprobe", args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.on("close", (code) => {
      resolve(stdout);
    });

    proc.on("error", (err) => {
      if ((err as any).code === "ENOENT") {
        console.warn(
          "FFprobe not found. Video duration detection unavailable.",
        );
        resolve("");
      } else {
        reject(err);
      }
    });
  });
}
