<template>
  <div>
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
    >
      <div>
        <h1
          class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white"
        >
          Files
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your uploaded files
        </p>
      </div>
      <router-link
        to="/upload"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Upload
      </router-link>
    </div>

    <!-- Folder breadcrumb -->
    <div
      v-if="folders.length > 0"
      class="flex items-center gap-2 mb-4 overflow-x-auto pb-1"
    >
      <button
        @click="
          currentFolder = '/';
          fetchFiles();
        "
        class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0"
        :class="
          currentFolder === '/'
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#22303c]'
        "
      >
        All Files
      </button>
      <button
        v-for="folder in folders"
        :key="folder.folder"
        @click="
          currentFolder = folder.folder;
          fetchFiles();
        "
        class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0"
        :class="
          currentFolder === folder.folder
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#22303c]'
        "
      >
        📁
        {{ folder.folder === "/" ? "Root" : folder.folder.split("/").pop() }}
        ({{ folder.file_count }})
      </button>
    </div>

    <!-- Filters -->
    <div
      class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 mb-4"
    >
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            placeholder="Search files..."
            @input="debouncedFetch"
            class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
        <select
          v-model="filterType"
          @change="fetchFiles"
          class="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
        >
          <option value="">All types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="application/pdf">PDFs</option>
        </select>
        <select
          v-model="sortOrder"
          @change="fetchFiles"
          class="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>
    </div>

    <!-- Selection bar -->
    <div
      v-if="selectedFiles.length > 0"
      class="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-3 mb-4 flex items-center justify-between flex-wrap gap-2"
    >
      <span class="text-sm font-medium text-primary-800 dark:text-primary-200"
        >{{ selectedFiles.length }} file(s) selected</span
      >
      <div class="flex gap-2">
        <button
          @click="handleBulkDownload"
          class="px-3 py-1.5 rounded-lg bg-white dark:bg-[#22303c] border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
        >
          Download ZIP
        </button>
        <button
          @click="handleBatchDelete"
          class="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="i in 8"
        :key="i"
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden animate-pulse"
      >
        <div class="aspect-4/3 bg-slate-200 dark:bg-[#22303c]"></div>
        <div class="p-3 space-y-2">
          <div class="h-4 bg-slate-200 dark:bg-[#22303c] rounded w-3/4"></div>
          <div class="h-3 bg-slate-200 dark:bg-[#22303c] rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="files.length === 0"
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
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <polyline points="14,2 14,8 20,8" />
        </svg>
      </div>
      <p class="text-slate-500 dark:text-slate-400">No files found</p>
    </div>

    <!-- Files Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="file in files"
        :key="file.id"
        class="group relative bg-white dark:bg-[#192734] rounded-xl border overflow-hidden hover:shadow-md transition-all"
        :class="
          selectedFiles.includes(file.id)
            ? 'border-primary-400 ring-2 ring-primary-100 dark:ring-primary-900/50'
            : 'border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
        "
      >
        <div class="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            :checked="selectedFiles.includes(file.id)"
            @change="toggleSelect(file.id)"
            class="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/20 cursor-pointer"
          />
        </div>

        <div
          class="aspect-4/3 bg-slate-100 dark:bg-[#22303c] flex items-center justify-center overflow-hidden cursor-pointer"
          @click="openPreview(file, files.indexOf(file))"
        >
          <img
            v-if="file.isImage && file.thumbnailUrl"
            :src="file.thumbnailUrl"
            :alt="file.originalFilename"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div
            v-else
            class="flex flex-col items-center gap-2"
            :class="getFileIconColor(file.mimeType)"
          >
            <div class="w-10 h-10">
              <component :is="FileIcon" :mime-type="file.mimeType" />
            </div>
            <span class="text-xs font-bold uppercase">{{
              getFileExtLabel(file.originalFilename)
            }}</span>
          </div>
        </div>

        <div class="p-3">
          <p
            class="text-sm font-medium text-slate-900 dark:text-white truncate"
            :title="file.originalFilename"
          >
            {{ file.originalFilename }}
          </p>
          <div class="flex items-center gap-2 mt-1.5">
            <span
              class="inline-flex px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#22303c] text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              {{ file.mimeType.split("/")[1]?.toUpperCase() }}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400">{{
              formatSize(file.size)
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination.totalPages > 1"
      class="flex items-center justify-center gap-3 mt-8"
    >
      <button
        :disabled="pagination.page <= 1"
        @click="goToPage(pagination.page - 1)"
        class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <span class="text-sm text-slate-500 dark:text-slate-400"
        >Page {{ pagination.page }} of {{ pagination.totalPages }}</span
      >
      <button
        :disabled="pagination.page >= pagination.totalPages"
        @click="goToPage(pagination.page + 1)"
        class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>

    <!-- Delete Confirm -->
    <ConfirmDialog
      :visible="showDeleteConfirm"
      title="Delete files?"
      :message="`Move ${selectedFiles.length} file(s) to trash?`"
      confirm-text="Move to Trash"
      @confirm="confirmBatchDelete"
      @cancel="showDeleteConfirm = false"
    />

    <!-- File Preview Modal -->
    <FilePreviewModal
      :visible="!!previewFile"
      :file="previewFile"
      :has-prev="previewIndex > 0"
      :has-next="previewIndex < files.length - 1"
      @close="previewFile = null"
      @prev="previewPrev"
      @next="previewNext"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { filesApi, foldersApi } from "@/api";
import { useToast } from "@/composables/useToast";
import {
  getFileIconColor,
  getFileExtLabel,
  FileIcon,
} from "@/utils/file-icons";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import FilePreviewModal from "@/components/FilePreviewModal.vue";

const toast = useToast();
const files = ref<any[]>([]);
const loading = ref(true);
const search = ref("");
const filterType = ref("");
const sortOrder = ref("desc");
const selectedFiles = ref<string[]>([]);
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
const showDeleteConfirm = ref(false);
const previewFile = ref<any>(null);
const previewIndex = ref(0);
const folders = ref<any[]>([]);
const currentFolder = ref("/");

let debounceTimer: ReturnType<typeof setTimeout>;

onMounted(() => {
  fetchFiles();
  fetchFolders();
});

async function fetchFolders() {
  try {
    const { data } = await foldersApi.list();
    folders.value = (data.folders || []).filter((f: any) => f.folder !== "/");
  } catch {
    /* ignore */
  }
}

async function fetchFiles() {
  loading.value = true;
  try {
    const params: Record<string, string> = {
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      order: sortOrder.value,
    };
    if (search.value) params.search = search.value;
    if (filterType.value === "image") params.isImage = "true";
    else if (filterType.value === "video") params.isVideo = "true";
    else if (filterType.value) params.mimeType = filterType.value;

    if (currentFolder.value !== "/") params.folder = currentFolder.value;

    const { data } = await filesApi.list(params);
    files.value = data.files;
    pagination.value = data.pagination;
  } catch {
    toast.error("Failed to load files");
  } finally {
    loading.value = false;
  }
}

function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchFiles, 300);
}

function goToPage(page: number) {
  pagination.value.page = page;
  fetchFiles();
}

function toggleSelect(fileId: string) {
  const idx = selectedFiles.value.indexOf(fileId);
  if (idx >= 0) selectedFiles.value.splice(idx, 1);
  else selectedFiles.value.push(fileId);
}

function handleBatchDelete() {
  showDeleteConfirm.value = true;
}

async function confirmBatchDelete() {
  showDeleteConfirm.value = false;
  try {
    await filesApi.batchDelete(selectedFiles.value);
    toast.success(`${selectedFiles.value.length} file(s) moved to trash`);
    selectedFiles.value = [];
    fetchFiles();
  } catch {
    toast.error("Failed to delete files");
  }
}

async function handleBulkDownload() {
  try {
    const response = await fetch("/api/files/download-zip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ fileIds: selectedFiles.value }),
    });
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uploadbox-files.tar";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started");
  } catch {
    toast.error("Failed to download files");
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

function openPreview(file: any, index: number) {
  previewFile.value = file;
  previewIndex.value = index;
}

function previewPrev() {
  if (previewIndex.value > 0) {
    previewIndex.value--;
    previewFile.value = files.value[previewIndex.value];
  }
}

function previewNext() {
  if (previewIndex.value < files.value.length - 1) {
    previewIndex.value++;
    previewFile.value = files.value[previewIndex.value];
  }
}
</script>
