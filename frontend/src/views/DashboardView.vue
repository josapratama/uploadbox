<template>
  <div class="space-y-8 max-w-7xl mx-auto">
    <!-- Welcome Hero Banner -->
    <div
      class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl"
    >
      <!-- Background ambient glow elements -->
      <div class="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
      <div class="absolute right-40 -bottom-20 w-60 h-60 rounded-full bg-violet-500/20 blur-2xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-2 max-w-xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Cloud Storage System Active
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Deliver assets at lightspeed.
          </h1>
          <p class="text-sm sm:text-base text-indigo-100/80 font-normal leading-relaxed">
            Upload files, generate CDN links with 1-click, and manage your media assets across all projects.
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <router-link
            to="/upload"
            class="px-5 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <svg class="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Upload New Files</span>
          </router-link>

          <router-link
            to="/files"
            class="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 backdrop-blur-md transition-all"
          >
            Browse Library
          </router-link>
        </div>
      </div>
    </div>

    <!-- 4 Stats Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- Total Files -->
      <div class="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Files</span>
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-baseline justify-between">
          <p class="text-3xl font-extrabold text-slate-900 dark:text-white">
            {{ stats.totalFiles }}
          </p>
          <span class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Active</span>
        </div>
      </div>

      <!-- Storage Used -->
      <div class="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Storage Used</span>
          <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-baseline justify-between">
          <p class="text-3xl font-extrabold text-slate-900 dark:text-white">
            {{ formatSize(stats.totalSize) }}
          </p>
          <span class="text-xs text-slate-400 font-mono">/ 5 GB</span>
        </div>
      </div>

      <!-- Images -->
      <div class="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Images</span>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-baseline justify-between">
          <p class="text-3xl font-extrabold text-slate-900 dark:text-white">
            {{ stats.totalImages }}
          </p>
          <span class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">WebP Ready</span>
        </div>
      </div>

      <!-- Videos -->
      <div class="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Videos</span>
          <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23,7 16,12 23,17" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-baseline justify-between">
          <p class="text-3xl font-extrabold text-slate-900 dark:text-white">
            {{ stats.totalVideos }}
          </p>
          <span class="text-xs text-rose-600 dark:text-rose-400 font-semibold">Fast Stream</span>
        </div>
      </div>
    </div>

    <!-- Storage Distribution Bar -->
    <div class="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Storage Breakdown</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Total usage across all formats</p>
        </div>
        <span class="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
          {{ formatSize(stats.totalSize) }} used of 5 GB
        </span>
      </div>

      <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 flex overflow-hidden p-0.5">
        <div class="bg-indigo-500 rounded-l-full h-full" style="width: 25%"></div>
        <div class="bg-emerald-500 h-full" style="width: 15%"></div>
        <div class="bg-rose-500 h-full" style="width: 10%"></div>
        <div class="bg-slate-200 dark:bg-slate-700/60 flex-1 h-full rounded-r-full"></div>
      </div>

      <div class="flex items-center gap-6 mt-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <span>Images ({{ stats.totalImages }})</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Videos ({{ stats.totalVideos }})</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Documents & Others</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          <span>Free Space</span>
        </div>
      </div>
    </div>

    <!-- Main Content: Recent Uploads & Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Files (2 Cols) -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Recent Uploads</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Quickly access and copy links</p>
          </div>
          <router-link
            to="/files"
            class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
          >
            <span>View All Files</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>

        <!-- Empty State -->
        <div
          v-if="recentFiles.length === 0"
          class="p-12 text-center rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">No uploads yet</p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">Start by uploading your first image or file</p>
          <router-link
            to="/upload"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs"
          >
            Upload Now
          </router-link>
        </div>

        <!-- Files Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="file in recentFiles"
            :key="file.id"
            class="group relative rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <!-- Preview Media Area -->
            <div
              class="aspect-4/3 bg-slate-100 dark:bg-slate-800/60 overflow-hidden flex items-center justify-center relative cursor-pointer"
              @click="$router.push(`/files/${file.id}`)"
            >
              <img
                v-if="file.isImage && (file.thumbnailUrl || file.cdnUrl)"
                :src="file.thumbnailUrl || file.cdnUrl"
                :alt="file.originalFilename"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div v-else class="text-slate-400 dark:text-slate-500 flex flex-col items-center gap-1.5">
                <svg v-if="file.isVideo" class="w-9 h-9 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <polygon points="23,7 16,12 23,17" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <svg v-else class="w-9 h-9 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
              </div>

              <!-- Quick action hover overlay -->
              <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  @click.stop="copyCdnUrl(file.cdnUrl)"
                  class="p-2 rounded-xl bg-white text-slate-900 hover:bg-indigo-50 hover:text-indigo-600 shadow-md transition-all scale-95 group-hover:scale-100"
                  title="Copy CDN URL"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <router-link
                  :to="`/files/${file.id}`"
                  class="p-2 rounded-xl bg-white text-slate-900 hover:bg-indigo-50 hover:text-indigo-600 shadow-md transition-all scale-95 group-hover:scale-100"
                  title="View Details"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </router-link>
              </div>
            </div>

            <!-- Card Bottom Meta -->
            <div class="p-3.5">
              <p
                class="text-xs font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                @click="$router.push(`/files/${file.id}`)"
              >
                {{ file.originalFilename }}
              </p>
              <div class="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                <span>{{ formatSize(file.size) }}</span>
                <span class="font-mono text-[10px]">{{ timeAgo(file.uploadedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Feed (1 Col) -->
      <div class="space-y-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Activity Log</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Events in real-time</p>
        </div>

        <div class="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          <div
            v-if="activities.length === 0"
            class="p-8 text-center text-xs text-slate-400 dark:text-slate-500"
          >
            No events logged yet
          </div>

          <div
            v-for="activity in activities"
            :key="activity.id"
            class="p-3.5 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
          >
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              :class="activityIconClass(activity.action)"
            >
              <svg v-if="activity.action === 'upload'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <svg v-else-if="activity.action === 'delete'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="3,6 5,6 21,6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
              </svg>
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-xs text-slate-800 dark:text-slate-200">
                <span class="font-bold capitalize">{{ activity.action }}</span>
                <span v-if="activity.original_filename" class="text-slate-500 dark:text-slate-400 truncate block">
                  {{ activity.original_filename }}
                </span>
              </p>
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">
                {{ timeAgo(activity.created_at) }}
              </span>
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
import { useToast } from "@/composables/useToast";

const toast = useToast();

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

function copyCdnUrl(url: string) {
  if (!url) return;
  navigator.clipboard.writeText(url);
  toast.success("CDN link copied to clipboard");
}

function formatSize(bytes: number): string {
  const n = Number(bytes);
  if (!n || n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function timeAgo(date: string): string {
  if (!date) return "";
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
      return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400";
    case "delete":
      return "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400";
    default:
      return "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400";
  }
}
</script>
