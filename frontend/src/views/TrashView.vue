<template>
  <div>
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
    >
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Trash</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Files deleted in the last 30 days can be restored
        </p>
      </div>
      <button
        v-if="files.length > 0"
        @click="showEmptyConfirm = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="3,6 5,6 21,6" />
          <path
            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          />
        </svg>
        Empty Trash
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div
        class="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"
      ></div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="files.length === 0"
      class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-12 text-center"
    >
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4"
      >
        <svg
          class="w-8 h-8 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="3,6 5,6 21,6" />
          <path
            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          />
        </svg>
      </div>
      <p class="text-slate-500 dark:text-slate-400">Trash is empty</p>
    </div>

    <!-- Files list -->
    <div v-else class="space-y-2">
      <div
        v-for="file in files"
        :key="file.id"
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 flex items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-400 shrink-0"
          >
            <svg
              class="w-5 h-5"
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
          <div class="min-w-0">
            <p class="text-sm font-medium text-slate-900 truncate">
              {{ file.originalFilename }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ formatSize(file.size) }} · Deleted
              {{ formatDate(file.deletedAt) }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="restoreFile(file.id)"
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
          >
            Restore
          </button>
          <button
            @click="permanentDelete(file.id)"
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>

    <!-- Empty Trash Confirm -->
    <ConfirmDialog
      :visible="showEmptyConfirm"
      title="Empty trash?"
      message="All files in trash will be permanently deleted. This cannot be undone."
      confirm-text="Empty Trash"
      @confirm="handleEmptyTrash"
      @cancel="showEmptyConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { filesApi } from "@/api";
import { useToast } from "@/composables/useToast";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const toast = useToast();
const files = ref<any[]>([]);
const loading = ref(true);
const showEmptyConfirm = ref(false);

onMounted(async () => {
  await fetchTrash();
});

async function fetchTrash() {
  loading.value = true;
  try {
    const { data } = await filesApi.listTrash();
    files.value = data.files;
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
    toast.success("File restored");
  } catch {
    toast.error("Failed to restore file");
  }
}

async function permanentDelete(id: string) {
  try {
    await filesApi.permanentDelete(id);
    files.value = files.value.filter((f) => f.id !== id);
    toast.success("File permanently deleted");
  } catch {
    toast.error("Failed to delete file");
  }
}

async function handleEmptyTrash() {
  showEmptyConfirm.value = false;
  try {
    await filesApi.emptyTrash();
    files.value = [];
    toast.success("Trash emptied");
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
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return d.toLocaleDateString();
}
</script>


