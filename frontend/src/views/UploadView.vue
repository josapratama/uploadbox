<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Upload Center
          </h1>
          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
            CDN Ready
          </span>
        </div>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload images, videos, audio, and documents. Direct CDN links generated instantly.
        </p>
      </div>

      <!-- Quick stats/action button -->
      <div v-if="uploads.length > 0" class="flex items-center gap-2">
        <button
          v-if="hasCompletedUploads"
          @click="clearCompleted"
          class="px-3 py-1.5 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
        >
          Clear Finished ({{ completedCount }})
        </button>
      </div>
    </div>

    <!-- Main Upload Mode Tabs -->
    <div class="flex items-center gap-2 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl max-w-fit">
      <button
        @click="activeTab = 'file'"
        class="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
        :class="
          activeTab === 'file'
            ? 'bg-white dark:bg-[#0f172a] text-indigo-600 dark:text-indigo-400 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        "
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17,8 12,3 7,8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span>Browse & Drag Drop</span>
      </button>

      <button
        @click="activeTab = 'url'"
        class="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
        :class="
          activeTab === 'url'
            ? 'bg-white dark:bg-[#0f172a] text-indigo-600 dark:text-indigo-400 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        "
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span>Upload from URL</span>
      </button>
    </div>

    <!-- TAB 1: File Dropzone Area -->
    <div v-show="activeTab === 'file'" class="space-y-4">
      <div
        class="relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer group"
        :class="[
          isDragging
            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 scale-[1.008]'
            : 'border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-[#0f172a]/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50/70 dark:hover:bg-slate-800/40',
        ]"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <!-- Background subtle glow -->
        <div class="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative flex flex-col items-center justify-center py-16 px-6 text-center">
          <!-- Animated Icon Badge -->
          <div
            class="relative flex items-center justify-center w-20 h-20 rounded-2xl mb-5 transition-transform duration-300 group-hover:scale-110"
            :class="
              isDragging
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/40'
                : 'bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white'
            "
          >
            <svg
              class="w-10 h-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-1">
            <span class="text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop files here
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">
            Support high-res images, 4K videos, audio, PDF, ZIP and documents up to 5 GB per file.
          </p>

          <!-- Clipboard paste pill indicator -->
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80">
            <svg class="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            </svg>
            <span>Tip: You can also paste directly with <kbd class="px-1 py-0.5 rounded bg-white dark:bg-slate-700 font-mono text-[10px] shadow-xs">Ctrl + V</kbd></span>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          multiple
          hidden
          @change="handleFileSelect"
        />
      </div>

      <!-- Target Folder Selector -->
      <div class="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Target Folder</p>
            <p class="text-[11px] text-slate-400">Organize where files are stored</p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div class="flex items-center gap-1">
            <button
              v-for="chip in folderChips"
              :key="chip"
              @click="targetFolder = chip"
              type="button"
              class="px-2.5 py-1 text-xs rounded-lg font-mono transition-colors"
              :class="targetFolder === chip ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'"
            >
              {{ chip }}
            </button>
          </div>
          <input
            v-model="targetFolder"
            type="text"
            placeholder="/custom-folder"
            class="px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white w-36 sm:w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>
    </div>

    <!-- TAB 2: Upload from URL Area -->
    <div v-show="activeTab === 'url'" class="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div>
        <h3 class="text-base font-bold text-slate-800 dark:text-white">Fetch & Upload Remote File</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Paste any publicly accessible URL. UploadBox will download the asset directly to your storage.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <input
            v-model="urlInput"
            type="url"
            placeholder="https://example.com/assets/banner.png"
            @keyup.enter="handleUrlUpload"
            class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-mono"
          />
          <div class="absolute left-3.5 top-3.5 text-slate-400">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
        </div>

        <button
          @click="handleUrlUpload"
          :disabled="!urlInput || urlUploading"
          class="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <svg v-if="urlUploading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span>{{ urlUploading ? "Fetching..." : "Fetch & Upload" }}</span>
        </button>
      </div>
    </div>

    <!-- Active Uploads Queue -->
    <div v-if="uploads.length > 0" class="space-y-3 pt-2">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Active Transfers</span>
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {{ uploads.length }}
          </span>
        </h3>
      </div>

      <div class="space-y-3">
        <div
          v-for="upload in uploads"
          :key="upload.id"
          class="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div class="flex items-center justify-between gap-3">
            <!-- Thumbnail / File Icon -->
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-700/50">
                <img
                  v-if="upload.thumbnail"
                  :src="upload.thumbnail"
                  class="w-full h-full object-cover"
                />
                <svg v-else class="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
              </div>

              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {{ upload.filename }}
                </p>
                <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>{{ formatSize(upload.size) }}</span>
                  <span>•</span>
                  <span
                    :class="[
                      upload.status === 'completed'
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1'
                        : upload.status === 'error'
                          ? 'text-red-500 font-semibold'
                          : 'text-indigo-600 dark:text-indigo-400 font-medium',
                    ]"
                  >
                    <span v-if="upload.status === 'completed'">✓ Uploaded</span>
                    <span v-else-if="upload.status === 'error'">Failed</span>
                    <span v-else>Uploading {{ upload.progress }}%</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                v-if="upload.status === 'uploading'"
                @click="cancelUpload(upload.id)"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                Cancel
              </button>
              <button
                v-if="upload.status === 'error'"
                @click="retryUpload(upload.id)"
                class="px-3 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
              >
                Retry
              </button>
              <button
                @click="removeUpload(upload.id)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Dismiss"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="upload.status === 'uploading'" class="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-150 rounded-full"
              :style="{ width: `${upload.progress}%` }"
            ></div>
          </div>

          <!-- Generated CDN URL bar when completed -->
          <div v-if="upload.status === 'completed' && upload.cdnUrl" class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <input
                  :value="upload.cdnUrl"
                  readonly
                  @focus="($event.target as HTMLInputElement).select()"
                  class="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs font-mono text-slate-700 dark:text-slate-200 select-all focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <svg class="w-3.5 h-3.5 text-indigo-500 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>

              <!-- 1-Click Copy Button with Visual Feedback -->
              <button
                @click="copyUrl(upload.cdnUrl!)"
                class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
                :class="
                  copiedUrl === upload.cdnUrl
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                "
              >
                <svg v-if="copiedUrl === upload.cdnUrl" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>{{ copiedUrl === upload.cdnUrl ? 'Copied!' : 'Copy CDN' }}</span>
              </button>

              <!-- Open Link -->
              <a
                :href="upload.cdnUrl"
                target="_blank"
                class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Open in new tab"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { uploadApi } from "@/api";
import { useToast } from "@/composables/useToast";

const toast = useToast();

interface UploadItem {
  id: string;
  filename: string;
  size: number;
  progress: number;
  status: "uploading" | "completed" | "error";
  cdnUrl?: string;
  thumbnail?: string;
  abortController?: AbortController;
  file?: File;
}

const activeTab = ref<"file" | "url">("file");
const fileInput = ref<HTMLInputElement>();
const isDragging = ref(false);
const urlInput = ref("");
const urlUploading = ref(false);
const targetFolder = ref("/");
const folderChips = ["/", "/images", "/documents", "/media", "/backups"];
const uploads = ref<UploadItem[]>([]);
const copiedUrl = ref<string | null>(null);

const completedCount = computed(
  () => uploads.value.filter((u) => u.status === "completed").length,
);
const hasCompletedUploads = computed(() => completedCount.value > 0);

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    uploadFiles(Array.from(input.files));
    input.value = "";
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files) {
    uploadFiles(Array.from(event.dataTransfer.files));
  }
}

// Global Clipboard Paste Listener
function handlePaste(event: ClipboardEvent) {
  if (event.clipboardData?.files && event.clipboardData.files.length > 0) {
    uploadFiles(Array.from(event.clipboardData.files));
  }
}

onMounted(() => {
  window.addEventListener("paste", handlePaste);
});

onUnmounted(() => {
  window.removeEventListener("paste", handlePaste);
});

function createThumbnail(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

async function uploadFiles(files: File[]) {
  for (const file of files) {
    const thumbnail = await createThumbnail(file);
    const abortController = new AbortController();

    const uploadItem = reactive<UploadItem>({
      id: Math.random().toString(36).substring(7),
      filename: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
      thumbnail,
      abortController,
      file,
    });

    uploads.value.unshift(uploadItem);

    try {
      const { data } = await uploadApi.file(
        file,
        (progress) => {
          uploadItem.progress = progress;
        },
        abortController.signal,
        targetFolder.value,
      );

      uploadItem.status = "completed";
      uploadItem.progress = 100;
      uploadItem.cdnUrl = data.cdnUrl;
      toast.success(`${file.name} uploaded successfully`);
    } catch (err: any) {
      if (err?.code === "ERR_CANCELED" || err?.message === "canceled") {
        uploadItem.status = "error";
        uploadItem.progress = 0;
      } else {
        uploadItem.status = "error";
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }
}

function cancelUpload(id: string) {
  const item = uploads.value.find((u) => u.id === id);
  if (item?.abortController) {
    item.abortController.abort();
    item.status = "error";
    item.progress = 0;
    toast.info("Upload cancelled");
  }
}

async function retryUpload(id: string) {
  const item = uploads.value.find((u) => u.id === id);
  if (!item?.file) return;

  const abortController = new AbortController();
  item.abortController = abortController;
  item.status = "uploading";
  item.progress = 0;

  try {
    const { data } = await uploadApi.file(
      item.file,
      (progress) => {
        item.progress = progress;
      },
      abortController.signal,
      targetFolder.value,
    );

    item.status = "completed";
    item.progress = 100;
    item.cdnUrl = data.cdnUrl;
    toast.success(`${item.filename} uploaded successfully`);
  } catch (err: any) {
    if (err?.code !== "ERR_CANCELED") {
      item.status = "error";
      toast.error(`Failed to upload ${item.filename}`);
    }
  }
}

function removeUpload(id: string) {
  const idx = uploads.value.findIndex((u) => u.id === id);
  if (idx >= 0) uploads.value.splice(idx, 1);
}

function clearCompleted() {
  uploads.value = uploads.value.filter((u) => u.status !== "completed");
}

async function handleUrlUpload() {
  if (!urlInput.value) return;

  urlUploading.value = true;
  const uploadItem = reactive<UploadItem>({
    id: Math.random().toString(36).substring(7),
    filename: urlInput.value.split("/").pop() || "downloaded-file",
    size: 0,
    progress: 50,
    status: "uploading",
  });

  uploads.value.unshift(uploadItem);

  try {
    const { data } = await uploadApi.fromUrl(urlInput.value);
    uploadItem.status = "completed";
    uploadItem.progress = 100;
    uploadItem.filename = data.filename;
    uploadItem.size = data.size;
    uploadItem.cdnUrl = data.cdnUrl;
    urlInput.value = "";
    toast.success("File uploaded from URL");
  } catch {
    uploadItem.status = "error";
    toast.error("Failed to upload from URL");
  } finally {
    urlUploading.value = false;
  }
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url);
  copiedUrl.value = url;
  toast.success("CDN link copied to clipboard");
  setTimeout(() => {
    if (copiedUrl.value === url) copiedUrl.value = null;
  }, 2500);
}

function formatSize(bytes: number): string {
  const n = Number(bytes);
  if (!n || n === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
</script>
