<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {{ $t('analytics.title') || 'Usage & Analytics' }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {{ $t('analytics.subtitle') || 'Real-time storage insights, upload trends, and distribution' }}
          </p>
        </div>
      </div>

      <!-- Live Indicator -->
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold self-start sm:self-auto">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        {{ $t('analytics.live_metrics') || 'Live Metrics' }}
      </div>
    </div>

    <!-- Stat Cards (4 columns) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('analytics.total_assets') || 'Total Assets' }}</span>
          <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            </svg>
          </div>
        </div>
        <p class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
          {{ usage.total_files || 0 }}
        </p>
        <p class="text-[11px] text-slate-400 mt-1">{{ $t('analytics.total_assets_sub') || 'Stored across all folders' }}</p>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('analytics.storage_used') || 'Storage Used' }}</span>
          <div class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </div>
        </div>
        <p class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
          {{ formatSize(usage.total_size) }}
        </p>
        <p class="text-[11px] text-slate-400 mt-1">{{ quotaPercent.toFixed(1) }}% of {{ formatSize(quota) }} quota</p>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uploads (7 Days)</span>
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>
        <p class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
          {{ usage.uploads_last_week || 0 }}
        </p>
        <p class="text-[11px] text-slate-400 mt-1">Recent uploads this week</p>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uploads (30 Days)</span>
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>
        <p class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
          {{ usage.uploads_last_month || 0 }}
        </p>
        <p class="text-[11px] text-slate-400 mt-1">Monthly upload volume</p>
      </div>
    </div>

    <!-- Storage Quota Bar -->
    <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-slate-900 dark:text-white">Workspace Storage Quota</span>
          <span
            class="px-2 py-0.5 rounded-full text-[11px] font-bold"
            :class="quotaPercent > 90 ? 'bg-red-500/10 text-red-500' : quotaPercent > 75 ? 'bg-amber-500/10 text-amber-500' : 'bg-primary-500/10 text-primary-500'"
          >
            {{ quotaPercent.toFixed(1) }}% Used
          </span>
        </div>
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {{ formatSize(usage.total_size) }} of {{ formatSize(quota) }} allocated
        </span>
      </div>

      <div class="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="
            quotaPercent > 90
              ? 'bg-gradient-to-r from-red-500 to-rose-600'
              : quotaPercent > 70
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-primary-500 to-indigo-600'
          "
          :style="{ width: Math.max(quotaPercent, 1) + '%' }"
        ></div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Upload History (30 Days) -->
      <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Upload History (30 Days)
          </h3>
          <span class="text-xs text-slate-400">Activity volume</span>
        </div>

        <div v-if="history.length === 0" class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center py-12">
          No historical upload events recorded yet.
        </div>

        <div v-else class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          <div
            v-for="day in history"
            :key="day.date"
            class="flex items-center gap-3 text-xs"
          >
            <span class="w-20 font-medium text-slate-500 dark:text-slate-400 shrink-0">
              {{ formatDate(day.date) }}
            </span>
            <div class="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-300"
                :style="{ width: getBarWidth(day.count) }"
              ></div>
            </div>
            <span class="w-8 text-right font-bold text-slate-700 dark:text-slate-300 shrink-0">
              {{ day.count }}
            </span>
          </div>
        </div>
      </div>

      <!-- MIME Distribution -->
      <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            File Type Breakdown
          </h3>
          <span class="text-xs text-slate-400">By format category</span>
        </div>

        <div v-if="distribution.length === 0" class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center py-12">
          No format distribution data yet.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="item in distribution"
            :key="item.category"
            class="space-y-1.5"
          >
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 capitalize">
                <span class="w-2.5 h-2.5 rounded-full" :class="getCategoryColor(item.category)"></span>
                {{ item.category }}
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900 dark:text-white">{{ item.count }} files</span>
                <span class="text-slate-400">({{ formatSize(item.total_size) }})</span>
              </div>
            </div>
            <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full"
                :class="getCategoryColor(item.category)"
                :style="{ width: getCategoryPercent(item.total_size) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Largest Files -->
      <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 lg:col-span-2">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Top Largest Assets
          </h3>
          <span class="text-xs text-slate-400">Highest storage consumers</span>
        </div>

        <div v-if="topFiles.length === 0" class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center py-12">
          No files uploaded yet.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(file, i) in topFiles"
            :key="file.id"
            class="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 hover:border-primary-500/30 transition-all"
          >
            <!-- Rank Badge -->
            <div
              class="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0"
              :class="
                i === 0
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : i === 1
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    : i === 2
                      ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                      : 'text-slate-400'
              "
            >
              {{ i + 1 }}
            </div>

            <div class="min-w-0 flex-1">
              <a
                :href="'/files/' + file.id"
                class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate block hover:text-primary-500 transition-colors"
              >
                {{ file.original_filename }}
              </a>
              <p class="text-[11px] text-slate-400">
                {{ file.mime_type || 'Unknown MIME' }}
              </p>
            </div>

            <span class="text-xs sm:text-sm font-bold font-mono text-slate-800 dark:text-slate-200 shrink-0">
              {{ formatSize(file.size) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { analyticsApi, filesApi } from "@/api";

const usage = ref<any>({});
const history = ref<any[]>([]);
const topFiles = ref<any[]>([]);
const distribution = ref<any[]>([]);
const quota = ref(5368709120); // 5GB default

onMounted(async () => {
  try {
    const [usageRes, histRes, topRes, distRes, quotaRes] = await Promise.all([
      analyticsApi.usage(),
      analyticsApi.uploadsHistory().catch(() => ({ data: { history: [] } })),
      analyticsApi.topFiles().catch(() => ({ data: { files: [] } })),
      analyticsApi
        .mimeDistribution()
        .catch(() => ({ data: { distribution: [] } })),
      filesApi.quota().catch(() => ({ data: { quota: 5368709120 } })),
    ]);
    usage.value = usageRes.data || {};
    history.value = histRes.data.history || [];
    topFiles.value = topRes.data.files || [];
    distribution.value = distRes.data.distribution || [];
    quota.value = Number(quotaRes.data?.quota) || 5368709120;
  } catch {
    /* ignore */
  }
});

const quotaPercent = computed(() => {
  const used = Number(usage.value.total_size) || 0;
  return quota.value > 0 ? Math.min(100, (used / quota.value) * 100) : 0;
});

function getBarWidth(count: number): string {
  const max = Math.max(...history.value.map((h: any) => h.count), 1);
  return Math.max(3, (count / max) * 100) + "%";
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    image: "bg-emerald-500",
    video: "bg-pink-500",
    audio: "bg-purple-500",
    application: "bg-blue-500",
    text: "bg-amber-500",
  };
  return colors[category] || "bg-slate-400";
}

function getCategoryPercent(size: number): number {
  const total = Number(usage.value.total_size) || 1;
  return Math.min(100, Math.max(2, (Number(size) / total) * 100));
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

function formatSize(bytes: number): string {
  const n = Number(bytes);
  if (!n || n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
</script>
