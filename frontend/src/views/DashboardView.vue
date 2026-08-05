<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        Dashboard
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Overview of your file storage
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-500"
          >
            <svg
              class="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ stats.totalFiles }}
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Total Files
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500"
          >
            <svg
              class="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ formatSize(stats.totalSize) }}
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Storage Used
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500"
          >
            <svg
              class="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ stats.totalImages }}
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Images</p>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-900/30 text-pink-500"
          >
            <svg
              class="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon points="23,7 16,12 23,17" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ stats.totalVideos }}
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Videos</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Two column layout: Recent Activity + Recent Files -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      <!-- Recent Activity -->
      <div class="lg:col-span-1">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div
          class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 divide-y divide-slate-100 dark:divide-slate-700"
        >
          <div
            v-if="activities.length === 0"
            class="p-6 text-center text-sm text-slate-500 dark:text-slate-400"
          >
            No activity yet
          </div>
          <div
            v-for="activity in activities"
            :key="activity.id"
            class="px-4 py-3 flex items-start gap-3"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              :class="activityIconClass(activity.action)"
            >
              <svg
                v-if="activity.action === 'upload'"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <svg
                v-else-if="activity.action === 'delete'"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3,6 5,6 21,6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
              <svg
                v-else-if="activity.action === 'restore'"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="1,4 1,10 7,10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              <svg
                v-else
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm text-slate-900 dark:text-slate-100">
                <span class="font-medium capitalize">{{
                  activity.action
                }}</span>
                <span
                  v-if="activity.original_filename"
                  class="text-slate-500 dark:text-slate-400"
                >
                  — {{ activity.original_filename }}</span
                >
              </p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {{ timeAgo(activity.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Files -->
      <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Files
          </h2>
          <router-link
            to="/files"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >View all →</router-link
          >
        </div>

        <div
          v-if="recentFiles.length === 0"
          class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-12 text-center"
        >
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-[#22303c] mb-4"
          >
            <svg
              class="w-8 h-8 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p class="text-slate-500 dark:text-slate-400 mb-2">
            No files uploaded yet
          </p>
          <router-link
            to="/upload"
            class="text-sm text-primary-600 font-medium hover:text-primary-700"
            >Upload your first file →</router-link
          >
        </div>

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <div
            v-for="file in recentFiles"
            :key="file.id"
            class="group bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
            @click="$router.push(`/files/${file.id}`)"
          >
            <div
              class="aspect-4/3 bg-slate-100 dark:bg-[#22303c] flex items-center justify-center overflow-hidden"
            >
              <img
                v-if="file.isImage && file.thumbnailUrl"
                :src="file.thumbnailUrl"
                :alt="file.originalFilename"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="text-slate-400 dark:text-slate-500">
                <svg
                  class="w-10 h-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
              </div>
            </div>
            <div class="p-3">
              <p
                class="text-sm font-medium text-slate-900 dark:text-white truncate"
              >
                {{ file.originalFilename }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {{ formatSize(file.size) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { filesApi, activityApi } from "@/api";

const stats = ref({
  totalFiles: 0,
  totalSize: 0,
  totalImages: 0,
  totalVideos: 0,
});
const recentFiles = ref<any[]>([]);
const activities = ref<any[]>([]);

onMounted(async () => {
  try {
    const [statsRes, filesRes, actRes] = await Promise.all([
      filesApi.stats(),
      filesApi.list({ limit: "6", sort: "uploaded_at", order: "desc" }),
      activityApi.list(10).catch(() => ({ data: { activities: [] } })),
    ]);
    stats.value = statsRes.data;
    recentFiles.value = filesRes.data.files;
    activities.value = actRes.data.activities || [];
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
  }
});

function formatSize(bytes: number): string {
  const n = Number(bytes);
  if (!n || n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function timeAgo(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

function activityIconClass(action: string): string {
  switch (action) {
    case "upload":
      return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
    case "delete":
      return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
    case "restore":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    default:
      return "bg-slate-100 dark:bg-[#22303c] text-slate-500";
  }
}
</script>

