<template>
  <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Storage Hygiene & CDN Cache</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
              NVMe Flash
            </span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Monitor disk footprint on server storage and purge generated image/video variants with 1-click.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="fetchBreakdown"
          :disabled="loading"
          class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Loading...' : '🔄 Refresh' }}
        </button>
        <button
          @click="handlePurgeCache"
          :disabled="purging || !breakdown || breakdown.cacheBytes === 0"
          class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 flex items-center gap-1.5"
        >
          <span>{{ purging ? 'Purging Cache...' : '🧹 Purge CDN Cache' }}</span>
        </button>
      </div>
    </div>

    <!-- Alert / Feedback -->
    <div
      v-if="purgeMessage"
      class="p-3 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-between"
    >
      <span>{{ purgeMessage }}</span>
      <button @click="purgeMessage = null" class="text-slate-400 hover:text-slate-600 ml-2">✕</button>
    </div>

    <!-- 4 KPI Metrics -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Original Assets</span>
        <span class="text-lg font-bold font-mono text-slate-900 dark:text-white block">
          {{ breakdown?.originalFilesHuman || '0 B' }}
        </span>
        <span class="text-[10px] text-slate-400">{{ breakdown?.filesCount || 0 }} files active</span>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">CDN Cache</span>
        <span class="text-lg font-bold font-mono text-amber-500 block">
          {{ breakdown?.cacheHuman || '0 B' }}
        </span>
        <span class="text-[10px] text-slate-400">{{ breakdown?.cacheFilesCount || 0 }} generated variants</span>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Temp Chunks</span>
        <span class="text-lg font-bold font-mono text-cyan-500 block">
          {{ breakdown?.multipartHuman || '0 B' }}
        </span>
        <span class="text-[10px] text-slate-400">Multipart buffer</span>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Trash Bin</span>
        <span class="text-lg font-bold font-mono text-slate-600 dark:text-slate-300 block">
          {{ breakdown?.trashHuman || '0 B' }}
        </span>
        <span class="text-[10px] text-slate-400">{{ breakdown?.trashFilesCount || 0 }} items</span>
      </div>
    </div>

    <!-- Media Distribution Breakdown -->
    <div class="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
      <div class="flex items-center justify-between text-xs">
        <span class="font-bold text-slate-700 dark:text-slate-300">File Type Storage Distribution</span>
        <span class="text-slate-400 font-mono">{{ breakdown?.totalStorageHuman || '0 B' }} total used</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        <div class="p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
          <div class="font-semibold">🖼️ Images</div>
          <div class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ breakdown?.mimeBreakdown?.images?.human || '0 B' }} ({{ breakdown?.mimeBreakdown?.images?.count || 0 }})
          </div>
        </div>

        <div class="p-2 rounded-lg bg-purple-500/5 border border-purple-500/20 text-purple-600 dark:text-purple-400">
          <div class="font-semibold">🎬 Videos</div>
          <div class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ breakdown?.mimeBreakdown?.videos?.human || '0 B' }} ({{ breakdown?.mimeBreakdown?.videos?.count || 0 }})
          </div>
        </div>

        <div class="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <div class="font-semibold">📄 Documents</div>
          <div class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ breakdown?.mimeBreakdown?.documents?.human || '0 B' }} ({{ breakdown?.mimeBreakdown?.documents?.count || 0 }})
          </div>
        </div>

        <div class="p-2 rounded-lg bg-slate-500/5 border border-slate-500/20 text-slate-600 dark:text-slate-400">
          <div class="font-semibold">📦 Others</div>
          <div class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ breakdown?.mimeBreakdown?.other?.human || '0 B' }} ({{ breakdown?.mimeBreakdown?.other?.count || 0 }})
          </div>
        </div>
      </div>
    </div>

    <!-- Safety Notice -->
    <div class="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2">
      <span class="text-sm">💡</span>
      <p>
        <strong>Zero Risk Purge:</strong> File asli Anda 100% aman dan tidak akan terhapus saat purge cache. Hanya varian thumbnail dan resize sementara yang dibersihkan, dan akan di-generate ulang secara otomatis saat diakses kembali oleh pengguna.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { filesApi } from "@/api";
import { useToast } from "@/composables/useToast";

const toast = useToast();
const loading = ref(false);
const purging = ref(false);
const breakdown = ref<any>(null);
const purgeMessage = ref<string | null>(null);

async function fetchBreakdown() {
  loading.value = true;
  try {
    const { data } = await filesApi.storageBreakdown();
    breakdown.value = data;
  } catch (err: any) {
    console.error("Failed to load storage breakdown", err);
  } finally {
    loading.value = false;
  }
}

async function handlePurgeCache() {
  purging.value = true;
  purgeMessage.value = null;
  try {
    const { data } = await filesApi.purgeCache();
    purgeMessage.value = data.message || "Cache berhasil dibersihkan";
    toast.success("CDN cache purged successfully");
    await fetchBreakdown();
  } catch (err: any) {
    toast.error("Failed to purge CDN cache");
  } finally {
    purging.value = false;
  }
}

onMounted(() => {
  fetchBreakdown();
});
</script>
