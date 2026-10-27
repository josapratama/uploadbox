<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {{ $t('trash.title') || 'Trash Bin' }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {{ $t('trash.notice') || 'Files in trash will be permanently purged after 30 days' }}
          </p>
        </div>
      </div>

      <div v-if="files.length > 0" class="flex items-center gap-3">
        <button
          @click="showEmptyConfirm = true"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-red-500/20 transition-all active:scale-95"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          {{ $t('trash.empty_trash') || 'Empty Trash' }} ({{ files.length }})
        </button>
      </div>
    </div>

    <!-- Notice Banner -->
    <div v-if="files.length > 0" class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
      <svg class="w-5 h-5 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>
        {{ $t('trash.restore_banner') || 'Need these files back? Restoring them will instantly put them back into your main library and re-activate their CDN delivery links.' }}
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24">
      <div class="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
      <p class="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">{{ $t('status.loading') || 'Loading trash bin...' }}</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="files.length === 0"
      class="glass-card rounded-3xl p-12 text-center max-w-md mx-auto"
    >
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4 ring-8 ring-emerald-500/5">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('trash.empty_title') || 'Trash is completely empty' }}</h3>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('trash.empty_desc') || 'No deleted assets here. Your workspace is tidy and clean!' }}
      </p>
    </div>

    <!-- Files List -->
    <div v-else class="space-y-3">
      <div
        v-for="file in files"
        :key="file.id"
        class="glass-card-hover rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/80 dark:border-slate-800/80"
      >
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {{ file.originalFilename }}
            </p>
            <div class="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span class="font-medium">{{ formatSize(file.size) }}</span>
              <span>·</span>
              <span class="inline-flex items-center gap-1">
                <svg class="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Deleted {{ formatDate(file.deletedAt) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            @click="restoreFile(file.id)"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 transition-colors"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 14 4 9 9 4" />
              <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
            </svg>
            {{ $t('trash.restore') || 'Restore' }}
          </button>
          <button
            @click="permanentDelete(file.id)"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            {{ $t('trash.purge_forever') || 'Purge Forever' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Empty Dialog -->
    <ConfirmDialog
      :visible="showEmptyConfirm"
      :title="$t('trash.confirm_empty_title') || 'Empty trash bin?'"
      :message="$t('trash.confirm_empty_message') || 'All files in the trash bin will be permanently erased from disk. This operation is irreversible.'"
      :confirm-text="$t('trash.confirm_empty_btn') || 'Permanently Delete All'"
      type="danger"
      @confirm="handleEmptyTrash"
      @cancel="showEmptyConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { filesApi } from "@/api";
import { useToast } from "@/composables/useToast";
import { useI18n } from "@/composables/useI18n";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const { t } = useI18n();

const toast = useToast();
const files = ref<any[]>([]);
const loading = ref(true);
const showEmptyConfirm = ref(false);

onMounted(fetchTrash);

async function fetchTrash() {
  loading.value = true;
  try {
    const { data } = await filesApi.listTrash();
    files.value = data.files || [];
  } catch {
    toast.error("Failed to load trash");
  } finally {
    loading.value = false;
  }
}

async function restoreFile(id: string) {
  try {
    await filesApi.restore(id);
    files.value = files.value.filter((f) => f.id !== id);
    toast.success("File restored successfully");
  } catch {
    toast.error("Failed to restore file");
  }
}

async function permanentDelete(id: string) {
  try {
    await filesApi.permanentDelete(id);
    files.value = files.value.filter((f) => f.id !== id);
    toast.success("File permanently purged");
  } catch {
    toast.error("Failed to delete file");
  }
}

async function handleEmptyTrash() {
  showEmptyConfirm.value = false;
  try {
    await filesApi.emptyTrash();
    files.value = [];
    toast.success("Trash emptied completely");
  } catch {
    toast.error("Failed to empty trash");
  }
}

function formatSize(bytes: number): string {
  const n = Number(bytes);
  if (!n || n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(date: string): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return t("time.today") || "Today";
  if (days === 1) return t("time.yesterday") || "Yesterday";
  if (days < 30) return t("time.days_ago", { days }) || `${days} days ago`;
  return d.toLocaleDateString();
}
</script>
