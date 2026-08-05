<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        Analytics
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Usage statistics and insights
      </p>
    </div>

    <!-- Usage Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5"
      >
        <p class="text-sm text-slate-500 dark:text-slate-400">Total Files</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {{ usage.total_files || 0 }}
        </p>
      </div>
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5"
      >
        <p class="text-sm text-slate-500 dark:text-slate-400">Storage Used</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {{ formatSize(usage.total_size) }}
        </p>
      </div>
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5"
      >
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Uploads (7 days)
        </p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {{ usage.uploads_last_week || 0 }}
        </p>
      </div>
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5"
      >
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Uploads (30 days)
        </p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {{ usage.uploads_last_month || 0 }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Upload History -->
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5"
      >
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          Upload History (30 days)
        </h3>
        <div
          v-if="history.length === 0"
          class="text-sm text-slate-500 dark:text-slate-400 text-center py-8"
        >
          No upload data yet
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="day in history"
            :key="day.date"
            class="flex items-center gap-3"
          >
            <span
              class="text-xs text-slate-500 dark:text-slate-400 w-20 shrink-0"
              >{{ formatDate(day.date) }}</span
            >
            <div
              class="flex-1 h-5 bg-slate-100 dark:bg-[#22303c] rounded-full overflow-hidden"
            >
              <div
                class="h-full bg-primary-500 rounded-full"
                :style="{ width: getBarWidth(day.count) }"
              ></div>
            </div>
            <span
              class="text-xs font-medium text-slate-700 dark:text-slate-300 w-8 text-right"
              >{{ day.count }}</span
            >
          </div>
        </div>
      </div>

      <!-- MIME Distribution -->
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5"
      >
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          File Type Distribution
        </h3>
        <div
          v-if="distribution.length === 0"
          class="text-sm text-slate-500 dark:text-slate-400 text-center py-8"
        >
          No data yet
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="item in distribution"
            :key="item.category"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-3 h-3 rounded-full"
                :class="getCategoryColor(item.category)"
              ></div>
              <span
                class="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize"
                >{{ item.category }}</span
              >
            </div>
            <div class="text-right">
              <span class="text-sm font-bold text-slate-900 dark:text-white">{{
                item.count
              }}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400 ml-2">{{
                formatSize(item.total_size)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Files -->
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 lg:col-span-2"
      >
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          Largest Files
        </h3>
        <div
          v-if="topFiles.length === 0"
          class="text-sm text-slate-500 dark:text-slate-400 text-center py-8"
        >
          No files yet
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="(file, i) in topFiles"
            :key="file.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#22303c]"
          >
            <span class="text-xs font-bold text-slate-400 w-5">{{
              i + 1
            }}</span>
            <div class="min-w-0 flex-1">
              <p
                class="text-sm font-medium text-slate-900 dark:text-white truncate"
              >
                {{ file.original_filename }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ file.mime_type }}
              </p>
            </div>
            <span
              class="text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0"
              >{{ formatSize(file.size) }}</span
            >
          </div>
        </div>
      </div>

      <!-- Storage Quota -->
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 lg:col-span-2"
      >
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          Storage Quota
        </h3>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <div
              class="h-4 bg-slate-100 dark:bg-[#22303c] rounded-full overflow-hidden"
            >
              <div
                class="h-full rounded-full transition-all"
                :class="
                  quotaPercent > 90
                    ? 'bg-red-500'
                    : quotaPercent > 70
                      ? 'bg-amber-500'
                      : 'bg-primary-500'
                "
                :style="{ width: quotaPercent + '%' }"
              ></div>
            </div>
          </div>
          <span
            class="text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0"
          >
            {{ formatSize(usage.total_size) }} / {{ formatSize(quota) }}
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {{ quotaPercent.toFixed(1) }}% used
        </p>
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
    usage.value = usageRes.data;
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
  return Math.max(2, (count / max) * 100) + "%";
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
